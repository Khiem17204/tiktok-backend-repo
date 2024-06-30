import express from 'express';
import authRoute from './authRoute';

const router = express.Router();

router.use('/',authRoute);


// Export the router
module.exports = router;