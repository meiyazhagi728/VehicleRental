import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaSearch } from 'react-icons/fa';

const ModernSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  disabled = false,
  error = null,
  success = false,
  label = '',
  required = false,
  hint = null,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const searchRef = useRef(null);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);
  const selectedOptions = multiple
    ? options.filter(option => value.includes(option.value))
    : [];

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...value, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
    setHighlightedIndex(-1);
  };

  const removeSelected = (valueToRemove) => {
    const newValue = value.filter(v => v !== valueToRemove);
    onChange(newValue);
  };

  return (
    <div className={`modern-select ${className} ${error ? 'error' : ''} ${success ? 'success' : ''} ${disabled ? 'disabled' : ''}`}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div
        ref={selectRef}
        className={`select-container ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        <div className="select-value">
          {multiple ? (
            <div className="selected-tags">
              {selectedOptions.map(option => (
                <span key={option.value} className="selected-tag">
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelected(option.value);
                    }}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedOptions.length === 0 && (
                <span className="placeholder">{placeholder}</span>
              )}
            </div>
          ) : (
            <span className={selectedOption ? 'selected' : 'placeholder'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>

        <div className="select-arrow">
          <FaChevronDown />
        </div>

        {isOpen && (
          <div className="select-dropdown">
            {searchable && (
              <div className="select-search">
                <FaSearch className="search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="search-input"
                />
              </div>
            )}

            <div className="select-options" role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="no-options">No options found</div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={`select-option ${
                      index === highlightedIndex ? 'highlighted' : ''
                    } ${
                      multiple
                        ? value.includes(option.value)
                          ? 'selected'
                          : ''
                        : value === option.value
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={
                      multiple
                        ? value.includes(option.value)
                        : value === option.value
                    }
                  >
                    <span className="option-label">{option.label}</span>
                    {(multiple
                      ? value.includes(option.value)
                      : value === option.value) && (
                      <FaCheck className="check-icon" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {hint && !error && (
        <div className="select-hint">
          <span>{hint}</span>
        </div>
      )}

      {error && (
        <div className="select-error">
          <span>{error}</span>
        </div>
      )}

      <style jsx>{`
        .modern-select {
          position: relative;
          margin-bottom: var(--space-6);
        }

        .select-label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .required {
          color: var(--error-500);
          margin-left: var(--space-1);
        }

        .select-container {
          position: relative;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all var(--transition-normal);
          outline: none;
        }

        .select-container:hover:not(.disabled) {
          border-color: var(--primary-300);
        }

        .select-container:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .select-container.open {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .select-container.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: var(--gray-100);
        }

        .select-value {
          padding: var(--space-3) var(--space-4);
          padding-right: var(--space-10);
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .selected-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          background: var(--primary-100);
          color: var(--primary-700);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .remove-tag {
          background: none;
          border: none;
          color: var(--primary-700);
          cursor: pointer;
          font-size: var(--font-size-sm);
          line-height: 1;
          padding: 0;
          margin-left: var(--space-1);
        }

        .placeholder {
          color: var(--text-secondary);
        }

        .selected {
          color: var(--text-primary);
        }

        .select-arrow {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          transition: transform var(--transition-fast);
          pointer-events: none;
        }

        .select-container.open .select-arrow {
          transform: translateY(-50%) rotate(180deg);
        }

        .select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border: 2px solid var(--primary-500);
          border-top: none;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          max-height: 200px;
          overflow: hidden;
        }

        .select-search {
          position: relative;
          padding: var(--space-2);
          border-bottom: 1px solid var(--border-color);
        }

        .search-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .search-input {
          width: 100%;
          padding: var(--space-2) var(--space-2) var(--space-2) var(--space-8);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          outline: none;
          background: var(--bg-primary);
        }

        .search-input:focus {
          border-color: var(--primary-500);
        }

        .select-options {
          max-height: 150px;
          overflow-y: auto;
        }

        .select-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .select-option:hover,
        .select-option.highlighted {
          background: var(--primary-50);
        }

        .select-option.selected {
          background: var(--primary-100);
          color: var(--primary-700);
        }

        .option-label {
          flex: 1;
        }

        .check-icon {
          color: var(--primary-500);
          font-size: var(--font-size-sm);
        }

        .no-options {
          padding: var(--space-4);
          text-align: center;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .select-hint {
          margin-top: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .select-error {
          margin-top: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--error-500);
        }

        .modern-select.error .select-container {
          border-color: var(--error-500);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .modern-select.success .select-container {
          border-color: var(--success-500);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ModernSelect;
