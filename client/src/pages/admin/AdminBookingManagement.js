import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSearch, FaFilter, FaDownload, FaEye, FaCalendarAlt } from 'react-icons/fa';

const AdminBookingManagement = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      if (!user?.token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      
      // Transform the data to match our component structure
      const bookingsData = data.bookings?.map((booking) => ({
        id: booking._id,
        customerName: booking.user?.name || 'Unknown Customer',
        customerEmail: booking.user?.email || 'N/A',
        vehicleName: `${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}`.trim() || 'Unknown Vehicle',
        vendorName: booking.vendor?.name || 'Unknown Vendor',
        startDate: new Date(booking.startDate).toISOString().split('T')[0],
        endDate: new Date(booking.endDate).toISOString().split('T')[0],
        totalAmount: booking.totalAmount || 0,
        status: booking.status || 'pending',
        createdAt: new Date(booking.createdAt).toISOString().split('T')[0]
      })) || [];

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback to mock data if API fails
      const mockBookings = [
        {
          id: 1,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          vehicleName: 'Toyota Camry',
          vendorName: 'Premium Car Rentals',
          startDate: '2024-01-20',
          endDate: '2024-01-25',
          totalAmount: 12500,
          status: 'confirmed',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          vehicleName: 'Honda City',
          vendorName: 'City Auto Services',
          startDate: '2024-01-22',
          endDate: '2024-01-28',
          totalAmount: 13200,
          status: 'pending',
          createdAt: '2024-01-16'
        },
        {
          id: 3,
          customerName: 'Mike Johnson',
          customerEmail: 'mike@example.com',
          vehicleName: 'Maruti Swift',
          vendorName: 'Metro Vehicle Hub',
          startDate: '2024-01-18',
          endDate: '2024-01-20',
          totalAmount: 3600,
          status: 'completed',
          createdAt: '2024-01-14'
        }
      ];
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (bookingId) => {
    console.log('View button clicked for booking:', bookingId);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      alert(`Viewing booking: ${booking.id}\nCustomer: ${booking.customerName}\nVehicle: ${booking.vehicleName}\nStatus: ${booking.status}\nAmount: ₹${booking.totalAmount}`);
    } else {
      alert('Booking not found');
    }
  };


  const handleExport = () => {
    try {
      const csvContent = [
        ['Customer Name', 'Customer Email', 'Vehicle Name', 'Vendor Name', 'Start Date', 'End Date', 'Total Amount', 'Status', 'Created At'],
        ...bookings.map(booking => [
          booking.customerName,
          booking.customerEmail,
          booking.vehicleName,
          booking.vendorName,
          booking.startDate,
          booking.endDate,
          booking.totalAmount,
          booking.status,
          booking.createdAt
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-booking-management">
      <div className="page-header">
        <h1>Booking Management</h1>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleExport}>
            <FaDownload /> Export
          </button>
        </div>
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Vendor</th>
              <th>Dates</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>
                  <div className="customer-info">
                    <strong>{booking.customerName}</strong>
                    <small>{booking.customerEmail}</small>
                  </div>
                </td>
                <td>{booking.vehicleName}</td>
                <td>{booking.vendorName}</td>
                <td>
                  <div className="date-info">
                    <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                    <div>to {new Date(booking.endDate).toLocaleDateString()}</div>
                  </div>
                </td>
                <td>₹{booking.totalAmount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
                <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleView(booking.id)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-booking-management {
          padding: 2rem;
          background: var(--grey-50);
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem 2rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--grey-800);
          margin: 0;
        }

        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
        }

        .search-box {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          color: var(--grey-500);
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--grey-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--grey-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
        }

        .bookings-table {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          overflow: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--grey-200);
        }

        th {
          background: var(--grey-50);
          font-weight: 600;
          color: var(--grey-700);
        }

        .customer-info strong {
          display: block;
          color: var(--grey-800);
          margin-bottom: 0.25rem;
        }

        .customer-info small {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .date-info {
          font-size: 0.875rem;
          color: var(--grey-600);
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-active {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .admin-booking-management {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .filters-section {
            flex-direction: column;
          }

          .bookings-table {
            overflow: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBookingManagement;
