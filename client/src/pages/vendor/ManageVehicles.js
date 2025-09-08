import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ManageVehicles = () => {
  const { user } = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/vehicles/vendor', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
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
      const res = await fetch(`/api/vehicles/${vehicle._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
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
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
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
                  <td>{v.images?.[0] && <img src={v.images[0]} alt={v.name} style={{ width: 80, height: 50, objectFit: 'cover' }} />}</td>
                  <td>{v.name}</td>
                  <td>{v.type}</td>
                  <td>₹{v.pricePerDay}</td>
                  <td>{v.isAvailable ? 'Available' : 'Booked'}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => toggleAvailability(v)}>
                      {v.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button className="btn btn-danger" onClick={() => deleteVehicle(v._id)}>Delete</button>
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
