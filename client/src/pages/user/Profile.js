import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [viewMode, setViewMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/profile');
      const data = response.data;
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
      await api.put('/users/profile', form);
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
        <div className="card" style={{ padding: '1rem', maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Profile Details</h2>
            <button className="btn btn-outline" onClick={() => setViewMode(!viewMode)}>
              {viewMode ? 'Edit' : 'Cancel'}
            </button>
          </div>

          {viewMode ? (
            <div className="profile-view">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Name</label>
                <div className="form-control" style={{ background: '#f8f9fa' }}>{form.name}</div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Phone</label>
                <div className="form-control" style={{ background: '#f8f9fa' }}>{form.phone}</div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Address</label>
                <div className="form-control" style={{ background: '#f8f9fa' }}>{form.address}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
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
      )}
    </div>
  );
};

export default Profile;
