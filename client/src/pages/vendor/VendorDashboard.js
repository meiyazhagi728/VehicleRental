import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaCar, FaMoneyBillWave, FaUsers, FaChartLine } from 'react-icons/fa';

const VendorDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your vehicles and track your business</p>
        </div>

        <div className="dashboard-stats">
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
              <FaUsers />
            </div>
            <h3>0</h3>
            <p>Total Customers</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <h3>0</h3>
            <p>Active Bookings</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/vehicles/add" className="action-card">
                <FaCar />
                <h3>Add Vehicle</h3>
                <p>List a new vehicle</p>
              </Link>
              <Link to="/vehicles" className="action-card">
                <FaCar />
                <h3>Manage Vehicles</h3>
                <p>View and edit vehicles</p>
              </Link>
              <Link to="/bookings" className="action-card">
                <FaChartLine />
                <h3>View Bookings</h3>
                <p>Track all bookings</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
