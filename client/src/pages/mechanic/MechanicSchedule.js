import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaTools, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaFilter, FaDownload } from 'react-icons/fa';
import './MechanicSchedule.css';

const MechanicSchedule = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, in_progress, completed
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAllDates, setShowAllDates] = useState(false);

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
      const response = await fetch('http://localhost:5000/api/mechanics/bookings/mechanic', {
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
    let filtered = bookings;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(booking => booking.status === filter);
    }

    // Filter by date (only if showAllDates is false)
    if (!showAllDates && selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.preferredDate);
        return bookingDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    return filtered.sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate));
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/mechanics/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err.message);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaExclamationCircle className="status-icon pending" />;
      case 'confirmed':
        return <FaCheckCircle className="status-icon confirmed" />;
      case 'in_progress':
        return <FaClock className="status-icon in-progress" />;
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaExclamationCircle className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const exportSchedule = () => {
    const csvContent = [
      ['Date', 'Time', 'Customer', 'Service', 'Status', 'Location', 'Phone'].join(','),
      ...getFilteredBookings().map(booking => [
        formatDate(booking.preferredDate),
        booking.preferredTime || 'Not specified',
        booking.customerId?.name || 'Unknown',
        booking.serviceType,
        booking.status,
        booking.location,
        booking.contactPhone
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mechanic-schedule-${showAllDates ? 'all-dates' : (selectedDate || 'all')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="mechanic-schedule-page">
        <div className="container">
          <div className="page-header">
            <h1>My Schedule</h1>
            <p>Manage your appointments and availability</p>
          </div>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mechanic-schedule-page">
      <div className="container">
        <div className="page-header">
          <h1>My Schedule</h1>
          <p>
            Manage your appointments and availability
            {showAllDates && (
              <span className="filter-indicator">
                • Showing all dates
              </span>
            )}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Filters and Controls */}
        <div className="schedule-controls">
          <div className="filter-group">
            <label htmlFor="dateFilter">
              <FaCalendar className="filter-icon" />
              Date:
            </label>
            <input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-filter"
              disabled={showAllDates}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="showAllDates" className="checkbox-label">
              <input
                type="checkbox"
                id="showAllDates"
                checked={showAllDates}
                onChange={(e) => setShowAllDates(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Show All Dates</span>
            </label>
          </div>

          <div className="filter-group">
            <label htmlFor="statusFilter">
              <FaFilter className="filter-icon" />
              Status:
            </label>
            <select
              id="statusFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button className="btn btn-outline" onClick={exportSchedule}>
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* Schedule Stats */}
        <div className="schedule-stats">
          <div className="stat-card">
            <div className="stat-number">{filteredBookings.length}</div>
            <div className="stat-label">{showAllDates ? 'All Bookings' : 'Filtered Bookings'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredBookings.filter(b => b.status === 'pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredBookings.filter(b => b.status === 'confirmed').length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredBookings.filter(b => b.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bookings-container">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <FaCalendar className="no-bookings-icon" />
              <h3>No bookings found</h3>
              <p>
                {filter === 'all' 
                  ? (showAllDates 
                      ? "You don't have any bookings yet." 
                      : `No bookings found for ${selectedDate}. Try enabling "Show All Dates" to see all bookings.`)
                  : `No ${filter} bookings found${showAllDates ? '' : ` for ${selectedDate}`}.`
                }
              </p>
            </div>
          ) : (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-date-time">
                      <div className="date">
                        <FaCalendar className="icon" />
                        {formatDate(booking.preferredDate)}
                      </div>
                      {booking.preferredTime && (
                        <div className="time">
                          <FaClock className="icon" />
                          {booking.preferredTime}
                        </div>
                      )}
                    </div>
                    <div className={`booking-status ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                    </div>
                  </div>

                  <div className="booking-content">
                    <div className="customer-info">
                      <h4>
                        <FaUser className="icon" />
                        {booking.customerId?.name || 'Customer'}
                      </h4>
                      <p className="phone">
                        <FaPhone className="icon" />
                        {booking.contactPhone}
                      </p>
                    </div>

                    <div className="service-info">
                      <h5>
                        <FaTools className="icon" />
                        {booking.serviceType}
                      </h5>
                      <p className="description">{booking.description}</p>
                      <p className="duration">Duration: {booking.estimatedDuration}</p>
                    </div>

                    <div className="location-info">
                      <FaMapMarkerAlt className="icon" />
                      <span>{booking.location}</span>
                    </div>

                    {booking.totalCost && (
                      <div className="cost-info">
                        <strong>Cost: ₹{booking.totalCost}</strong>
                      </div>
                    )}
                  </div>

                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateBookingStatus(booking._id, 'in_progress')}
                      >
                        Start Service
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                      >
                        Complete Service
                      </button>
                    )}
                    {booking.status === 'completed' && booking.rating && (
                      <div className="rating-display">
                        <span>Customer Rating: {booking.rating}/5</span>
                        {booking.review && <p>"{booking.review}"</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MechanicSchedule;
