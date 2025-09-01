import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserBookings } from '../../store/slices/bookingSlice';
import { FaCar, FaTools, FaHistory, FaUser } from 'react-icons/fa';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, isLoading } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getUserBookings());
  }, [dispatch]);

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your vehicle rentals and find mechanics</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaCar />
            </div>
            <h3>{bookings.length}</h3>
            <p>Total Bookings</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaHistory />
            </div>
            <h3>{bookings.filter(b => b.status === 'completed').length}</h3>
            <p>Completed Trips</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaTools />
            </div>
            <h3>24/7</h3>
            <p>Mechanic Support</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaUser />
            </div>
            <h3>Customer</h3>
            <p>Account Type</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/vehicles" className="action-card">
                <FaCar />
                <h3>Browse Vehicles</h3>
                <p>Find and rent vehicles</p>
              </Link>
              <Link to="/mechanics" className="action-card">
                <FaTools />
                <h3>Find Mechanics</h3>
                <p>Get roadside assistance</p>
              </Link>
              <Link to="/bookings" className="action-card">
                <FaHistory />
                <h3>Booking History</h3>
                <p>View all your bookings</p>
              </Link>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/bookings" className="view-all">View All</Link>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="spinner">Loading...</div>
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="bookings-list">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-info">
                      <h4>{booking.vehicleId?.name || 'Vehicle'}</h4>
                      <p className="booking-dates">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p className="booking-amount">₹{booking.totalAmount}</p>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No bookings yet. Start by browsing vehicles!</p>
                <Link to="/vehicles" className="btn btn-primary">
                  Browse Vehicles
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-content {
          display: grid;
          gap: 2rem;
        }

        .dashboard-section {
          background: var(--white-color);
          border-radius: var(--border-radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          color: var(--grey-800);
          margin: 0;
        }

        .view-all {
          color: var(--accent-color);
          text-decoration: none;
          font-weight: 500;
        }

        .view-all:hover {
          text-decoration: underline;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          background: var(--grey-50);
          border-radius: var(--border-radius-lg);
          text-decoration: none;
          color: var(--grey-700);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .action-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
          color: var(--accent-color);
        }

        .action-card svg {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--accent-color);
        }

        .action-card h3 {
          margin-bottom: 0.5rem;
          color: var(--grey-800);
        }

        .action-card p {
          text-align: center;
          color: var(--grey-600);
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .booking-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: var(--grey-50);
          border-radius: var(--border-radius);
          border-left: 4px solid var(--accent-color);
        }

        .booking-info h4 {
          margin-bottom: 0.5rem;
          color: var(--grey-800);
        }

        .booking-dates {
          color: var(--grey-600);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .booking-amount {
          font-weight: 600;
          color: var(--accent-color);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--grey-600);
        }

        .empty-state p {
          margin-bottom: 1.5rem;
        }

        .spinner {
          border: 4px solid var(--grey-300);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .quick-actions {
            grid-template-columns: 1fr;
          }

          .booking-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
