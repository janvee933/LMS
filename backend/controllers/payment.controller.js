const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not set in the .env file');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { amount, course_id } = req.body;
    
    // Amount should be in paise (e.g., 500 Rs = 50000 paise)
    const options = {
      amount: parseInt(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${course_id}`.substring(0, 40),
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create payment order' 
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};
