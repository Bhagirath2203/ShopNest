import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';

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
      await register(formData.name, formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        {/* Left — Branding */}
        <div className="auth-branding auth-branding--register">
          <div className="auth-branding__content">
            <span className="auth-branding__icon">🚀</span>
            <h1 className="auth-branding__title">Join ShopNest</h1>
            <p className="auth-branding__subtitle">
              Create your account and start exploring premium products.
            </p>
            <div className="auth-branding__features">
              <div className="auth-branding__feature">
                <span>🎁</span> Exclusive deals for members
              </div>
              <div className="auth-branding__feature">
                <span>📦</span> Track your orders
              </div>
              <div className="auth-branding__feature">
                <span>💜</span> Save items to wishlist
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="auth-form-wrapper">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__header">
              <h2 className="auth-form__title">Create Account</h2>
              <p className="auth-form__subtitle">Fill in your details to get started</p>
            </div>

            {/* Name */}
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Full Name</label>
              <div className={`form-input-wrapper ${errors.name ? 'form-input-wrapper--error' : ''}`}>
                <FiUser className="form-input-icon" size={18} />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  autoFocus
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email</label>
              <div className={`form-input-wrapper ${errors.email ? 'form-input-wrapper--error' : ''}`}>
                <FiMail className="form-input-icon" size={18} />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">Password</label>
              <div className={`form-input-wrapper ${errors.password ? 'form-input-wrapper--error' : ''}`}>
                <FiLock className="form-input-icon" size={18} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
              <div className={`form-input-wrapper ${errors.confirmPassword ? 'form-input-wrapper--error' : ''}`}>
                <FiLock className="form-input-icon" size={18} />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary btn-lg auth-form__submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  Creating account...
                </span>
              ) : (
                <>
                  <FiUserPlus size={18} />
                  Create Account
                </>
              )}
            </button>

            {/* Link */}
            <p className="auth-form__footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-form__link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
