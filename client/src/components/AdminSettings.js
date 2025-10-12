import React, { useState, useEffect } from 'react';
import { FaSave, FaCog, FaShieldAlt, FaBell, FaPalette, FaDatabase } from 'react-icons/fa';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Vehicle Rental Platform',
      siteDescription: 'Your trusted vehicle rental service',
      contactEmail: 'admin@vehiclerental.com',
      contactPhone: '+91-9876543210',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      language: 'en'
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowRegistration: true,
      emailVerification: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingAlerts: true,
      systemAlerts: true,
      maintenanceAlerts: true
    },
    appearance: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      logoUrl: '',
      faviconUrl: '',
      customCss: ''
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      backupFrequency: 'daily',
      cacheTimeout: 3600,
      maxFileSize: 10
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.log('Using default settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess('Settings saved successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        general: {
          siteName: 'Vehicle Rental Platform',
          siteDescription: 'Your trusted vehicle rental service',
          contactEmail: 'admin@vehiclerental.com',
          contactPhone: '+91-9876543210',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          language: 'en'
        },
        security: {
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireTwoFactor: false,
          allowRegistration: true,
          emailVerification: true
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          bookingAlerts: true,
          systemAlerts: true,
          maintenanceAlerts: true
        },
        appearance: {
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          logoUrl: '',
          faviconUrl: '',
          customCss: ''
        },
        system: {
          maintenanceMode: false,
          debugMode: false,
          logLevel: 'info',
          backupFrequency: 'daily',
          cacheTimeout: 3600,
          maxFileSize: 10
        }
      });
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'system', label: 'System', icon: FaDatabase }
  ];

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner">
          <FaCog className="spinning" />
        </div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h2>System Settings</h2>
        <div className="header-actions">
          <button onClick={handleReset} className="btn btn-outline">
            Reset to Default
          </button>
          <button onClick={handleSave} className="btn btn-primary" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={settings.general.contactPhone}
                    onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="1440"
                  />
                </div>
                <div className="form-group">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>
                <div className="form-group">
                  <label>Password Min Length</label>
                  <input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="20"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.security.requireTwoFactor}
                      onChange={(e) => updateSetting('security', 'requireTwoFactor', e.target.checked)}
                    />
                    Require Two-Factor Authentication
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.security.allowRegistration}
                      onChange={(e) => updateSetting('security', 'allowRegistration', e.target.checked)}
                    />
                    Allow User Registration
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.security.emailVerification}
                      onChange={(e) => updateSetting('security', 'emailVerification', e.target.checked)}
                    />
                    Require Email Verification
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                    />
                    Email Notifications
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                    />
                    SMS Notifications
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                    />
                    Push Notifications
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.bookingAlerts}
                      onChange={(e) => updateSetting('notifications', 'bookingAlerts', e.target.checked)}
                    />
                    Booking Alerts
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                    />
                    System Alerts
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.maintenanceAlerts}
                      onChange={(e) => updateSetting('notifications', 'maintenanceAlerts', e.target.checked)}
                    />
                    Maintenance Alerts
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Primary Color</label>
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Secondary Color</label>
                  <input
                    type="color"
                    value={settings.appearance.secondaryColor}
                    onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    value={settings.appearance.logoUrl}
                    onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="form-group">
                  <label>Favicon URL</label>
                  <input
                    type="url"
                    value={settings.appearance.faviconUrl}
                    onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Custom CSS</label>
                  <textarea
                    value={settings.appearance.customCss}
                    onChange={(e) => updateSetting('appearance', 'customCss', e.target.value)}
                    rows="6"
                    placeholder="/* Custom CSS styles */"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section">
              <h3>System Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.system.maintenanceMode}
                      onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
                    />
                    Maintenance Mode
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.system.debugMode}
                      onChange={(e) => updateSetting('system', 'debugMode', e.target.checked)}
                    />
                    Debug Mode
                  </label>
                </div>
                <div className="form-group">
                  <label>Log Level</label>
                  <select
                    value={settings.system.logLevel}
                    onChange={(e) => updateSetting('system', 'logLevel', e.target.value)}
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Backup Frequency</label>
                  <select
                    value={settings.system.backupFrequency}
                    onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cache Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.system.cacheTimeout}
                    onChange={(e) => updateSetting('system', 'cacheTimeout', parseInt(e.target.value))}
                    min="60"
                    max="86400"
                  />
                </div>
                <div className="form-group">
                  <label>Max File Size (MB)</label>
                  <input
                    type="number"
                    value={settings.system.maxFileSize}
                    onChange={(e) => updateSetting('system', 'maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-settings {
          padding: 1rem;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .settings-content {
          display: flex;
          gap: 2rem;
          min-height: 600px;
        }

        .settings-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: none;
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-size: 0.875rem;
        }

        .tab-button:hover {
          background: #e9ecef;
        }

        .tab-button.active {
          background: #007bff;
          color: white;
        }

        .settings-panel {
          flex: 1;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .settings-section h3 {
          margin: 0 0 1.5rem 0;
          color: #495057;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #495057;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .form-group input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .form-group input[type="color"] {
          width: 60px;
          height: 40px;
          padding: 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-outline {
          background: transparent;
          color: #6c757d;
          border: 1px solid #6c757d;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .settings-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .loading-spinner {
          margin-bottom: 1rem;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .settings-content {
            flex-direction: column;
          }
          
          .settings-tabs {
            flex-direction: row;
            overflow-x: auto;
            min-width: auto;
          }
          
          .tab-button {
            white-space: nowrap;
            min-width: 120px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .settings-header {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;
