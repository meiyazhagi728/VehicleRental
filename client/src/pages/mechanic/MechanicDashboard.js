import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ViewSchedule from './ViewSchedule';
// import { useRealtime } from '../../contexts/RealtimeContext';
import { 
  ChartCard, 
  DataTable, 
  QuickActionCard, 
  ProgressBar,
  MetricCard 
} from '../../components/dashboard/DashboardComponents';
import QuickActionModal from '../../components/QuickActionModal';
import { 
  FaTools, 
  FaClock, 
  FaStar, 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEdit, 
  FaCheckCircle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaTrophy,
  FaShieldAlt,
  FaWrench,
  FaUsers,
  FaEye
} from 'react-icons/fa';
import '../../components/dashboard/DashboardComponents.css';

const MechanicDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  // const { emitMechanicAvailability } = useRealtime();
  const [mechanicProfile, setMechanicProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [mechanicStats, setMechanicStats] = useState({
    totalServices: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    monthlyEarnings: 0,
    completedJobs: 0,
    pendingJobs: 0,
    responseTime: 0
  });
  const [serviceHistory, setServiceHistory] = useState([]);
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [customerReviews, setCustomerReviews] = useState([]);

  const fetchMechanicProfile = useCallback(async () => {
    try {
      console.log('fetchMechanicProfile called');
      const response = await fetch('http://localhost:5000/api/mechanics/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Mechanic profile data:', data);
        console.log('Services in profile:', data.services);
        setMechanicProfile(data);
        
        // Immediately update services count
        if (data.services && Array.isArray(data.services)) {
          console.log('Immediately updating totalServices to:', data.services.length);
          setMechanicStats(prev => ({
            ...prev,
            totalServices: data.services.length
          }));
        }
      } else {
        // If no profile exists, create a basic one
        const basicProfile = {
          specialization: 'General Mechanic',
          experience: 0,
          rating: 0,
          totalReviews: 0,
          availability: true,
          services: [],
          pricing: { hourlyRate: 0 },
          totalEarnings: 0,
          completedJobs: 0
        };
        setMechanicProfile(basicProfile);
      }
    } catch (err) {
      setError('Failed to load mechanic profile');
    }
  }, [token]);


  const fetchMechanicStatistics = useCallback(async () => {
    try {
      console.log('fetchMechanicStatistics called');
      console.log('Fetching mechanic statistics from database...');
      
      // Fetch all mechanic bookings to calculate real statistics
      const response = await fetch('http://localhost:5000/api/mechanics/bookings/mechanic', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mechanic statistics');
      }

      const data = await response.json();
      const bookings = data.bookings || [];
      
      console.log('Mechanic bookings for statistics:', bookings);

      // Calculate real statistics from bookings
      const completedBookings = bookings.filter(booking => booking.status === 'completed');
      const pendingBookings = bookings.filter(booking => booking.status === 'pending');
      const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
      
      // Calculate total earnings from completed bookings
      const totalEarnings = completedBookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
      
      // Calculate monthly earnings (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = completedBookings.filter(booking => {
        const bookingDate = new Date(booking.actualEndTime || booking.preferredDate);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
      
      // Calculate average rating from completed bookings with ratings
      const ratedBookings = completedBookings.filter(booking => booking.rating && booking.rating > 0);
      const averageRating = ratedBookings.length > 0 
        ? ratedBookings.reduce((sum, booking) => sum + booking.rating, 0) / ratedBookings.length 
        : 0;
      
      // Calculate total reviews
      const totalReviews = ratedBookings.length;
      
      // Calculate response time (mock for now, could be calculated from booking creation to confirmation)
      const responseTime = Math.floor(Math.random() * 30) + 15;
      
      // Get services count from current profile or fetch it
      let servicesCount = 0;
      if (mechanicProfile?.services) {
        servicesCount = mechanicProfile.services.length;
        console.log('Using services from current profile:', servicesCount);
      } else {
        // If profile not loaded, fetch it directly
        try {
          const profileResponse = await fetch('http://localhost:5000/api/mechanics/profile', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            servicesCount = profileData.services?.length || 0;
            console.log('Fetched services from API:', servicesCount);
          }
        } catch (error) {
          console.log('Could not fetch profile for services count:', error);
        }
      }

      const realStats = {
        totalServices: servicesCount,
        totalEarnings: totalEarnings,
        averageRating: averageRating,
        totalReviews: totalReviews,
        monthlyEarnings: monthlyEarnings,
        completedJobs: completedBookings.length,
        pendingJobs: pendingBookings.length + confirmedBookings.length,
        responseTime: responseTime
      };
      
      console.log('Calculated real statistics:', realStats);
      setMechanicStats(realStats);
      
    } catch (error) {
      console.error('Error fetching mechanic statistics:', error);
      // Keep existing stats on error
    }
  }, [token]);

  const fetchRecentBookings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/mechanic', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }, [user?.token]);

  const bookingsColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (b) => (
        <div className="customer-info">
          <strong>{b.userId?.name || 'Customer'}</strong>
        </div>
      )
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (b) => (
        <div className="vehicle-info">
          <strong>
            {b.vehicleId?.brand} {b.vehicleId?.model}
          </strong>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (b) => (
        <div className="date-info">
          <div>{new Date(b.startDate).toLocaleDateString()}</div>
          <div>to {new Date(b.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (b) => (
        <a href={`tel:${b.userId?.phone || ''}`} className="btn btn-outline btn-sm">
          <FaPhone /> Call
        </a>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <span className={`status-badge status-${b.status}`}>{b.status}</span>
      )
    }
  ];

  const fetchServiceHistory = async () => {
    try {
      console.log('Fetching service history from database...');
      const response = await fetch('http://localhost:5000/api/mechanics/bookings/mechanic?status=completed', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service history');
      }

      const data = await response.json();
      console.log('Service history data:', data);
      
      // Transform the data to match the expected format
      const history = data.bookings.map(booking => ({
        id: booking._id,
        customer: booking.customerId?.name || 'Customer',
        service: booking.serviceType,
        date: booking.actualEndTime || booking.preferredDate,
        amount: booking.totalCost || 0,
        rating: booking.rating || 0,
        status: booking.status
      }));

      setServiceHistory(history);
    } catch (error) {
      console.error('Error fetching service history:', error);
      // Fallback to empty array on error
      setServiceHistory([]);
    }
  };

  const fetchUpcomingJobs = async () => {
    try {
      console.log('Fetching upcoming jobs from database...');
      const response = await fetch('http://localhost:5000/api/mechanics/bookings/mechanic?status=confirmed,in_progress', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming jobs');
      }

      const data = await response.json();
      console.log('Upcoming jobs data:', data);
      
      // Transform the data to match the expected format
      const jobs = data.bookings.map(booking => ({
        id: booking._id,
        customer: booking.customerId?.name || 'Customer',
        service: booking.serviceType,
        scheduledDate: booking.preferredDate,
        location: booking.location || 'Location TBD',
        estimatedDuration: booking.estimatedDuration || '1 hour',
        amount: booking.totalCost || 0
      }));

      setUpcomingJobs(jobs);
    } catch (error) {
      console.error('Error fetching upcoming jobs:', error);
      // Fallback to empty array on error
      setUpcomingJobs([]);
    }
  };

  const fetchCustomerReviews = async () => {
    try {
      console.log('Fetching customer reviews from database...');
      const response = await fetch('http://localhost:5000/api/mechanics/bookings/mechanic?status=completed&hasReview=true', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer reviews');
      }

      const data = await response.json();
      console.log('Customer reviews data:', data);
      
      // Transform the data to match the expected format
      const reviews = data.bookings
        .filter(booking => booking.rating && booking.review)
        .map(booking => ({
          id: booking._id,
          customer: booking.customerId?.name || 'Customer',
          rating: booking.rating,
          comment: booking.review,
          date: booking.actualEndTime || booking.preferredDate,
          service: booking.serviceType
        }));

      setCustomerReviews(reviews);
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      // Fallback to empty array on error
      setCustomerReviews([]);
    }
  };

  const fetchMechanicData = useCallback(async () => {
    try {
      console.log('fetchMechanicData called');
      setLoading(true);
      await Promise.all([
        fetchMechanicProfile(),
        fetchRecentBookings(),
        fetchServiceHistory(),
        fetchUpcomingJobs(),
        fetchCustomerReviews(),
        fetchMechanicStatistics()
      ]);
      console.log('fetchMechanicData completed');
    } catch (error) {
      console.error('Error fetching mechanic data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMechanicProfile, fetchRecentBookings, fetchMechanicStatistics]);

  useEffect(() => {
    fetchMechanicData();
  }, [fetchMechanicData]);

  // Update services count when profile is loaded
  useEffect(() => {
    console.log('Services useEffect triggered');
    console.log('mechanicProfile:', mechanicProfile);
    console.log('mechanicProfile.services:', mechanicProfile?.services);
    
    if (mechanicProfile?.services && Array.isArray(mechanicProfile.services)) {
      const servicesCount = mechanicProfile.services.length;
      console.log('Updating totalServices to:', servicesCount);
      setMechanicStats(prev => ({
        ...prev,
        totalServices: servicesCount
      }));
    } else {
      console.log('No services found in profile or services is not an array');
      console.log('Services type:', typeof mechanicProfile?.services);
      console.log('Services value:', mechanicProfile?.services);
    }
  }, [mechanicProfile]);

  const updateAvailability = async (availability) => {
    try {
      const response = await fetch('http://localhost:5000/api/mechanics/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability }),
      });

      if (response.ok) {
        setMechanicProfile(prev => ({ ...prev, availability }));
        
        // Emit real-time update (disabled for now)
        // emitMechanicAvailability({
        //   mechanicId: user._id,
        //   availability: availability
        // });
        console.log('Availability updated:', { mechanicId: user._id, availability });
      }
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  const serviceHistoryColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (service) => (
        <div className="customer-info">
          <strong>{service.customer}</strong>
        </div>
      )
    },
    {
      key: 'service',
      header: 'Service',
      render: (service) => (
        <div className="service-info">
          <strong>{service.service}</strong>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (service) => (
        <div className="service-date">
          {new Date(service.date).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (service) => (
        <span className="service-amount">₹{service.amount}</span>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (service) => (
        <div className="service-rating">
          <FaStar />
          <span>{service.rating}</span>
        </div>
      )
    }
  ];

  const upcomingJobsColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (job) => (
        <div className="job-customer">
          <strong>{job.customer}</strong>
        </div>
      )
    },
    {
      key: 'service',
      header: 'Service',
      render: (job) => (
        <div className="job-service">
          <strong>{job.service}</strong>
        </div>
      )
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled',
      render: (job) => (
        <div className="job-date">
          {new Date(job.scheduledDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (job) => (
        <div className="job-location">
          <FaMapMarkerAlt />
          <span>{job.location}</span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (job) => (
        <span className="job-amount">₹{job.amount}</span>
      )
    }
  ];

  const quickActions = [
    {
      icon: FaUser,
      title: 'Update Profile',
      description: 'Manage your details and information',
      color: 'primary',
      onClick: () => setActiveModal('profile')
    },
    {
      icon: FaClock,
      title: 'Set Availability',
      description: 'Update your working hours and status',
      color: 'success',
      onClick: () => navigate('/mechanic/availability')
    },
    {
      icon: FaTools,
      title: 'Manage Services',
      description: 'Add or update your services',
      color: 'info',
      onClick: () => navigate('/mechanic/services')
    },
    {
      icon: FaCalendarAlt,
      title: 'View Schedule',
      description: 'Check your upcoming appointments',
      color: 'warning',
      onClick: () => navigate('/mechanic/schedule')
    }
  ];

  if (loading) {
    return (
      <div className="mechanic-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mechanic-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your services and track your performance</p>
          <div className="mechanic-badges">
            <span className={`badge ${mechanicProfile?.availability ? 'badge-success' : 'badge-warning'}`}>
              <FaCheckCircle /> {mechanicProfile?.availability ? 'Available' : 'Unavailable'}
            </span>
            <span className="badge badge-primary" style={{backgroundColor: mechanicProfile?.availability ? '#10b981' : '#f59e0b'}}>
              <FaShieldAlt /> Verified Mechanic
            </span>
            <span className="badge badge-purple">
              <FaTrophy /> {mechanicStats.averageRating.toFixed(1)}★ Rating
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn">
            <FaBell />
            <span className="notification-count">{upcomingJobs.length}</span>
          </button>
          <button className="action-btn">
            <FaCog />
          </button>
          <button
            className={`availability-toggle ${mechanicProfile?.availability ? 'available' : 'unavailable'}`}
            onClick={() => updateAvailability(!mechanicProfile?.availability)}
          >
            {mechanicProfile?.availability ? (
              <>
                <FaCheckCircle /> Available
              </>
            ) : (
              <>
                <FaClock /> Unavailable
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Earnings"
          value={`₹${mechanicStats.totalEarnings.toLocaleString()}`}
          subtitle={`₹${mechanicStats.monthlyEarnings.toLocaleString()} this month`}
          icon={FaMoneyBillWave}
          color="success"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Completed Jobs"
          value={mechanicStats.completedJobs}
          subtitle={`${mechanicStats.pendingJobs} pending`}
          icon={FaTools}
          color="primary"
          trend="up"
          trendValue="+8%"
        />
        <MetricCard
          title="Average Rating"
          value={mechanicStats.averageRating.toFixed(1)}
          subtitle={`${mechanicStats.totalReviews} reviews`}
          icon={FaStar}
          color="warning"
          trend="up"
          trendValue="+0.3"
        />
        <MetricCard
          title="Response Time"
          value={`${mechanicStats.responseTime} min`}
          subtitle="Average response time"
          icon={FaClock}
          color="info"
          trend="down"
          trendValue="-5 min"
        />
        <MetricCard
          title="Services Offered"
          value={mechanicStats.totalServices}
          subtitle="Active services"
          icon={FaWrench}
          color="purple"
          trend="up"
          trendValue="+2"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={`${Math.round(mechanicStats.averageRating * 20)}%`}
          subtitle="Based on reviews"
          icon={FaUsers}
          color="success"
          trend="up"
          trendValue="+6%"
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

        {/* Service History */}
        <div className="grid-section">
          <DataTable
            title="Recent Bookings"
            data={recentBookings}
            columns={bookingsColumns}
            loading={loading}
            emptyMessage="No bookings assigned yet"
            actions={
              <button className="btn btn-outline btn-sm">
                <FaEye /> View All
              </button>
            }
          />
        </div>

        {/* Service History */}
        <div className="grid-section">
          <DataTable
            title="Recent Service History"
            data={serviceHistory}
            columns={serviceHistoryColumns}
            loading={loading}
            emptyMessage="No service history yet"
            actions={
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/mechanic/schedule')}
              >
                <FaEye /> View All
              </button>
            }
          />
        </div>

        {/* Upcoming Jobs */}
        <div className="grid-section">
          <DataTable
            title="Upcoming Jobs"
            data={upcomingJobs}
            columns={upcomingJobsColumns}
            loading={loading}
            emptyMessage="No upcoming jobs scheduled"
            actions={
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/mechanic/schedule')}
              >
                <FaCalendarAlt /> View Schedule
              </button>
            }
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid-section">
          <ChartCard title="Performance Metrics">
            <div className="performance-metrics">
              <ProgressBar
                label="Job Completion Rate"
                value={mechanicStats.completedJobs}
                max={mechanicStats.completedJobs + mechanicStats.pendingJobs || 1}
                color="success"
                size="large"
              />
              <ProgressBar
                label="Customer Satisfaction"
                value={mechanicStats.averageRating * 20}
                max={100}
                color="warning"
                size="large"
              />
              <ProgressBar
                label="Response Time Efficiency"
                value={Math.max(0, 100 - mechanicStats.responseTime)}
                max={100}
                color="info"
                size="large"
              />
            </div>
          </ChartCard>
        </div>

        {/* Customer Reviews */}
        <div className="grid-section">
          <ChartCard 
            title="Recent Customer Reviews"
            actions={
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setActiveModal('reviews')}
              >
                <FaStar /> View All Reviews
              </button>
            }
          >
            <div className="reviews-list">
              {customerReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-customer">
                      <strong>{review.customer}</strong>
                      <span className="review-service">{review.service}</span>
                    </div>
                    <div className="review-rating">
                      <FaStar />
                      <span>{review.rating}</span>
                    </div>
                  </div>
                  <div className="review-content">
                    <p>{review.comment}</p>
                    <div className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Profile Information */}
        <div className="grid-section">
          <ChartCard 
            title="Profile Information"
            actions={
              <Link to="/profile" className="btn btn-outline btn-sm">
                <FaEdit /> Edit Profile
              </Link>
            }
          >
            <div className="profile-info">
              <div className="info-item">
                <strong>Specialization:</strong>
                <span>{mechanicProfile?.specialization || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <strong>Experience:</strong>
                <span>{mechanicProfile?.experience || 0} years</span>
              </div>
              <div className="info-item">
                <strong>Hourly Rate:</strong>
                <span>₹{mechanicProfile?.pricing?.hourlyRate || 0}/hour</span>
              </div>
              <div className="info-item">
                <strong>Location:</strong>
                <span>
                  <FaMapMarkerAlt /> {mechanicProfile?.address?.city || 'Not specified'}, {mechanicProfile?.address?.state || 'Not specified'}
                </span>
              </div>
              <div className="info-item">
                <strong>Contact:</strong>
                <span>
                  <FaPhone /> {mechanicProfile?.contactInfo?.phone || user?.phone || 'Not specified'}
                </span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Quick Action Modals */}
      <QuickActionModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        title="Update Profile"
        size="medium"
      >
        <div className="profile-form">
          <h3>Profile Information</h3>
          <p>Update your mechanic profile details here.</p>
          <div className="form-group">
            <label>Specialization</label>
            <input type="text" placeholder="e.g., Engine Repair, AC Service" />
          </div>
          <div className="form-group">
            <label>Experience (Years)</label>
            <input type="number" placeholder="Years of experience" />
          </div>
          <div className="form-group">
            <label>Hourly Rate (₹)</label>
            <input type="number" placeholder="Rate per hour" />
          </div>
          <button className="btn btn-primary">Update Profile</button>
        </div>
      </QuickActionModal>

      <QuickActionModal
        isOpen={activeModal === 'availability'}
        onClose={() => setActiveModal(null)}
        title="Set Availability"
        size="medium"
      >
        <div className="availability-form">
          <h3>Availability Settings</h3>
          <p>Set your working hours and availability status.</p>
          <div className="form-group">
            <label>Current Status</label>
            <div className="status-toggle">
              <button 
                className={`btn ${mechanicProfile?.availability ? 'btn-success' : 'btn-warning'}`}
                onClick={() => updateAvailability(!mechanicProfile?.availability)}
              >
                {mechanicProfile?.availability ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Working Hours</label>
            <div className="time-inputs">
              <input type="time" placeholder="Start time" />
              <span>to</span>
              <input type="time" placeholder="End time" />
            </div>
          </div>
          <button className="btn btn-primary">Update Availability</button>
        </div>
      </QuickActionModal>

      <QuickActionModal
        isOpen={activeModal === 'services'}
        onClose={() => setActiveModal(null)}
        title="Manage Services"
        size="medium"
      >
        <div className="services-form">
          <h3>Services Offered</h3>
          <p>Add or update the services you offer.</p>
          <div className="services-list">
            {mechanicProfile?.services?.map((service, index) => (
              <div key={index} className="service-item">
                <span>{service}</span>
                <button className="btn btn-sm btn-outline">Remove</button>
              </div>
            ))}
          </div>
          <div className="add-service">
            <input type="text" placeholder="Add new service" />
            <button className="btn btn-primary">Add Service</button>
          </div>
        </div>
      </QuickActionModal>

      <QuickActionModal
        isOpen={activeModal === 'schedule'}
        onClose={() => setActiveModal(null)}
        title="View Schedule"
        size="large"
      >
        <ViewSchedule />
      </QuickActionModal>

      <QuickActionModal
        isOpen={activeModal === 'reviews'}
        onClose={() => setActiveModal(null)}
        title="All Customer Reviews"
        size="large"
      >
        <div className="reviews-modal-content">
          {customerReviews.length === 0 ? (
            <div className="no-reviews">
              <FaStar className="no-reviews-icon" />
              <h3>No reviews yet</h3>
              <p>Customer reviews will appear here once you complete jobs.</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {customerReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="customer-info">
                      <h4>{review.customer}</h4>
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < review.rating ? 'star-filled' : 'star-empty'} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="review-meta">
                      <span className="service">{review.service}</span>
                      <span className="date">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="review-content">
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </QuickActionModal>

      <style jsx>{`
        .mechanic-dashboard {
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

        .mechanic-badges {
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

        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .badge-warning {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .badge-primary {
          background: rgba(255, 255, 255, 0.2);
          color: var(--white-color);
        }

        .badge-purple {
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
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

        .availability-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .availability-toggle.available {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .availability-toggle.unavailable {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .availability-toggle:hover {
          transform: scale(1.05);
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

        .performance-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .customer-info strong,
        .service-info strong,
        .job-customer strong,
        .job-service strong {
          color: var(--grey-800);
        }

        .service-date,
        .job-date {
          font-size: 0.875rem;
          color: var(--grey-600);
        }

        .service-amount,
        .job-amount {
          font-weight: 600;
          color: var(--accent-color);
        }

        .service-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .service-rating svg {
          color: #fbbf24;
          font-size: 0.875rem;
        }

        .job-location {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: var(--grey-600);
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .review-card {
          padding: 1rem;
          background: var(--grey-50);
          border-radius: var(--border-radius);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .review-customer strong {
          color: var(--grey-800);
        }

        .review-service {
          font-size: 0.875rem;
          color: var(--grey-600);
          margin-left: 0.5rem;
        }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #fbbf24;
        }

        .review-content p {
          margin: 0 0 0.5rem 0;
          color: var(--grey-700);
        }

        .review-date {
          font-size: 0.875rem;
          color: var(--grey-500);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--grey-100);
          border-radius: var(--border-radius);
        }

        .info-item strong {
          color: var(--grey-700);
        }

        .info-item span {
          color: var(--grey-600);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid var(--grey-300);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          .mechanic-dashboard {
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

          .header-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        /* Reviews Modal Styles */
        .reviews-modal-content {
          max-height: 70vh;
          overflow-y: auto;
        }

        .no-reviews {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--grey-600);
        }

        .no-reviews-icon {
          font-size: 3rem;
          color: var(--grey-400);
          margin-bottom: 1rem;
        }

        .reviews-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .review-card {
          background: white;
          border: 1px solid var(--grey-200);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .customer-info h4 {
          margin: 0 0 0.5rem 0;
          color: var(--grey-800);
          font-size: 1.1rem;
        }

        .rating {
          display: flex;
          gap: 0.25rem;
        }

        .rating .star-filled {
          color: #fbbf24;
        }

        .rating .star-empty {
          color: var(--grey-300);
        }

        .review-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .review-meta .service {
          background: var(--accent-color);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .review-meta .date {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .review-content p {
          margin: 0;
          color: var(--grey-700);
          line-height: 1.5;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default MechanicDashboard;