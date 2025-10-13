import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaTimes, FaCheckCircle, FaExclamationTriangle, FaKey } from 'react-icons/fa';
import { updateVehicleStatus } from '../store/slices/vehicleSlice';
import './BookingModal.css';

const BookingModal = ({ vehicle, isOpen, onClose, onBookingSuccess }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth || {});
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupTime: '09:00',
    returnTime: '18:00',
    totalDays: 0,
    totalAmount: 0,
    driverDetails: {
      name: '',
      licenseNumber: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate total days and amount when dates change
  React.useEffect(() => {
    if (bookingData.pickupDate && bookingData.returnDate) {
      const pickup = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
      const returnDate = new Date(`${bookingData.returnDate}T${bookingData.returnTime}`);
      const diffTime = Math.abs(returnDate - pickup);
      const diffHours = diffTime / (1000 * 60 * 60);
      const diffDays = diffHours / 24; // Convert to days (can be fractional)
      
      if (diffDays >= 0.04) { // At least 1 hour (0.04 days)
        const totalAmount = diffDays * vehicle.pricePerDay;
        setBookingData(prev => ({
          ...prev,
          totalDays: diffDays,
          totalAmount: totalAmount
        }));
      }
    }
  }, [bookingData.pickupDate, bookingData.returnDate, bookingData.pickupTime, bookingData.returnTime, vehicle.pricePerDay]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested driver details
    if (name.startsWith('driverDetails.')) {
      const field = name.split('.')[1];
      setBookingData(prev => ({
        ...prev,
        driverDetails: {
          ...prev.driverDetails,
          [field]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLoggedIn) {
        setError('Please login to book a vehicle. Click the login button in the top navigation to sign in.');
        return;
      }

      if (!bookingData.pickupDate || !bookingData.returnDate) {
        setError('Please select pickup and return dates');
        return;
      }

      // Validate driver details
      if (!bookingData.driverDetails.name.trim()) {
        setError('Driver name is required');
        return;
      }
      if (!bookingData.driverDetails.licenseNumber.trim()) {
        setError('Driver license number is required');
        return;
      }
      if (!bookingData.driverDetails.phone.trim()) {
        setError('Driver phone number is required');
        return;
      }

      // Check if return datetime is after pickup datetime (including time)
      const startDateTime = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
      const endDateTime = new Date(`${bookingData.returnDate}T${bookingData.returnTime}`);
      
      if (endDateTime <= startDateTime) {
        setError('Return time must be after pickup time');
        return;
      }

      // Allow booking up to 5 minutes in the past to account for minor time differences
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      if (startDateTime < fiveMinutesAgo) {
        setError('Pickup date and time cannot be in the past');
        return;
      }

      const bookingPayload = {
        vehicleId: vehicle._id,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        totalDays: bookingData.totalDays,
        pickupLocation: vehicle.location?.city || vehicle.location || 'Default Location',
        dropLocation: vehicle.location?.city || vehicle.location || 'Default Location',
        totalAmount: bookingData.totalAmount,
        driverDetails: {
          name: bookingData.driverDetails.name.trim(),
          licenseNumber: bookingData.driverDetails.licenseNumber.trim(),
          phone: bookingData.driverDetails.phone.trim()
        }
      };

      console.log('Booking payload:', bookingPayload);
      console.log('User token:', token);
      console.log('User data:', user);

      if (!token) {
        setError('Please login to book a vehicle');
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking error:', errorData);
        
        // Handle authentication errors
        if (response.status === 401) {
          if (errorData.message === 'User not found') {
            setError('Your session has expired. Please log out and log back in.');
            // Clear the invalid token from localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            // Redirect to login or refresh the page
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return;
          } else {
            setError('Please login to book a vehicle');
            return;
          }
        }
        
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking response:', result);
      
      // Update vehicle availability status in Redux store
      dispatch(updateVehicleStatus({ 
        vehicleId: vehicle._id, 
        isAvailable: false 
      }));
      
      // Set flag to trigger vehicle list refresh
      localStorage.setItem('lastBookingChange', Date.now().toString());
      
      onBookingSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Show login warning if user is not logged in, but still show the form
  const isLoggedIn = user && token;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="booking-modal-header">
          <h2>Book Vehicle</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="booking-modal-content">
          {/* Login Warning Banner */}
          {!isLoggedIn && (
            <div className="login-warning">
              <FaExclamationTriangle />
              <div className="warning-content">
                <h4>Login Required</h4>
                <p>Please login to complete your booking. You can still fill out the form below to see what information is required.</p>
                <a href="/login" className="login-link">Go to Login Page</a>
              </div>
            </div>
          )}

          <div className="vehicle-summary">
            <div className="vehicle-image">
              <img 
                src={vehicle.images?.[0] || '/api/placeholder/300/200'} 
                alt={vehicle.name || `${vehicle.make} ${vehicle.model}`}
              />
            </div>
            <div className="vehicle-details">
              <h3>{vehicle.name || `${vehicle.make} ${vehicle.model}`}</h3>
              <p className="vehicle-type">{vehicle.type} • {vehicle.fuelType}</p>
              <p className="vehicle-location">
                <FaCalendarAlt /> {vehicle.location?.city || vehicle.location}
              </p>
              <p className="vehicle-price">₹{vehicle.pricePerDay} per day</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            {error && (
              <div className="error-message">
                <FaTimes />
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="pickupDate">
                <FaCalendarAlt /> Pickup Date
              </label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                value={bookingData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="returnDate">
                <FaCalendarAlt /> Return Date
              </label>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={bookingData.returnDate}
                onChange={handleInputChange}
                min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickupTime">
                  <FaClock /> Pickup Time
                </label>
                <input
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={bookingData.pickupTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="returnTime">
                  <FaClock /> Return Time
                </label>
                <input
                  type="time"
                  id="returnTime"
                  name="returnTime"
                  value={bookingData.returnTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Driver Details Section */}
            <div className="driver-details-section">
              <h4>Driver Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="driverDetails.name">
                    <FaUser /> Driver Name
                  </label>
                  <input
                    type="text"
                    id="driverDetails.name"
                    name="driverDetails.name"
                    value={bookingData.driverDetails.name}
                    onChange={handleInputChange}
                    placeholder="Enter driver's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="driverDetails.phone">
                    <FaPhone /> Driver Phone
                  </label>
                  <input
                    type="tel"
                    id="driverDetails.phone"
                    name="driverDetails.phone"
                    value={bookingData.driverDetails.phone}
                    onChange={handleInputChange}
                    placeholder="Enter driver's phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="driverDetails.licenseNumber">
                  <FaKey /> License Number
                </label>
                <input
                  type="text"
                  id="driverDetails.licenseNumber"
                  name="driverDetails.licenseNumber"
                  value={bookingData.driverDetails.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="Enter driving license number"
                  required
                />
              </div>
            </div>

            {bookingData.totalDays > 0 && (
              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <div className="summary-row">
                  <span>Duration:</span>
                  <span>
                    {bookingData.totalDays < 1 
                      ? `${Math.round(bookingData.totalDays * 24)} hours`
                      : `${bookingData.totalDays.toFixed(1)} days`
                    }
                  </span>
                </div>
                <div className="summary-row">
                  <span>Rate per day:</span>
                  <span>₹{vehicle.pricePerDay}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{Math.round(bookingData.totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="booking-actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || bookingData.totalDays === 0}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
