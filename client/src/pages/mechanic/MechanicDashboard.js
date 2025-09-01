import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTools, FaClock, FaStar, FaUser } from 'react-icons/fa';

const MechanicDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your services and availability</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaTools />
            </div>
            <h3>0</h3>
            <p>Total Services</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <h3>Available</h3>
            <p>Status</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaStar />
            </div>
            <h3>0.0</h3>
            <p>Rating</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaUser />
            </div>
            <h3>Mechanic</h3>
            <p>Account Type</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/profile" className="action-card">
                <FaUser />
                <h3>Update Profile</h3>
                <p>Manage your details</p>
              </Link>
              <Link to="/availability" className="action-card">
                <FaClock />
                <h3>Set Availability</h3>
                <p>Update your status</p>
              </Link>
              <Link to="/services" className="action-card">
                <FaTools />
                <h3>Manage Services</h3>
                <p>Update services</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
