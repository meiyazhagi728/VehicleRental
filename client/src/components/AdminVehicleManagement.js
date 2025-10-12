import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye, FaSearch, FaFilter, FaDownload, FaCar, FaPlus } from 'react-icons/fa';

const AdminVehicleManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    category: '',
    price: '',
    description: '',
    features: [],
    images: [],
    location: '',
    isAvailable: true,
    vendorId: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, [page, statusFilter, categoryFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`/api/vehicles?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to load vehicles: ${response.status}`);
      }
      
      const data = await response.json();
      setVehicles(data.vehicles || data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create vehicle');
      }
      
      setSuccess('Vehicle created successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        brand: '',
        model: '',
        year: '',
        category: '',
        price: '',
        description: '',
        features: [],
        images: [],
        location: '',
        isAvailable: true,
        vendorId: ''
      });
      fetchVehicles();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/vehicles/${selectedVehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update vehicle');
      }
      
      setSuccess('Vehicle updated successfully!');
      setShowEditModal(false);
      setSelectedVehicle(null);
      fetchVehicles();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete vehicle');
      }
      
      setSuccess('Vehicle deleted successfully!');
      fetchVehicles();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (vehicleId, currentStatus) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/vehicles/${vehicleId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update vehicle availability');
      }
      
      setSuccess(`Vehicle ${!currentStatus ? 'made available' : 'made unavailable'} successfully!`);
      fetchVehicles();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      category: vehicle.category || '',
      price: vehicle.price || '',
      description: vehicle.description || '',
      features: vehicle.features || [],
      images: vehicle.images || [],
      location: vehicle.location || '',
      isAvailable: vehicle.isAvailable !== false,
      vendorId: vehicle.vendorId || ''
    });
    setShowEditModal(true);
  };

  const exportVehicles = () => {
    const csvContent = [
      ['Name', 'Brand', 'Model', 'Year', 'Category', 'Price', 'Status', 'Location', 'Vendor'],
      ...vehicles.map(vehicle => [
        vehicle.name,
        vehicle.brand,
        vehicle.model,
        vehicle.year,
        vehicle.category,
        vehicle.price,
        vehicle.isAvailable ? 'Available' : 'Unavailable',
        vehicle.location,
        vehicle.vendorId?.name || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicles.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-vehicle-management">
      <div className="management-header">
        <h2>Vehicle Management</h2>
        <div className="header-actions">
          <button onClick={exportVehicles} className="btn btn-outline">
            <FaDownload /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <FaPlus /> Add Vehicle
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
              placeholder="Search vehicles..."
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
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="luxury">Luxury</option>
            <option value="economy">Economy</option>
          </select>
          <button type="submit" className="btn btn-primary">
            <FaSearch /> Search
          </button>
        </form>
      </div>

      <div className="vehicles-table">
        {loading ? (
          <div className="loading">Loading vehicles...</div>
        ) : vehicles.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Details</th>
                <th>Price</th>
                <th>Status</th>
                <th>Location</th>
                <th>Vendor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>
                    <div className="vehicle-info">
                      <div className="vehicle-image">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img src={vehicle.images[0]} alt={vehicle.name} />
                        ) : (
                          <div className="vehicle-placeholder">
                            <FaCar />
                          </div>
                        )}
                      </div>
                      <div className="vehicle-details">
                        <div className="vehicle-name">{vehicle.name}</div>
                        <div className="vehicle-id">ID: {vehicle._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-specs">
                      <div>{vehicle.brand} {vehicle.model}</div>
                      <div>Year: {vehicle.year}</div>
                      <div>Category: {vehicle.category}</div>
                    </div>
                  </td>
                  <td>
                    <div className="price-info">
                      <div className="price">₹{vehicle.price?.toLocaleString()}</div>
                      <div className="price-period">per day</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${vehicle.isAvailable ? 'available' : 'unavailable'}`}>
                      {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="location-info">
                      {vehicle.location || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="vendor-info">
                      {vehicle.vendorId?.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(vehicle)}
                        className="btn btn-sm btn-outline"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(vehicle._id, vehicle.isAvailable)}
                        className={`btn btn-sm ${vehicle.isAvailable ? 'btn-warning' : 'btn-success'}`}
                      >
                        {vehicle.isAvailable ? <FaToggleOff /> : <FaToggleOn />}
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="btn btn-sm btn-danger"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No vehicles found</p>
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

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="luxury">Luxury</option>
                    <option value="economy">Economy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (per day)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select
                    value={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Vehicle'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Vehicle</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <form onSubmit={handleEditVehicle} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="luxury">Luxury</option>
                    <option value="economy">Economy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (per day)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select
                    value={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Vehicle'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-vehicle-management {
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

        .vehicles-table {
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

        .vehicle-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .vehicle-image {
          width: 60px;
          height: 40px;
          border-radius: 6px;
          overflow: hidden;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vehicle-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vehicle-placeholder {
          color: #6c757d;
          font-size: 1.2rem;
        }

        .vehicle-name {
          font-weight: 600;
          color: #495057;
        }

        .vehicle-id {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .vehicle-specs div {
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .price-info {
          text-align: center;
        }

        .price {
          font-weight: 600;
          color: #28a745;
          font-size: 1.1rem;
        }

        .price-period {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-available { background: #d4edda; color: #155724; }
        .status-unavailable { background: #f8d7da; color: #721c24; }

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
          max-width: 600px;
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
          color: #495057;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
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
          .form-row {
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

export default AdminVehicleManagement;
