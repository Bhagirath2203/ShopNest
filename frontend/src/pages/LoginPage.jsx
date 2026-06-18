import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        {/* Left — Branding */}
        <div className="auth-branding">
          <div className="auth-branding__content">
            <span className="auth-branding__icon">🛍️</span>
            <h1 className="auth-branding__title">Welcome Back</h1>
            <p className="auth-branding__subtitle">
              Sign in to access your cart, orders, and wishlist.
            </p>
            <div className="auth-branding__features">
              <div className="auth-branding__feature">
                <span>✨</span> Curated premium products
              </div>
              <div className="auth-branding__feature">
                <span>🚚</span> Fast & free delivery
              </div>
              <div className="auth-branding__feature">
                <span>🔒</span> Secure checkout
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="auth-form-wrapper">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__header">
              <h2 className="auth-form__title">Sign In</h2>
              <p className="auth-form__subtitle">Enter your credentials to continue</p>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <div className={`form-input-wrapper ${errors.email ? 'form-input-wrapper--error' : ''}`}>
                <FiMail className="form-input-icon" size={18} />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className={`form-input-wrapper ${errors.password ? 'form-input-wrapper--error' : ''}`}>
                <FiLock className="form-input-icon" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="form-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary btn-lg auth-form__submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  Signing in...
                </span>
              ) : (
                <>
                  <FiLogIn size={18} />
                  Sign In
                </>
              )}
            </button>

            {/* Demo Credentials */}
            <div className="auth-demo">
              <p className="auth-demo__title">Demo Credentials</p>
              <div className="auth-demo__cards">
                <button
                  type="button"
                  className="auth-demo__card"
                  onClick={() => setFormData({ email: 'user@shopnest.com', password: 'user123' })}
                >
                  <strong>User</strong>
                  <span>user@shopnest.com</span>
                </button>
                <button
                  type="button"
                  className="auth-demo__card"
                  onClick={() => setFormData({ email: 'admin@shopnest.com', password: 'admin123' })}
                >
                  <strong>Admin</strong>
                  <span>admin@shopnest.com</span>
                </button>
              </div>
            </div>

            {/* Link */}
            <p className="auth-form__footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-form__link">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
