import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCheck, FaTimes, FaEye, FaSearch, FaFilter, FaDownload, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const AdminVendorManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, [page, statusFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/admin/vendors?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to load vendors: ${response.status}`);
      }
      
      const data = await response.json();
      setVendors(data.vendors || []);
      setTotalPages(data.pagination?.totalPages || 1);
      
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError(err.message);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVendors();
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to approve vendor');
      }
      
      setSuccess('Vendor approved successfully!');
      fetchVendors();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor?')) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/admin/vendors/${vendorId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to reject vendor');
      }
      
      setSuccess('Vendor rejected successfully!');
      fetchVendors();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (vendorId, currentStatus) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/admin/vendors/${vendorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update vendor status');
      }
      
      setSuccess(`Vendor ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchVendors();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const exportVendors = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Approval Status', 'City', 'State', 'Registration Date'],
      ...vendors.map(vendor => [
        vendor.userId?.name || vendor.name,
        vendor.userId?.email || vendor.email,
        vendor.userId?.phone || vendor.phone,
        vendor.isActive ? 'Active' : 'Inactive',
        vendor.approvalStatus || 'Pending',
        vendor.address?.city || '',
        vendor.address?.state || '',
        new Date(vendor.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendors.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-vendor-management">
      <div className="management-header">
        <h2>Vendor Management</h2>
        <div className="header-actions">
          <button onClick={exportVendors} className="btn btn-outline">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className="btn btn-primary">
            <FaSearch /> Search
          </button>
        </form>
      </div>

      <div className="vendors-table">
        {loading ? (
          <div className="loading">Loading vendors...</div>
        ) : vendors.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Vendor Info</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Location</th>
                <th>Registration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>
                    <div className="vendor-info">
                      <div className="vendor-avatar">
                        <FaUserCheck />
                      </div>
                      <div>
                        <div className="vendor-name">{vendor.userId?.name || vendor.name}</div>
                        <div className="vendor-id">ID: {vendor._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{vendor.userId?.email || vendor.email}</div>
                      <div>{vendor.userId?.phone || vendor.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${vendor.isActive ? 'active' : 'inactive'}`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`approval-badge approval-${vendor.approvalStatus || 'pending'}`}>
                      {vendor.approvalStatus || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="location-info">
                      <div>{vendor.address?.city || 'N/A'}</div>
                      <div>{vendor.address?.state || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openDetailsModal(vendor)}
                        className="btn btn-sm btn-outline"
                      >
                        <FaEye />
                      </button>
                      {vendor.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveVendor(vendor._id)}
                            className="btn btn-sm btn-success"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRejectVendor(vendor._id)}
                            className="btn btn-sm btn-danger"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleToggleStatus(vendor._id, vendor.isActive)}
                        className={`btn btn-sm ${vendor.isActive ? 'btn-warning' : 'btn-success'}`}
                      >
                        {vendor.isActive ? <FaUserTimes /> : <FaUserCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No vendors found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}

      {/* Vendor Details Modal */}
      {showDetailsModal && selectedVendor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Vendor Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="vendor-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedVendor.userId?.name || selectedVendor.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedVendor.userId?.email || selectedVendor.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedVendor.userId?.phone || selectedVendor.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge status-${selectedVendor.isActive ? 'active' : 'inactive'}`}>
                        {selectedVendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Business Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Business Name:</label>
                      <span>{selectedVendor.businessName || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Business Type:</label>
                      <span>{selectedVendor.businessType || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Registration Number:</label>
                      <span>{selectedVendor.registrationNumber || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Approval Status:</label>
                      <span className={`approval-badge approval-${selectedVendor.approvalStatus || 'pending'}`}>
                        {selectedVendor.approvalStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Address</h4>
                  <div className="address-info">
                    <p>{selectedVendor.address?.street || 'N/A'}</p>
                    <p>{selectedVendor.address?.city}, {selectedVendor.address?.state}</p>
                    <p>PIN: {selectedVendor.address?.pincode || 'N/A'}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Documents</h4>
                  <div className="documents-list">
                    {selectedVendor.documents ? (
                      Object.entries(selectedVendor.documents).map(([key, value]) => (
                        <div key={key} className="document-item">
                          <span className="document-label">{key}:</span>
                          <span className="document-value">{value || 'Not provided'}</span>
                        </div>
                      ))
                    ) : (
                      <p>No documents uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-vendor-management {
          padding: 1rem;
        }

        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .filters-section {
          margin-bottom: 2rem;
        }

        .search-form {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .search-box svg {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          min-width: 150px;
        }

        .vendors-table {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
        }

        .vendor-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .vendor-avatar {
          width: 40px;
          height: 40px;
          background: #e9ecef;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }

        .vendor-name {
          font-weight: 600;
          color: #495057;
        }

        .vendor-id {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .contact-info div {
          margin-bottom: 0.25rem;
        }

        .location-info div {
          margin-bottom: 0.25rem;
        }

        .status-badge, .approval-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-active { background: #d4edda; color: #155724; }
        .status-inactive { background: #f8d7da; color: #721c24; }

        .approval-pending { background: #fff3cd; color: #856404; }
        .approval-approved { background: #d4edda; color: #155724; }
        .approval-rejected { background: #f8d7da; color: #721c24; }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
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

        .btn-primary { background: #007bff; color: white; }
        .btn-outline { background: transparent; color: #6c757d; border: 1px solid #6c757d; }
        .btn-success { background: #28a745; color: white; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8rem; }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .vendor-details {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .detail-section h4 {
          margin: 0 0 1rem 0;
          color: #495057;
          font-size: 1.1rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          font-weight: 500;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .address-info p {
          margin: 0.25rem 0;
          color: #495057;
        }

        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .document-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .document-label {
          font-weight: 500;
          color: #495057;
        }

        .document-value {
          color: #6c757d;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .loading, .no-data {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
          
          .search-form {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminVendorManagement;
