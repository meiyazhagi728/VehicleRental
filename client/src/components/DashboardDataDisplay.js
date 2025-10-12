import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUsers, FaCar, FaWrench, FaCalendarAlt, FaChartLine, FaEye, FaEyeSlash } from 'react-icons/fa';
import './DashboardDataDisplay.css';

const DashboardDataDisplay = () => {
  const [showData, setShowData] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    users: [],
    vehicles: [],
    mechanics: [],
    bookings: [],
    stats: {}
  });
  const [loading, setLoading] = useState(false);

  const { user } = useSelector(state => state.auth);

  // Function to sanitize data and remove any objects that can't be rendered
  const sanitizeData = (data) => {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }
    if (data && typeof data === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Convert coordinate objects to strings
          if (value.type === 'Point' && value.coordinates) {
            sanitized[key] = `${value.coordinates[1]?.toFixed(4) || 'N/A'}, ${value.coordinates[0]?.toFixed(4) || 'N/A'}`;
          } else {
            sanitized[key] = JSON.stringify(value);
          }
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return data;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data for dashboard display
      const [usersRes, vehiclesRes, mechanicsRes, bookingsRes] = await Promise.all([
        fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).catch(() => ({ json: () => [] })),
        fetch('/api/vehicles', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).catch(() => ({ json: () => [] })),
        fetch('/api/mechanics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).catch(() => ({ json: () => [] })),
        fetch('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).catch(() => ({ json: () => [] }))
      ]);

      const [users, vehicles, mechanics, bookings] = await Promise.all([
        usersRes.json().catch(() => []),
        vehiclesRes.json().catch(() => []),
        mechanicsRes.json().catch(() => []),
        bookingsRes.json().catch(() => [])
      ]);

      // Sanitize all data to remove coordinate objects that can't be rendered
      const cleanUsers = sanitizeData(users || []);
      const cleanVehicles = sanitizeData(vehicles || []);
      const cleanMechanics = sanitizeData(mechanics || []);
      const cleanBookings = sanitizeData(bookings || []);

      // Calculate statistics
      const stats = {
        totalUsers: cleanUsers.length,
        totalVehicles: cleanVehicles.length,
        totalMechanics: cleanMechanics.length,
        totalBookings: cleanBookings.length,
        activeBookings: cleanBookings.filter(b => b.status === 'confirmed' || b.status === 'active').length,
        completedBookings: cleanBookings.filter(b => b.status === 'completed').length,
        pendingBookings: cleanBookings.filter(b => b.status === 'pending').length,
        cancelledBookings: cleanBookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: cleanBookings
          .filter(b => b.status === 'completed' || b.status === 'confirmed')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        averageBookingValue: cleanBookings.length > 0 
          ? cleanBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / cleanBookings.length 
          : 0
      };

      // Debug: Log the cleaned data to check for any remaining objects
      console.log('Cleaned users:', cleanUsers.slice(0, 2));
      console.log('Cleaned vehicles:', cleanVehicles.slice(0, 2));
      console.log('Cleaned mechanics:', cleanMechanics.slice(0, 2));
      console.log('Cleaned bookings:', cleanBookings.slice(0, 2));

      setDashboardData({
        users: cleanUsers.slice(0, 10), // Show first 10 users
        vehicles: cleanVehicles.slice(0, 10), // Show first 10 vehicles
        mechanics: cleanMechanics.slice(0, 10), // Show first 10 mechanics
        bookings: cleanBookings.slice(0, 10), // Show first 10 bookings
        stats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showData) {
      fetchDashboardData();
    }
  }, [showData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#27ae60',
      active: '#3498db',
      completed: '#2ecc71',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#e74c3c',
      vendor: '#f39c12',
      mechanic: '#3498db',
      user: '#2ecc71'
    };
    return colors[role] || '#95a5a6';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="dashboard-data-display">
      <div className="data-toggle">
        <button 
          className={`toggle-btn ${showData ? 'active' : ''}`}
          onClick={() => setShowData(!showData)}
        >
          {showData ? <FaEyeSlash /> : <FaEye />}
          {showData ? 'Hide Dashboard Data' : 'Show Dashboard Data'}
        </button>
      </div>

      {showData && (
        <div className="data-content">
          {loading ? (
            <div className="loading">Loading dashboard data...</div>
          ) : (
            <>
              {/* Statistics Overview */}
              <div className="stats-overview">
                <h3>📊 Dashboard Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <FaUsers className="stat-icon" />
                    <div className="stat-content">
                      <h4>{dashboardData.stats.totalUsers}</h4>
                      <p>Total Users</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FaCar className="stat-icon" />
                    <div className="stat-content">
                      <h4>{dashboardData.stats.totalVehicles}</h4>
                      <p>Total Vehicles</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FaWrench className="stat-icon" />
                    <div className="stat-content">
                      <h4>{dashboardData.stats.totalMechanics}</h4>
                      <p>Total Mechanics</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FaCalendarAlt className="stat-icon" />
                    <div className="stat-content">
                      <h4>{dashboardData.stats.totalBookings}</h4>
                      <p>Total Bookings</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FaChartLine className="stat-icon" />
                    <div className="stat-content">
                      <h4>{formatCurrency(dashboardData.stats.totalRevenue)}</h4>
                      <p>Total Revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Status Breakdown */}
              <div className="booking-breakdown">
                <h3>📅 Booking Status Breakdown</h3>
                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <span className="status-dot" style={{ backgroundColor: '#f39c12' }}></span>
                    <span>Pending: {dashboardData.stats.pendingBookings}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="status-dot" style={{ backgroundColor: '#27ae60' }}></span>
                    <span>Confirmed: {dashboardData.stats.activeBookings}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="status-dot" style={{ backgroundColor: '#2ecc71' }}></span>
                    <span>Completed: {dashboardData.stats.completedBookings}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="status-dot" style={{ backgroundColor: '#e74c3c' }}></span>
                    <span>Cancelled: {dashboardData.stats.cancelledBookings}</span>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="data-section">
                <h3>👥 Recent Users</h3>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.users.map(user => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span 
                              className="role-badge"
                              style={{ backgroundColor: getRoleColor(user.role) }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>{user.phone}</td>
                          <td>
                            <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vehicles Table */}
              <div className="data-section">
                <h3>🚗 Recent Vehicles</h3>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th>Price/Day</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.vehicles.map(vehicle => (
                        <tr key={vehicle._id}>
                          <td>{vehicle.name}</td>
                          <td>{vehicle.type}</td>
                          <td>{formatCurrency(vehicle.pricePerDay)}</td>
                          <td>{vehicle.location}</td>
                          <td>
                            <span className={`status-badge ${vehicle.isAvailable ? 'available' : 'unavailable'}`}>
                              {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mechanics Table */}
              <div className="data-section">
                <h3>🔧 Recent Mechanics</h3>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Experience</th>
                        <th>Rating</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.mechanics.map(mechanic => (
                        <tr key={mechanic._id}>
                          <td>{mechanic.name || 'N/A'}</td>
                          <td>{mechanic.specialization}</td>
                          <td>{mechanic.experience} years</td>
                          <td>
                            <span className="rating">
                              ⭐ {mechanic.rating.toFixed(1)} ({mechanic.totalReviews})
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${mechanic.availability ? 'available' : 'unavailable'}`}>
                              {mechanic.availability ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="data-section">
                <h3>📅 Recent Bookings</h3>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Vehicle</th>
                        <th>Customer</th>
                        <th>Dates</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.bookings.map(booking => (
                        <tr key={booking._id}>
                          <td>{booking._id.slice(-8)}</td>
                          <td>{booking.vehicle?.name || 'N/A'}</td>
                          <td>{booking.user?.name || 'N/A'}</td>
                          <td>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </td>
                          <td>{formatCurrency(booking.totalAmount)}</td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(booking.status) }}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Test Credentials */}
              <div className="test-credentials">
                <h3>🔑 Test Credentials</h3>
                <div className="credentials-grid">
                  <div className="credential-card">
                    <h4>Admin</h4>
                    <p><strong>Email:</strong> admin@vehicle.com</p>
                    <p><strong>Password:</strong> admin123</p>
                  </div>
                  <div className="credential-card">
                    <h4>Vendor</h4>
                    <p><strong>Email:</strong> vendor1@autorentals.com</p>
                    <p><strong>Password:</strong> vendor123</p>
                  </div>
                  <div className="credential-card">
                    <h4>Mechanic</h4>
                    <p><strong>Email:</strong> raj@mechanic.com</p>
                    <p><strong>Password:</strong> mechanic123</p>
                  </div>
                  <div className="credential-card">
                    <h4>Customer</h4>
                    <p><strong>Email:</strong> john@example.com</p>
                    <p><strong>Password:</strong> user123</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardDataDisplay;
