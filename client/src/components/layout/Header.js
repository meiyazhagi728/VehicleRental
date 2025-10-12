import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FaUser, FaCog, FaGlobe, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const authState = useSelector((state) => state?.auth) || {};
  const { user } = authState;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  React.useEffect(() => {
    const onClick = (e) => {
      const menu = document.querySelector('.user-menu');
      if (menu && !menu.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Close dropdown on route changes by listening to popstate
  React.useEffect(() => {
    const onPop = () => setIsDropdownOpen(false);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            VehicleRental
          </Link>

          <nav className="nav-menu">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/vehicles" className="nav-link">
              Vehicles
            </Link>
            <Link to="/mechanics" className="nav-link">
              Mechanic
            </Link>
            {user && (
              <Link to="/my-bookings" className="nav-link">
                My Bookings
              </Link>
            )}
            <Link to="/mechanic-bookings" className="nav-link">
              Mechanic Bookings
            </Link>
            
          </nav>

          <div className="header-actions">
            

            {user ? (
              <div className="user-menu">
                <button
                  className="btn btn-primary"
                  onClick={toggleDropdown}
                  title="User Menu"
                >
                  <FaUser />
                  <span style={{ marginLeft: '0.5rem' }}>{user.name}</span>
                </button>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/dashboard/redirect"
                      className="dropdown-item"
                    >
                      Dashboard
                    </Link>
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item">
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .user-menu {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--blue-glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--blue-glass-border);
          box-shadow: var(--blue-glass-shadow);
          border: 1px solid var(--grey-300);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-lg);
          min-width: 200px;
          z-index: 1000;
          margin-top: 0.5rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--grey-700);
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .dropdown-item:hover {
          background: var(--grey-100);
        }

        .auth-buttons {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }
          
          .auth-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
