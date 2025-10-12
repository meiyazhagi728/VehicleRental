import React from 'react';
import { useSelector } from 'react-redux';
import { FaClock, FaEnvelope, FaPhone, FaUser } from 'react-icons/fa';

const PendingApproval = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="pending-approval-page">
      <div className="container">
        <div className="approval-card">
          <div className="approval-icon">
            <FaClock />
          </div>
          
          <h1>Account Pending Approval</h1>
          <p className="approval-message">
            Your {user?.role} account is currently under review. Our team will review your application and notify you once it's approved.
          </p>
          
          <div className="user-info">
            <div className="info-item">
              <FaUser className="info-icon" />
              <span><strong>Name:</strong> {user?.name}</span>
            </div>
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <span><strong>Email:</strong> {user?.email}</span>
            </div>
            <div className="info-item">
              <FaPhone className="info-icon" />
              <span><strong>Phone:</strong> {user?.phone}</span>
            </div>
            <div className="info-item">
              <span><strong>Role:</strong> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
            </div>
          </div>
          
          <div className="approval-status">
            <div className="status-badge pending">
              <FaClock />
              Pending Approval
            </div>
          </div>
          
          <div className="next-steps">
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your application within 24-48 hours</li>
              <li>You'll receive an email notification once approved</li>
              <li>You can contact support if you have any questions</li>
            </ul>
          </div>
          
          <div className="contact-info">
            <p>Need help? Contact our support team:</p>
            <div className="contact-methods">
              <a href="mailto:support@vehiclerental.com" className="contact-link">
                <FaEnvelope /> support@vehiclerental.com
              </a>
              <a href="tel:+1234567890" className="contact-link">
                <FaPhone /> +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .pending-approval-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .container {
          max-width: 600px;
          width: 100%;
        }
        
        .approval-card {
          background: white;
          border-radius: 16px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .approval-icon {
          width: 80px;
          height: 80px;
          background: #fef3c7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: #f59e0b;
          font-size: 2rem;
        }
        
        h1 {
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }
        
        .approval-message {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 2rem 0;
        }
        
        .user-info {
          background: var(--grey-50);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
          text-align: left;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        
        .info-item:last-child {
          margin-bottom: 0;
        }
        
        .info-icon {
          color: var(--accent-color);
          font-size: 1rem;
          width: 16px;
        }
        
        .approval-status {
          margin: 2rem 0;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .status-badge.pending {
          background: #fef3c7;
          color: #f59e0b;
          border: 1px solid #f59e0b;
        }
        
        .next-steps {
          text-align: left;
          margin: 2rem 0;
        }
        
        .next-steps h3 {
          color: var(--text-primary);
          font-size: 1.2rem;
          margin: 0 0 1rem 0;
        }
        
        .next-steps ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .next-steps li {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
          position: relative;
        }
        
        .next-steps li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--accent-color);
          font-weight: bold;
        }
        
        .contact-info {
          background: var(--grey-50);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
        }
        
        .contact-info p {
          color: var(--text-primary);
          font-weight: 600;
          margin: 0 0 1rem 0;
        }
        
        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent-color);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .contact-link:hover {
          color: var(--primary-dark);
        }
        
        @media (max-width: 768px) {
          .approval-card {
            padding: 2rem;
          }
          
          h1 {
            font-size: 1.5rem;
          }
          
          .contact-methods {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PendingApproval;
