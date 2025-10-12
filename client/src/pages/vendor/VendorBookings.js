import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaCar,
  FaMoneyBillWave,
  FaPlus,
  FaTrash
} from "react-icons/fa";
import axios from "axios";
import "./VendorBookings.css";
import { useSelector } from "react-redux";

const VendorBookings = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [newBooking, setNewBooking] = useState({
    vehicleId: '',
    userId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    pickupLocation: '',
    dropLocation: '',
    driverDetails: {
      name: '',
      licenseNumber: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchBookings();
    fetchVehicles();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    if (!user || !token) {
      console.log("No user or token available");
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get("http://localhost:5000/api/bookings/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data.bookings || response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    if (!user || !token) return;
    
    try {
      const response = await axios.get("http://localhost:5000/api/vehicles/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched vehicles:', response.data);
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchUsers = async () => {
    if (!user || !token) return;
    
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!newBooking.vehicleId || !newBooking.userId || !newBooking.startDate || !newBooking.endDate || 
        !newBooking.pickupLocation || !newBooking.dropLocation || 
        !newBooking.driverDetails.name || !newBooking.driverDetails.licenseNumber || !newBooking.driverDetails.phone) {
      toast.error("Please fill in all required fields including driver details");
      return;
    }
    
    // Additional check for driver details
    if (!newBooking.driverDetails.name.trim() || !newBooking.driverDetails.licenseNumber.trim() || !newBooking.driverDetails.phone.trim()) {
      toast.error("Driver details cannot be empty");
      return;
    }
    
    // Validate MongoDB ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(newBooking.vehicleId)) {
      toast.error("Invalid vehicle selection");
      return;
    }
    if (!objectIdRegex.test(newBooking.userId)) {
      toast.error("Invalid user selection");
      return;
    }
    
    try {
      // Fetch vehicle to get pricing
      const vehicleRes = await axios.get(`http://localhost:5000/api/vehicles/${newBooking.vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vehicle = vehicleRes.data || {};

      // Ensure proper date/time formatting
      const startDateTime = `${newBooking.startDate}T${newBooking.startTime}:00`;
      const endDateTime = `${newBooking.endDate}T${newBooking.endTime}:00`;
      
      const startISO = new Date(startDateTime).toISOString();
      const endISO = new Date(endDateTime).toISOString();
      
      console.log('Date conversion:', {
        startDate: newBooking.startDate,
        startTime: newBooking.startTime,
        startDateTime,
        startISO,
        endDate: newBooking.endDate,
        endTime: newBooking.endTime,
        endDateTime,
        endISO
      });

      const start = new Date(startISO);
      const end = new Date(endISO);
      
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        toast.error("Invalid date format");
        return;
      }
      
      if (end <= start) {
        toast.error("End date must be after start date");
        return;
      }
      
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      const dailyRate = vehicle?.pricing?.dailyRate || vehicle?.pricePerDay || 0;
      const totalAmount = dailyRate * days;

      const bookingData = {
        vehicleId: newBooking.vehicleId,
        userId: newBooking.userId,
        startDate: startISO,
        endDate: endISO,
        totalDays: days,
        pickupLocation: newBooking.pickupLocation,
        dropLocation: newBooking.dropLocation,
        totalAmount,
        driverDetails: newBooking.driverDetails
      };

      console.log('Sending booking data:', bookingData);
      console.log('Form validation check:', {
        vehicleId: !!newBooking.vehicleId,
        userId: !!newBooking.userId,
        startDate: !!newBooking.startDate,
        endDate: !!newBooking.endDate,
        pickupLocation: !!newBooking.pickupLocation,
        dropLocation: !!newBooking.dropLocation,
        driverName: !!newBooking.driverDetails.name,
        driverLicense: !!newBooking.driverDetails.licenseNumber,
        driverPhone: !!newBooking.driverDetails.phone
      });
      
      console.log('Driver details values:', {
        name: newBooking.driverDetails.name,
        licenseNumber: newBooking.driverDetails.licenseNumber,
        phone: newBooking.driverDetails.phone
      });

      const response = await axios.post("http://localhost:5000/api/bookings", bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        toast.success("Booking created successfully!");
        setShowCreateForm(false);
        setNewBooking({
          vehicleId: '',
          userId: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          pickupLocation: '',
          dropLocation: '',
          driverDetails: {
            name: '',
            licenseNumber: '',
            phone: ''
          }
        });
        fetchBookings();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create booking");
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        toast.success("Booking deleted successfully!");
        fetchBookings();
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error("Failed to delete booking");
      }
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      toast.success(`Booking ${newStatus} successfully`);
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(booking.vehicleId?._id || booking.vehicleId || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "confirmed":
        return "#28a745";
      case "active":
        return "#007bff";
      case "completed":
        return "#6c757d";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="vendor-bookings-page">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="vendor-bookings-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/vendor/dashboard")}>
          <FaArrowLeft />
          Back to Dashboard
        </button>
        <h1>Manage Bookings</h1>
        <button 
          className="create-booking-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <FaPlus />
          Create Booking
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {showCreateForm && (
        <div className="create-booking-form">
          <h3>Create New Booking</h3>
          <form onSubmit={handleCreateBooking}>
            <div className="form-row">
              <div className="form-group">
                <label>Vehicle</label>
                <select
                  value={newBooking.vehicleId}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, vehicleId: e.target.value }))}
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} - {vehicle.brand}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>User</label>
                <select
                  value={newBooking.userId}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, userId: e.target.value }))}
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={newBooking.startDate}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={newBooking.startTime}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={newBooking.endDate}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={newBooking.endTime}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pickup Location</label>
                <input
                  type="text"
                  value={newBooking.pickupLocation}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Drop Location</label>
                <input
                  type="text"
                  value={newBooking.dropLocation}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, dropLocation: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Driver Details <span style={{color: 'red'}}>*</span></h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Driver Name</label>
                  <input
                    type="text"
                    value={newBooking.driverDetails.name}
                    onChange={(e) => setNewBooking(prev => ({ 
                      ...prev, 
                      driverDetails: { ...prev.driverDetails, name: e.target.value }
                    }))}
                    placeholder="Enter driver's full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    value={newBooking.driverDetails.licenseNumber}
                    onChange={(e) => setNewBooking(prev => ({ 
                      ...prev, 
                      driverDetails: { ...prev.driverDetails, licenseNumber: e.target.value }
                    }))}
                    placeholder="Enter driver's license number"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Driver Phone</label>
                  <input
                    type="tel"
                    value={newBooking.driverDetails.phone}
                    onChange={(e) => setNewBooking(prev => ({ 
                      ...prev, 
                      driverDetails: { ...prev.driverDetails, phone: e.target.value }
                    }))}
                    placeholder="Enter driver's phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  {/* Empty div for layout */}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Booking</button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bookings-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>{bookings.length}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCheck />
          </div>
          <div className="stat-info">
            <h3>{bookings.filter((b) => b.status === "confirmed").length}</h3>
            <p>Confirmed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>₹{bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <FaCalendarAlt />
            <h3>No bookings found</h3>
            <p>Bookings will appear here when customers make reservations</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-id">
                  <h3>Booking #{booking._id.slice(-8)}</h3>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                <div className="booking-amount">₹{booking.totalAmount}</div>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <FaUser />
                  <div>
                    <strong>Customer:</strong> {booking.userId?.name || booking.customerName || "N/A"}
                  </div>
                </div>

                <div className="detail-row">
                  <FaCar />
                  <div>
                    <strong>Vehicle:</strong> {booking.vehicleId?.name || booking.vehicleName || "N/A"}
                  </div>
                </div>

                <div className="detail-row">
                  <FaCalendarAlt />
                  <div>
                    <strong>Dates:</strong> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </div>
                </div>

                <div className="detail-row">
                  <strong>Duration:</strong> {booking.totalDays} days
                </div>

                {booking.pickupLocation && (
                  <div className="detail-row">
                    <strong>Pickup:</strong> {booking.pickupLocation}
                  </div>
                )}

                {booking.dropLocation && (
                  <div className="detail-row">
                    <strong>Drop:</strong> {booking.dropLocation}
                  </div>
                )}
              </div>

              <div className="booking-actions">
                <button className="action-btn view" onClick={() => navigate(`/bookings/${booking._id}`)}>
                  <FaEye />
                  View Details
                </button>

                {booking.status === "pending" && (
                  <>
                    <button className="action-btn confirm" onClick={() => handleStatusUpdate(booking._id, "confirmed")}>
                      <FaCheck />
                      Confirm
                    </button>
                    <button className="action-btn reject" onClick={() => handleStatusUpdate(booking._id, "cancelled")}>
                      <FaTimes />
                      Reject
                    </button>
                  </>
                )}

                {booking.status === "confirmed" && (
                  <button className="action-btn active" onClick={() => handleStatusUpdate(booking._id, "active")}>
                    <FaCheck />
                    Mark as Active
                  </button>
                )}

                {booking.status === "active" && (
                  <button className="action-btn complete" onClick={() => handleStatusUpdate(booking._id, "completed")}>
                    <FaCheck />
                    Mark as Completed
                  </button>
                )}

                <button 
                  className="action-btn delete" 
                  onClick={() => handleDeleteBooking(booking._id)}
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

export default VendorBookings;
