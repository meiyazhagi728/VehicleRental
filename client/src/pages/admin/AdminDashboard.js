import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaUsers, FaCar, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <h3>0</h3>
            <p>Total Users</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaCar />
            </div>
            <h3>0</h3>
            <p>Total Vehicles</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <h3>₹0</h3>
            <p>Total Revenue</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <h3>0</h3>
            <p>Pending Approvals</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/admin/vendors" className="action-card">
                <FaUsers />
                <h3>Manage Vendors</h3>
                <p>Approve vendor requests</p>
              </Link>
              <Link to="/admin/vehicles" className="action-card">
                <FaCar />
                <h3>Manage Vehicles</h3>
                <p>View all vehicles</p>
              </Link>
              <Link to="/admin/users" className="action-card">
                <FaUsers />
                <h3>Manage Users</h3>
                <p>User management</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
