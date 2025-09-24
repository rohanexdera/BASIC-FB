import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    razorpay_customer_id: {
        type: String,
    },
    plan: {
        plan_id: String,
        name: String,
        price: Number,
        currency: { type: String, default: 'INR' },
        credits: Number,
        cycle: String,
    },
    credits: {
        type: Number,
        default: 0,
    },
    subscriptions: [
        {
            subscription_id: String,
            plan_id: String,
            plan_name: String,
            status: String,
            start_at: Date,
            end_at: Date,
        },
    ],
    payments: [
        {
            payment_id: String,
            order_id: String,
            amount: Number,
            currency: { type: String, default: 'INR' },
            status: String,
            createdAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const User = mongoose.model('User', userSchema);
export default User;