import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserBookings } from '../../store/slices/bookingSlice';
import { FaCalendar, FaCar, FaMapMarkerAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa';

const BookingHistory = () => {
  const dispatch = useDispatch();
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserBookings());
  }, [dispatch]);

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

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'payment-paid';
      case 'failed':
        return 'payment-failed';
      case 'refunded':
        return 'payment-refunded';
      default:
        return 'payment-pending';
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="booking-history-page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Track your vehicle rental history</p>
        </div>

        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <h3>No bookings found</h3>
              <p>You haven't made any bookings yet.</p>
              <Link to="/vehicles" className="btn btn-primary">
                Browse Vehicles
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">
                    <h3>Booking #{booking._id.slice(-8)}</h3>
                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-date">
                    <FaCalendar />
                    <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="vehicle-info">
                    <div className="vehicle-image">
                      <img 
                        src={booking.vehicleId?.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEzMy42MzEgMTAwIDEyMCA4Ni4zNjg5IDEyMCA3MEMxMjAgNTMuNjMxMSAxMzMuNjMxIDQwIDE1MCA0MEMxNjYuMzY5IDQwIDE4MCA1My42MzExIDE4MCA3MEMxODAgODYuMzY4OSAxNjYuMzY5IDEwMCAxNTAgMTAwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K'} 
                        alt={booking.vehicleId?.name} 
                      />
                    </div>
                    <div className="vehicle-details">
                      <h4>{booking.vehicleId?.name}</h4>
                      <p>{booking.vehicleId?.type} • {booking.vehicleId?.fuelType}</p>
                      <div className="vehicle-location">
                        <FaMapMarkerAlt />
                        <span>{booking.vehicleId?.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-info">
                    <div className="info-row">
                      <div className="info-item">
                        <FaCalendar />
                        <div>
                          <span className="label">Start Date:</span>
                          <span className="value">{new Date(booking.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <FaCalendar />
                        <div>
                          <span className="label">End Date:</span>
                          <span className="value">{new Date(booking.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-item">
                        <FaClock />
                        <div>
                          <span className="label">Duration:</span>
                          <span className="value">{booking.duration || 'Calculating...'} days</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <FaMapMarkerAlt />
                        <div>
                          <span className="label">Pickup Location:</span>
                          <span className="value">{booking.pickupLocation}</span>
                        </div>
                      </div>
                    </div>

                    {booking.driverDetails && (
                      <div className="driver-info">
                        <h4>Driver Details:</h4>
                        <div className="driver-details-grid">
                          <div className="driver-detail">
                            <span className="label">Name:</span>
                            <span className="value">{booking.driverDetails.name}</span>
                          </div>
                          <div className="driver-detail">
                            <span className="label">License:</span>
                            <span className="value">{booking.driverDetails.licenseNumber}</span>
                          </div>
                          <div className="driver-detail">
                            <span className="label">Phone:</span>
                            <span className="value">{booking.driverDetails.phone}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="booking-summary">
                    <div className="price-info">
                      <FaMoneyBillWave />
                      <div>
                        <span className="label">Total Amount:</span>
                        <span className="price">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                    <div className="payment-status">
                      <span className={`payment-badge ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <Link to={`/bookings/${booking._id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  {booking.status === 'pending' && (
                    <button className="btn btn-secondary">
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                    <button className="btn btn-primary">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
