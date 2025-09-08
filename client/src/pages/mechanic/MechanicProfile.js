import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const MechanicProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [userForm, setUserForm] = useState({ name: '', phone: '', address: '' });
  const [mechForm, setMechForm] = useState({ specialization: '', experience: 0, pricing: { hourlyRate: 0 } });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [uRes, mRes] = await Promise.all([
        fetch('/api/users/profile', { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` } }),
        fetch('/api/mechanics', { headers: { 'Content-Type': 'application/json' } }),
      ]);
      if (!uRes.ok) throw new Error((await uRes.json()).message || 'Failed to load user');
      const uData = await uRes.json();
      setUserForm({ name: uData.name || '', phone: uData.phone || '', address: uData.address || '' });
      // Mechanic profile retrieval: ideally needs a GET /api/mechanics/profile; fallback find-by-user not present.
      // Skip fetching mechanic specific in list; leave fields for create/update.
      setMechForm((prev) => ({ ...prev }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUserChange = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value });
  const onMechChange = (e) => {
    const { name, value } = e.target;
    if (name === 'hourlyRate') {
      setMechForm({ ...mechForm, pricing: { ...mechForm.pricing, hourlyRate: Number(value) } });
    } else if (name === 'experience') {
      setMechForm({ ...mechForm, experience: Number(value) });
    } else {
      setMechForm({ ...mechForm, [name]: value });
    }
  };

  const saveUser = async () => {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
      body: JSON.stringify(userForm),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to save user');
  };

  const saveMechanic = async () => {
    // Try update first; if not exists, create
    let res = await fetch('/api/mechanics/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
      body: JSON.stringify(mechForm),
    });
    if (res.status === 404) {
      res = await fetch('/api/mechanics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ ...mechForm, services: ['General Maintenance'], address: { street: '', city: '', state: '', pincode: '' }, contactInfo: { phone: userForm.phone || '0000000000', email: user?.email || 'unknown@example.com' }, documents: { license: 'N/A' } }),
      });
    }
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to save mechanic');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await saveUser();
      await saveMechanic();
      setSuccess('Profile saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Mechanic Profile</h1>
      </div>
      {error && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{success}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ padding: '1rem', maxWidth: 700 }}>
          <h3>Basic Info</h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={userForm.name} onChange={onUserChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={userForm.phone} onChange={onUserChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" value={userForm.address} onChange={onUserChange} className="form-control" />
          </div>

          <h3>Mechanic Details</h3>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="specialization">Specialization</label>
            <input id="specialization" name="specialization" value={mechForm.specialization} onChange={onMechChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="experience">Experience (years)</label>
            <input id="experience" name="experience" type="number" value={mechForm.experience} onChange={onMechChange} className="form-control" />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="hourlyRate">Hourly Rate</label>
            <input id="hourlyRate" name="hourlyRate" type="number" value={mechForm.pricing.hourlyRate} onChange={onMechChange} className="form-control" />
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}
    </div>
  );
};

export default MechanicProfile;
