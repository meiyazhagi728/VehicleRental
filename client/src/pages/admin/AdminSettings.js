import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCog, FaSave, FaBell, FaShieldAlt, FaDatabase, FaServer, FaKey } from 'react-icons/fa';

const AdminSettings = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    siteName: 'Vehicle Rental System',
    siteDescription: 'Premium vehicle rental platform',
    contactEmail: 'admin@vehiclerental.com',
    contactPhone: '+91 98765 43210',
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      twoFactorAuth: false
    },
    system: {
      maintenanceMode: false,
      allowRegistration: true,
      requireApproval: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Fetching settings...');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Settings fetched:', data);
        setSettings(data);
      } else {
        console.log('Failed to fetch settings, using defaults');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('Saving settings:', settings);
      
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      const result = await response.json();
      console.log('Settings saved successfully:', result);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1>System Settings</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="success-message">
          Settings saved successfully!
        </div>
      )}

      <div className="settings-sections">
        {/* General Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FaCog />
            <h2>General Settings</h2>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                className="form-control"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FaBell />
            <h2>Notification Settings</h2>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                />
                <span>Email Notifications</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => handleChange('notifications', 'smsNotifications', e.target.checked)}
                />
                <span>SMS Notifications</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => handleChange('notifications', 'pushNotifications', e.target.checked)}
                />
                <span>Push Notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FaShieldAlt />
            <h2>Security Settings</h2>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.security.requireEmailVerification}
                  onChange={(e) => handleChange('security', 'requireEmailVerification', e.target.checked)}
                />
                <span>Require Email Verification</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.security.requirePhoneVerification}
                  onChange={(e) => handleChange('security', 'requirePhoneVerification', e.target.checked)}
                />
                <span>Require Phone Verification</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                />
                <span>Two-Factor Authentication</span>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FaServer />
            <h2>System Settings</h2>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.system.maintenanceMode}
                  onChange={(e) => handleChange('system', 'maintenanceMode', e.target.checked)}
                />
                <span>Maintenance Mode</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.system.allowRegistration}
                  onChange={(e) => handleChange('system', 'allowRegistration', e.target.checked)}
                />
                <span>Allow New Registrations</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.system.requireApproval}
                  onChange={(e) => handleChange('system', 'requireApproval', e.target.checked)}
                />
                <span>Require Vendor Approval</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-settings {
          padding: 2rem;
          background: var(--grey-50);
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem 2rem;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--grey-800);
          margin: 0;
        }

        .success-message {
          background: #d1fae5;
          color: #065f46;
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 2rem;
          text-align: center;
          font-weight: 500;
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .settings-section {
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          overflow: auto;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: var(--grey-50);
          border-bottom: 1px solid var(--grey-200);
        }

        .section-header svg {
          color: var(--accent-color);
          font-size: 1.25rem;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--grey-800);
          margin: 0;
        }

        .settings-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--grey-700);
          font-weight: 500;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--grey-300);
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          transition: border-color 0.3s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: var(--accent-color);
        }

        @media (max-width: 768px) {
          .admin-settings {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .settings-form {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
