import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ManageVehicles = () => {
  const { user } = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState('');
  const [available, setAvailable] = useState('');

  const fetchVehicles = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '10');
      if (type) params.set('type', type);
      if (available !== '') params.set('available', available);
      const response = await fetch(`/api/admin/vehicles?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load vehicles');
      }
      const data = await response.json();
      setVehicles(data.vehicles || []);
      setPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = (e) => {
    e.preventDefault();
    fetchVehicles(1);
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Manage Vehicles</h1>
        <p>View and filter all vehicles</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={onFilter} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Car">Car</option>
          <option value="Bike">Bike</option>
          <option value="SUV">SUV</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Bus">Bus</option>
          <option value="Auto">Auto</option>
        </select>
        <select value={available} onChange={(e) => setAvailable(e.target.value)}>
          <option value="">Any Availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <button className="btn btn-primary" type="submit">Apply Filters</button>
      </form>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : vehicles.length === 0 ? (
            <p>No vehicles found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Price/Day</th>
                    <th>Vendor</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v._id}>
                      <td>{v.name}</td>
                      <td>{v.type}</td>
                      <td>₹{v.pricePerDay}</td>
                      <td>{v.vendorId?.name || '-'}</td>
                      <td>{v.isAvailable ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn" disabled={page <= 1} onClick={() => fetchVehicles(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button className="btn" disabled={page >= totalPages} onClick={() => fetchVehicles(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageVehicles;
