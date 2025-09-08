import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaCar,
  FaMoneyBillWave
} from "react-icons/fa";
import axios from "axios";
import "./VendorBookings.css";
import { useSelector } from "react-redux";

const VendorBookings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings/vendor", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
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

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `/api/bookings/${bookingId}/status`,
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorBookings;
