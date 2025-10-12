import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const EnhancedForm = ({ 
  children, 
  onSubmit, 
  className = '', 
  loading = false,
  error = null,
  success = null 
}) => {
  return (
    <form className={`enhanced-form ${className}`} onSubmit={onSubmit}>
      {error && (
        <div className="form-message error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="form-message success">
          <FaCheck />
          <span>{success}</span>
        </div>
      )}
      
      {children}
      
      <style jsx>{`
        .enhanced-form {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .form-message {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          animation: slideInDown 0.3s ease-out;
        }

        .form-message.error {
          background: var(--error-50);
          color: var(--error-600);
          border: 1px solid var(--error-200);
        }

        .form-message.success {
          background: var(--success-50);
          color: var(--success-600);
          border: 1px solid var(--success-200);
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </form>
  );
};

export const FormField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  onBlur,
  placeholder,
  error = null,
  success = false,
  required = false,
  disabled = false,
  icon = null,
  hint = null,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`form-field ${error ? 'error' : ''} ${success ? 'success' : ''} ${isFocused ? 'focused' : ''} ${hasValue ? 'has-value' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="form-input-wrapper">
        {icon && <div className="form-icon">{icon}</div>}
        
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="form-input"
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
        
        {success && (
          <div className="form-status success">
            <FaCheck />
          </div>
        )}
      </div>
      
      {hint && !error && (
        <div className="form-hint">
          <FaInfoCircle />
          <span>{hint}</span>
        </div>
      )}
      
      {error && (
        <div className="form-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .form-field {
          margin-bottom: var(--space-6);
          position: relative;
        }

        .form-label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
          transition: color var(--transition-fast);
        }

        .required {
          color: var(--error-500);
          margin-left: var(--space-1);
        }

        .form-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          padding-left: ${icon ? 'var(--space-10)' : 'var(--space-4)'};
          padding-right: ${isPassword || success ? 'var(--space-10)' : 'var(--space-4)'};
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          color: var(--text-primary);
          background: var(--bg-secondary);
          transition: all var(--transition-normal);
          outline: none;
        }

        .form-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-secondary);
          transition: opacity var(--transition-fast);
        }

        .form-input:focus::placeholder {
          opacity: 0.7;
        }

        .form-icon {
          position: absolute;
          left: var(--space-3);
          color: var(--text-secondary);
          z-index: 1;
          transition: color var(--transition-fast);
        }

        .form-field.focused .form-icon {
          color: var(--primary-500);
        }

        .password-toggle,
        .form-status {
          position: absolute;
          right: var(--space-3);
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          z-index: 1;
        }

        .password-toggle:hover {
          color: var(--primary-500);
          background: var(--primary-50);
        }

        .form-status.success {
          color: var(--success-500);
          cursor: default;
        }

        .form-hint {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .form-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--error-500);
          animation: shake 0.3s ease-in-out;
        }

        .form-field.error .form-input {
          border-color: var(--error-500);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-field.error .form-icon {
          color: var(--error-500);
        }

        .form-field.success .form-input {
          border-color: var(--success-500);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .form-field.success .form-icon {
          color: var(--success-500);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .form-field.focused .form-label {
          color: var(--primary-500);
        }

        .form-field.has-value .form-label {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export const FormButton = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  ...props 
}) => {
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };

  return (
    <button
      type={type}
      className={`form-button ${variant} ${sizeClasses[size]} ${fullWidth ? 'full-width' : ''} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="button-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
      ) : (
        <>
          {icon && <span className="button-icon">{icon}</span>}
          {children}
        </>
      )}

      <style jsx>{`
        .form-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          border: none;
          border-radius: var(--radius-lg);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
          text-decoration: none;
        }

        .form-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-button.full-width {
          width: 100%;
        }

        .btn-sm {
          padding: var(--space-2) var(--space-4);
          font-size: var(--font-size-sm);
        }

        .btn-md {
          padding: var(--space-3) var(--space-6);
          font-size: var(--font-size-base);
        }

        .btn-lg {
          padding: var(--space-4) var(--space-8);
          font-size: var(--font-size-lg);
        }

        .form-button.primary {
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .form-button.primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .form-button.secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        }

        .form-button.secondary:hover:not(:disabled) {
          background: var(--gray-50);
          border-color: var(--primary-500);
          color: var(--primary-500);
        }

        .form-button.outline {
          background: transparent;
          color: var(--primary-500);
          border: 2px solid var(--primary-500);
        }

        .form-button.outline:hover:not(:disabled) {
          background: var(--primary-500);
          color: white;
        }

        .button-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          position: relative;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-ring:nth-child(2) {
          animation-delay: -0.3s;
        }

        .spinner-ring:nth-child(3) {
          animation-delay: -0.15s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .button-icon {
          display: flex;
          align-items: center;
        }
      `}</style>
    </button>
  );
};

export default EnhancedForm;
