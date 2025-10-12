import React, { useState } from 'react';

const Support = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await fetch('/api/support/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit');
      setStatus('Thanks! Your feedback has been submitted.');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-header"><h1>Support</h1></div>
      {status && <div className="alert" style={{ marginBottom: '1rem' }}>{status}</div>}
      <form onSubmit={onSubmit} className="card" style={{ padding: '1rem', maxWidth: 700 }}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-control" />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="form-control" required />
        </div>
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  );
};

export default Support;


