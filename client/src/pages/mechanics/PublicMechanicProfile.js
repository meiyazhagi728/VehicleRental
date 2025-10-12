import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaTools, FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaUser, FaArrowLeft, FaCalendarPlus } from 'react-icons/fa';
import MechanicBookingModal from '../../components/MechanicBookingModal';

const PublicMechanicProfile = () => {
  const { id } = useParams();
  const [mechanic, setMechanic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Function to sanitize mechanic data and remove coordinate objects
  const sanitizeMechanicData = (data) => {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Handle location object
    if (sanitized.location && typeof sanitized.location === 'object') {
      if (sanitized.location.coordinates && Array.isArray(sanitized.location.coordinates)) {
        sanitized.location = `${sanitized.location.coordinates[1]?.toFixed(4) || 'N/A'}, ${sanitized.location.coordinates[0]?.toFixed(4) || 'N/A'}`;
      } else {
        sanitized.location = 'Location not specified';
      }
    }
    
    // Handle userId object if it has location
    if (sanitized.userId && sanitized.userId.location && typeof sanitized.userId.location === 'object') {
      if (sanitized.userId.location.coordinates && Array.isArray(sanitized.userId.location.coordinates)) {
        sanitized.userId.location = `${sanitized.userId.location.coordinates[1]?.toFixed(4) || 'N/A'}, ${sanitized.userId.location.coordinates[0]?.toFixed(4) || 'N/A'}`;
      } else {
        sanitized.userId.location = 'Location not specified';
      }
    }
    
    return sanitized;
  };

  const fetchMechanicProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching mechanic profile for ID:', id);
      const response = await fetch(`http://localhost:5000/api/mechanics/${id}`);
      console.log('Mechanic API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Mechanic data received:', data);
        const sanitizedData = sanitizeMechanicData(data);
        console.log('Sanitized mechanic data:', sanitizedData);
        setMechanic(sanitizedData);
      } else {
        const errorData = await response.json();
        console.error('Mechanic API error:', errorData);
        setError(errorData.message || 'Mechanic not found');
      }
    } catch (err) {
      setError('Failed to load mechanic profile');
      console.error('Error fetching mechanic profile:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMechanicProfile();
  }, [fetchMechanicProfile]);

  const handleBookMechanic = () => {
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (booking) => {
    console.log('Booking successful:', booking);
    setShowBookingModal(false);
    // You can add a success notification here
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  if (loading) {
    return (
      <div className="mechanic-profile-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading mechanic profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mechanic) {
    return (
      <div className="mechanic-profile-page">
        <div className="container">
          <div className="error-container">
            <h2>Mechanic Not Found</h2>
            <p>{error || 'The mechanic you are looking for does not exist.'}</p>
            <Link to="/mechanics" className="btn btn-primary">
              <FaArrowLeft /> Back to Mechanics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mechanic-profile-page">
      <div className="container">
        <div className="profile-header">
          <Link to="/mechanics" className="back-button">
            <FaArrowLeft /> Back to Mechanics
          </Link>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <FaTools />
            </div>
            <div className="profile-info">
              <h1>{mechanic.userId?.name || 'Mechanic'}</h1>
              <p className="specialization">{mechanic.specialization}</p>
              <div className="profile-location">
                <FaMapMarkerAlt />
                <span>{typeof mechanic.location === 'string' ? mechanic.location : 'Location not specified'}</span>
              </div>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h2>About</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <FaStar />
                  <div>
                    <strong>Rating</strong>
                    <span>{mechanic.rating || 0} ({mechanic.reviews?.length || 0} reviews)</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaUser />
                  <div>
                    <strong>Experience</strong>
                    <span>{mechanic.experience || 0} years</span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaClock />
                  <div>
                    <strong>Status</strong>
                    <span className={`status ${mechanic.availability ? 'available' : 'unavailable'}`}>
                      {mechanic.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaTools />
                  <div>
                    <strong>Hourly Rate</strong>
                    <span>₹{mechanic.pricing?.hourlyRate || 0}/hour</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h2>Services Offered</h2>
              <div className="services-grid">
                {mechanic.services && mechanic.services.length > 0 ? (
                  mechanic.services.map((service, index) => (
                    <span key={index} className="service-tag">
                      {service}
                    </span>
                  ))
                ) : (
                  <p>No services listed</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h2>Contact Information</h2>
              <div className="contact-info">
                {mechanic.userId?.phone && (
                  <div className="contact-item">
                    <FaPhone />
                    <a href={`tel:${mechanic.userId.phone}`}>
                      {mechanic.userId.phone}
                    </a>
                  </div>
                )}
                {mechanic.userId?.email && (
                  <div className="contact-item">
                    <FaEnvelope />
                    <a href={`mailto:${mechanic.userId.email}`}>
                      {mechanic.userId.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="btn btn-primary"
                onClick={handleBookMechanic}
              >
                <FaCalendarPlus /> Book Now
              </button>
              {mechanic.userId?.phone && (
                <a href={`tel:${mechanic.userId.phone}`} className="btn btn-secondary">
                  <FaPhone /> Call Now
                </a>
              )}
              <Link to="/mechanics" className="btn btn-outline">
                View All Mechanics
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mechanic-profile-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 2rem 0;
        }

        .loading-container,
        .error-container {
          text-align: center;
          padding: 4rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .profile-header {
          margin-bottom: 2rem;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-500);
          text-decoration: none;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .back-button:hover {
          color: var(--primary-600);
        }

        .profile-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-card {
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-lg);
          margin-bottom: 2rem;
          text-align: center;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
          color: white;
        }

        .profile-info h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          color: var(--text-primary);
        }

        .specialization {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0 0 1rem 0;
        }

        .profile-location {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .profile-details {
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h2 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
          border-radius: var(--radius-lg);
        }

        .detail-item svg {
          color: var(--primary-500);
          font-size: 1.2rem;
        }

        .detail-item strong {
          display: block;
          color: var(--text-primary);
          font-weight: 600;
        }

        .detail-item span {
          color: var(--text-secondary);
        }

        .status.available {
          color: var(--success-600);
          font-weight: 600;
        }

        .status.unavailable {
          color: var(--error-600);
          font-weight: 600;
        }

        .services-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .service-tag {
          background: var(--primary-500);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .contact-item svg {
          color: var(--primary-500);
        }

        .contact-item a {
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .contact-item a:hover {
          color: var(--primary-500);
        }

        .profile-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .profile-actions .btn {
          min-width: 150px;
        }

        @media (max-width: 768px) {
          .profile-actions {
            flex-direction: column;
          }
          
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Mechanic Booking Modal */}
      <MechanicBookingModal
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
        mechanic={mechanic}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default PublicMechanicProfile;
