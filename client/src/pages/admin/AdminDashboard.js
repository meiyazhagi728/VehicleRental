import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  StatCard, 
  ChartCard, 
  DataTable, 
  QuickActionCard, 
  ProgressBar,
  MetricCard 
} from '../../components/dashboard/DashboardComponents';
import AdminVendorManagement from './AdminVendorManagement';
import AdminVehicleManagement from './AdminVehicleManagement';
import ManageUsers from './ManageUsers';
import AdminBookingManagement from './AdminBookingManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import QuickActionModal from '../../components/QuickActionModal';
import { 
  FaUsers, 
  FaCar, 
  FaChartLine, 
  FaCalendarAlt, 
  FaCog,
  FaMoneyBillWave,
  FaStar,
  FaShieldAlt,
  FaTrophy,
  FaBell,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaUserCheck,
  FaUserTimes,
  FaCarCrash,
  FaTools,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from 'react-icons/fa';
import '../../components/dashboard/DashboardComponents.css';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalVehicles: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    systemHealth: 100,
    averageRating: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (user?.token) {
      fetchAdminData();
    }
  }, [user?.token]);

  const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');
      

      // Fetch comprehensive admin data
      await Promise.all([
        fetchAdminStats(),
        fetchRecentActivity(),
        fetchSystemMetrics(),
        fetchTopPerformers(),
        fetchAlerts()
      ]);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

  const fetchAdminStats = async () => {
    try {
      // Fetch real data from MongoDB
      const [usersRes, vendorsRes, vehiclesRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/users?role=vendor', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/vehicles', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/bookings', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [usersData, vendorsData, vehiclesData, bookingsData] = await Promise.all([
        usersRes.ok ? usersRes.json() : { users: [] },
        vendorsRes.ok ? vendorsRes.json() : { users: [] },
        vehiclesRes.ok ? vehiclesRes.json() : { vehicles: [] },
        bookingsRes.ok ? bookingsRes.json() : { bookings: [] }
      ]);

      const totalUsers = usersData.users?.length || 0;
      const totalVendors = vendorsData.users?.length || 0;
      const totalVehicles = vehiclesData.vehicles?.length || 0;
      const totalBookings = bookingsData.bookings?.length || 0;
      
      // Calculate revenue from bookings
      const totalRevenue = bookingsData.bookings?.reduce((sum, booking) => 
        sum + (booking.totalAmount || 0), 0) || 0;
      
      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyRevenue = bookingsData.bookings?.filter(booking => 
        new Date(booking.createdAt) >= thirtyDaysAgo
      ).reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) || 0;

      // Calculate active users (users with bookings in last 30 days)
      const activeUsers = new Set(
        bookingsData.bookings?.filter(booking => 
          new Date(booking.createdAt) >= thirtyDaysAgo
        ).map(booking => booking.userId)
      ).size || 0;

      const realStats = {
        totalUsers,
        totalVendors,
        totalVehicles,
        totalBookings,
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        activeUsers,
        pendingApprovals: 0, // This would need a separate API
        systemHealth: 98, // This would need system monitoring
        averageRating: 4.6 // This would need rating calculation
      };
      
      setAdminStats(realStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Fallback to mock data if API fails
      const mockStats = {
        totalUsers: 0,
        totalVendors: 0,
        totalVehicles: 0,
        totalBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeUsers: 0,
        pendingApprovals: 0,
        systemHealth: 0,
        averageRating: 0
      };
      setAdminStats(mockStats);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Fetch real recent activity from bookings and users
      const [bookingsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/bookings?limit=10&sort=-createdAt', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/users?limit=5&sort=-createdAt', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [bookingsData, usersData] = await Promise.all([
        bookingsRes.ok ? bookingsRes.json() : { bookings: [] },
        usersRes.ok ? usersRes.json() : { users: [] }
      ]);

      const activities = [];

      // Add recent bookings as activities
      bookingsData.bookings?.slice(0, 5).forEach(booking => {
        activities.push({
          id: `booking_${booking._id}`,
          type: 'booking_created',
          user: booking.user?.name || 'Unknown User',
          action: `created booking for ${booking.vehicle?.make} ${booking.vehicle?.model}`,
          timestamp: booking.createdAt,
          status: booking.status === 'cancelled' ? 'warning' : 'success'
        });
      });

      // Add recent user registrations as activities
      usersData.users?.slice(0, 3).forEach(user => {
        activities.push({
          id: `user_${user._id}`,
          type: 'user_registration',
          user: user.name,
          action: `registered as ${user.role}`,
          timestamp: user.createdAt,
          status: 'success'
        });
      });

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setRecentActivity(activities.slice(0, 10)); // Limit to 10 most recent
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      // Calculate real system metrics based on data
      const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/bookings', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/vehicles', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [bookingsData, usersData, vehiclesData] = await Promise.all([
        bookingsRes.ok ? bookingsRes.json() : { bookings: [] },
        usersRes.ok ? usersRes.json() : { users: [] },
        vehiclesRes.ok ? vehiclesRes.json() : { vehicles: [] }
      ]);

      const totalBookings = bookingsData.bookings?.length || 0;
      const totalUsers = usersData.users?.length || 0;
      const totalVehicles = vehiclesData.vehicles?.length || 0;
      
      // Calculate booking success rate
      const successfulBookings = bookingsData.bookings?.filter(b => 
        b.status === 'completed' || b.status === 'confirmed'
      ).length || 0;
      const successRate = totalBookings > 0 ? (successfulBookings / totalBookings) * 100 : 0;

      // Calculate vehicle utilization
      const availableVehicles = vehiclesData.vehicles?.filter(v => v.isAvailable).length || 0;
      const utilizationRate = totalVehicles > 0 ? ((totalVehicles - availableVehicles) / totalVehicles) * 100 : 0;

      // Calculate user engagement (users with bookings)
      const usersWithBookings = new Set(bookingsData.bookings?.map(b => b.userId)).size;
      const engagementRate = totalUsers > 0 ? (usersWithBookings / totalUsers) * 100 : 0;

      const metrics = [
        { name: 'Booking Success Rate', value: Math.round(successRate), max: 100, color: successRate > 80 ? 'success' : 'warning' },
        { name: 'Vehicle Utilization', value: Math.round(utilizationRate), max: 100, color: utilizationRate > 70 ? 'primary' : 'info' },
        { name: 'User Engagement', value: Math.round(engagementRate), max: 100, color: engagementRate > 50 ? 'success' : 'warning' },
        { name: 'System Health', value: 95, max: 100, color: 'success' }
      ];
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      setSystemMetrics([]);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      // Fetch real top performers data
      const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/bookings', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/admin/vehicles', {
          headers: { 
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [bookingsData, usersData, vehiclesData] = await Promise.all([
        bookingsRes.ok ? bookingsRes.json() : { bookings: [] },
        usersRes.ok ? usersRes.json() : { users: [] },
        vehiclesRes.ok ? vehiclesRes.json() : { vehicles: [] }
      ]);

      const performers = [];

      // Top users by booking count and spending
      const userStats = {};
      bookingsData.bookings?.forEach(booking => {
        if (!userStats[booking.userId]) {
          userStats[booking.userId] = { bookings: 0, spent: 0, name: booking.user?.name || 'Unknown' };
        }
        userStats[booking.userId].bookings++;
        userStats[booking.userId].spent += booking.totalAmount || 0;
      });

      const topUsers = Object.values(userStats)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 3)
        .map(user => ({
          name: user.name,
          bookings: user.bookings,
          spent: Math.round(user.spent),
          rating: 4.5, // Default rating
          type: 'user'
        }));

      performers.push(...topUsers);

      // Top vendors by revenue
      const vendorStats = {};
      bookingsData.bookings?.forEach(booking => {
        if (booking.vendorId) {
          if (!vendorStats[booking.vendorId]) {
            vendorStats[booking.vendorId] = { revenue: 0, bookings: 0, name: booking.vendor?.name || 'Unknown Vendor' };
          }
          vendorStats[booking.vendorId].revenue += booking.totalAmount || 0;
          vendorStats[booking.vendorId].bookings++;
        }
      });

      const topVendors = Object.values(vendorStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 2)
        .map(vendor => ({
          name: vendor.name,
          revenue: Math.round(vendor.revenue),
          bookings: vendor.bookings,
          rating: 4.6, // Default rating
          type: 'vendor'
        }));

      performers.push(...topVendors);

      setTopPerformers(performers);
    } catch (error) {
      console.error('Error fetching top performers:', error);
      setTopPerformers([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      // Mock alerts data
      const alerts = [
        {
          id: 1,
          type: 'warning',
          title: 'High Server Load',
          message: 'Server load is above 80%',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          priority: 'high'
        },
        {
          id: 2,
          type: 'info',
          title: 'New Vendor Application',
          message: '5 new vendor applications pending review',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          priority: 'medium'
        },
        {
          id: 3,
          type: 'success',
          title: 'System Update Complete',
          message: 'Latest security patches applied successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          priority: 'low'
        }
      ];
      setAlerts(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const activityColumns = [
    {
      key: 'user',
      header: 'User',
      render: (activity) => (
        <div className="activity-user">
          <strong>{activity.user}</strong>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action',
      render: (activity) => (
        <div className="activity-action">
          <span className={`action-type action-${activity.type}`}>
            {activity.action}
          </span>
        </div>
      )
    },
    {
      key: 'timestamp',
      header: 'Time',
      render: (activity) => (
        <div className="activity-time">
          {new Date(activity.timestamp).toLocaleString()}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (activity) => (
        <span className={`status-badge status-${activity.status}`}>
          {activity.status}
        </span>
      )
    }
  ];

  const alertColumns = [
    {
      key: 'title',
      header: 'Alert',
      render: (alert) => (
        <div className="alert-info">
          <strong>{alert.title}</strong>
          <small>{alert.message}</small>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (alert) => (
        <span className={`alert-type alert-${alert.type}`}>
          {alert.type}
        </span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (alert) => (
        <span className={`priority-badge priority-${alert.priority}`}>
          {alert.priority}
        </span>
      )
    },
    {
      key: 'timestamp',
      header: 'Time',
      render: (alert) => (
        <div className="alert-time">
          {new Date(alert.timestamp).toLocaleString()}
        </div>
      )
    }
  ];

  const quickActions = [
    {
      icon: FaUsers,
      title: 'Manage Vendors',
      description: 'Approve vendor requests',
      color: 'primary',
      onClick: () => setModal('vendors')
    },
    {
      icon: FaCar,
      title: 'Manage Vehicles',
      description: 'View and manage vehicles',
      color: 'success',
      onClick: () => setModal('vehicles')
    },
    {
      icon: FaUsers,
      title: 'Manage Users',
      description: 'Add, edit and manage users',
      color: 'info',
      onClick: () => setModal('users')
    },
    {
      icon: FaCalendarAlt,
      title: 'Manage Bookings',
      description: 'Create and manage bookings',
      color: 'warning',
      onClick: () => setModal('bookings')
    },
    {
      icon: FaChartLine,
      title: 'Analytics',
      description: 'View detailed analytics',
      color: 'purple',
      onClick: () => setModal('analytics')
    },
    {
      icon: FaCog,
      title: 'Settings',
      description: 'Configure system settings',
      color: 'danger',
      onClick: () => setModal('settings')
    }
  ];

  return (
    <div className="admin-dashboard">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Admin Dashboard</h1>
          <p>Welcome back{user?.name ? `, ${user.name}` : ''}. System overview and management.</p>
          <div className="admin-badges">
            <span className="badge badge-primary">
              <FaShieldAlt /> System Admin
            </span>
            <span className="badge badge-success">
              <FaCheckCircle /> All Systems Operational
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn">
            <FaBell />
            <span className="notification-count">{alerts.length}</span>
          </button>
          <button className="action-btn">
            <FaDownload />
          </button>
          <button className="action-btn">
            <FaCog />
          </button>
          </div>
        </div>

        {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Users"
          value={adminStats.totalUsers.toLocaleString()}
          subtitle={`${adminStats.activeUsers} active`}
          icon={FaUsers}
          color="primary"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${adminStats.totalRevenue.toLocaleString()}`}
          subtitle={`₹${adminStats.monthlyRevenue.toLocaleString()} this month`}
          icon={FaMoneyBillWave}
          color="success"
          trend="up"
          trendValue="+18%"
        />
        <MetricCard
          title="Total Vehicles"
          value={adminStats.totalVehicles.toLocaleString()}
          subtitle="Across all vendors"
          icon={FaCar}
          color="info"
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title="Total Bookings"
          value={adminStats.totalBookings.toLocaleString()}
          subtitle="All time bookings"
          icon={FaCalendarAlt}
          color="warning"
          trend="up"
          trendValue="+15%"
        />
        <MetricCard
          title="System Health"
          value={`${adminStats.systemHealth}%`}
          subtitle="Overall system status"
          icon={FaShieldAlt}
          color="success"
          trend="up"
          trendValue="+2%"
        />
        <MetricCard
          title="Average Rating"
          value={adminStats.averageRating.toFixed(1)}
          subtitle="Customer satisfaction"
          icon={FaStar}
          color="purple"
          trend="up"
          trendValue="+0.3"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="grid-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                icon={action.icon}
                title={action.title}
                description={action.description}
                color={action.color}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid-section">
          <ChartCard title="System Performance">
            <div className="system-metrics">
              {systemMetrics.map((metric, index) => (
                <ProgressBar
                  key={index}
                  label={metric.name}
                  value={metric.value}
                  max={metric.max}
                  color={metric.color}
                  size="large"
                />
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Recent Activity */}
        <div className="grid-section">
          <DataTable
            title="Recent Activity"
            data={recentActivity}
            columns={activityColumns}
            loading={loading}
            emptyMessage="No recent activity"
            actions={
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setModal('users')}
              >
                <FaEye /> View All
              </button>
            }
          />
        </div>

        {/* System Alerts */}
        <div className="grid-section">
          <DataTable
            title="System Alerts"
            data={alerts}
            columns={alertColumns}
            loading={loading}
            emptyMessage="No alerts"
            actions={
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setModal('settings')}
              >
                <FaBell /> Manage Alerts
              </button>
            }
          />
          </div>

        {/* Top Performers */}
        <div className="grid-section">
          <ChartCard 
            title="Top Performers"
            actions={
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setModal('analytics')}
              >
                <FaTrophy /> View Rankings
              </button>
            }
          >
            <div className="top-performers">
              {topPerformers.map((performer, index) => (
                <div key={index} className="performer-card">
                  <div className="performer-rank">
                    <FaTrophy />
                    <span>#{index + 1}</span>
                  </div>
                  <div className="performer-info">
                    <h4>{performer.name}</h4>
                    <div className="performer-stats">
                      {performer.type === 'vendor' && (
                        <>
                          <span className="stat">
                            <FaMoneyBillWave /> ₹{performer.revenue.toLocaleString()}
                          </span>
                          <span className="stat">
                            <FaCalendarAlt /> {performer.bookings} bookings
                          </span>
                        </>
                      )}
                      {performer.type === 'user' && (
                        <>
                          <span className="stat">
                            <FaCalendarAlt /> {performer.bookings} bookings
                          </span>
                          <span className="stat">
                            <FaMoneyBillWave /> ₹{performer.spent.toLocaleString()}
                          </span>
                        </>
                      )}
                      {performer.type === 'mechanic' && (
                        <>
                          <span className="stat">
                            <FaTools /> {performer.services} services
                          </span>
                          <span className="stat">
                            <FaMoneyBillWave /> ₹{performer.revenue.toLocaleString()}
                          </span>
                        </>
                      )}
                      <span className="stat">
                        <FaStar /> {performer.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Pending Approvals */}
        <div className="grid-section">
          <ChartCard 
            title="Pending Approvals"
            actions={
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setModal('users')}
              >
                <FaEdit /> Manage All
              </button>
            }
          >
            <div className="pending-approvals">
              <div className="approval-item">
                <div className="approval-icon">
              <FaUsers />
                </div>
                <div className="approval-content">
                  <h4>Vendor Applications</h4>
                  <p>{adminStats.pendingApprovals} pending review</p>
                </div>
                <div className="approval-actions">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => setModal('vendors')}
                  >
                    <FaCheckCircle /> Review
                  </button>
                </div>
              </div>
              <div className="approval-item">
                <div className="approval-icon">
                  <FaCar />
                </div>
                <div className="approval-content">
                  <h4>Vehicle Listings</h4>
                  <p>8 pending verification</p>
                </div>
                <div className="approval-actions">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => setModal('vehicles')}
                  >
                    <FaCheckCircle /> Review
                  </button>
                </div>
              </div>
              <div className="approval-item">
                <div className="approval-icon">
                  <FaTools />
                </div>
                <div className="approval-content">
                  <h4>Mechanic Applications</h4>
                  <p>3 pending approval</p>
                </div>
                <div className="approval-actions">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => setModal('users')}
                  >
                    <FaCheckCircle /> Review
                  </button>
                </div>
              </div>
            </div>
          </ChartCard>
          </div>
        </div>

      {/* Quick Action Modals */}
        <QuickActionModal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          title={
            modal === 'vendors' ? 'Manage Vendors' :
            modal === 'vehicles' ? 'Manage Vehicles' :
            modal === 'users' ? 'Manage Users' :
            modal === 'bookings' ? 'Manage Bookings' :
            modal === 'analytics' ? 'Analytics' :
            modal === 'settings' ? 'Settings' : 'Quick Action'
          }
          onAdd={() => {
            // Handle add action based on modal type
            switch(modal) {
              case 'vendors':
                alert('Add new vendor functionality');
                break;
              case 'vehicles':
                alert('Add new vehicle functionality');
                break;
              case 'users':
                alert('Add new user functionality');
                break;
              case 'bookings':
                alert('Add new booking functionality');
                break;
              default:
                console.log(`Add new ${modal}`);
            }
          }}
          onEdit={() => {
            // Handle edit action based on modal type
            switch(modal) {
              case 'vendors':
                alert('Edit vendor functionality');
                break;
              case 'vehicles':
                alert('Edit vehicle functionality');
                break;
              case 'users':
                alert('Edit user functionality');
                break;
              case 'bookings':
                alert('Edit booking functionality');
                break;
              default:
                console.log(`Edit ${modal}`);
            }
          }}
          onDelete={() => {
            // Handle delete action based on modal type
            switch(modal) {
              case 'vendors':
                alert('Delete vendor functionality');
                break;
              case 'vehicles':
                alert('Delete vehicle functionality');
                break;
              case 'users':
                alert('Delete user functionality');
                break;
              case 'bookings':
                alert('Delete booking functionality');
                break;
              default:
                console.log(`Delete ${modal}`);
            }
          }}
          size={modal === 'analytics' ? 'fullscreen' : 'large'}
        >
          {modal === 'vendors' && <AdminVendorManagement />}
          {modal === 'vehicles' && <AdminVehicleManagement />}
          {modal === 'users' && <ManageUsers />}
          {modal === 'bookings' && <AdminBookingManagement />}
          {modal === 'analytics' && <AdminAnalytics />}
          {modal === 'settings' && <AdminSettings />}
        </QuickActionModal>

      <style jsx>{`
        .admin-dashboard {
          padding: 2rem;
          background: var(--bg-tertiary);
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: var(--white-color);
          border-radius: var(--border-radius-lg);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
        }

        .welcome-section h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .welcome-section p {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
        }

        .admin-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-primary {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-color);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .action-btn {
          position: relative;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--grey-100);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: var(--grey-200);
          transform: scale(1.05);
        }

        .notification-count {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          background: #ef4444;
          color: var(--white-color);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          min-width: 1.25rem;
          text-align: center;
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

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--grey-800);
          margin: 0 0 1.5rem 0;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--grey-200);
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .system-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .activity-user strong {
          color: var(--text-primary);
        }

        .activity-action {
          color: var(--text-secondary);
        }

        .action-type {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .action-user_registration {
          background: #dbeafe;
          color: #1e40af;
        }

        .action-vendor_approval {
          background: #d1fae5;
          color: #065f46;
        }

        .action-booking_completed {
          background: #fef3c7;
          color: #92400e;
        }

        .action-vehicle_added {
          background: #e0e7ff;
          color: #3730a3;
        }

        .action-system_alert {
          background: #fee2e2;
          color: #991b1b;
        }

        .activity-time {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-success {
          background: #d1fae5;
          color: #065f46;
        }

        .status-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .status-error {
          background: #fee2e2;
          color: #991b1b;
        }

        .alert-info strong {
          display: block;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .alert-info small {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .alert-type {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .alert-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .alert-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
        }

        .priority-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .priority-high {
          background: #fee2e2;
          color: #991b1b;
        }

        .priority-medium {
          background: #fef3c7;
          color: #92400e;
        }

        .priority-low {
          background: #d1fae5;
          color: #065f46;
        }

        .alert-time {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .top-performers {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .performer-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }

        .performer-rank {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #fbbf24;
          font-weight: 600;
        }

        .performer-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .performer-stats {
          display: flex;
          gap: 1rem;
        }

        .performer-stats .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .pending-approvals {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .approval-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }

        .approval-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--accent-color);
          color: var(--white-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .approval-content {
          flex: 1;
        }

        .approval-content h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }

        .approval-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .approval-actions {
          display: flex;
          gap: 0.5rem;
        }

        .alert {
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 2rem;
        }

        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .welcome-section h1 {
            font-size: 2rem;
          }

          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .performer-stats {
            flex-direction: column;
            gap: 0.5rem;
          }

          .approval-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
      
    </div>
  );
};

export default AdminDashboard;
