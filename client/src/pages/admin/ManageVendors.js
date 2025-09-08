import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ManageVendors = () => {
  const { user } = useSelector((state) => state.auth);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPendingVendors = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/admin/vendors/pending?page=${pageNum}&limit=10`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load vendors');
      }
      const data = await response.json();
      setVendors(data.vendors || []);
      setPage(data.pagination?.currentPage || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approveVendor = async (vendorId) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Approve failed');
      }
      await fetchPendingVendors(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const rejectVendor = async (vendorId) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ reason: 'Not meeting requirements' }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Reject failed');
      }
      await fetchPendingVendors(page);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Manage Vendors</h1>
        <p>Approve or reject pending vendor accounts</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : vendors.length === 0 ? (
            <p>No pending vendors.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v._id}>
                      <td>{v.name}</td>
                      <td>{v.email}</td>
                      <td>{v.phone || '-'}</td>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() => approveVendor(v._id)}
                          style={{ marginRight: '0.5rem' }}
                          title="Approve"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => rejectVendor(v._id)}
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn" disabled={page <= 1} onClick={() => fetchPendingVendors(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button className="btn" disabled={page >= totalPages} onClick={() => fetchPendingVendors(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageVendors;
