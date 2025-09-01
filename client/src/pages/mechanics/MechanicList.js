import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMechanics, getNearbyMechanics } from '../../store/slices/mechanicSlice';
import { FaSearch, FaMapMarkerAlt, FaStar, FaPhone, FaTools } from 'react-icons/fa';

const MechanicList = () => {
  const dispatch = useDispatch();
  const { mechanics, isLoading } = useSelector((state) => state.mechanics);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    location: ''
  });
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    dispatch(getMechanics(filters));
    getUserLocation();
  }, [dispatch, filters]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('User location:', position.coords);
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getMechanics(filters));
  };

  const handleFindNearby = () => {
    if (userLocation) {
      dispatch(getNearbyMechanics({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        maxDistance: 10
      }));
    } else {
      alert('Please allow location access to find nearby mechanics');
    }
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
          <h1>Find Mechanics</h1>
          <p>Professional mechanics near you</p>
        </div>

        <div className="filters-section">
          <form onSubmit={handleSearch} className="filters-form">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                name="search"
                placeholder="Search mechanics..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-options">
              <select name="specialization" value={filters.specialization} onChange={handleFilterChange}>
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

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={filters.location}
                onChange={handleFilterChange}
              />

              <button type="button" onClick={handleFindNearby} className="btn btn-secondary">
                <FaMapMarkerAlt /> Find Nearby
              </button>
              

              <button type="submit" className="btn btn-primary">
                <FaSearch /> Search
              </button>
            </div>
          </form>
        </div>

        <div className="mechanics-grid">
          {mechanics.length === 0 ? (
            <div className="no-mechanics">
              <h3>No mechanics found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            mechanics.map((mechanic) => (
              <div key={mechanic._id} className="mechanic-card">
                <div className="mechanic-header">
                  <div className="mechanic-avatar">
                    <FaTools />
                  </div>
                  <div className="mechanic-info">
                    <h3>{mechanic.userId?.name || 'Mechanic'}</h3>
                    <p className="specialization">{mechanic.specialization}</p>
                    <div className="mechanic-location">
                      <FaMapMarkerAlt />
                      <span>{mechanic.location || 'Location not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="mechanic-details">
                  <div className="mechanic-rating">
                    <FaStar />
                    <span>{mechanic.rating || 0}</span>
                    <span className="review-count">({mechanic.reviews?.length || 0} reviews)</span>
                  </div>

                  <div className="mechanic-experience">
                    <span className="experience">{mechanic.experience} years experience</span>
                  </div>

                  <div className="mechanic-services">
                    <h4>Services:</h4>
                    <div className="services-list">
                      {mechanic.services?.slice(0, 3).map((service, index) => (
                        <span key={index} className="service-tag">{service}</span>
                      ))}
                      {mechanic.services?.length > 3 && (
                        <span className="service-tag">+{mechanic.services.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="mechanic-availability">
                    <span className={`availability-status ${mechanic.availability ? 'available' : 'unavailable'}`}>
                      {mechanic.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                <div className="mechanic-actions">
                  <Link to={`/mechanics/${mechanic._id}`} className="btn btn-primary">
                    View Profile
                  </Link>
                  {mechanic.userId?.phone && (
                    <a href={`tel:${mechanic.userId.phone}`} className="btn btn-outline">
                      <FaPhone /> Call
                    </a>
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

export default MechanicList;
