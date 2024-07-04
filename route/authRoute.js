import express from 'express';
import AuthController from '../controller/authController.js';

const authRouter = express.Router();

// Authentication route
authRouter.post('/auth', AuthController.authenticate);

// Logout route
authRouter.post('/logout', AuthController.logout);

authRouter.get('/tiktokAuth', AuthController.authenticateWithTiktok);

export default authRouter;