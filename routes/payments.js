const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const StripeService = require('../services/stripeService');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @route   POST /api/payments/create-intent
// @desc    Create a payment intent for booking
// @access  Private
router.post('/create-intent', [protect], async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID and amount are required' 
      });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate('vehicleId', 'name make model');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to pay for this booking' 
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only confirmed bookings can be paid' 
      });
    }

    // Create payment intent
    const result = await StripeService.createPaymentIntent(
      amount,
      process.env.STRIPE_CURRENCY || 'usd',
      {
        bookingId: bookingId,
        userId: req.user._id,
        vehicleId: booking.vehicleId._id
      }
    );

    if (result.success) {
      res.json({
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and activate booking
// @access  Private
router.post('/confirm', [protect], async (req, res) => {
  try {
    console.log('Payment confirm request:', req.body);
    console.log('User ID:', req.user._id);
    
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      console.log('Missing required fields:', { paymentIntentId, bookingId });
      return res.status(400).json({ 
        success: false, 
        message: 'Payment Intent ID and Booking ID are required' 
      });
    }

    // Verify booking exists and belongs to user
    console.log('Looking for booking:', bookingId);
    const booking = await Booking.findById(bookingId);
    console.log('Found booking:', booking ? 'Yes' : 'No');

    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    console.log('Booking user ID:', booking.userId);
    console.log('Request user ID:', req.user._id);
    console.log('User IDs match:', booking.userId.toString() === req.user._id.toString());

    if (booking.userId.toString() !== req.user._id.toString()) {
      console.log('User not authorized for this booking');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to confirm this payment' 
      });
    }

    // Confirm payment with Stripe
    console.log('Calling StripeService.confirmPaymentIntent with:', paymentIntentId);
    const result = await StripeService.confirmPaymentIntent(paymentIntentId);
    console.log('StripeService result:', result);

    if (result.success) {
      // Update booking status
      booking.status = 'active';
      booking.paymentStatus = 'paid';
      booking.paymentIntentId = paymentIntentId;
      booking.activatedAt = new Date();
      await booking.save();

      res.json({
        success: true,
        message: 'Payment confirmed and booking activated',
        booking: booking
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await StripeService.handleWebhook(req.body, signature);

    if (result.success) {
      const event = result.event;

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          // Additional processing if needed
          break;
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object.id);
          // Handle failed payment
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } else {
      console.error('Webhook error:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   GET /api/payments/config
// @desc    Get Stripe configuration for frontend
// @access  Public
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    currency: process.env.STRIPE_CURRENCY || 'usd'
  });
});

module.exports = router;
