import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaCalendarAlt, FaMapMarkerAlt, FaCar, FaClock, FaTimes, FaCheckCircle, FaExclamationTriangle, FaSearch, FaCreditCard, FaKey } from 'react-icons/fa';
import PaymentModal from '../../components/PaymentModal';
import OTPVerification from '../../components/OTPVerification';
import './MyBookings.css';

const MyBookings = () => {
  const { token } = useSelector((state) => state.auth || {});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:5000/api/bookings/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserBookings();
    }
  }, [token, fetchUserBookings]);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Refresh bookings
      await fetchUserBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const handlePayment = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (booking) => {
    try {
      console.log('handlePaymentSuccess called with booking:', booking);
      console.log('Booking ID:', booking._id);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Update booking status to active after successful payment
      console.log('Calling booking activation API...');
      const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Activation response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Activation successful:', result);
        // Refresh bookings
        await fetchUserBookings();
        alert('Payment successful! Your booking is now active.');
      } else {
        const errorData = await response.json();
        console.error('Activation failed:', errorData);
        throw new Error(`Failed to activate booking: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error activating booking:', error);
      alert('Payment successful, but there was an error activating your booking. Please contact support.');
    }
  };

  const handleOTPVerification = (booking) => {
    setSelectedBooking(booking);
    setShowOTPModal(true);
  };

  const handleOTPSuccess = async (booking) => {
    try {
      // Update booking status to completed after OTP verification
      const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh bookings
        await fetchUserBookings();
        alert('Booking completed successfully!');
      } else {
        throw new Error('Failed to complete booking');
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('OTP verified, but there was an error completing your booking. Please contact support.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle />;
      case 'pending':
        return <FaClock />;
      case 'cancelled':
        return <FaTimes />;
      case 'completed':
        return <FaCheckCircle />;
      default:
        return <FaClock />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = searchTerm === '' || 
      booking.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Manage and track your vehicle bookings</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bookings-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({bookings.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button 
              className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button 
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({bookings.filter(b => b.status === 'completed').length})
            </button>
            <button 
              className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <FaCalendarAlt className="no-bookings-icon" />
              <h3>No bookings found</h3>
              <p>
                {filter === 'all' 
                  ? "You haven't made any bookings yet." 
                  : `No ${filter} bookings found.`
                }
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">
                    <span className="label">Booking ID:</span>
                    <span className="value">{booking._id}</span>
                  </div>
                  <div className={`booking-status ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                  </div>
                </div>

                <div className="booking-content">
                  <div className="vehicle-info">
                    <div className="vehicle-image">
                      <img 
                        src={booking.vehicleId?.images?.[0] || booking.vehicleId?.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEE5MEUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZlaGljbGUgSW1hZ2U8L3RleHQ+PC9zdmc+'} 
                        alt={booking.vehicleId?.name || (booking.vehicleId?.make || booking.vehicleId?.brand) + ' ' + booking.vehicleId?.model || 'Vehicle Image'}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNEE5MEUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZlaGljbGUgSW1hZ2U8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="vehicle-details">
                      <h3>{booking.vehicleId?.make || booking.vehicleId?.brand || 'Vehicle'} {booking.vehicleId?.model || ''}</h3>
                      <p className="vehicle-type">{booking.vehicleId?.type || 'N/A'} • {booking.vehicleId?.fuelType || 'N/A'}</p>
                      <div className="vehicle-location">
                        <FaMapMarkerAlt />
                        <span>{booking.vehicleId?.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <FaCalendarAlt />
                      <div>
                        <span className="label">Pickup Date:</span>
                        <span className="value">{formatDate(booking.startDate || booking.pickupDate)}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FaCalendarAlt />
                      <div>
                        <span className="label">Return Date:</span>
                        <span className="value">{formatDate(booking.endDate || booking.returnDate)}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FaClock />
                      <div>
                        <span className="label">Duration:</span>
                        <span className="value">{booking.totalDays || booking.duration} days</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FaCar />
                      <div>
                        <span className="label">Total Amount:</span>
                        <span className="value amount">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="booking-footer">
                  <div className="booking-dates">
                    <span className="created-date">
                      Booked on: {formatDateTime(booking.createdAt)}
                    </span>
                  </div>
                  
                  <div className="booking-actions">
                    {booking.status === 'confirmed' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handlePayment(booking)}
                      >
                        <FaCreditCard /> Pay Now
                      </button>
                    )}
                    
                    {booking.status === 'active' && new Date(booking.endDate) <= new Date() && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOTPVerification(booking)}
                      >
                        <FaKey /> Verify OTP
                      </button>
                    )}
                    
                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => cancelBooking(booking._id)}
                      >
                        <FaTimes /> Cancel Booking
                      </button>
                    )}
                    
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => viewBookingDetails(booking)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="booking-details-modal-overlay">
          <div className="booking-details-modal">
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={closeDetailsModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              {/* Booking Information */}
              <div className="details-section">
                <h3>Booking Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Booking ID:</span>
                    <span className="value">{selectedBooking._id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value status-${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Pickup Date:</span>
                    <span className="value">{formatDate(selectedBooking.startDate || selectedBooking.pickupDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Return Date:</span>
                    <span className="value">{formatDate(selectedBooking.endDate || selectedBooking.returnDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration:</span>
                    <span className="value">
                      {selectedBooking.totalDays < 1 
                        ? `${Math.round(selectedBooking.totalDays * 24)} hours`
                        : `${selectedBooking.totalDays} days`
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Amount:</span>
                    <span className="value">₹{selectedBooking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {selectedBooking.vehicleId && (
                <div className="details-section">
                  <h3>Vehicle Details</h3>
                  <div className="vehicle-details">
                    <div className="vehicle-image">
                      <img 
                        src={selectedBooking.vehicleId?.images?.[0] || selectedBooking.vehicleId?.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZWhpY2xlIEltYWdlPC90ZXh0Pjwvc3ZnPg=='} 
                        alt={`${selectedBooking.vehicleId?.make || selectedBooking.vehicleId?.brand || 'Vehicle'} ${selectedBooking.vehicleId?.model || ''}`}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZWhpY2xlIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <div className="vehicle-info">
                      <div className="detail-item">
                        <span className="label">Make & Model:</span>
                        <span className="value">{selectedBooking.vehicleId?.make || selectedBooking.vehicleId?.brand || 'N/A'} {selectedBooking.vehicleId?.model || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Year:</span>
                        <span className="value">{selectedBooking.vehicleId?.year || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Type:</span>
                        <span className="value">{selectedBooking.vehicleId?.type || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Fuel Type:</span>
                        <span className="value">{selectedBooking.vehicleId?.fuelType || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Transmission:</span>
                        <span className="value">{selectedBooking.vehicleId?.specifications?.transmission || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Seating Capacity:</span>
                        <span className="value">{selectedBooking.vehicleId?.specifications?.seats || 'N/A'} people</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Price per Day:</span>
                        <span className="value">₹{selectedBooking.vehicleId?.pricing?.pricePerDay || selectedBooking.vehicleId?.pricePerDay || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Features:</span>
                        <span className="value">{selectedBooking.vehicleId?.features?.join(', ') || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Location:</span>
                        <span className="value">{selectedBooking.vehicleId?.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Information */}
              <div className="details-section">
                <h3>Location Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Pickup Location:</span>
                    <span className="value">{selectedBooking.pickupLocation}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Drop Location:</span>
                    <span className="value">{selectedBooking.dropLocation || selectedBooking.dropoffLocation || 'Same as pickup'}</span>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              {selectedBooking.driverDetails && (
                <div className="details-section">
                  <h3>Driver Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Driver Name:</span>
                      <span className="value">{selectedBooking.driverDetails.name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">License Number:</span>
                      <span className="value">{selectedBooking.driverDetails.licenseNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone Number:</span>
                      <span className="value">{selectedBooking.driverDetails.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Timeline */}
              <div className="details-section">
                <h3>Booking Timeline</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">{formatDateTime(selectedBooking.createdAt)}</span>
                  </div>
                  {selectedBooking.updatedAt && (
                    <div className="detail-item">
                      <span className="label">Last Updated:</span>
                      <span className="value">{formatDateTime(selectedBooking.updatedAt)}</span>
                    </div>
                  )}
                  {selectedBooking.cancelledAt && (
                    <div className="detail-item">
                      <span className="label">Cancelled:</span>
                      <span className="value">{formatDateTime(selectedBooking.cancelledAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={selectedBooking}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* OTP Verification Modal */}
      <OTPVerification
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        booking={selectedBooking}
        onVerificationSuccess={handleOTPSuccess}
      />
    </div>
  );
};

export default MyBookings;
