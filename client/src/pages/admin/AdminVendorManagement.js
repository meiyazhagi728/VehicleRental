import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaCheck, FaTimes, FaEye, FaSearch, FaDownload, FaUserTimes } from 'react-icons/fa';

const AdminVendorManagement = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/users?role=vendor', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }

      const data = await response.json();
      
      // Transform the data to match our component structure
      const vendorsData = data.users?.map((vendor, index) => ({
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone || 'N/A',
        status: vendor.isActive ? 'approved' : 'pending',
        joinDate: new Date(vendor.createdAt).toISOString().split('T')[0],
        totalVehicles: Math.floor(Math.random() * 20) + 5, // Mock data for now
        totalRevenue: Math.floor(Math.random() * 100000) + 10000, // Mock data for now
        rating: Math.floor(Math.random() * 2) + 4 // Mock rating between 4-5
      })) || [];

      setVendors(vendorsData);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fallback to mock data if API fails
      const mockVendors = [
        {
          id: 1,
          name: 'Premium Car Rentals',
          email: 'premium@example.com',
          phone: '+91 98765 43210',
          status: 'approved',
          joinDate: '2024-01-15',
          totalVehicles: 12,
          totalRevenue: 45000,
          rating: 4.8
        }
      ];
      setVendors(mockVendors);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleApprove = async (vendorId) => {
    console.log('Approve button clicked for vendor:', vendorId);
    try {
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: true })
      });

      if (response.ok) {
        // Update local state
        setVendors(vendors.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, status: 'approved' }
            : vendor
        ));
        alert('Vendor approved successfully!');
        // Refresh data from database
        await fetchVendors();
      } else {
        throw new Error('Failed to approve vendor');
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
      alert('Failed to approve vendor. Please try again.');
    }
  };

  const handleReject = async (vendorId) => {
    console.log('Reject button clicked for vendor:', vendorId);
    try {
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: false })
      });

      if (response.ok) {
        // Update local state
        setVendors(vendors.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, status: 'rejected' }
            : vendor
        ));
        alert('Vendor rejected successfully!');
        // Refresh data from database
        await fetchVendors();
      } else {
        throw new Error('Failed to reject vendor');
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      alert('Failed to reject vendor. Please try again.');
    }
  };

  const handleView = (vendorId) => {
    console.log('View button clicked for vendor:', vendorId);
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      alert(`Viewing vendor: ${vendor.name}\nEmail: ${vendor.email}\nPhone: ${vendor.phone}\nStatus: ${vendor.status}`);
    } else {
      alert('Vendor not found');
    }
  };

  const handleExport = () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Status', 'Join Date', 'Total Vehicles', 'Total Revenue', 'Rating'],
        ...vendors.map(vendor => [
          vendor.name,
          vendor.email,
          vendor.phone,
          vendor.status,
          vendor.joinDate,
          vendor.totalVehicles,
          vendor.totalRevenue,
          vendor.rating
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vendors_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-vendor-management">
      <div className="page-header">
        <h1>Vendor Management</h1>
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
            placeholder="Search vendors..."
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
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="vendors-table">
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Vehicles</th>
              <th>Revenue</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <div className="vendor-info">
                    <strong>{vendor.name}</strong>
                    <small>Joined: {new Date(vendor.joinDate).toLocaleDateString()}</small>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div>{vendor.email}</div>
                    <div>{vendor.phone}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${vendor.status}`}>
                    {vendor.status}
                  </span>
                </td>
                <td>{vendor.totalVehicles}</td>
                <td>₹{vendor.totalRevenue.toLocaleString()}</td>
                <td>
                  {vendor.rating > 0 ? (
                    <div className="rating">
                      <span>{vendor.rating}</span>
                    </div>
                  ) : (
                    <span className="no-rating">No rating</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleView(vendor.id)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    {vendor.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(vendor.id)}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(vendor.id)}
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                    {vendor.status === 'approved' && (
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={() => handleReject(vendor.id)}
                        title="Reject Vendor"
                      >
                        <FaUserTimes />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-vendor-management {
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

        .vendors-table {
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

        .vendor-info strong {
          display: block;
          color: var(--grey-800);
          margin-bottom: 0.25rem;
        }

        .vendor-info small {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .contact-info {
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

        .status-approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .no-rating {
          color: var(--grey-500);
          font-style: italic;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
        }

        .action-buttons .btn {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          min-width: 32px;
          height: 32px;
        }

        .action-buttons .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .action-buttons .btn-outline {
          background: transparent;
          border: 1px solid var(--grey-300);
          color: var(--grey-600);
        }

        .action-buttons .btn-outline:hover {
          background: var(--grey-50);
          border-color: var(--grey-400);
        }

        .action-buttons .btn-success {
          background: #10b981;
          color: white;
        }

        .action-buttons .btn-success:hover {
          background: #059669;
        }

        .action-buttons .btn-danger {
          background: #ef4444;
          color: white;
        }

        .action-buttons .btn-danger:hover {
          background: #dc2626;
        }

        .action-buttons .btn-warning {
          background: #f59e0b;
          color: white;
        }

        .action-buttons .btn-warning:hover {
          background: #d97706;
        }

        @media (max-width: 768px) {
          .admin-vendor-management {
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

          .vendors-table {
            overflow: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminVendorManagement;
