import { BaseController } from "./baseController.js";
import CryptoJS from 'crypto-js';
import { URLSearchParams } from 'url';
import fetch from 'node-fetch';
import exp from "constants";

class AuthController extends BaseController {
    constructor() {
        super(); 
    }

    async authenticateWithTiktok(req, res) {
        const CODE_VERIFIER = AuthController.generateRandomString(128)
        const CODE_CHALLENGE = AuthController.generateCodeChallenge(CODE_VERIFIER)
        
        const csrfState = Math.random().toString(36).substring(2);
        res.cookie('csrfState', csrfState, { maxAge: 60000 });
        res.cookie('codeVerifier', CODE_VERIFIER, { maxAge: 60000 });
        const queryParams = new URLSearchParams({
            client_key: process.env.CLIENT_KEY ,
            response_type: 'code',
            scope: 'user.info.basic,video.list', 
            redirect_uri: process.env.SERVER_ENDPOINT_REDIRECT,
            state: csrfState,
            code_challenge: CODE_CHALLENGE,
            code_challenge_method: 'S256'
        });
        const authorizationUrl = `https://www.tiktok.com/v2/auth/authorize/?${queryParams}`;
        res.redirect(authorizationUrl);
    }
    
    async handleCallbackTiktok(req, res) {
        const { code, state } = req.query;
        const storedState = req.cookies.csrfState;
        const codeVerifier = req.cookies.codeVerifier;

        if (state !== storedState) {
            return res.status(400).send('Invalid state parameter');
        }

        try {
            const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_key: process.env.CLIENT_KEY ,
                    client_secret: process.env.CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: process.env.SERVER_ENDPOINT_REDIRECT,
                    code_verifier: codeVerifier
                })
            });

            const tokenData = await tokenResponse.json();
            
            if (tokenData) {
                // send the access token to the client
                res.cookie('accessToken', tokenData.access_token, { maxAge: 86400 });
                res.cookie('refreshToken', tokenData.refresh_token, { maxAge: 31536000 });
                res.redirect('/');
            } else {
                res.status(400).send('Failed to obtain access token');
            }
        } catch (error) {
            console.error('Error during token exchange:', error);
            res.status(500).send('Internal server error');
        }
    }

    // endpoint to refresh the access token, use middleware to track request if the token is expired and
    // call the endpoint to refresh the token before continue
    async refreshAccessToken(req, res) {
        try {
            const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_key: process.env.CLIENT_KEY,
                    client_secret: process.env.CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: req.cookies.refresh_token,
                })
            });

            const data = await response.json();

            if (data) {
                // Update the stored access token and refresh token
                res.cookie('accessToken', tokenData.access_token, { maxAge: 86400 });
                res.cookie('refreshToken', tokenData.refresh_token, { maxAge: 31536000 });
                res.status(200).json({ success: true, message: 'Token refreshed successfully' });
            } else {
                res.status(400).send('Failed to refresh token');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }

    static generateCodeChallenge(codeVerifier) {
        return CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Hex)
    }

    static generateRandomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

export default new AuthController();