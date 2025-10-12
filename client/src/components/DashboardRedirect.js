import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user role
    switch (user?.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'vendor':
        // Check if vendor is approved
        if (user.isApproved) {
          navigate('/vendor');
        } else {
          navigate('/pending-approval');
        }
        break;
      case 'mechanic':
        navigate('/mechanic/dashboard');
        break;
      case 'user':
      default:
        navigate('/dashboard');
        break;
    }
  }, [user?.role, user?.isApproved, navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Redirecting to your dashboard...</p>
      </div>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        
        .loading-spinner {
          text-align: center;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--grey-200);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        p {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default DashboardRedirect;
