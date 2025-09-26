import razorpay from '../constants/razorpayInstance.js';
import crypto from 'crypto';
import User from '../models/userModel.js';
import Payment from '../models/Payment.js';
import { RAZORPAY_WEBHOOK_SECRET } from '../constants/razorpay.js';

export const createSubscription = async (req, res) => {
    try {
        const { plan_id, plan_name, price, cycle, credits } = req.body;
        const subscription = await razorpay.subscriptions.create({  // // this returns = subscription : { id: 'sub_...', plan_id: 'plan_...', status: 'created', ... }
            plan_id,
            customer_notify: 1,
            total_count: cycle,
        });

        if (!subscription) return res.status(500).json({ message: 'Something went wrong' });
        console.log("req.user", req.user);
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.plan = {
            plan_id,
            plan_name,
            price,
            cycle,
            credits,
        };
        user.subscriptions.push({
            subscription_id: subscription.id,
            plan_id,
            plan_name,
            status: subscription.status,
            start_at: new Date(subscription.start_at * 1000),
            end_at: new Date(subscription.end_at * 1000),
        });
        user.credits += credits;
        await user.save();
        res.status(201).json({
            success: true,
            subscription,
        });
    } catch (error) {
        console.error("----------------------------", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const getSubscription = async (req, res) => {
    try {
        const { subscription_id } = req.params;
        const subscription = await razorpay.subscriptions.fetch(subscription_id);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.status(200).json({ success: true, subscription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// subscription.activated  → subscription is now active
// subscription.charged    → payment for this cycle succeeded
// payment.failed          → payment failed



export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = req.body.toString('utf8');
        if (!signature) {
            return res.status(400).json({ message: 'Signature missing' });
        }
        const expectedSignature = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ message: 'Invalid signature' });
        }
        const event = parsedBody.event;

        if (event === 'subscription.charged') {
            const subscriptionId = req.body.payload.subscription.entity.id;
            const paymentEntity = req.body.payload.payment.entity;

            const user = await User.findOne({ 'subscriptions.subscription_id': subscriptionId });
            if (user) {
                const sub = user.subscriptions.find(s => s.subscription_id === subscriptionId);
                if (sub) {
                    sub.status = 'active';
                    sub.start_at = new Date(req.body.payload.subscription.entity.start_at * 1000);
                    sub.end_at = new Date(req.body.payload.subscription.entity.end_at * 1000);
                }
                user.credits += user.plan.credits;
                user.payments.push({
                    payment_id: paymentEntity.id,
                    order_id: paymentEntity.order_id,
                    amount: paymentEntity.amount,
                    currency: paymentEntity.currency,
                    status: paymentEntity.status,
                    type: 'subscription',
                });
                await user.save();
            }
        };
        res.status(200).json({ message: 'Webhook handled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};