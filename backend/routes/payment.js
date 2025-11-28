const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { log } = require("console");

router.get("/key", (req, res) => {
  return res.json({
    key: process.env.RAZORPAY_KEY_ID || "rzp_test_123456",
  });
});
// Create Razorpay order
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    // Check if Razorpay is configured
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = require("razorpay");
        const razorpayInstance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        // if (typeof amount === "string" && !isNaN(amount)) {
        //   amount = Number(amount);
        // }

        const options = {
          amount: Math.ceil(amount * 100), // Convert to paise
          currency: currency,
          receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);
        return res.json({
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        });
        
      } catch (razorpayError) {
        console.error("Razorpay API error:", razorpayError);
        // Fall through to mock data
      }
    }

    // Return mock data if Razorpay is not configured
    console.log("Razorpay not configured, using mock data");
    res.json({
      id: `order_mock_${Date.now()}`,
      amount: amount * 100,
      currency: currency,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify payment
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // If it's a mock order, accept it
    if (razorpay_order_id && razorpay_order_id.startsWith("order_mock_")) {
      res.json({
        success: true,
        payment_id: razorpay_payment_id || `mock_payment_${Date.now()}`,
        message: "Payment verified successfully (mock)",
      });
      return;
    }

    // Verify with Razorpay if configured
    if (process.env.RAZORPAY_KEY_SECRET) {
      const crypto = require("crypto");
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const text = razorpay_order_id + "|" + razorpay_payment_id;
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(text)
        .digest("hex");

      if (generated_signature === razorpay_signature) {
        res.json({
          success: true,
          payment_id: razorpay_payment_id,
          message: "Payment verified successfully",
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
        return;
      }
    }

    // If Razorpay not configured, accept mock payments
    res.json({
      success: true,
      payment_id: razorpay_payment_id || `mock_payment_${Date.now()}`,
      message: "Payment verified successfully (mock)",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
