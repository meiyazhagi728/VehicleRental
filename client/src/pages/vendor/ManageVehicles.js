import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ManageVehicles = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    if (!user || !token) {
      setError('Please log in to access this page');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5000/api/vehicles/vendor', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to load vehicles');
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailability = async (vehicle) => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${vehicle._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: !vehicle.isAvailable }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update');
      await fetchVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete');
      await fetchVehicles();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>My Vehicles</h1>
        <button className="btn btn-primary" onClick={() => navigate('/vendor/add-vehicle')}>Add Vehicle</button>
      </div>

      {error && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles found. Add your first vehicle.</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Type</th>
                <th>Price/Day</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <img 
                      src={v.images?.[0] || v.image || '/api/placeholder/80/50' || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzRBOTBFMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZWhpY2xlPC90ZXh0Pjwvc3ZnPg=='} 
                      alt={v.name || v.make + ' ' + v.model || 'Vehicle'} 
                      style={{ width: 80, height: 50, objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzRBOTBFMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZWhpY2xlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </td>
                  <td>{v.name}</td>
                  <td>{v.type}</td>
                  <td>₹{v.pricePerDay}</td>
                  <td>{v.isAvailable ? 'Available' : 'Booked'}</td>
                  <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => navigate(`/vendor/edit-vehicle/${v._id}`)}
                      title="Edit Vehicle"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => toggleAvailability(v)}
                      title={v.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    >
                      {v.isAvailable ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => deleteVehicle(v._id)}
                      title="Delete Vehicle"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageVehicles;
