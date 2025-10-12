import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaCar } from 'react-icons/fa';

const AdminBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || data || []);
      } else {
        console.error('Failed to fetch bookings:', response.status);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || data || []);
      } else {
        console.error('Failed to fetch vehicles:', response.status);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data || []);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        ...newBooking,
        startDate: new Date(`${newBooking.startDate}T${newBooking.startTime}`).toISOString(),
        endDate: new Date(`${newBooking.endDate}T${newBooking.endTime}`).toISOString()
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        alert('Booking created successfully!');
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create booking: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          alert('Booking deleted successfully!');
          fetchBookings();
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to delete booking: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking: ' + error.message);
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.vehicleId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="admin-booking-management">
      <div className="booking-header">
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            <FaPlus /> Create Booking
          </button>
        </div>
        
        <div className="filters">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
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

      <div className="bookings-list">
        <h3>All Bookings ({filteredBookings.length})</h3>
        {filteredBookings.length > 0 ? (
          <div className="bookings-grid">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">#{booking._id.slice(-8)}</div>
                  <div className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <FaCar />
                    <span>{booking.vehicleId?.name || 'Unknown Vehicle'}</span>
                  </div>
                  <div className="detail-item">
                    <FaUser />
                    <span>{booking.userId?.name || 'Unknown User'}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>
                      {new Date(booking.startDate).toLocaleDateString()} - 
                      {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>📍 {booking.pickupLocation}</span>
                  </div>
                  <div className="detail-item">
                    <span>📍 {booking.dropLocation}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button 
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="btn btn-danger btn-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <p>No bookings found</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-booking-management {
          padding: 1rem;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filters {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box input {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 250px;
        }

        .search-box svg {
          position: absolute;
          left: 0.75rem;
          color: #666;
        }

        .status-filter {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
        }

        .create-booking-form {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .booking-card {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .booking-id {
          font-weight: 600;
          color: #666;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-confirmed {
          background: #d4edda;
          color: #155724;
        }

        .status-completed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        .booking-details {
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #666;
        }

        .detail-item svg {
          color: #007bff;
        }

        .booking-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-outline {
          background: transparent;
          color: #6c757d;
          border: 1px solid #6c757d;
        }

        .btn-outline:hover {
          background: #6c757d;
          color: white;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8rem;
        }

        .no-bookings {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .booking-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filters {
            flex-direction: column;
          }
          
          .search-box input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBookingManagement;
