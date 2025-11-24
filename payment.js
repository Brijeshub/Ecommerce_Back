import Razorpay from 'razorpay';
import express from 'express';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
});

// Create order
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  const options = {
    amount: amount * 100, // Razorpay expects amount in paisa
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', razorpay.key_secret)
    .update(sign.toString())
    .digest('hex');

  if (razorpay_signature === expectedSign) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
});

export default router;
