import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FaUser, FaCog, FaGlobe, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
            <Link to="/support" className="nav-link">
              Support
            </Link>
          </nav>

          <div className="header-actions">
            <button className="btn btn-outline" title="Settings">
              <FaCog />
            </button>
            <button className="btn btn-outline" title="Language">
              <FaGlobe />
            </button>

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
                    <Link to="/dashboard" className="dropdown-item">
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

      <style jsx>{`
        .user-menu {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--white-color);
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
