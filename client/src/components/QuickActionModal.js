import React from 'react';
import { FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './QuickActionModal.css';

const QuickActionModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  onAdd,
  onEdit,
  onDelete,
  showActions = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'modal-sm',
    medium: 'modal-md',
    large: 'modal-lg',
    fullscreen: 'modal-fullscreen'
  };

  return (
    <div className="quick-action-modal-overlay" onClick={onClose}>
      <div 
        className={`quick-action-modal ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quick-action-modal-header">
          <h3>{title}</h3>
          <div className="modal-header-actions">
            {!showActions && (
              <>
                
                {onEdit && (
                  <button 
                    className="modal-action-btn modal-edit-btn" 
                    onClick={onEdit}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                )}
                {onDelete && (
                  <button 
                    className="modal-action-btn modal-delete-btn" 
                    onClick={onDelete}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                )}
              </>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="quick-action-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default QuickActionModal;
