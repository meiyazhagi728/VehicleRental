import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ManageUsers = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [role, setRole] = useState('');

  const fetchUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '10');
      if (role) params.set('role', role);
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
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

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Manage Users</h1>
        <p>View and filter users</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={onFilter} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
          <option value="mechanic">Mechanic</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-primary" type="submit">Apply Filters</button>
      </form>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.isActive === false ? 'Inactive' : 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button className="btn" disabled={page >= totalPages} onClick={() => fetchUsers(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
