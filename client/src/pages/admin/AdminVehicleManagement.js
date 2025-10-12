import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaSearch, FaDownload, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const AdminVehicleManagement = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/vehicles', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      
      // Transform the data to match our component structure
      const vehiclesData = data.vehicles?.map((vehicle) => ({
        id: vehicle._id,
        name: `${vehicle.make} ${vehicle.model}`,
        type: vehicle.type,
        brand: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        pricePerDay: vehicle.pricePerDay,
        isAvailable: vehicle.isAvailable,
        vendor: vehicle.vendor?.name || 'Unknown Vendor',
        totalBookings: Math.floor(Math.random() * 30) + 5, // Mock data for now
        revenue: Math.floor(Math.random() * 50000) + 10000, // Mock data for now
        rating: Math.floor(Math.random() * 2) + 4 // Mock rating between 4-5
      })) || [];

      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Fallback to mock data if API fails
      const mockVehicles = [
        {
          id: 1,
          name: 'Toyota Camry',
          type: 'Sedan',
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          pricePerDay: 2500,
          isAvailable: true,
          vendor: 'Premium Car Rentals',
          totalBookings: 15,
          revenue: 45000,
          rating: 4.8
        }
      ];
      setVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleView = (vehicleId) => {
    console.log('View button clicked for vehicle:', vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      alert(`Viewing vehicle: ${vehicle.name}\nType: ${vehicle.type}\nBrand: ${vehicle.brand}\nPrice: ₹${vehicle.pricePerDay}/day\nAvailable: ${vehicle.isAvailable ? 'Yes' : 'No'}`);
    } else {
      alert('Vehicle not found');
    }
  };

  const handleEdit = async (vehicleId) => {
    console.log('Edit button clicked for vehicle:', vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      // Get new values from user
      const newPrice = prompt(`Enter new price per day for ${vehicle.name}:`, vehicle.pricePerDay);
      const newAvailability = window.confirm(`Is ${vehicle.name} available? (OK for Yes, Cancel for No)`);
      
       if (newPrice !== null) {
         try {
          
          const response = await fetch(`http://localhost:5000/api/admin/vehicles/${vehicleId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              pricePerDay: parseFloat(newPrice),
              isAvailable: newAvailability
            })
          });

          if (response.ok) {
            // Update local state
            setVehicles(vehicles.map(v => 
              v.id === vehicleId 
                ? { ...v, pricePerDay: parseFloat(newPrice), isAvailable: newAvailability }
                : v
            ));
            alert('Vehicle updated successfully!');
            // Refresh data from database
            await fetchVehicles();
          } else {
            throw new Error('Failed to update vehicle');
          }
        } catch (error) {
          console.error('Error updating vehicle:', error);
          alert('Failed to update vehicle. Please try again.');
        }
      }
    }
  };

  const handleDelete = async (vehicleId) => {
    console.log('Delete button clicked for vehicle:', vehicleId);
    if (window.confirm('Are you sure you want to delete this vehicle?\n\nNote: Vehicles with active bookings cannot be deleted.')) {
      try {
        
        const response = await fetch(`http://localhost:5000/api/admin/vehicles/${vehicleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Update local state
          setVehicles(vehicles.filter(v => v.id !== vehicleId));
          alert('Vehicle deleted successfully!');
          // Refresh data from database
          await fetchVehicles();
        } else {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 400 && errorData.message) {
            alert(`Cannot delete vehicle: ${errorData.message}`);
            return; // Don't throw error, just return
          } else {
            throw new Error('Failed to delete vehicle');
          }
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  const handleExport = () => {
    try {
      const csvContent = [
        ['Name', 'Type', 'Brand', 'Model', 'Year', 'Price/Day', 'Available', 'Vendor', 'Total Bookings', 'Revenue', 'Rating'],
        ...vehicles.map(vehicle => [
          vehicle.name,
          vehicle.type,
          vehicle.brand,
          vehicle.model,
          vehicle.year,
          vehicle.pricePerDay,
          vehicle.isAvailable ? 'Yes' : 'No',
          vehicle.vendor,
          vehicle.totalBookings,
          vehicle.revenue,
          vehicle.rating
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vehicles_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || vehicle.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="admin-vehicle-management">
      <div className="page-header">
        <h1>Vehicle Management</h1>
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
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="Sedan">Sedan</option>
          <option value="Hatchback">Hatchback</option>
          <option value="SUV">SUV</option>
          <option value="Luxury">Luxury</option>
        </select>
      </div>

      <div className="vehicles-table">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Vendor</th>
              <th>Type</th>
              <th>Price/Day</th>
              <th>Status</th>
              <th>Bookings</th>
              <th>Revenue</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>
                  <div className="vehicle-info">
                    <strong>{vehicle.name}</strong>
                    <small>{vehicle.year} • {vehicle.brand} {vehicle.model}</small>
                  </div>
                </td>
                <td>{vehicle.vendor}</td>
                <td>
                  <span className="type-badge">{vehicle.type}</span>
                </td>
                <td>₹{vehicle.pricePerDay}</td>
                <td>
                  <span className={`status-badge status-${vehicle.isAvailable ? 'available' : 'unavailable'}`}>
                    {vehicle.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </td>
                <td>{vehicle.totalBookings}</td>
                <td>₹{vehicle.revenue.toLocaleString()}</td>
                <td>
                  <div className="rating">
                    <span>{vehicle.rating}</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleView(vehicle.id)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(vehicle.id)}
                      title="Edit Vehicle"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(vehicle.id)}
                      title="Delete Vehicle"
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

      <style jsx>{`
        .admin-vehicle-management {
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

        .vehicles-table {
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

        .vehicle-info strong {
          display: block;
          color: var(--grey-800);
          margin-bottom: 0.25rem;
        }

        .vehicle-info small {
          color: var(--grey-600);
          font-size: 0.875rem;
        }

        .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-available {
          background: #d1fae5;
          color: #065f46;
        }

        .status-unavailable {
          background: #fee2e2;
          color: #991b1b;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
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

        .action-buttons .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .action-buttons .btn-primary:hover {
          background: #2563eb;
        }

        .action-buttons .btn-danger {
          background: #ef4444;
          color: white;
        }

        .action-buttons .btn-danger:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .admin-vehicle-management {
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

          .vehicles-table {
            overflow: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminVehicleManagement;
