import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMechanics, getNearbyMechanics } from '../../store/slices/mechanicSlice';
import { FaSearch, FaStar, FaMapMarkerAlt, FaTools, FaClock, FaPhone, FaLocationArrow, FaCalendarPlus } from 'react-icons/fa';
import MechanicBookingModal from '../../components/MechanicBookingModal';
import './MechanicList.css';

const MechanicList = () => {
  const dispatch = useDispatch();
  const { mechanics, isLoading } = useSelector((state) => state.mechanics);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    experience: '',
    rating: '',
    city: '',
    available: ''
  });
  const [userLocation, setUserLocation] = useState(null);
  const [showNearby, setShowNearby] = useState(false);
  const [maxDistance, setMaxDistance] = useState(30);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    console.log('Filters changed:', filters);
    console.log('Show nearby:', showNearby);
    console.log('User location:', userLocation);
    
    if (showNearby && userLocation) {
      console.log('Dispatching nearby mechanics with:', {
        lat: userLocation.lat,
        lng: userLocation.lng,
        maxDistance: maxDistance
      });
      dispatch(getNearbyMechanics({
        lat: userLocation.lat,
        lng: userLocation.lng,
        maxDistance: maxDistance
      }));
    } else {
      console.log('Dispatching regular mechanics with filters:', filters);
      dispatch(getMechanics(filters));
    }
  }, [dispatch, filters, showNearby, userLocation, maxDistance]);

  // Debug: Log mechanics data when it changes
  useEffect(() => {
    if (mechanics && mechanics.length > 0) {
      console.log('Mechanics data:', mechanics);
      console.log('First mechanic ID:', mechanics[0]?._id);
    }
  }, [mechanics]);

  // Get user location when nearby button is clicked
  const requestLocationPermission = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
          // Automatically trigger nearby search after getting location
          dispatch(getNearbyMechanics({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            maxDistance: maxDistance
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationLoading(false);
          let errorMessage = 'Location access denied. Please enable location permissions to find nearby mechanics.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while accessing location.';
              break;
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationLoading(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log('Filter changed:', name, value);
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookMechanic = (mechanic) => {
    setSelectedMechanic(mechanic);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (booking) => {
    console.log('Booking successful:', booking);
    setShowBookingModal(false);
    setSelectedMechanic(null);
    // You can add a success notification here
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedMechanic(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowNearby(false);
    dispatch(getMechanics(filters));
  };

  const handleNearbyToggle = () => {
    if (!showNearby) {
      // Request location permission when switching to nearby mode
      if (!userLocation) {
        requestLocationPermission();
      } else {
        // If we already have location, just search nearby
        dispatch(getNearbyMechanics({
          lat: userLocation.lat,
          lng: userLocation.lng,
          maxDistance: maxDistance
        }));
      }
      setShowNearby(true);
    } else {
      // Switch back to all mechanics
      setShowNearby(false);
      dispatch(getMechanics(filters));
    }
  };

  const handleDistanceChange = (e) => {
    const newDistance = parseInt(e.target.value);
    setMaxDistance(newDistance);
    
    // If we're in nearby mode and have location, search with new distance
    if (showNearby && userLocation) {
      dispatch(getNearbyMechanics({
        lat: userLocation.lat,
        lng: userLocation.lng,
        maxDistance: newDistance
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialization: '',
      experience: '',
      rating: '',
      city: '',
      available: ''
    });
    setShowNearby(false);
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading mechanics...</div>
      </div>
    );
  }

  return (
    <div className="mechanic-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Available Mechanics</h1>
          <p>Find skilled mechanics in your area</p>
        </div>

        {/* Search and Filters */}
        <div className="search-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input">
              <FaSearch className="search-icon" />
              <input
                type="text"
                name="search"
                placeholder="Search mechanics..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <button type="submit" className="search-btn">Search</button>
            <button type="button" onClick={clearFilters} className="clear-btn">Clear Filters</button>
          </form>

          <div className="filters">
            <select
              name="specialization"
              value={filters.specialization}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Specializations</option>
              <option value="Engine Repair">Engine Repair</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Service">Tire Service</option>
              <option value="Battery Service">Battery Service</option>
              <option value="AC Service">AC Service</option>
              <option value="Electrical Repair">Electrical Repair</option>
              <option value="Body Repair">Body Repair</option>
              <option value="Paint Job">Paint Job</option>
              <option value="General Maintenance">General Maintenance</option>
            </select>

            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>

            <select
              name="experience"
              value={filters.experience}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Experience Levels</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>

            <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
              <option value="2">2+ stars</option>
            </select>

            <select
              name="available"
              value={filters.available}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Availability</option>
              <option value="true">Available Now</option>
              <option value="false">Not Available</option>
            </select>
          </div>

          {/* Nearby Mechanics Toggle */}
          <div className="nearby-section">
            <button
              type="button"
              onClick={handleNearbyToggle}
              className={`nearby-btn ${showNearby ? 'active' : ''} ${locationLoading ? 'loading' : ''}`}
              disabled={locationLoading}
            >
              <FaLocationArrow />
              {locationLoading ? 'Getting Location...' : 
               showNearby ? 'Show All Mechanics' : 'Find Nearby Mechanics'}
            </button>
            
            {showNearby && userLocation && (
              <div className="distance-control">
                <label>Max Distance: {maxDistance} km</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={handleDistanceChange}
                  className="distance-slider"
                />
                <div className="location-info">
                  <small>📍 Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</small>
                </div>
              </div>
            )}
            
            {showNearby && !userLocation && !locationLoading && (
              <p className="location-error">Location access required for nearby search</p>
            )}
          </div>
        </div>

        {/* Mechanics Grid */}
        <div className="mechanics-grid">
          {mechanics && mechanics.length > 0 ? (
            mechanics.map((mechanic) => (
              <div key={mechanic._id} className="mechanic-card">
                <div className="mechanic-header">
                  <div className="mechanic-avatar">
                    <FaTools />
                  </div>
                  <div className="mechanic-info">
                    <h3>{mechanic.userId?.name || 'Mechanic'}</h3>
                    <p className="specialization">{mechanic.specialization}</p>
                    <div className="rating">
                      <FaStar className="star" />
                      <span>{mechanic.rating.toFixed(1)}</span>
                      <span className="review-count">({mechanic.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="mechanic-details">
                  <div className="detail-item">
                    <FaClock />
                    <span>{mechanic.experience} years experience</span>
                  </div>
                  <div className="detail-item">
                    <FaMapMarkerAlt />
                    <span>{mechanic.address?.city || 'Location not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <FaPhone />
                    <span>{mechanic.userId?.phone || 'Phone not available'}</span>
                  </div>
                </div>

                <div className="services">
                  <h4>Services:</h4>
                  <div className="service-tags">
                    {mechanic.services && mechanic.services.length > 0 ? (
                      mechanic.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="service-tag">{service}</span>
                      ))
                    ) : (
                      <span className="no-services">No services listed</span>
                    )}
                    {mechanic.services && mechanic.services.length > 3 && (
                      <span className="more-services">+{mechanic.services.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="pricing">
                  <span className="hourly-rate">₹{mechanic.pricing?.hourlyRate || 0}/hour</span>
                </div>

                <div className="mechanic-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleBookMechanic(mechanic)}
                  >
                    <FaCalendarPlus /> Book Now
                  </button>
                  <Link 
                    to={`/mechanics/${mechanic._id}`} 
                    className="btn btn-outline"
                    onClick={() => console.log('Navigating to mechanic profile:', mechanic._id, mechanic)}
                  >
                    View Profile
                  </Link>
                  <a className="btn btn-secondary" href={`tel:${mechanic.userId?.phone || ''}`}>
                    <FaPhone /> Call
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="no-mechanics">
              <FaTools className="no-mechanics-icon" />
              <h3>
                {showNearby 
                  ? `No mechanics found within ${maxDistance}km radius`
                  : 'No mechanics found'
                }
              </h3>
              <p>
                {showNearby 
                  ? 'Try increasing the search radius or check other areas.'
                  : 'Try adjusting your search criteria or check back later.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mechanic Booking Modal */}
      <MechanicBookingModal
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
        mechanic={selectedMechanic}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default MechanicList;
