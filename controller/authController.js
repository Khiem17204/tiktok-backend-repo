import { BaseController } from "./baseController.js";
import CryptoJS from 'crypto-js';
import { URLSearchParams } from 'url';

export default class AuthController extends BaseController {
    #TIKTOK_CLIENT_KEY
    #TIKTOK_SERVER_ENDPOINT_REDIRECT
    #TIKTOK_CLIENT_SECRET
    constructor() {
        super();
        // tiktok token env variable
        this.TIKTOK_CLIENT_KEY = process.env.CLIENT_KEY 
        this.TIKTOK_SERVER_ENDPOINT_REDIRECT = process.env.SERVER_ENDPOINT_REDIRECT
        this.TIKTOK_CLIENT_SECRET = process.env.CLIENT_SECRET
    }

    // Add specific methods or properties here

    static async authenticate(token) {
        // Implement logic to authenticate a user
        return token 
    }

    
    static async logout() {
        // Implement logic to log out a user
    }

    static async authenticateWithTiktok(req, res) {
        const CODE_VERIFIER = AuthController.generateRandomString(128)
        const CODE_CHALLENGE = AuthController.generateCodeChallenge(CODE_VERIFIER)
        
        const csrfState = Math.random().toString(36).substring(2);
        res.cookie('csrfState', csrfState, { maxAge: 60000 });
        res.cookie('codeVerifier', CODE_VERIFIER, { maxAge: 60000 });
        const queryParams = new URLSearchParams({
            client_key: this.TIKTOK_CLIENT_KEY,
            response_type: 'code',
            scope: 'user.info.basic,video.list', 
            redirect_uri: this.TIKTOK_SERVER_ENDPOINT_REDIRECT,
            state: csrfState,
            code_challenge: CODE_CHALLENGE,
            code_challenge_method: 'S256'
        });
        const authorizationUrl = `https://www.tiktok.com/v2/auth/authorize/?${queryParams}`;
        res.redirect(authorizationUrl);
    }
    
    static async handleCallbackTiktok(req, res) {
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
                    client_key: this.CLIENT_KEY,
                    client_secret: this.CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.REDIRECT_URI,
                    code_verifier: codeVerifier
                })
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.data && tokenData.data.access_token) {
                localStorage.setItem('accessToken', tokenData.data.access_token);
                res.redirect('/home');
            } else {
                res.status(400).send('Failed to obtain access token');
            }
        } catch (error) {
            console.error('Error during token exchange:', error);
            res.status(500).send('Internal server error');
        }
    }

    static async refreshAccessToken(refreshToken) {
        try {
            const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_key: this.TIKTOK_CLIENT_KEY,
                    client_secret: this.TIKTOK_CLIENT_KEY,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            });

            const data = await response.json();

            if (data.data && data.data.access_token) {
                // Update the stored access token and refresh token
                return data.data.access_token;
            } else {
                throw new Error('Failed to refresh token');
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