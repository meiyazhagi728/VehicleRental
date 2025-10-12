import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const SetAvailability = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ availability: true, workingHours: { start: '09:00', end: '18:00' }, workingDays: ['Mon','Tue','Wed','Thu','Fri'] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCurrent = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching current availability settings...');
      const res = await fetch('http://localhost:5000/api/mechanics/profile', {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Current profile data:', data);
        
        // Update form with current values
        setForm(prev => ({
          ...prev,
          availability: data.availability !== undefined ? data.availability : true,
          workingHours: data.workingHours || { start: '09:00', end: '18:00' },
          workingDays: data.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        }));
      } else {
        console.log('No existing profile found, using defaults');
      }
    } catch (err) {
      console.log('Error fetching current settings:', err);
      // Continue with default values
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !token) {
      setError('Please log in to access this page');
      return;
    }
    fetchCurrent();
  }, [user, token]);

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
    
    if (!user || !token) {
      setError('Please log in to update availability');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      console.log('Submitting availability form:', form);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Form data being sent:', JSON.stringify(form, null, 2));
      
      const res = await fetch('http://localhost:5000/api/mechanics/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to update availability');
      }
      
      const result = await res.json();
      console.log('Success response:', result);
      setSuccess(`Availability updated successfully! Working hours: ${form.workingHours.start} - ${form.workingHours.end}, Days: ${form.workingDays.join(', ')}`);
    } catch (err) {
      console.error('Form submission error:', err);
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
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={saving}
            onClick={(e) => {
              console.log('Button clicked!');
              if (!e.defaultPrevented) {
                console.log('Form will submit normally');
              }
            }}
          >
            {saving ? 'Saving...' : 'Update Availability'}
          </button>
          
          {/* Fallback button for testing */}
          <button 
            className="btn btn-secondary" 
            type="button" 
            disabled={saving}
            onClick={(e) => {
              e.preventDefault();
              console.log('Fallback button clicked!');
              onSubmit(e);
            }}
            style={{ marginLeft: '10px' }}
          >
            {saving ? 'Saving...' : 'Test Update'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SetAvailability;
