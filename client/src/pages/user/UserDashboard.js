import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getUserBookings } from '../../store/slices/bookingSlice';
import { getVehicles } from '../../store/slices/vehicleSlice';
import { getMechanics } from '../../store/slices/mechanicSlice';
import { 
  StatCard, 
  ChartCard, 
  DataTable, 
  QuickActionCard, 
  ProgressBar,
  MetricCard 
} from '../../components/dashboard/DashboardComponents';
import { 
  FaCar, 
  FaTools, 
  FaHistory, 
  FaUser, 
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClock,
  FaSearch,
  FaHeart,
  FaBell,
  FaCog,
  FaChartLine,
  FaUsers,
  FaTrophy,
  FaShieldAlt
} from 'react-icons/fa';
import '../../components/dashboard/DashboardComponents.css';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { bookings, isLoading: bookingsLoading } = useSelector((state) => state.bookings);
  const { vehicles, isLoading: vehiclesLoading } = useSelector((state) => state.vehicles);
  const { mechanics, isLoading: mechanicsLoading } = useSelector((state) => state.mechanics);
  
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    completedTrips: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteVehicleType: 'Sedan',
    memberSince: new Date().getFullYear(),
    loyaltyPoints: 0,
    upcomingBookings: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    dispatch(getUserBookings());
    dispatch(getVehicles({ limit: 10 }));
    dispatch(getMechanics({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    if (bookings.length > 0) {
      calculateUserStats();
      generateRecentActivity();
    }
  }, [bookings]);

  useEffect(() => {
    if (vehicles.length > 0) {
      generateRecommendations();
    }
  }, [vehicles]);

  const calculateUserStats = () => {
    const totalBookings = bookings.length;
    const completedTrips = bookings.filter(b => b.status === 'completed').length;
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    const ratings = bookings
      .filter(b => b.rating)
      .map(b => b.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    const upcomingBookings = bookings.filter(b => 
      ['pending', 'confirmed'].includes(b.status)
    ).length;

    const loyaltyPoints = Math.floor(totalSpent / 1000) * 10;

    setUserStats({
      totalBookings,
      completedTrips,
      totalSpent,
      averageRating,
      upcomingBookings,
      loyaltyPoints,
      memberSince: new Date(user?.createdAt || Date.now()).getFullYear()
    });
  };

  const generateRecentActivity = () => {
    const activities = bookings.slice(0, 5).map(booking => ({
      id: booking._id,
      type: 'booking',
      title: `Booked ${booking.vehicleId?.name || 'Vehicle'}`,
      date: new Date(booking.createdAt).toLocaleDateString(),
      status: booking.status,
      amount: booking.totalAmount
    }));
    setRecentActivity(activities);
  };

  const generateRecommendations = () => {
    const userBookings = bookings.map(b => b.vehicleId?.type).filter(Boolean);
    const favoriteType = userBookings.length > 0 
      ? userBookings.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        )
      : 'Sedan';

    const recommendedVehicles = vehicles
      .filter(v => v.type === favoriteType && v.isAvailable)
      .slice(0, 3);

    setRecommendations(recommendedVehicles);
  };

  const bookingColumns = [
    {
      key: 'vehicleName',
      header: 'Vehicle',
      render: (booking) => (
        <div className="vehicle-info">
          <strong>{booking.vehicleId?.name || 'Vehicle'}</strong>
          <small>{booking.vehicleId?.type}</small>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (booking) => (
        <div className="date-info">
          <div>{new Date(booking.startDate).toLocaleDateString()}</div>
          <div>to {new Date(booking.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (booking) => (
        <span className="amount">₹{booking.totalAmount}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => (
        <span className={`status-badge status-${booking.status}`}>
          {booking.status}
        </span>
      )
    }
  ];

  const quickActions = [
    {
      icon: FaCar,
      title: 'Browse Vehicles',
      description: 'Find your perfect ride',
      color: 'primary',
      onClick: () => navigate('/vehicles')
    },
    {
      icon: FaTools,
      title: 'Find Mechanics',
      description: 'Get roadside assistance',
      color: 'success',
      onClick: () => navigate('/mechanics')
    },
    {
      icon: FaHistory,
      title: 'My Bookings',
      description: 'Manage your bookings',
      color: 'warning',
      onClick: () => navigate('/my-bookings')
    },
    {
      icon: FaHistory,
      title: 'Booking History',
      description: 'View all your trips',
      color: 'info',
      onClick: () => navigate('/bookings')
    },
    {
      icon: FaUser,
      title: 'Update Profile',
      description: 'Manage your account',
      color: 'warning',
      onClick: () => navigate('/profile')
    }
  ];

  return (
    <div className="enhanced-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what's happening with your account</p>
          <div className="user-badges">
            <span className="badge badge-primary" style={{backgroundColor: userStats.loyaltyPoints > 0 ? '#10b981' : '#f59e0b'}}>
              <FaTrophy /> Loyalty Member
            </span>
            <span className="badge badge-success">
              <FaShieldAlt /> Verified User
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn">
            <FaBell />
            <span className="notification-count">3</span>
          </button>
          <button className="action-btn">
            <FaCog />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Bookings"
          value={userStats.totalBookings}
          subtitle={`${userStats.completedTrips} completed`}
          icon={FaCar}
          color="primary"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Total Spent"
          value={`₹${userStats.totalSpent.toLocaleString()}`}
          subtitle="This year"
          icon={FaMoneyBillWave}
          color="success"
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title="Average Rating"
          value={userStats.averageRating.toFixed(1)}
          subtitle="Based on reviews"
          icon={FaStar}
          color="warning"
          trend="up"
          trendValue="+0.3"
        />
        <MetricCard
          title="Loyalty Points"
          value={userStats.loyaltyPoints}
          subtitle="Available for rewards"
          icon={FaTrophy}
          color="purple"
          trend="up"
          trendValue="+50"
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

        {/* Recent Bookings */}
        <div className="grid-section">
          <DataTable
            title="Recent Bookings"
            data={bookings.slice(0, 5)}
            columns={bookingColumns}
            loading={bookingsLoading}
            emptyMessage="No bookings yet. Start exploring vehicles!"
            actions={
              <Link to="/bookings" className="btn btn-outline btn-sm">
                View All
              </Link>
            }
          />
        </div>

        {/* Recommendations */}
        <div className="grid-section">
          <ChartCard 
            title="Recommended for You"
            actions={
              <Link to="/vehicles" className="btn btn-outline btn-sm">
                <FaSearch /> Browse All
              </Link>
            }
          >
            <div className="recommendations-list">
              {recommendations.length > 0 ? (
                recommendations.map((vehicle) => (
                  <div key={vehicle._id} className="recommendation-card">
                    <div className="vehicle-image">
                      <img 
                        src={vehicle.images?.[0] || '/default-vehicle.jpg'} 
                        alt={vehicle.name}
                        onError={(e) => {
                          e.target.src = '/default-vehicle.jpg';
                        }}
                      />
                    </div>
                    <div className="vehicle-details">
                      <h4>{vehicle.name}</h4>
                      <p>{vehicle.type} • {vehicle.seatingCapacity} seats</p>
                      <div className="vehicle-rating">
                        <FaStar />
                        <span>{vehicle.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                      <div className="vehicle-price">
                        <span className="price">₹{vehicle.pricePerDay}</span>
                        <span className="period">/day</span>
                      </div>
                    </div>
                    <div className="vehicle-actions">
                      <Link 
                        to={`/vehicles/${vehicle._id}`} 
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-recommendations">
                  <p>Complete your first booking to get personalized recommendations!</p>
                  <Link to="/vehicles" className="btn btn-primary">
                    Browse Vehicles
                  </Link>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Activity Summary */}
        <div className="grid-section">
          <ChartCard title="Activity Summary">
            <div className="activity-summary">
              <div className="activity-item">
                <div className="activity-icon">
                  <FaCalendarAlt />
                </div>
                <div className="activity-content">
                  <h4>Upcoming Bookings</h4>
                  <p>{userStats.upcomingBookings} trips scheduled</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FaClock />
                </div>
                <div className="activity-content">
                  <h4>Member Since</h4>
                  <p>{userStats.memberSince}</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="activity-content">
                  <h4>Favorite Type</h4>
                  <p>{userStats.favoriteVehicleType}</p>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Progress Tracking */}
        <div className="grid-section">
          <ChartCard title="Progress Tracking">
            <div className="progress-tracking">
              <ProgressBar
                label="Booking Completion Rate"
                value={userStats.completedTrips}
                max={userStats.totalBookings || 1}
                color="success"
                size="large"
              />
              <ProgressBar
                label="Loyalty Points Progress"
                value={userStats.loyaltyPoints}
                max={1000}
                color="primary"
                size="large"
              />
              <ProgressBar
                label="Profile Completion"
                value={75}
                max={100}
                color="info"
                size="large"
              />
            </div>
          </ChartCard>
        </div>

        {/* Nearby Mechanics */}
        <div className="grid-section">
          <ChartCard 
            title="Nearby Mechanics"
            actions={
              <Link to="/mechanics" className="btn btn-outline btn-sm">
                View All
              </Link>
            }
          >
            <div className="mechanics-list">
              {mechanics.slice(0, 3).map((mechanic) => (
                <div key={mechanic._id} className="mechanic-card">
                  <div className="mechanic-info">
                    <h4>{mechanic.userId?.name || 'Mechanic'}</h4>
                    <p>{mechanic.specialization}</p>
                    <div className="mechanic-rating">
                      <FaStar />
                      <span>{mechanic.rating?.toFixed(1) || '4.5'}</span>
                      <span className="reviews">({mechanic.totalReviews || 0} reviews)</span>
                    </div>
                    <div className="mechanic-location">
                      <FaMapMarkerAlt />
                      <span>{mechanic.address?.city}, {mechanic.address?.state}</span>
                    </div>
                  </div>
                  <div className="mechanic-actions">
                    <Link 
                      to={`/mechanics/${mechanic._id}`} 
                      className="btn btn-outline btn-sm"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <style jsx>{`
        .enhanced-dashboard {
          padding: 2rem;
          background: var(--bg-tertiary);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 2rem;
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

        .user-badges {
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
          background: rgba(255, 255, 255, 0.2);
          color: var(--white-color);
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
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
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: var(--white-color);
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
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
          align-items: stretch;
        }

        .dashboard-grid {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          align-items: start;
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

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recommendation-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--grey-50);
          border-radius: var(--border-radius);
          transition: all 0.3s ease;
        }

        .recommendation-card:hover {
          background: var(--grey-100);
          transform: translateY(-2px);
        }

        .vehicle-image {
          width: 4rem;
          height: 4rem;
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .vehicle-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vehicle-details {
          flex: 1;
        }

        .vehicle-details h4 {
          margin: 0 0 0.25rem 0;
          color: var(--grey-800);
        }

        .vehicle-details p {
          margin: 0 0 0.5rem 0;
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .vehicle-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .vehicle-rating svg {
          color: #fbbf24;
          font-size: 0.875rem;
        }

        .vehicle-price {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .price {
          font-weight: 600;
          color: var(--accent-color);
        }

        .period {
          font-size: 0.875rem;
          color: var(--grey-500);
        }

        .vehicle-actions {
          display: flex;
          align-items: center;
        }

        .no-recommendations {
          text-align: center;
          padding: 2rem;
          color: var(--grey-600);
        }

        .activity-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--grey-50);
          border-radius: var(--border-radius);
        }

        .activity-icon {
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

        .activity-content h4 {
          margin: 0 0 0.25rem 0;
          color: var(--grey-800);
          font-size: 1rem;
        }

        .activity-content p {
          margin: 0;
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .progress-tracking {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mechanics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mechanic-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--grey-50);
          border-radius: var(--border-radius);
        }

        .mechanic-info h4 {
          margin: 0 0 0.25rem 0;
          color: var(--grey-800);
        }

        .mechanic-info p {
          margin: 0 0 0.5rem 0;
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .mechanic-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .mechanic-rating svg {
          color: #fbbf24;
          font-size: 0.875rem;
        }

        .reviews {
          font-size: 0.75rem;
          color: var(--grey-500);
        }

        .mechanic-location {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--grey-500);
        }

        .vehicle-info strong {
          display: block;
          color: var(--grey-800);
        }

        .vehicle-info small {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .date-info {
          font-size: 0.875rem;
          color: var(--grey-600);
        }

        .amount {
          font-weight: 600;
          color: var(--accent-color);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-completed {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 768px) {
          .enhanced-dashboard {
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

          .recommendation-card,
          .mechanic-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;