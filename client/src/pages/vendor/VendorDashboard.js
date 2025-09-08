import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCar,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaPlus,
  FaEdit,
  FaList,
  FaUser,
  FaWrench,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { logout } from "../../store/slices/authSlice";
import "./VendorDashboard.css";

const VendorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    activeBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentVehicles, setRecentVehicles] = useState([]);

  useEffect(() => {
    fetchVendorStats();
    fetchRecentBookings();
    fetchRecentVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVendorStats = async () => {
    try {
      // Aggregate from vendor endpoints
      const [vehiclesRes, bookingsRes] = await Promise.all([
        fetch("/api/vehicles/vendor", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
        }),
        fetch("/api/bookings/vendor", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
        }),
      ]);
      const vehicles = vehiclesRes.ok ? await vehiclesRes.json() : [];
      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

      const totalRevenue = bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const activeBookings = bookings.filter((b) => ["pending", "confirmed", "active"].includes(b.status)).length;
      const totalCustomers = new Set(bookings.map((b) => b.userId?._id || b.userId)).size;

      setStats({
        totalVehicles: vehicles.length,
        totalRevenue,
        totalCustomers,
        activeBookings,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const res = await fetch("/api/bookings/vendor?limit=5&page=1", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data.bookings) ? data.bookings : data; // supports both shapes
      setRecentBookings(
        list.slice(0, 5).map((b) => ({
          id: b._id,
          customerName: b.userId?.name || b.customerName || "Customer",
          vehicleName: b.vehicleId?.name || b.vehicleName || "Vehicle",
          startDate: new Date(b.startDate).toLocaleDateString(),
          endDate: new Date(b.endDate).toLocaleDateString(),
          status: b.status,
          amount: b.totalAmount,
        }))
      );
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchRecentVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles/vendor", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setRecentVehicles(
        data.slice(0, 5).map((v) => ({
          id: v._id,
          name: v.name,
          type: v.type,
          pricePerDay: v.pricePerDay,
          isAvailable: v.isAvailable,
          rating: v.rating,
        }))
      );
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCar />
          </div>
          <h3>{stats.totalVehicles}</h3>
          <p>Total Vehicles</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <h3>{stats.totalCustomers}</h3>
          <p>Total Customers</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <h3>{stats.activeBookings}</h3>
          <p>Active Bookings</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <h3>Recent Bookings</h3>
            <Link to="/vendor/bookings" className="view-all">
              View All
            </Link>
          </div>
          <div className="bookings-list">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <h4>{booking.customerName}</h4>
                  <p>{booking.vehicleName}</p>
                  <span className="booking-dates">
                    {booking.startDate} - {booking.endDate}
                  </span>
                </div>
                <div className="booking-status">
                  <span className={`status ${booking.status}`}>{booking.status}</span>
                  <span className="amount">₹{booking.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3>Recent Vehicles</h3>
            <Link to="/vendor/manage-vehicles" className="view-all">
              View All
            </Link>
          </div>
          <div className="vehicles-list">
            {recentVehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle-item">
                <div className="vehicle-info">
                  <h4>{vehicle.name}</h4>
                  <p>{vehicle.type}</p>
                  <span className="price">₹{vehicle.pricePerDay}/day</span>
                </div>
                <div className="vehicle-status">
                  <span className={`availability ${vehicle.isAvailable ? "available" : "unavailable"}`}>
                    {vehicle.isAvailable ? "Available" : "Booked"}
                  </span>
                  <span className="rating"> {vehicle.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Vendor Panel</h2>
          <p>Welcome, {user?.name}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaChartLine />
            Dashboard
          </button>

          <Link to="/vendor/add-vehicle" className="nav-item">
            <FaPlus />
            Add Vehicle
          </Link>

          <Link to="/vendor/manage-vehicles" className="nav-item">
            <FaEdit />
            Manage Vehicles
          </Link>

          <Link to="/vendor/bookings" className="nav-item">
            <FaList />
            Bookings
          </Link>

          <Link to="/vendor/mechanics" className="nav-item">
            <FaWrench />
            Mechanics
          </Link>

          <Link to="/vendor/profile" className="nav-item">
            <FaUser />
            Profile
          </Link>

          <button className="nav-item logout" onClick={handleLogout}>
            <FaSignOutAlt />
            Logout
          </button>
        </nav>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Vendor Dashboard</h1>
          <div className="header-actions">
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-menu">
              <img src="/default-avatar.png" alt="Profile" className="user-avatar" />
              <span>{user?.name}</span>
            </div>
          </div>
        </div>

        {activeTab === "dashboard" && renderDashboard()}
      </div>
    </div>
  );
};

export default VendorDashboard;
