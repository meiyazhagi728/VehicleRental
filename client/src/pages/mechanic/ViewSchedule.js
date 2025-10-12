import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaCar, FaTools } from 'react-icons/fa';
import './ViewSchedule.css';

const ViewSchedule = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, today, completed

  useEffect(() => {
    if (!user || !token) {
      setError('Please log in to view your schedule');
      return;
    }
    fetchBookings();
  }, [user, token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching mechanic bookings...');
      const response = await fetch('http://localhost:5000/api/bookings/mechanic', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('Mechanic bookings:', data);
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startDate);
      
      switch (filter) {
        case 'upcoming':
          return bookingDate >= now && booking.status !== 'completed' && booking.status !== 'cancelled';
        case 'today':
          return bookingDate >= today && bookingDate < tomorrow && booking.status !== 'completed' && booking.status !== 'cancelled';
        case 'completed':
          return booking.status === 'completed';
        default:
          return true;
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Your Schedule</h1>
          <p>View and manage your upcoming appointments</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Your Schedule</h1>
        <p>View and manage your upcoming appointments</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filter Controls */}
      <div className="schedule-filters">
        <div className="filter-group">
          <label>Filter by:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Bookings</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="schedule-stats">
          <span className="stat-item">
            <FaCalendar className="stat-icon" />
            Total: {bookings.length}
          </span>
          <span className="stat-item">
            <FaClock className="stat-icon" />
            Upcoming: {bookings.filter(b => new Date(b.startDate) >= new Date() && b.status !== 'completed' && b.status !== 'cancelled').length}
          </span>
        </div>
      </div>

      {/* Bookings List */}
      <div className="schedule-container">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <FaCalendar className="no-bookings-icon" />
            <h3>No {filter === 'all' ? '' : filter} bookings found</h3>
            <p>
              {filter === 'upcoming' 
                ? "You don't have any upcoming appointments." 
                : filter === 'today'
                ? "You don't have any appointments today."
                : filter === 'completed'
                ? "You haven't completed any bookings yet."
                : "You don't have any bookings yet."
              }
            </p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-date">
                    <FaCalendar className="date-icon" />
                    <span>{formatDate(booking.startDate)}</span>
                  </div>
                  <div className="booking-time">
                    <FaClock className="time-icon" />
                    <span>{formatTime(booking.startDate)}</span>
                  </div>
                  <div className={`booking-status ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>

                <div className="booking-details">
                  <div className="customer-info">
                    <div className="customer-name">
                      <FaUser className="info-icon" />
                      <span>{booking.userId?.name || 'Customer'}</span>
                    </div>
                    {booking.userId?.phone && (
                      <div className="customer-phone">
                        <FaPhone className="info-icon" />
                        <span>{booking.userId.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="service-info">
                    <div className="vehicle-info">
                      <FaCar className="info-icon" />
                      <span>{booking.vehicleId?.name || 'Vehicle Service'}</span>
                    </div>
                    <div className="service-type">
                      <FaTools className="info-icon" />
                      <span>General Service</span>
                    </div>
                  </div>

                  <div className="location-info">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{booking.pickupLocation || 'Service Location'}</span>
                  </div>

                  {booking.totalAmount && (
                    <div className="booking-amount">
                      <strong>₹{booking.totalAmount}</strong>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  {booking.status === 'confirmed' && (
                    <button className="btn btn-primary btn-sm">
                      Start Service
                    </button>
                  )}
                  {booking.status === 'active' && (
                    <button className="btn btn-success btn-sm">
                      Complete Service
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar View Placeholder */}
      <div className="calendar-placeholder">
        <h3>Calendar View</h3>
        <div className="calendar-coming-soon">
          <FaCalendar className="calendar-icon" />
          <p>Interactive calendar view coming soon...</p>
          <p>For now, use the list view above to manage your schedule.</p>
        </div>
      </div>
    </div>
  );
};

export default ViewSchedule;
