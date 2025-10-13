import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, email, password, confirmPassword, phone, role } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state?.auth) || {};
  const { user, isLoading, isError, isSuccess, message } = authState;

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(clearError());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (passwordStrength < 3) {
      errors.password = 'Password is too weak. Please use a stronger password';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      errors.terms = 'You must accept the terms and conditions';
    }

    return errors;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Real-time validation
    if (name === 'email') {
      setIsEmailValid(validateEmail(value));
    }
    if (name === 'phone') {
      setIsPhoneValid(validatePhone(value));
    }
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear validation errors for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role,
      };

      await dispatch(register(userData));
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for UI
  const getPasswordStrengthText = () => {
    const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return strengthTexts[passwordStrength] || 'Very Weak';
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#ff4444', '#ff8800', '#ffbb33', '#99cc00', '#00c851'];
    return colors[passwordStrength] || '#ff4444';
  };

  const renderValidationIcon = (isValid, hasValue) => {
    if (!hasValue) return null;
    return isValid ? <FaCheck className="validation-icon valid" /> : <FaTimes className="validation-icon invalid" />;
  };

  const renderPasswordStrength = () => {
    if (!password) return null;
    return (
      <div className="password-strength">
        <div className="strength-bar">
          <div 
            className="strength-fill" 
            style={{ 
              width: `${(passwordStrength / 5) * 100}%`,
              backgroundColor: getPasswordStrengthColor()
            }}
          />
        </div>
        <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
          {getPasswordStrengthText()}
        </span>
      </div>
    );
  };

  if (isLoading || isSubmitting) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="form-container" style={{padding: '2rem'}}>
        <h2 className="form-title">Create Your Account</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-container">
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                placeholder="Enter your full name"
                onChange={onChange}
                required
                className={validationErrors.name ? 'error' : ''}
                aria-describedby={validationErrors.name ? 'name-error' : ''}
              />
              {renderValidationIcon(name.trim().length >= 2, name.trim())}
            </div>
            {validationErrors.name && (
              <div id="name-error" className="error-message" role="alert">
                <FaExclamationTriangle /> {validationErrors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={onChange}
                required
                className={validationErrors.email ? 'error' : ''}
                aria-describedby={validationErrors.email ? 'email-error' : ''}
              />
              {renderValidationIcon(isEmailValid, email.trim())}
            </div>
            {validationErrors.email && (
              <div id="email-error" className="error-message" role="alert">
                <FaExclamationTriangle /> {validationErrors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-container">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                placeholder="Enter your phone number"
                onChange={onChange}
                required
                className={validationErrors.phone ? 'error' : ''}
                aria-describedby={validationErrors.phone ? 'phone-error' : ''}
              />
              {renderValidationIcon(isPhoneValid, phone.trim())}
            </div>
            {validationErrors.phone && (
              <div id="phone-error" className="error-message" role="alert">
                <FaExclamationTriangle /> {validationErrors.phone}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={onChange}
              required
            >
              <option value="user">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="mechanic">Mechanic</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={onChange}
                required
                minLength="6"
                className={validationErrors.password ? 'error' : ''}
                aria-describedby={validationErrors.password ? 'password-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {renderPasswordStrength()}
            {validationErrors.password && (
              <div id="password-error" className="error-message" role="alert">
                <FaExclamationTriangle /> {validationErrors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                placeholder="Confirm your password"
                onChange={onChange}
                required
                minLength="6"
                className={validationErrors.confirmPassword ? 'error' : ''}
                aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <div id="confirmPassword-error" className="error-message" role="alert">
                <FaExclamationTriangle /> {validationErrors.confirmPassword}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              I agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
            </label>
            {validationErrors.terms && (
              <div className="error-message" role="alert">
                <FaExclamationTriangle /> {validationErrors.terms}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            aria-describedby="submit-status"
          >
            {isSubmitting ? (
              <>
                <div className="spinner-small"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          <div id="submit-status" className="sr-only" aria-live="polite">
            {isSubmitting ? 'Creating your account, please wait...' : ''}
          </div>
        </form>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          padding: 2rem 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--border-light);
          border-radius: var(--border-radius);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .form-group input.error {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }

        .form-group input:valid:not(.error) {
          border-color: #27ae60;
        }

        .password-input {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--grey-500);
          cursor: pointer;
          padding: 0.25rem;
        }

        .password-toggle:hover {
          color: var(--accent-color);
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }

        .auth-links {
          text-align: center;
          margin-top: 1.5rem;
        }

        .auth-links a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .auth-links a:hover {
          text-decoration: underline;
        }

        .spinner {
          border: 4px solid var(--grey-300);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .validation-icon {
          position: absolute;
          right: 3rem;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .validation-icon.valid {
          color: #27ae60;
        }

        .validation-icon.invalid {
          color: #e74c3c;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e74c3c;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .password-strength {
          margin-top: 0.5rem;
        }

        .strength-bar {
          width: 100%;
          height: 4px;
          background-color: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .strength-text {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: 0;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin: 0;
          opacity: 0;
          position: absolute;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-light);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background-color: var(--accent-color);
          border-color: var(--accent-color);
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          color: white;
          font-weight: bold;
          font-size: 12px;
        }

        .checkbox-label a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .checkbox-label a:hover {
          text-decoration: underline;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .form-title {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--text-primary);
          font-size: 1.75rem;
          font-weight: 600;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};

export default Register;
