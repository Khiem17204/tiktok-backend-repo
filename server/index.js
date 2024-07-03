import express from 'express';
import fetch from 'node-fetch';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Cryptojs from 'crypto-js';


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});