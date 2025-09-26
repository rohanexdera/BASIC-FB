import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../constants/razorpay.js';

const razorpay = new Razorpay({
    key_id: 'rzp_live_BpmkRYYBRmjtiE',
    key_secret: 'gqMsYIcZyVR1fdkXD847mkFL',
});

export default razorpay;
