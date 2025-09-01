import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVehicle, addVehicleReview } from '../../store/slices/vehicleSlice';
import { createBooking } from '../../store/slices/bookingSlice';
import { FaStar, FaMapMarkerAlt, FaCalendar, FaUser, FaPhone } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vehicle, isLoading } = useSelector((state) => state.vehicles);
  const { user } = useSelector((state) => state.auth);
  const [bookingData, setBookingData] = useState({
    startDate: null,
    endDate: null,
    pickupLocation: '',
    driverDetails: {
      name: '',
      licenseNumber: '',
      phone: ''
    }
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    dispatch(getVehicle(id));
  }, [dispatch, id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const bookingPayload = {
      vehicleId: id,
      ...bookingData,
      startDate: bookingData.startDate.toISOString(),
      endDate: bookingData.endDate.toISOString()
    };

    try {
      await dispatch(createBooking(bookingPayload)).unwrap();
      navigate('/bookings');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addVehicleReview({ id, reviewData })).unwrap();
      setReviewData({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Review submission failed:', error);
    }
  };

  if (isLoading || !vehicle) {
    return (
      <div className="container">
        <div className="loading">Loading vehicle details...</div>
      </div>
    );
  }

  return (
    <div className="vehicle-detail-page">
      <div className="container">
        <div className="vehicle-detail">
          <div className="vehicle-images">
            <div className="main-image">
              <img src={vehicle.images[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEzMy42MzEgMTAwIDEyMCA4Ni4zNjg5IDEyMCA3MEMxMjAgNTMuNjMxMSAxMzMuNjMxIDQwIDE1MCA0MEMxNjYuMzY5IDQwIDE4MCA1My42MzExIDE4MCA3MEMxODAgODYuMzY4OSAxNjYuMzY5IDEwMCAxNTAgMTAwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K'} alt={vehicle.name} />
            </div>
            <div className="image-gallery">
              {vehicle.images.slice(1).map((image, index) => (
                <img key={index} src={image} alt={`${vehicle.name} ${index + 2}`} />
              ))}
            </div>
          </div>

          <div className="vehicle-info-detail">
            <h1>{vehicle.name}</h1>
            <p className="vehicle-type">{vehicle.type} • {vehicle.fuelType}</p>
            
            <div className="vehicle-location">
              <FaMapMarkerAlt />
              <span>{vehicle.location}</span>
            </div>

            <div className="vehicle-rating">
              <FaStar />
              <span>{vehicle.calculateAverageRating ? vehicle.calculateAverageRating() : 0}</span>
              <span className="review-count">({vehicle.reviews?.length || 0} reviews)</span>
            </div>

            <div className="vehicle-price">
              <span className="price">₹{vehicle.pricePerDay}</span>
              <span className="per-day">per day</span>
            </div>

            <div className="vehicle-description">
              <h3>Description</h3>
              <p>{vehicle.description || 'No description available.'}</p>
            </div>

            <div className="vehicle-specifications">
              <h3>Specifications</h3>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Type:</span>
                  <span className="spec-value">{vehicle.type}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Fuel Type:</span>
                  <span className="spec-value">{vehicle.fuelType}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Status:</span>
                  <span className={`spec-value ${vehicle.isAvailable ? 'available' : 'booked'}`}>
                    {vehicle.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {vehicle.isAvailable && (
          <div className="booking-section">
            <h2>Book This Vehicle</h2>
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <DatePicker
                    selected={bookingData.startDate}
                    onChange={(date) => setBookingData(prev => ({ ...prev, startDate: date }))}
                    minDate={new Date()}
                    placeholderText="Select start date"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <DatePicker
                    selected={bookingData.endDate}
                    onChange={(date) => setBookingData(prev => ({ ...prev, endDate: date }))}
                    minDate={bookingData.startDate || new Date()}
                    placeholderText="Select end date"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pickup Location</label>
                <input
                  type="text"
                  value={bookingData.pickupLocation}
                  onChange={(e) => setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  placeholder="Enter pickup location"
                  required
                />
              </div>

              <div className="driver-details">
                <h3>Driver Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Driver Name</label>
                    <input
                      type="text"
                      value={bookingData.driverDetails.name}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        driverDetails: { ...prev.driverDetails, name: e.target.value }
                      }))}
                      placeholder="Driver name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>License Number</label>
                    <input
                      type="text"
                      value={bookingData.driverDetails.licenseNumber}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        driverDetails: { ...prev.driverDetails, licenseNumber: e.target.value }
                      }))}
                      placeholder="License number"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={bookingData.driverDetails.phone}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      driverDetails: { ...prev.driverDetails, phone: e.target.value }
                    }))}
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-large">
                Book Now
              </button>
            </form>
          </div>
        )}

        <div className="reviews-section">
          <h2>Reviews</h2>
          {vehicle.reviews && vehicle.reviews.length > 0 ? (
            <div className="reviews-list">
              {vehicle.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? 'star-filled' : 'star-empty'} />
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet.</p>
          )}

          {user && (
            <div className="add-review">
              <h3>Add a Review</h3>
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= reviewData.rating ? 'star-filled' : 'star-empty'}
                        onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
