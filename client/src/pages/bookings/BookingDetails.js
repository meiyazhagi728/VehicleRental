import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCalendar, FaCar, FaMapMarkerAlt, FaMoneyBillWave, FaPhone } from 'react-icons/fa';
import './BookingDetails.css';

const BookingDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load booking');
      }
      const data = await response.json();
      console.log('Booking details received:', data);
      console.log('Vehicle data:', data.vehicleId);
      console.log('Vendor data:', data.vendorId);
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading booking...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="booking-details-page">
      <div className="container">
        <div className="page-header">
          <h1>Booking Details</h1>
          <p>Booking #{booking._id.slice(-8)}</p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div className="section">
            <h3>Vehicle</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: 200, height: 120, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                {booking.vehicleId?.images?.[0] ? (
                  <img 
                    src={booking.vehicleId.images[0]} 
                    alt={booking.vehicleId?.name || 'Vehicle'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div style={{ display: booking.vehicleId?.images?.[0] ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', color: '#666' }}>
                  <FaCar style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <span>No Image</span>
                </div>
              </div>
              <div>
                <h4><FaCar /> {booking.vehicleId?.name || `${booking.vehicleId?.brand || ''} ${booking.vehicleId?.model || ''}`.trim() || 'Vehicle'}</h4>
                <p>{booking.vehicleId?.type || 'N/A'} • {booking.vehicleId?.fuelType || 'N/A'}</p>
                <div className="vehicle-location">
                  <FaMapMarkerAlt />
                  <span>{booking.vehicleId?.location || 'Location not available'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section" style={{ marginTop: '1rem' }}>
            <h3>Booking Info</h3>
            <div className="info-grid">
              <div className="info-item">
                <FaCalendar />
                <div>
                  <span className="label">Start Date:</span>
                  <span className="value">{new Date(booking.startDate).toLocaleString()}</span>
                </div>
              </div>
              <div className="info-item">
                <FaCalendar />
                <div>
                  <span className="label">End Date:</span>
                  <span className="value">{new Date(booking.endDate).toLocaleString()}</span>
                </div>
              </div>
              <div className="info-item">
                <FaMoneyBillWave />
                <div>
                  <span className="label">Total Amount:</span>
                  <span className="value">₹{booking.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {booking.vendorId && (
            <div className="section" style={{ marginTop: '1rem' }}>
              <h3>Vendor Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <FaPhone />
                  <div>
                    <span className="label">Name:</span>
                    <span className="value">{booking.vendorId.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FaPhone />
                  <div>
                    <span className="label">Phone:</span>
                    <span className="value">{booking.vendorId.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FaMapMarkerAlt />
                  <div>
                    <span className="label">Address:</span>
                    <span className="value">{booking.vendorId.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="section" style={{ marginTop: '1rem' }}>
            <Link to="/bookings" className="btn btn-outline">Back to bookings</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
