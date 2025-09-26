import {
    createSubscription,
    getSubscription,
    handleWebhook
} from '../controllers/subscriptionController.js';
import bodyParser from 'body-parser';
import { authenticate } from '../middleware/authenticate.js';


import express from 'express';
const router = express.Router();


router.post('/create-subscription', authenticate , createSubscription);
router.get('/get-subscription/:subscription_id',authenticate , getSubscription);
router.post('/webhook',
    bodyParser.raw({ type: 'application/json' }),
    handleWebhook
);

export default router;
