import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner-wrapper">
        <div className={`spinner ${sizeClasses[size]}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
        }

        .loading-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 9999;
        }


        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
        }

        .spinner {
          position: relative;
          display: inline-block;
        }

        .spinner-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top: 3px solid var(--primary-500);
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(1) {
          animation-delay: -0.45s;
        }

        .spinner-ring:nth-child(2) {
          animation-delay: -0.3s;
          border-top-color: var(--secondary-500);
        }

        .spinner-ring:nth-child(3) {
          animation-delay: -0.15s;
          border-top-color: var(--success-500);
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          margin: 0;
          text-align: center;
        }

        .loading-container.fullscreen .loading-text {
          font-size: var(--font-size-base);
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
