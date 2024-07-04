import authRoute from './authRoute.js';
import express from 'express';

const mainRouter = express.Router();

// Authentication route
mainRouter.use('/', authRoute);


export default mainRouter;