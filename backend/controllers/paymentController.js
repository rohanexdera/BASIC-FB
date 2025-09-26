import Payment from '../models/paymentModel.js';
import razorpay from '../constants/razorpayInstance.js';
import crypto from 'crypto';
import User from '../models/userModel.js';

// // Create One-Time Payment Order
export const createOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: currency || 'INR',
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1, // auto capture
        };
        const order = await razorpay.orders.create(options);
        if (!order) return res.status(500).json({ message: 'Something went wrong' });

        const Payment = {
            razorpay_order_id: order.id,
            user: req.user.userId,
            amount: order.amount,
            type: 'one-time',
            currency: currency || 'INR',
        };

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.payments.push(Payment);
        await user.save();

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            const user = await User.findById(req.user.userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const payment = user.payments.find(p => p.razorpay_order_id === razorpay_order_id);
            if (!payment) return res.status(404).json({ message: 'Payment not found' });

            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
            payment.status = 'paid';
            user.credits += 10;
            await user.save();

            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};