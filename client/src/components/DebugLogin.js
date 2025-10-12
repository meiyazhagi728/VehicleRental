import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';

const DebugLogin = () => {
  const [formData, setFormData] = useState({
    email: 'admin@vehicle.com',
    password: 'admin123'
  });
  const [debugInfo, setDebugInfo] = useState([]);
  
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  
  const addDebugInfo = (message) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDebugInfo([]);
    
    addDebugInfo('Starting login process...');
    addDebugInfo(`Email: ${formData.email}`);
    addDebugInfo(`Password: ${formData.password}`);
    
    try {
      addDebugInfo('Dispatching login action...');
      const result = await dispatch(login(formData));
      
      if (login.fulfilled.match(result)) {
        addDebugInfo('✅ Login successful!');
        addDebugInfo(`User: ${result.payload.name}`);
        addDebugInfo(`Role: ${result.payload.role}`);
        addDebugInfo(`Token: ${result.payload.token?.substring(0, 50)}...`);
      } else {
        addDebugInfo('❌ Login failed');
        addDebugInfo(`Error: ${result.payload}`);
      }
    } catch (error) {
      addDebugInfo(`❌ Exception: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Debug Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Test Login
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Debug Info:</h3>
        <div style={{ background: '#f8f9fa', padding: '10px', border: '1px solid #dee2e6', maxHeight: '300px', overflow: 'auto' }}>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ marginBottom: '5px', fontSize: '14px' }}>
              {info}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Redux State:</h3>
        <pre style={{ background: '#f8f9fa', padding: '10px', border: '1px solid #dee2e6', fontSize: '12px' }}>
          {JSON.stringify(authState, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugLogin;
