import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaChartLine, FaUsers, FaCar, FaCalendarAlt, FaMoneyBillWave, FaDownload, FaRedo } from 'react-icons/fa';
import { isTokenValid, clearInvalidToken } from '../utils/tokenUtils';

const AdminAnalytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days
  const [chartType, setChartType] = useState('revenue');

  useEffect(() => {
    if (user?.token) {
      fetchAnalytics();
    }
  }, [dateRange, user?.token]);

  const fetchAnalytics = async () => {
    if (!user?.token) {
      setError('Please log in to view analytics');
      return;
    }
    
    // Validate token before making request
    if (!isTokenValid(user.token)) {
      console.error('Invalid or expired token detected');
      clearInvalidToken();
      setError('Session expired. Please log in again.');
      window.location.href = '/login';
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh or redirect to login
          console.error('Authentication failed, redirecting to login');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      
      // Set fallback data
      setAnalytics({
        overview: {
          totalUsers: 0,
          totalVehicles: 0,
          totalBookings: 0,
          totalRevenue: 0,
          activeUsers: 0,
          availableVehicles: 0,
          completedBookings: 0,
          monthlyRevenue: 0
        },
        trends: {
          userGrowth: [],
          bookingTrends: [],
          revenueTrends: [],
          vehicleUtilization: []
        },
        topPerformers: {
          topVehicles: [],
          topVendors: [],
          topUsers: []
        },
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const csvContent = [
      ['Metric', 'Value', 'Change'],
      ['Total Users', analytics.overview?.totalUsers || 0, '+12%'],
      ['Total Vehicles', analytics.overview?.totalVehicles || 0, '+8%'],
      ['Total Bookings', analytics.overview?.totalBookings || 0, '+18%'],
      ['Total Revenue', analytics.overview?.totalRevenue || 0, '+25%'],
      ['Active Users', analytics.overview?.activeUsers || 0, '+15%'],
      ['Available Vehicles', analytics.overview?.availableVehicles || 0, '+5%'],
      ['Completed Bookings', analytics.overview?.completedBookings || 0, '+20%'],
      ['Monthly Revenue', analytics.overview?.monthlyRevenue || 0, '+22%']
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user?.token) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">
          <FaUsers />
        </div>
        <p>Please log in to view analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">
          <FaRedo className="spinning" />
        </div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="header-controls">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button onClick={fetchAnalytics} className="btn btn-outline">
            <FaRedo /> Refresh
          </button>
          <button onClick={exportAnalytics} className="btn btn-primary">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Overview Cards */}
      <div className="overview-section">
        <h3>Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <FaUsers />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics?.overview?.totalUsers || 0}</div>
              <div className="metric-label">Total Users</div>
              <div className="metric-change positive">+12%</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FaCar />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics?.overview?.totalVehicles || 0}</div>
              <div className="metric-label">Total Vehicles</div>
              <div className="metric-change positive">+8%</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FaCalendarAlt />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics?.overview?.totalBookings || 0}</div>
              <div className="metric-label">Total Bookings</div>
              <div className="metric-change positive">+18%</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FaMoneyBillWave />
            </div>
            <div className="metric-content">
              <div className="metric-value">₹{analytics?.overview?.totalRevenue?.toLocaleString() || 0}</div>
              <div className="metric-label">Total Revenue</div>
              <div className="metric-change positive">+25%</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FaUsers />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics?.overview?.activeUsers || 0}</div>
              <div className="metric-label">Active Users</div>
              <div className="metric-change positive">+15%</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <FaCar />
            </div>
            <div className="metric-content">
              <div className="metric-value">{analytics?.overview?.availableVehicles || 0}</div>
              <div className="metric-label">Available Vehicles</div>
              <div className="metric-change positive">+5%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-controls">
          <h3>Trends & Analytics</h3>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="chart-type-select"
          >
            <option value="revenue">Revenue Trends</option>
            <option value="bookings">Booking Trends</option>
            <option value="users">User Growth</option>
            <option value="vehicles">Vehicle Utilization</option>
          </select>
        </div>

        <div className="chart-container">
          <div className="chart-placeholder">
            <FaChartLine className="chart-icon" />
            <h4>Chart Visualization</h4>
            <p>Interactive charts showing {chartType} trends over the selected period</p>
            <div className="chart-mock">
              <div className="chart-bars">
                {[65, 80, 45, 90, 70, 85, 95, 75, 60, 88, 92, 78].map((height, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="top-performers-section">
        <h3>Top Performers</h3>
        <div className="performers-grid">
          <div className="performer-card">
            <h4>Top Vehicles</h4>
            <div className="performer-list">
              {analytics?.topPerformers?.topVehicles?.slice(0, 5).map((vehicle, index) => (
                <div key={vehicle._id || index} className="performer-item">
                  <div className="performer-rank">{index + 1}</div>
                  <div className="performer-info">
                    <div className="performer-name">{vehicle.name}</div>
                    <div className="performer-metric">{vehicle.bookings} bookings</div>
                  </div>
                </div>
              )) || (
                <div className="no-data">No data available</div>
              )}
            </div>
          </div>

          <div className="performer-card">
            <h4>Top Vendors</h4>
            <div className="performer-list">
              {analytics?.topPerformers?.topVendors?.slice(0, 5).map((vendor, index) => (
                <div key={vendor._id || index} className="performer-item">
                  <div className="performer-rank">{index + 1}</div>
                  <div className="performer-info">
                    <div className="performer-name">{vendor.name}</div>
                    <div className="performer-metric">₹{vendor.revenue?.toLocaleString()}</div>
                  </div>
                </div>
              )) || (
                <div className="no-data">No data available</div>
              )}
            </div>
          </div>

          <div className="performer-card">
            <h4>Top Users</h4>
            <div className="performer-list">
              {analytics?.topPerformers?.topUsers?.slice(0, 5).map((user, index) => (
                <div key={user._id || index} className="performer-item">
                  <div className="performer-rank">{index + 1}</div>
                  <div className="performer-info">
                    <div className="performer-name">{user.name}</div>
                    <div className="performer-metric">{user.bookings} bookings</div>
                  </div>
                </div>
              )) || (
                <div className="no-data">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {analytics?.recentActivity?.length > 0 ? (
            analytics.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <FaCalendarAlt />
                </div>
                <div className="activity-content">
                  <div className="activity-text">{activity.description}</div>
                  <div className="activity-time">{new Date(activity.timestamp).toLocaleString()}</div>
                </div>
                <div className="activity-status">
                  <span className={`status-badge status-${activity.type}`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No recent activity</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-analytics {
          padding: 1rem;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .date-range-select,
        .chart-type-select {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
        }

        .overview-section {
          margin-bottom: 2rem;
        }

        .overview-section h3 {
          margin-bottom: 1rem;
          color: #495057;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-2px);
        }

        .metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: var(--blue-shard-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .metric-content {
          flex: 1;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #495057;
          margin-bottom: 0.25rem;
        }

        .metric-label {
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .metric-change {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .metric-change.positive {
          color: #28a745;
        }

        .metric-change.negative {
          color: #dc3545;
        }

        .charts-section {
          margin-bottom: 2rem;
        }

        .chart-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .chart-container {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .chart-placeholder {
          text-align: center;
          padding: 2rem;
        }

        .chart-icon {
          font-size: 3rem;
          color: #6c757d;
          margin-bottom: 1rem;
        }

        .chart-mock {
          margin-top: 2rem;
        }

        .chart-bars {
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 0.5rem;
          height: 200px;
        }

        .chart-bar {
          width: 20px;
          background: var(--blue-shard-gradient);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s;
        }

        .chart-bar:hover {
          background: var(--blue-shard-gradient);
        }

        .top-performers-section {
          margin-bottom: 2rem;
        }

        .performers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .performer-card {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .performer-card h4 {
          margin: 0 0 1rem 0;
          color: #495057;
        }

        .performer-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .performer-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .performer-rank {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .performer-info {
          flex: 1;
        }

        .performer-name {
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.25rem;
        }

        .performer-metric {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .recent-activity-section {
          margin-bottom: 2rem;
        }

        .activity-list {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-weight: 500;
          color: #495057;
          margin-bottom: 0.25rem;
        }

        .activity-time {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-booking { background: #d4edda; color: #155724; }
        .status-user { background: #d1ecf1; color: #0c5460; }
        .status-vehicle { background: #fff3cd; color: #856404; }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary { background: #007bff; color: white; }
        .btn-outline { background: transparent; color: #6c757d; border: 1px solid #6c757d; }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .loading-spinner {
          margin-bottom: 1rem;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .no-data {
          text-align: center;
          color: #6c757d;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-controls {
            justify-content: center;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .performers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;
