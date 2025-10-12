import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // If it's a JSON parsing error, try to clean up localStorage
    if (error.message && error.message.includes('JSON')) {
      console.log('Detected JSON parsing error, cleaning up localStorage...');
      try {
        localStorage.clear();
        console.log('localStorage cleared successfully');
      } catch (cleanupError) {
        console.error('Error clearing localStorage:', cleanupError);
      }
    }
  }

  handleRefresh = () => {
    // Clear localStorage and reload the page
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <FaExclamationTriangle className="error-icon" />
            <h2>Something went wrong</h2>
            <p>
              We encountered an error while loading the application. 
              This might be due to corrupted data in your browser's storage.
            </p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleRefresh}
                className="btn btn-primary"
              >
                <FaRedo className="mr-2" />
                Refresh & Clear Data
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--blue-shard-gradient);
              padding: 20px;
            }

            .error-content {
              background: var(--blue-glass-bg);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border: 1px solid var(--blue-glass-border);
              box-shadow: var(--blue-glass-shadow);
              border-radius: 12px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              max-width: 500px;
              width: 100%;
            }

            .error-icon {
              font-size: 4rem;
              color: #e74c3c;
              margin-bottom: 20px;
            }

            .error-content h2 {
              color: #2c3e50;
              margin-bottom: 15px;
              font-size: 1.8rem;
            }

            .error-content p {
              color: #7f8c8d;
              margin-bottom: 30px;
              line-height: 1.6;
            }

            .error-actions {
              margin-bottom: 30px;
            }

            .btn {
              display: inline-flex;
              align-items: center;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              text-decoration: none;
            }

            .btn-primary {
              background: var(--blue-shard-gradient);
              color: white;
            }

            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }

            .mr-2 {
              margin-right: 8px;
            }

            .error-details {
              text-align: left;
              margin-top: 20px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #495057;
              margin-bottom: 10px;
            }

            .error-stack {
              background: var(--blue-glass-bg);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border: 1px solid var(--blue-glass-border);
              box-shadow: var(--blue-glass-shadow);
              color: #ecf0f1;
              padding: 15px;
              border-radius: 4px;
              font-size: 0.85rem;
              overflow-x: auto;
              white-space: pre-wrap;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
