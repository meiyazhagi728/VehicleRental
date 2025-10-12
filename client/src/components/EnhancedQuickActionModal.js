import React, { useEffect, useState } from 'react';
import { FaTimes, FaExpand, FaCompress, FaMinus } from 'react-icons/fa';

const EnhancedQuickActionModal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    fullscreen: 'modal-fullscreen'
  };

  const currentSize = isFullscreen ? 'fullscreen' : size;

  return (
    <div className="enhanced-modal-overlay" onClick={onClose}>
      <div 
        className={`enhanced-modal-content ${sizeClasses[currentSize]} ${isMinimized ? 'minimized' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="enhanced-modal-header">
          <div className="enhanced-modal-title-section">
            <div className="modal-title-with-icon">
              <div className="modal-title-icon">
                <div className="icon-dot"></div>
                <div className="icon-dot"></div>
                <div className="icon-dot"></div>
              </div>
              <h2>{title}</h2>
            </div>
            <div className="enhanced-modal-actions">
              <button 
                className="modal-action-btn minimize-btn" 
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Restore" : "Minimize"}
              >
                <FaMinus />
              </button>
              <button 
                className="modal-action-btn fullscreen-btn" 
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              <button className="modal-close" onClick={onClose} title="Close">
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
        {!isMinimized && (
          <div className="enhanced-modal-body">
            {children}
          </div>
        )}
      </div>

      <style jsx>{`
        .enhanced-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(8px);
          animation: modalFadeIn 0.3s ease-out;
        }

        .enhanced-modal-content {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 20px;
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.4);
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid #e5e7eb;
          position: relative;
          transform: scale(1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 300px;
        }

        .enhanced-modal-content:hover {
          transform: scale(1.01);
          box-shadow: 0 40px 80px -12px rgba(0, 0, 0, 0.5);
        }

        .enhanced-modal-content.minimized {
          height: auto;
          max-height: 80px;
        }

        .modal-small {
          width: 100%;
          max-width: 400px;
        }

        .modal-medium {
          width: 100%;
          max-width: 600px;
        }

        .modal-large {
          width: 100%;
          max-width: 800px;
        }

        .modal-fullscreen {
          width: 95vw;
          height: 95vh;
        }

        .enhanced-modal-header {
          padding: 0;
          border-bottom: 1px solid #e5e7eb;
          background: var(--blue-shard-gradient);
          border-radius: 20px 20px 0 0;
          position: relative;
          overflow: hidden;
        }

        .enhanced-modal-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }

        .enhanced-modal-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          position: relative;
          z-index: 1;
        }

        .modal-title-with-icon {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .modal-title-icon {
          display: flex;
          gap: 4px;
        }

        .icon-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          animation: pulse 2s infinite;
        }

        .icon-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .icon-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .enhanced-modal-title-section h2 {
          margin: 0;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .enhanced-modal-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .modal-action-btn,
        .modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          min-width: 44px;
          min-height: 44px;
        }

        .modal-action-btn:hover,
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .modal-close:hover {
          background: rgba(239, 68, 68, 0.8);
          border-color: rgba(239, 68, 68, 0.8);
        }

        .minimize-btn:hover {
          background: rgba(59, 130, 246, 0.8);
          border-color: rgba(59, 130, 246, 0.8);
        }

        .fullscreen-btn:hover {
          background: rgba(34, 197, 94, 0.8);
          border-color: rgba(34, 197, 94, 0.8);
        }

        .enhanced-modal-body {
          padding: 2rem;
          overflow: auto;
          max-height: calc(90vh - 100px);
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          position: relative;
        }

        .enhanced-modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .enhanced-modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .enhanced-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .enhanced-modal-body::-webkit-scrollbar-thumb:hover {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .enhanced-modal-content {
            margin: 0.5rem;
            max-height: calc(100vh - 1rem);
          }
          
          .enhanced-modal-title-section {
            padding: 1rem 1.5rem;
          }
          
          .enhanced-modal-body {
            padding: 1.5rem;
          }

          .enhanced-modal-actions {
            gap: 0.25rem;
          }

          .modal-action-btn,
          .modal-close {
            padding: 0.5rem;
            min-width: 40px;
            min-height: 40px;
          }
        }

        @media (max-width: 480px) {
          .enhanced-modal-content {
            margin: 0.25rem;
            max-height: calc(100vh - 0.5rem);
          }

          .enhanced-modal-title-section {
            padding: 0.75rem 1rem;
          }

          .enhanced-modal-title-section h2 {
            font-size: 1.25rem;
          }

          .enhanced-modal-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedQuickActionModal;
