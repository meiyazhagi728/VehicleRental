import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load profile');
      }
      const data = await response.json();
      setForm({ name: data.name || '', phone: data.phone || '', address: data.address || '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update profile');
      }
      await fetchProfile();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ padding: '1rem', maxWidth: 600 }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={onChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" value={form.address} onChange={onChange} className="form-control" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
