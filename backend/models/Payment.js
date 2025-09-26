import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    currency: { type: String, default: 'INR' },
    status: { type: String, default: 'created' },
    type: { type: String, enum: ['one-time', 'subscription'], required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', paymentSchema);
