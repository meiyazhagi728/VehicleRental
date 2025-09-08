import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ManageServices = () => {
  const { user } = useSelector((state) => state.auth);
  const [services, setServices] = useState(['General Maintenance']);
  const [newService, setNewService] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addService = () => {
    const s = newService.trim();
    if (!s) return;
    if (services.includes(s)) return;
    setServices([...services, s]);
    setNewService('');
  };

  const removeService = (s) => {
    setServices(services.filter((x) => x !== s));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const res = await fetch('/api/mechanics/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ services }),
      });
      if (res.status === 404) {
        // create mechanic profile
        const createRes = await fetch('/api/mechanics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify({ specialization: 'General', experience: 0, services, address: { street: '', city: '', state: '', pincode: '' }, contactInfo: { phone: '0000000000', email: 'unknown@example.com' }, documents: { license: 'N/A' }, pricing: { hourlyRate: 0 } }),
        });
        if (!createRes.ok) throw new Error((await createRes.json()).message || 'Failed to create profile');
      } else if (!res.ok) {
        throw new Error((await res.json()).message || 'Failed to update services');
      }
      setSuccess('Services saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Manage Services</h1>
      </div>
      {error && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{success}</div>}

      <form onSubmit={onSubmit} className="card" style={{ padding: '1rem', maxWidth: 700 }}>
        <div className="form-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Add a service" className="form-control" />
          <button type="button" className="btn btn-secondary" onClick={addService}>Add</button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {services.map((s) => (
            <span key={s} className="badge">
              {s}
              <button type="button" className="btn btn-link" onClick={() => removeService(s)} aria-label={`Remove ${s}`}>×</button>
            </span>
          ))}
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Services'}</button>
      </form>
    </div>
  );
};

export default ManageServices;
