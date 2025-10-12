import React, { useState, useEffect, useRef } from 'react';
import { FaKey, FaCheckCircle, FaTimes, FaClock } from 'react-icons/fa';
import './OTPVerification.css';

const OTPVerification = ({ isOpen, onClose, booking, onVerificationSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit, index) => !digit && index >= pastedData.length);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      alert('Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful verification
      setVerificationStatus('success');
      
      // Call success callback after a delay
      setTimeout(() => {
        onVerificationSuccess(booking);
        onClose();
      }, 2000);
      
    } catch (error) {
      setVerificationStatus('error');
      console.error('OTP verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimeLeft(300);
    setOtp(['', '', '', '', '', '']);
    setVerificationStatus(null);
    
    // Simulate resending OTP
    alert('OTP has been resent to your registered mobile number');
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <div className="otp-modal-header">
          <h2>Verify Booking Completion</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="otp-modal-body">
          {verificationStatus === 'success' ? (
            <div className="verification-success">
              <FaCheckCircle className="success-icon" />
              <h3>Verification Successful!</h3>
              <p>Your booking has been completed successfully.</p>
            </div>
          ) : (
            <>
              <div className="booking-info">
                <h3>Booking Details</h3>
                <div className="info-item">
                  <span>Vehicle:</span>
                  <span>{booking?.vehicleId?.make} {booking?.vehicleId?.model}</span>
                </div>
                <div className="info-item">
                  <span>Booking ID:</span>
                  <span>{booking?._id?.slice(-8)}</span>
                </div>
                <div className="info-item">
                  <span>End Date:</span>
                  <span>{new Date(booking?.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="otp-instructions">
                <FaKey className="key-icon" />
                <p>Please enter the 6-digit OTP provided by the vendor to complete your booking.</p>
              </div>

              <form onSubmit={handleVerify} className="otp-form">
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`otp-input ${digit ? 'filled' : ''}`}
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                <div className="timer-section">
                  {timeLeft > 0 ? (
                    <div className="timer">
                      <FaClock />
                      <span>OTP expires in {formatTime(timeLeft)}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={handleResend}
                      disabled={!canResend}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="otp-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isVerifying}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isVerifying || otp.join('').length !== 6}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify OTP'}
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

export default OTPVerification;
