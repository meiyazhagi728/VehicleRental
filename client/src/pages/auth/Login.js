import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state?.auth) || {};
  const { user, isLoading, isError, isSuccess, message } = authState;

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      const r = user?.role;
      if (r === 'admin') navigate('/admin');
      else if (r === 'vendor') navigate('/vendor');
      else if (r === 'mechanic') navigate('/mechanic/dashboard');
      else navigate('/dashboard');
    }

    dispatch(clearError());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    dispatch(login(userData));
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="form-container" style={{padding: '2rem'}}>
        <h2 className="form-title">Welcome Back</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={onChange}
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
         <div className="auth-credentials-info" style={{
          marginTop:'50px'
         }}>
          <p>Use the following credentials to login:</p>
          <ul>
            <li>Email: admin@gmail.com</li>
            <li>Password: admin123</li>
            <li>Email: vendor@gmail.com</li>
            <li>Password: vendor123</li>
            <li>Email: mechanic@gmail.com</li>
            <li>Password: mechanic123</li>
            <li>Email: user@gmail.com</li>
            <li>Password: user1234</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          padding: 2rem 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--border-light);
          border-radius: var(--border-radius);
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .password-input {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--grey-500);
          cursor: pointer;
          padding: 0.25rem;
        }

        .password-toggle:hover {
          color: var(--accent-color);
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }

        .auth-links {
          text-align: center;
          margin-top: 1.5rem;
        }

        .auth-links a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .auth-links a:hover {
          text-decoration: underline;
        }

        .spinner {
          border: 4px solid var(--grey-300);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
