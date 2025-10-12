import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getVehicles } from '../../store/slices/vehicleSlice';
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import BookingModal from '../../components/BookingModal';
import useDebounce from '../../hooks/useDebounce';
import './VehicleList.css';

const VehicleList = () => {
  const dispatch = useDispatch();
  const { vehicles, isLoading } = useSelector((state) => state.vehicles);
  const { user } = useSelector((state) => state.auth || {});
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    fuelType: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Debounce price filters to prevent loading on every keystroke
  const debouncedMinPrice = useDebounce(filters.minPrice, 500);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500);
  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    const debouncedFilters = {
      ...filters,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      search: debouncedSearch
    };
    dispatch(getVehicles(debouncedFilters));
  }, [dispatch, debouncedMinPrice, debouncedMaxPrice, debouncedSearch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getVehicles(filters));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      fuelType: '',
      minPrice: '',
      maxPrice: '',
      location: ''
    });
  };

  const handleBookNow = (vehicle) => {
    if (!user) {
      alert('Please login to book a vehicle');
      return;
    }
    setSelectedVehicle(vehicle);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    alert(`Booking successful! Booking ID: ${booking._id}`);
    setIsBookingModalOpen(false);
    setSelectedVehicle(null);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedVehicle(null);
  };

  if (isLoading) {
    return (
      <div className="vehicle-list-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Available Vehicles</h1>
          <p>Find your perfect ride in Tamil Nadu</p>
        </div>

        <div className="filters-section">
          <form onSubmit={handleSearch} className="filters-form">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                name="search"
                placeholder="Search vehicles..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-options">
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>

              <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
                <option value="">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>

              <input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />

              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />

              <button type="submit" className="btn btn-primary">
                <FaFilter /> Apply Filters
              </button>

              <button type="button" onClick={clearFilters} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        <div className="vehicles-grid">
          {vehicles && vehicles.length === 0 ? (
            <div className="no-vehicles">
              <h3>No vehicles found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            vehicles && vehicles.map((vehicle) => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-image">
                  <img 
                    src={vehicle.images?.[0] || '/api/placeholder/300/200'} 
                    alt={vehicle.name || `${vehicle.make} ${vehicle.model}`}
                  />
                  <div className="vehicle-status">
                    {vehicle.isAvailable ? (
                      <span className="status-available">Available</span>
                    ) : (
                      <span className="status-booked">Booked</span>
                    )}
                  </div>
                </div>

                <div className="vehicle-info">
                  <h3>{vehicle.name || `${vehicle.make || 'Vehicle'} ${vehicle.model || 'Model'}`}</h3>
                  <p className="vehicle-type">{vehicle.type} • {vehicle.fuelType}</p>
                  
                  <div className="vehicle-location">
                    <FaMapMarkerAlt />
                    <span>{vehicle.location?.city || vehicle.location}</span>
                  </div>

                  <div className="vehicle-rating">
                    <FaStar />
                    <span>{vehicle.rating || 0}</span>
                    <span className="review-count">({vehicle.reviews?.length || 0} reviews)</span>
                  </div>

                  <div className="vehicle-price">
                    <span className="price">₹{vehicle.pricePerDay}</span>
                    <span className="per-day">per day</span>
                  </div>

                  <div className="vehicle-actions">
                    {vehicle.isAvailable ? (
                      <>
                        <button 
                          onClick={() => handleBookNow(vehicle)}
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <FaCalendarAlt />
                          Book Now
                        </button>
                        <Link to={`/vehicles/${vehicle._id}`} className="btn btn-outline">
                          View Details
                        </Link>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-secondary" disabled>
                          Booked
                        </button>
                        <Link to={`/vehicles/${vehicle._id}`} className="btn btn-outline">
                          View Details
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Booking Modal */}
        {selectedVehicle && (
          <BookingModal
            vehicle={selectedVehicle}
            isOpen={isBookingModalOpen}
            onClose={closeBookingModal}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default VehicleList;