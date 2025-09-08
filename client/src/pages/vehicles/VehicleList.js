import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getVehicles } from '../../store/slices/vehicleSlice';
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import './VehicleList.css';

const VehicleList = () => {
  const dispatch = useDispatch();
  const { vehicles, isLoading } = useSelector((state) => state.vehicles);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    fuelType: '',
    minPrice: '',
    maxPrice: '',
    location: 'Tamil Nadu'
  });

  useEffect(() => {
    dispatch(getVehicles(filters));
  }, [dispatch, filters]);

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

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading vehicles...</div>
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
            </div>
          </form>
        </div>

        <div className="vehicles-grid">
          {vehicles.length === 0 ? (
            <div className="no-vehicles">
              <h3>No vehicles found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-image">
                  <img src={vehicle.images[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEzMy42MzEgMTAwIDEyMCA4Ni4zNjg5IDEyMCA3MEMxMjAgNTMuNjMxMSAxMzMuNjMxIDQwIDE1MCA0MEMxNjYuMzY5IDQwIDE4MCA1My42MzExIDE4MCA3MEMxODAgODYuMzY4OSAxNjYuMzY5IDEwMCAxNTAgMTAwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K'} alt={vehicle.name} />
                  <div className="vehicle-status">
                    {vehicle.isAvailable ? (
                      <span className="status-available">Available</span>
                    ) : (
                      <span className="status-booked">Booked</span>
                    )}
                  </div>
                </div>

                <div className="vehicle-info">
                  <h3>{vehicle.name}</h3>
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

                  <div className="vehicle-actions">
                    {vehicle.isAvailable ? (
                      <Link to={`/vehicles/${vehicle._id}`} className="btn btn-primary">
                        Book Now
                      </Link>
                    ) : (
                      <button className="btn btn-secondary" disabled>
                        Booked
                      </button>
                    )}
                    <Link to={`/vehicles/${vehicle._id}`} className="btn btn-outline">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleList;
