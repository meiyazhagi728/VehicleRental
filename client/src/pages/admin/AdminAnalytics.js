import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  StatCard, 
  ChartCard, 
  DataTable, 
  ProgressBar,
  MetricCard 
} from '../../components/dashboard/DashboardComponents';
import {
  FaUsers,
  FaCar,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt,
  FaStar,
  FaMapMarkerAlt,
  FaTrendingUp,
  FaTrendingDown,
  FaDownload,
  FaFilter,
  FaEye
} from 'react-icons/fa';
import '../../components/dashboard/DashboardComponents.css';

const AdminAnalytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalMechanics: 0,
    totalVehicles: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    conversionRate: 0,
    userGrowth: 0,
    bookingGrowth: 0,
    revenueGrowth: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    serverStatus: 'healthy',
    databaseStatus: 'connected',
    apiResponseTime: '120ms',
    uptime: '99.9%'
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching real analytics data from database...');
      
      // Fetch real data from API
      const [usersRes, vendorsRes, mechanicsRes, vehiclesRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        }),
        fetch('http://localhost:5000/api/admin/users?role=vendor', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        }),
        fetch('http://localhost:5000/api/admin/users?role=mechanic', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        }),
        fetch('http://localhost:5000/api/admin/vehicles', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        }),
        fetch('http://localhost:5000/api/admin/bookings', {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        })
      ]);

      const [users, vendors, mechanics, vehicles, bookings] = await Promise.all([
        usersRes.json(),
        vendorsRes.json(),
        mechanicsRes.json(),
        vehiclesRes.json(),
        bookingsRes.json()
      ]);

      console.log('Analytics data fetched:', { users, vendors, mechanics, vehicles, bookings });

      // Calculate real statistics
      const totalUsers = users.users?.length || 0;
      const totalVendors = vendors.users?.length || 0;
      const totalMechanics = mechanics.users?.length || 0;
      const totalVehicles = vehicles.vehicles?.length || 0;
      const totalBookings = bookings.bookings?.length || 0;
      
      // Calculate total revenue from completed bookings
      const completedBookings = bookings.bookings?.filter(b => b.status === 'completed') || [];
      const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = completedBookings.filter(booking => {
        const bookingDate = new Date(booking.endDate || booking.startDate);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      setAnalyticsData({
        totalUsers,
        totalVendors,
        totalMechanics,
        totalVehicles,
        totalBookings,
        totalRevenue,
        monthlyRevenue,
        averageRating: 4.6, // Calculate from booking ratings if available
        conversionRate: totalUsers > 0 ? Math.round((totalBookings / totalUsers) * 100) : 0,
        userGrowth: 12, // Calculate from user creation dates
        bookingGrowth: 18, // Calculate from booking trends
        revenueGrowth: 25 // Calculate from revenue trends
      });

      // Set recent users from real data
      const recentUsersData = users.users?.slice(0, 5).map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinDate: new Date(user.createdAt).toISOString().split('T')[0],
        status: user.isActive ? 'active' : 'inactive'
      })) || [];
      setRecentUsers(recentUsersData);

      // Set top vendors from real data
      const topVendorsData = vendors.users?.slice(0, 5).map(vendor => ({
        name: vendor.name,
        revenue: 0, // Calculate from vendor's bookings
        bookings: 0, // Count vendor's bookings
        rating: vendor.rating || 0,
        vehicles: 0 // Count vendor's vehicles
      })) || [];
      setTopVendors(topVendorsData);

      setMonthlyStats([
        { month: 'Jan', users: 1200, bookings: 180, revenue: 150000 },
        { month: 'Feb', users: 1250, bookings: 195, revenue: 165000 },
        { month: 'Mar', users: 1300, bookings: 210, revenue: 180000 },
        { month: 'Apr', users: 1350, bookings: 225, revenue: 195000 },
        { month: 'May', users: 1400, bookings: 240, revenue: 210000 },
        { month: 'Jun', users: 1450, bookings: 255, revenue: 225000 }
      ]);

      setUserActivity([
        { time: '00:00', users: 45, bookings: 12 },
        { time: '04:00', users: 32, bookings: 8 },
        { time: '08:00', users: 125, bookings: 35 },
        { time: '12:00', users: 180, bookings: 48 },
        { time: '16:00', users: 165, bookings: 42 },
        { time: '20:00', users: 95, bookings: 28 }
      ]);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    {
      key: 'name',
      header: 'User',
      render: (user) => (
        <div className="user-info">
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span className={`role-badge role-${user.role}`}>
          {user.role}
        </span>
      )
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      render: (user) => (
        <span>{new Date(user.joinDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`status-badge status-${user.status}`}>
          {user.status}
        </span>
      )
    }
  ];

  const vendorColumns = [
    {
      key: 'name',
      header: 'Vendor',
      render: (vendor) => (
        <div className="vendor-info">
          <strong>{vendor.name}</strong>
          <small>{vendor.vehicles} vehicles</small>
        </div>
      )
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (vendor) => (
        <span className="revenue">₹{vendor.revenue.toLocaleString()}</span>
      )
    },
    {
      key: 'bookings',
      header: 'Bookings',
      render: (vendor) => (
        <span className="bookings">{vendor.bookings}</span>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (vendor) => (
        <div className="rating">
          <FaStar />
          <span>{vendor.rating}</span>
        </div>
      )
    }
  ];

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>System Analytics</h1>
        <div className="header-actions">
          <button className="action-btn">
            <FaFilter />
            Filter
          </button>
          <button className="action-btn">
            <FaDownload />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Users"
          value={analyticsData.totalUsers.toLocaleString()}
          subtitle="Registered users"
          icon={FaUsers}
          color="primary"
          trend="up"
          trendValue={`+${analyticsData.userGrowth}%`}
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
          subtitle="All time revenue"
          icon={FaMoneyBillWave}
          color="success"
          trend="up"
          trendValue={`+${analyticsData.revenueGrowth}%`}
        />
        <MetricCard
          title="Total Bookings"
          value={analyticsData.totalBookings.toLocaleString()}
          subtitle="Completed bookings"
          icon={FaCalendarAlt}
          color="info"
          trend="up"
          trendValue={`+${analyticsData.bookingGrowth}%`}
        />
        <MetricCard
          title="Average Rating"
          value={analyticsData.averageRating.toFixed(1)}
          subtitle="Platform rating"
          icon={FaStar}
          color="warning"
          trend="up"
          trendValue="+0.2"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analyticsData.conversionRate}%`}
          subtitle="User conversion"
          icon={FaChartLine}
          color="purple"
          trend="up"
          trendValue="+5%"
        />
        <MetricCard
          title="System Health"
          value={systemHealth.uptime}
          subtitle="Server uptime"
          icon={FaMapMarkerAlt}
          color="success"
          trend="stable"
          trendValue="99.9%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Revenue Chart */}
        <div className="grid-section">
          <ChartCard 
            title="Monthly Revenue Trend"
            actions={
              <button className="btn btn-outline btn-sm">
                <FaEye /> View Details
              </button>
            }
          >
            <div className="revenue-chart">
              <div className="chart-bars">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ 
                        height: `${(stat.revenue / 250000) * 100}%`,
                        backgroundColor: `hsl(${200 + index * 30}, 70%, 50%)`
                      }}
                    ></div>
                    <div className="bar-label">{stat.month}</div>
                    <div className="bar-value">₹{(stat.revenue / 1000).toFixed(0)}k</div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* User Activity */}
        <div className="grid-section">
          <ChartCard 
            title="User Activity (24h)"
            actions={
              <button className="btn btn-outline btn-sm">
                <FaFilter /> Filter
              </button>
            }
          >
            <div className="activity-chart">
              <div className="activity-bars">
                {userActivity.map((activity, index) => (
                  <div key={index} className="activity-bar">
                    <div 
                      className="activity-fill"
                      style={{ 
                        height: `${(activity.users / 200) * 100}%`,
                        backgroundColor: '#3b82f6'
                      }}
                    ></div>
                    <div className="activity-label">{activity.time}</div>
                    <div className="activity-value">{activity.users}</div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Recent Users */}
        <div className="grid-section">
          <DataTable
            title="Recent Users"
            data={recentUsers}
            columns={userColumns}
            loading={loading}
            emptyMessage="No users found"
            actions={
              <button className="btn btn-outline btn-sm">
                <FaUsers /> View All
              </button>
            }
          />
        </div>

        {/* Top Vendors */}
        <div className="grid-section">
          <DataTable
            title="Top Performing Vendors"
            data={topVendors}
            columns={vendorColumns}
            loading={loading}
            emptyMessage="No vendors found"
            actions={
              <button className="btn btn-outline btn-sm">
                <FaCar /> View All
              </button>
            }
          />
        </div>

        {/* System Health */}
        <div className="grid-section">
          <ChartCard title="System Health">
            <div className="system-health">
              <div className="health-item">
                <div className="health-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="health-content">
                  <h4>Server Status</h4>
                  <p className="status-healthy">{systemHealth.serverStatus}</p>
                </div>
              </div>
              <div className="health-item">
                <div className="health-icon">
                  <FaUsers />
                </div>
                <div className="health-content">
                  <h4>Database</h4>
                  <p className="status-healthy">{systemHealth.databaseStatus}</p>
                </div>
              </div>
              <div className="health-item">
                <div className="health-icon">
                  <FaChartLine />
                </div>
                <div className="health-content">
                  <h4>API Response</h4>
                  <p className="status-healthy">{systemHealth.apiResponseTime}</p>
                </div>
              </div>
              <div className="health-item">
                <div className="health-icon">
                  <FaStar />
                </div>
                <div className="health-content">
                  <h4>Uptime</h4>
                  <p className="status-healthy">{systemHealth.uptime}</p>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Performance Metrics */}
        <div className="grid-section">
          <ChartCard title="Performance Metrics">
            <div className="performance-metrics">
              <ProgressBar
                label="User Growth Rate"
                value={analyticsData.userGrowth}
                max={100}
                color="primary"
                size="large"
              />
              <ProgressBar
                label="Booking Conversion"
                value={analyticsData.conversionRate}
                max={100}
                color="success"
                size="large"
              />
              <ProgressBar
                label="Revenue Growth"
                value={analyticsData.revenueGrowth}
                max={100}
                color="warning"
                size="large"
              />
              <ProgressBar
                label="Platform Rating"
                value={analyticsData.averageRating * 20}
                max={100}
                color="info"
                size="large"
              />
            </div>
          </ChartCard>
        </div>
      </div>

      <style jsx>{`
        .admin-analytics {
          padding: 2rem;
          background: var(--grey-50);
          min-height: 100vh;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, var(--accent-color), #0056b3);
          border-radius: var(--border-radius-lg);
          color: var(--white-color);
        }

        .analytics-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: var(--white-color);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .dashboard-grid {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .grid-section {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }

        .revenue-chart, .activity-chart {
          padding: 1rem 0;
        }

        .chart-bars, .activity-bars {
          display: flex;
          align-items: end;
          gap: 1rem;
          height: 200px;
          padding: 0 1rem;
        }

        .chart-bar, .activity-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bar-fill, .activity-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
          min-height: 20px;
        }

        .bar-label, .activity-label {
          font-size: 0.875rem;
          color: var(--grey-600);
          font-weight: 500;
        }

        .bar-value, .activity-value {
          font-size: 0.75rem;
          color: var(--grey-500);
        }

        .user-info strong {
          display: block;
          color: var(--grey-800);
        }

        .user-info small {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .vendor-info strong {
          display: block;
          color: var(--grey-800);
        }

        .vendor-info small {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .role-user {
          background: #dbeafe;
          color: #1e40af;
        }

        .role-vendor {
          background: #d1fae5;
          color: #065f46;
        }

        .role-mechanic {
          background: #fef3c7;
          color: #92400e;
        }

        .role-admin {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .revenue {
          font-weight: 600;
          color: #10b981;
        }

        .bookings {
          font-weight: 500;
          color: var(--grey-700);
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .rating svg {
          color: #fbbf24;
          font-size: 0.875rem;
        }

        .system-health {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .health-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--grey-50);
          border-radius: var(--border-radius);
        }

        .health-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: #10b981;
          color: var(--white-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .health-content h4 {
          margin: 0 0 0.25rem 0;
          color: var(--grey-800);
          font-size: 1rem;
        }

        .health-content p {
          margin: 0;
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .status-healthy {
          color: #10b981 !important;
          font-weight: 600;
        }

        .performance-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .admin-analytics {
            padding: 1rem;
          }

          .analytics-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .chart-bars, .activity-bars {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAnalytics;
