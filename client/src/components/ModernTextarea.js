import React, { useState, useRef, useEffect } from 'react';
import { FaExclamationTriangle, FaCheck, FaInfoCircle } from 'react-icons/fa';

const ModernTextarea = ({
  label = '',
  value = '',
  onChange,
  onBlur,
  placeholder = '',
  error = null,
  success = false,
  required = false,
  disabled = false,
  hint = null,
  maxLength = null,
  minRows = 3,
  maxRows = 10,
  resize = 'vertical',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const textareaRef = useRef(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate the height based on content
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      // Set height within min/max bounds
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, minRows, maxRows]);

  const handleChange = (e) => {
    onChange(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const remainingChars = maxLength ? maxLength - value.length : null;
  const isNearLimit = remainingChars !== null && remainingChars < 20;
  const isOverLimit = remainingChars !== null && remainingChars < 0;

  return (
    <div className={`modern-textarea ${className} ${error ? 'error' : ''} ${success ? 'success' : ''} ${disabled ? 'disabled' : ''} ${isFocused ? 'focused' : ''} ${hasValue ? 'has-value' : ''}`}>
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className="textarea-input"
          style={{ resize }}
          {...props}
        />
        
        {success && (
          <div className="textarea-status success">
            <FaCheck />
          </div>
        )}
      </div>

      <div className="textarea-footer">
        {hint && !error && (
          <div className="textarea-hint">
            <FaInfoCircle />
            <span>{hint}</span>
          </div>
        )}

        {maxLength && (
          <div className={`char-count ${isOverLimit ? 'over-limit' : isNearLimit ? 'near-limit' : ''}`}>
            {remainingChars} characters remaining
          </div>
        )}
      </div>

      {error && (
        <div className="textarea-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .modern-textarea {
          margin-bottom: var(--space-6);
          position: relative;
        }

        .textarea-label {
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

        .textarea-wrapper {
          position: relative;
        }

        .textarea-input {
          width: 100%;
          min-height: ${minRows * 1.5}em;
          padding: var(--space-3) var(--space-4);
          padding-right: ${success ? 'var(--space-10)' : 'var(--space-4)'};
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          font-family: inherit;
          color: var(--text-primary);
          background: var(--bg-secondary);
          transition: all var(--transition-normal);
          outline: none;
          line-height: 1.5;
          resize: ${resize};
        }

        .textarea-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .textarea-input::placeholder {
          color: var(--text-secondary);
          transition: opacity var(--transition-fast);
        }

        .textarea-input:focus::placeholder {
          opacity: 0.7;
        }

        .textarea-status {
          position: absolute;
          right: var(--space-3);
          top: var(--space-3);
          color: var(--success-500);
          font-size: var(--font-size-sm);
        }

        .textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-2);
          min-height: 20px;
        }

        .textarea-hint {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .char-count {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
        }

        .char-count.near-limit {
          color: var(--warning-500);
        }

        .char-count.over-limit {
          color: var(--error-500);
        }

        .textarea-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--error-500);
          animation: shake 0.3s ease-in-out;
        }

        .modern-textarea.error .textarea-input {
          border-color: var(--error-500);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .modern-textarea.success .textarea-input {
          border-color: var(--success-500);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .modern-textarea.disabled .textarea-input {
          opacity: 0.6;
          cursor: not-allowed;
          background: var(--gray-100);
        }

        .modern-textarea.focused .textarea-label {
          color: var(--primary-500);
        }

        .modern-textarea.has-value .textarea-label {
          color: var(--text-primary);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Custom scrollbar for textarea */
        .textarea-input::-webkit-scrollbar {
          width: 6px;
        }

        .textarea-input::-webkit-scrollbar-track {
          background: var(--gray-100);
          border-radius: 3px;
        }

        .textarea-input::-webkit-scrollbar-thumb {
          background: var(--gray-300);
          border-radius: 3px;
        }

        .textarea-input::-webkit-scrollbar-thumb:hover {
          background: var(--gray-400);
        }

        /* Firefox scrollbar */
        .textarea-input {
          scrollbar-width: thin;
          scrollbar-color: var(--gray-300) var(--gray-100);
        }
      `}</style>
    </div>
  );
};

export default ModernTextarea;
