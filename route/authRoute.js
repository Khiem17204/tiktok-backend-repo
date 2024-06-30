import express from 'express';
import AuthController from '../controller/authController';


// Authentication route
app.post('/auth', AuthController.authenticate);

// Logout route
app.post('/logout', AuthController.logout);
