import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const SetAvailability = () => {
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ availability: true, workingHours: { start: '09:00', end: '18:00' }, workingDays: ['Mon','Tue','Wed','Thu','Fri'] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCurrent = async () => {
    try {
      setLoading(true);
      setError('');
      // No dedicated GET; skip fetch and rely on update form defaults
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'availability') {
      setForm({ ...form, availability: checked });
    } else if (name === 'start' || name === 'end') {
      setForm({ ...form, workingHours: { ...form.workingHours, [name]: value } });
    }
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const has = prev.workingDays.includes(day);
      return { ...prev, workingDays: has ? prev.workingDays.filter((d) => d !== day) : [...prev.workingDays, day] };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const res = await fetch('/api/mechanics/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update availability');
      setSuccess('Availability updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="container">
      <div className="page-header">
        <h1>Set Availability</h1>
      </div>
      {error && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{success}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ padding: '1rem', maxWidth: 700 }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>
              <input type="checkbox" name="availability" checked={form.availability} onChange={onChange} /> Available for jobs
            </label>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
            <div>
              <label htmlFor="start">Start</label>
              <input id="start" name="start" type="time" value={form.workingHours.start} onChange={onChange} className="form-control" />
            </div>
            <div>
              <label htmlFor="end">End</label>
              <input id="end" name="end" type="time" value={form.workingHours.end} onChange={onChange} className="form-control" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Working Days</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {days.map((d) => (
                <button type="button" key={d} className={`btn ${form.workingDays.includes(d) ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleDay(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </form>
      )}
    </div>
  );
};

export default SetAvailability;
