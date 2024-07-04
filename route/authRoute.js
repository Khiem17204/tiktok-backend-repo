import express from 'express';
import AuthController from '../controller/authController.js';

const authRouter = express.Router();

authRouter.get('/tiktokAuth', AuthController.authenticateWithTiktok);
authRouter.get('/tiktokAuth/callback', AuthController.handleCallbackTiktok);
authRouter.get('/tiktokAuth/refreshtoken', AuthController.refreshAccessToken);
export default authRouter;