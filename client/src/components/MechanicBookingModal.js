import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaTools, FaUser, FaPhone, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './MechanicBookingModal.css';

const MechanicBookingModal = ({ isOpen, onClose, mechanic, onBookingSuccess }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    location: '',
    contactPhone: '',
    estimatedDuration: '1 hour'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        contactPhone: user.phone || '',
        location: user.address || ''
      }));
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      setError('Please log in to book a mechanic');
      return;
    }

    if (!mechanic) {
      setError('Mechanic information not available');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate required fields
      if (!formData.serviceType || !formData.description || !formData.preferredDate || !formData.location) {
        throw new Error('Please fill in all required fields');
      }

      // Create booking data
      const bookingData = {
        mechanicId: mechanic._id,
        serviceType: formData.serviceType,
        description: formData.description,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        location: formData.location,
        contactPhone: formData.contactPhone,
        estimatedDuration: formData.estimatedDuration,
        status: 'pending',
        customerId: user._id
      };

      console.log('Submitting mechanic booking:', bookingData);

      const response = await fetch('http://localhost:5000/api/mechanics/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book mechanic');
      }

      const result = await response.json();
      console.log('Booking successful:', result);
      
      setSuccess('Mechanic booking request submitted successfully!');
      
      // Call success callback after a delay
      setTimeout(() => {
        if (onBookingSuccess) {
          onBookingSuccess(result.booking);
        }
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = [
    'Engine Repair',
    'Brake Service',
    'Oil Change',
    'Tire Replacement',
    'Battery Service',
    'AC Repair',
    'Transmission Service',
    'Electrical Repair',
    'General Maintenance',
    'Other'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  if (!isOpen) return null;

  return (
    <div className="mechanic-booking-overlay">
      <div className="mechanic-booking-modal">
        <div className="mechanic-booking-header">
          <h2>Book Mechanic Service</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {mechanic && (
          <div className="mechanic-info">
            <div className="mechanic-details">
              <h3>{mechanic.name || mechanic.userId?.name}</h3>
              <p className="mechanic-specialization">
                <FaTools className="icon" />
                {mechanic.specialization || 'General Mechanic'}
              </p>
              <p className="mechanic-rating">
                <FaUser className="icon" />
                {mechanic.rating || 0}/5 ({mechanic.totalReviews || 0} reviews)
              </p>
              <p className="mechanic-experience">
                <FaClock className="icon" />
                {mechanic.experience || 0} years experience
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <FaCheckCircle className="icon" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="serviceType">
              <FaTools className="icon" />
              Service Type *
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select a service</option>
              {serviceTypes.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <FaUser className="icon" />
              Problem Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the issue with your vehicle..."
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredDate">
                <FaCalendar className="icon" />
                Preferred Date *
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTime">
                <FaClock className="icon" />
                Preferred Time
              </label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">
              <FaMapMarkerAlt className="icon" />
              Service Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter the address where service is needed"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">
              <FaPhone className="icon" />
              Contact Phone *
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              placeholder="Your contact number"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="estimatedDuration">
              <FaClock className="icon" />
              Estimated Duration
            </label>
            <select
              id="estimatedDuration"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              className="form-control"
            >
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
              <option value="4+ hours">4+ hours</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Book Mechanic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MechanicBookingModal;
