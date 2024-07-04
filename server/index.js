import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mainRouter from '../route/index.js';
import dotenv from 'dotenv';
dotenv.config();

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

app.use('/', mainRouter);


app.get('/', (req, res)=>{
    res.send('Hello World');
    res.status(200);
    res.end();
})

// Start the server
const port = +process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});