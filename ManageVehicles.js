import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaArrowLeft,
  FaCar,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";
import axios from "axios";
import "./ManageVehicles.css";

const ManageVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("/api/vehicles/vendor", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(`/api/vehicles/${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        toast.success("Vehicle deleted successfully");
        fetchVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const handleToggleAvailability = async (vehicleId, currentStatus) => {
    try {
      await axios.put(`/api/vehicles/${vehicleId}`, {
        isAvailable: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      toast.success("Vehicle availability updated");
      fetchVehicles();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || vehicle.type === filterType;
    const matchesStatus = !filterStatus || 
                         (filterStatus === "available" && vehicle.isAvailable) ||
                         (filterStatus === "unavailable" && !vehicle.isAvailable);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="manage-vehicles-page">
        <div className="loading">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="manage-vehicles-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/vendor/dashboard")}>
          <FaArrowLeft />
          Back to Dashboard
        </button>
        <h1>Manage Vehicles</h1>
        <button 
          className="add-vehicle-btn"
          onClick={() => navigate("/vendor/add-vehicle")}
        >
          <FaPlus />
          Add Vehicle
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="SUV">SUV</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Bus">Bus</option>
            <option value="Auto">Auto</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <div className="vehicles-grid">
        {filteredVehicles.length === 0 ? (
          <div className="no-vehicles">
            <FaCar />
            <h3>No vehicles found</h3>
            <p>Start by adding your first vehicle</p>
            <button 
              className="btn-primary"
              onClick={() => navigate("/vendor/add-vehicle")}
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="vehicle-image">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img src={vehicle.images[0]} alt={vehicle.name} />
                ) : (
                  <div className="no-image">
                    <FaCar />
                  </div>
                )}
                <div className={`status-badge ${vehicle.isAvailable ? "available" : "unavailable"}`}>
                  {vehicle.isAvailable ? "Available" : "Booked"}
                </div>
              </div>

              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <p className="vehicle-details">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </p>
                <p className="vehicle-type">{vehicle.type}  {vehicle.fuelType}</p>
                <p className="price">?{vehicle.pricePerDay}/day</p>
                <p className="location">{vehicle.location}</p>
                
                <div className="vehicle-stats">
                  <span> {vehicle.rating || 0}</span>
                  <span>{vehicle.totalReviews || 0} reviews</span>
                </div>
              </div>

              <div className="vehicle-actions">
                <button
                  className="action-btn view"
                  onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                >
                  <FaEye />
                  View
                </button>
                
                <button
                  className="action-btn edit"
                  onClick={() => navigate(`/vendor/edit-vehicle/${vehicle._id}`)}
                >
                  <FaEdit />
                  Edit
                </button>
                
                <button
                  className="action-btn toggle"
                  onClick={() => handleToggleAvailability(vehicle._id, vehicle.isAvailable)}
                >
                  {vehicle.isAvailable ? <FaToggleOn /> : <FaToggleOff />}
                  {vehicle.isAvailable ? "Make Unavailable" : "Make Available"}
                </button>
                
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteVehicle(vehicle._id)}
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageVehicles;
