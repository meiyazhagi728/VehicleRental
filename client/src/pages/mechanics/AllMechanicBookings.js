import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  DataTable, 
  StatCard,
  MetricCard 
} from '../../components/dashboard/DashboardComponents';
import {
  FaTools,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaStar,
  FaFilter,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import '../../components/dashboard/DashboardComponents.css';

const AllMechanicBookings = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
    dateRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllMechanicBookings();
  }, [token, filters]);

  const fetchAllMechanicBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching all mechanic bookings...');
      const response = await fetch('http://localhost:5000/api/mechanics/bookings/all', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mechanic bookings');
      }

      const data = await response.json();
      console.log('Mechanic bookings data:', data);
      setBookings(data.bookings || []);
      setIsAdmin(data.isAdmin || false);
      
      // Calculate statistics
      const totalBookings = data.bookings?.length || 0;
      const completedBookings = data.bookings?.filter(b => b.status === 'completed').length || 0;
      const pendingBookings = data.bookings?.filter(b => b.status === 'pending').length || 0;
      const totalRevenue = data.bookings?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalCost || 0), 0) || 0;
      
      // Calculate average rating from completed bookings with ratings
      const ratedBookings = data.bookings?.filter(b => b.status === 'completed' && b.rating) || [];
      const averageRating = ratedBookings.length > 0 
        ? ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length 
        : 0;

      setStats({
        totalBookings,
        completedBookings,
        pendingBookings,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10
      });

    } catch (err) {
      console.error('Error fetching mechanic bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Filter by service type
    if (filters.serviceType !== 'all') {
      filtered = filtered.filter(booking => booking.serviceType === filters.serviceType);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(booking => 
            new Date(booking.preferredDate) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(booking => 
            new Date(booking.preferredDate) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(booking => 
            new Date(booking.preferredDate) >= filterDate
          );
          break;
      }
    }

    return filtered;
  };

  const getPaginatedData = (data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (data, itemsPerPage) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const exportBookings = () => {
    const filteredBookings = getFilteredBookings();
    const csvContent = [
      ['Customer', 'Mechanic', 'Service Type', 'Date', 'Time', 'Status', 'Cost', 'Rating', 'Description'],
      ...filteredBookings.map(booking => [
        booking.customerId?.name || 'N/A',
        booking.mechanicId?.name || 'N/A',
        booking.serviceType,
        new Date(booking.preferredDate).toLocaleDateString(),
        booking.preferredTime || 'N/A',
        booking.status,
        booking.totalCost || 0,
        booking.rating || 'N/A',
        booking.description || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mechanic-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'cancelled':
        return <FaTimesCircle className="status-icon cancelled" />;
      case 'in_progress':
        return <FaExclamationTriangle className="status-icon in-progress" />;
      default:
        return <FaClock className="status-icon" />;
    }
  };

  const bookingColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (booking) => (
        <div className="customer-info">
          <strong>{booking.customerId?.name || 'N/A'}</strong>
          <small>{booking.customerId?.email || 'N/A'}</small>
        </div>
      )
    },
    {
      key: 'mechanic',
      header: 'Mechanic',
      render: (booking) => (
        <div className="mechanic-info">
          <strong>{booking.mechanicId?.name || 'N/A'}</strong>
          <small>{booking.mechanicId?.specialization || 'General Mechanic'}</small>
        </div>
      )
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (booking) => (
        <div className="service-info">
          <span className="service-type">{booking.serviceType}</span>
          {booking.description && (
            <small className="service-description">{booking.description}</small>
          )}
        </div>
      )
    },
    {
      key: 'preferredDate',
      header: 'Date',
      render: (booking) => (
        <div className="date-info">
          <span className="booking-date">
            {new Date(booking.preferredDate).toLocaleDateString()}
          </span>
          <small className="booking-time">
            {booking.preferredTime || 'Time not specified'}
          </small>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => (
        <div className="status-cell">
          {getStatusIcon(booking.status)}
          <span className={`status ${booking.status}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      )
    },
    {
      key: 'totalCost',
      header: 'Cost',
      render: (booking) => (
        <span className="cost">₹{booking.totalCost || 0}</span>
      )
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (booking) => (
        <div className="rating-cell">
          {booking.rating ? (
            <div className="rating">
              <FaStar className="star" />
              <span>{booking.rating}/5</span>
            </div>
          ) : (
            <span className="no-rating">No rating</span>
          )}
        </div>
      )
    }
  ];

  const filteredBookings = getFilteredBookings();
  const paginatedBookings = getPaginatedData(filteredBookings, currentPage, itemsPerPage);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading mechanic bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    );
  }

  return (
    <div className="all-mechanic-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>{isAdmin ? 'All Mechanic Bookings' : 'My Mechanic Bookings'}</h1>
          <p>{isAdmin 
            ? 'View and manage all mechanic service bookings across the platform' 
            : 'View and manage your mechanic service bookings'
          }</p>
        </div>

        {/* User Info Note */}
        {!isAdmin && (
          <div className="user-info-note">
            <div className="alert alert-info">
              <strong>Note:</strong> You are viewing only your own mechanic service bookings. 
              Contact an administrator if you need to view all platform bookings.
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={FaTools}
            color="primary"
          />
          <StatCard
            title="Completed"
            value={stats.completedBookings}
            icon={FaCheckCircle}
            color="success"
          />
          <StatCard
            title="Pending"
            value={stats.pendingBookings}
            icon={FaClock}
            color="warning"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={FaMoneyBillWave}
            color="info"
          />
          <MetricCard
            title="Average Rating"
            value={stats.averageRating}
            subtitle="out of 5"
            icon={FaStar}
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="statusFilter">
              <FaFilter className="filter-icon" />
              Status:
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="serviceFilter">
              <FaTools className="filter-icon" />
              Service:
            </label>
            <select
              id="serviceFilter"
              value={filters.serviceType}
              onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
              className="filter-select"
            >
              <option value="all">All Services</option>
              <option value="Engine Repair">Engine Repair</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Replacement">Tire Replacement</option>
              <option value="Battery Service">Battery Service</option>
              <option value="AC Repair">AC Repair</option>
              <option value="Transmission Service">Transmission Service</option>
              <option value="Electrical Repair">Electrical Repair</option>
              <option value="General Maintenance">General Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dateFilter">
              <FaCalendarAlt className="filter-icon" />
              Date:
            </label>
            <select
              id="dateFilter"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <button 
            className="btn btn-outline"
            onClick={exportBookings}
          >
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bookings-section">
          <DataTable
            title={isAdmin ? "All Mechanic Bookings" : "My Mechanic Bookings"}
            data={paginatedBookings}
            columns={bookingColumns}
            loading={loading}
            emptyMessage={isAdmin ? "No mechanic bookings found" : "You haven't made any mechanic bookings yet"}
            actions={
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {getTotalPages(filteredBookings, itemsPerPage) > 1 && (
                  <div className="pagination-controls">
                    <button 
                      className="btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ←
                    </button>
                    <span style={{ margin: '0 0.5rem' }}>
                      Page {currentPage} of {getTotalPages(filteredBookings, itemsPerPage)}
                    </span>
                    <button 
                      className="btn btn-sm"
                      onClick={() => setCurrentPage(p => Math.min(getTotalPages(filteredBookings, itemsPerPage), p + 1))}
                      disabled={currentPage === getTotalPages(filteredBookings, itemsPerPage)}
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </div>

      <style jsx>{`
        .all-mechanic-bookings-page {
          min-height: 100vh;
          background-color: var(--bg-tertiary);
          padding: 2rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-header h1 {
          color: var(--text-primary);
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .page-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .filters-section {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          color: var(--accent-color);
          font-size: 1rem;
        }

        .filter-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .bookings-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .customer-info, .mechanic-info {
          display: flex;
          flex-direction: column;
        }

        .customer-info strong, .mechanic-info strong {
          font-weight: 600;
          color: var(--text-primary);
        }

        .customer-info small, .mechanic-info small {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .service-info {
          display: flex;
          flex-direction: column;
        }

        .service-type {
          font-weight: 600;
          color: var(--text-primary);
        }

        .service-description {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .date-info {
          display: flex;
          flex-direction: column;
        }

        .booking-date {
          font-weight: 600;
          color: var(--text-primary);
        }

        .booking-time {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-icon {
          font-size: 1rem;
        }

        .status-icon.completed {
          color: #28a745;
        }

        .status-icon.pending {
          color: #ffc107;
        }

        .status-icon.cancelled {
          color: #dc3545;
        }

        .status-icon.in-progress {
          color: #17a2b8;
        }

        .status {
          font-weight: 600;
          text-transform: capitalize;
        }

        .status.completed {
          color: #28a745;
        }

        .status.pending {
          color: #ffc107;
        }

        .status.cancelled {
          color: #dc3545;
        }

        .status.in-progress {
          color: #17a2b8;
        }

        .cost {
          font-weight: 600;
          color: var(--text-primary);
        }

        .rating-cell {
          display: flex;
          align-items: center;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .star {
          color: #ffc107;
          font-size: 0.9rem;
        }

        .no-rating {
          color: var(--text-secondary);
          font-style: italic;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8rem;
        }

        .btn-outline {
          background: transparent;
          color: var(--accent-color);
          border: 1px solid var(--accent-color);
        }

        .btn-outline:hover {
          background: var(--accent-color);
          color: white;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .user-info-note {
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AllMechanicBookings;
