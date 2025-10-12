import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaLock, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [stripeConfig, setStripeConfig] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchStripeConfig();
    }
  }, [isOpen]);

  const fetchStripeConfig = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments/config');
      const config = await response.json();
      setStripeConfig(config);
    } catch (error) {
      console.error('Failed to fetch Stripe config:', error);
    }
  };

  if (!isOpen) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      console.log('PaymentModal - Starting payment process');
      console.log('Booking data:', booking);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Create payment intent
      console.log('Creating payment intent...');
      const intentResponse = await fetch('http://localhost:5000/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          amount: booking.totalAmount
        })
      });

      console.log('Payment intent response status:', intentResponse.status);
      const intentData = await intentResponse.json();
      console.log('Payment intent response:', intentData);

      if (!intentData.success) {
        throw new Error(intentData.message || 'Failed to create payment intent');
      }

      // Simulate payment processing with Stripe
      console.log('Simulating payment processing...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Confirm payment
      console.log('Confirming payment...');
      const confirmResponse = await fetch('http://localhost:5000/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentIntentId: intentData.paymentIntentId,
          bookingId: booking._id
        })
      });

      console.log('Payment confirmation response status:', confirmResponse.status);
      const confirmData = await confirmResponse.json();
      console.log('Payment confirmation response:', confirmData);

      if (confirmData.success) {
        setPaymentStatus('success');
        
        // Call success callback after a delay
        setTimeout(() => {
          onPaymentSuccess(booking);
          onClose();
        }, 2000);
      } else {
        throw new Error(confirmData.message || 'Payment confirmation failed');
      }
      
    } catch (error) {
      setPaymentStatus('error');
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="payment-modal-body">
          {paymentStatus === 'success' ? (
            <div className="payment-success">
              <FaCheckCircle className="success-icon" />
              <h3>Payment Successful!</h3>
              <p>Your booking has been confirmed and activated.</p>
            </div>
          ) : (
            <>
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-item">
                  <span>Vehicle:</span>
                  <span>{booking?.vehicleId?.make} {booking?.vehicleId?.model}</span>
                </div>
                <div className="summary-item">
                  <span>Duration:</span>
                  <span>{booking?.totalDays} days</span>
                </div>
                <div className="summary-item">
                  <span>Total Amount:</span>
                  <span className="total-amount">₹{booking?.totalAmount}</span>
                </div>
              </div>

              <form onSubmit={handlePayment} className="payment-form">
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-label">
                      <FaCreditCard />
                      Credit/Debit Card
                    </span>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-details">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          number: formatCardNumber(e.target.value)
                        })}
                        maxLength="19"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({
                            ...cardDetails,
                            expiry: formatExpiry(e.target.value)
                          })}
                          maxLength="5"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({
                            ...cardDetails,
                            cvv: e.target.value.replace(/\D/g, '').substring(0, 3)
                          })}
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          name: e.target.value
                        })}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="security-info">
                  <FaLock />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <div className="payment-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Pay ₹${booking?.totalAmount}`}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
