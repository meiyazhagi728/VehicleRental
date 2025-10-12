import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ManageUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [role, setRole] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const fetchUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '10');
      if (role) params.set('role', role);
      const response = await fetch(`http://localhost:5000/api/admin/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load users');
      }
      const data = await response.json();
      setUsers(data.users || []);
      setPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - only allow digits
    if (name === 'phone') {
      const digitsOnly = String(value).replace(/\D/g, ''); // Ensure value is string
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Clean and validate form data before sending
      const cleanedData = {
        name: formData.name?.trim(),
        email: formData.email?.trim().toLowerCase(),
        password: formData.password,
        phone: String(formData.phone || '').replace(/\D/g, ''), // Convert to string and remove non-digits
        role: formData.role,
        address: formData.address
      };
      
      // Client-side validation
      if (!cleanedData.name || cleanedData.name.length < 2) {
        throw new Error('Name must be at least 2 characters');
      }
      if (!cleanedData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedData.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!cleanedData.password || cleanedData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (!cleanedData.phone || cleanedData.phone.length !== 10) {
        throw new Error('Phone number must be exactly 10 digits');
      }
      if (!['user', 'vendor', 'mechanic', 'admin'].includes(cleanedData.role)) {
        throw new Error('Please select a valid role');
      }
      
      console.log('Sending user creation data:', cleanedData);
      
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          // Handle validation errors
          const errorMessages = data.errors.map(err => `${err.param}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        } else {
          throw new Error(data.message || 'Failed to create user');
        }
      }

      setSuccess('User created successfully');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: ''
        }
      });
      fetchUsers(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Clean and validate form data before sending
      const cleanedData = {
        name: formData.name?.trim(),
        email: formData.email?.trim().toLowerCase(),
        phone: String(formData.phone || '').replace(/\D/g, ''), // Convert to string and remove non-digits
        role: formData.role,
        address: formData.address
      };
      
      // Only include password if it's provided and not empty
      if (formData.password && formData.password.trim()) {
        cleanedData.password = formData.password;
      }
      
      // Client-side validation
      if (!cleanedData.name || cleanedData.name.length < 2) {
        throw new Error('Name must be at least 2 characters');
      }
      if (!cleanedData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedData.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (cleanedData.password && cleanedData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (!cleanedData.phone || cleanedData.phone.length !== 10) {
        throw new Error('Phone number must be exactly 10 digits');
      }
      if (!['user', 'vendor', 'mechanic', 'admin'].includes(cleanedData.role)) {
        throw new Error('Please select a valid role');
      }
      
      console.log('Sending user update data:', cleanedData);
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          // Handle validation errors
          const errorMessages = data.errors.map(err => `${err.param}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        } else {
          throw new Error(data.message || 'Failed to update user');
        }
      }

      setSuccess('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      setSuccess('User deleted successfully');
      fetchUsers(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ isActive: !users.find(u => u._id === userId)?.isActive }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle user status');
      }

      setSuccess(data.message);
      fetchUsers(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone: String(user.phone || ''), // Convert to string to ensure it's always a string
      role: user.role || 'user',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || ''
      }
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    });
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Manage Users</h1>
            <p>View, add, edit, and manage all users</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="filters-section">
        <form onSubmit={onFilter} className="filters-form">
          <div className="filter-row">
            <div className="form-group">
              <label>Filter by Role:</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="form-control"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
                <option value="mechanic">Mechanic</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-info">
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.isActive ? 'status-active' : 'status-cancelled'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => openEditModal(u)}
                            title="Edit User"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleStatus(u._id)}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(u._id)}
                            title="Delete User"
                            disabled={u._id === user?._id}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer">
          <div className="pagination">
            <button 
              className="btn btn-outline" 
              disabled={page <= 1} 
              onClick={() => fetchUsers(page - 1)}
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button 
              className="btn btn-outline" 
              disabled={page >= totalPages} 
              onClick={() => fetchUsers(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="btn-close" onClick={closeModals}>×</button>
            </div>
            <form onSubmit={handleAddUser} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="1234567890"
                    maxLength="10"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <div className="form-row">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Street"
                    className="form-control"
                  />
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="form-control"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="form-control"
                  />
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModals}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="btn-close" onClick={closeModals}>×</button>
            </div>
            <form onSubmit={handleEditUser} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="1234567890"
                    maxLength="10"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <div className="form-row">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Street"
                    className="form-control"
                  />
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="form-control"
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="form-control"
                  />
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModals}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .filters-section {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          padding: 2rem;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          margin-bottom: 2rem;
        }

        .filters-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .filter-row {
          display: flex;
          gap: 1rem;
          align-items: end;
        }

        .filter-row .form-group {
          margin-bottom: 0;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th,
        .table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--grey-200);
        }

        .table th {
          background: var(--grey-100);
          font-weight: 600;
          color: var(--grey-700);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .role-user {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-vendor {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .role-mechanic {
          background: #e8f5e8;
          color: #388e3c;
        }

        .role-admin {
          background: #fff3e0;
          color: #f57c00;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.5rem;
          font-size: 0.875rem;
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

        .modal {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-lg);
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--grey-200);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--grey-800);
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--grey-500);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid var(--grey-200);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--grey-600);
        }

        .loading-container {
          text-align: center;
          padding: 3rem;
        }

        .page-info {
          padding: 0 1rem;
          color: var(--grey-600);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }

          .action-buttons {
            flex-direction: column;
          }

          .modal {
            width: 95%;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageUsers;
