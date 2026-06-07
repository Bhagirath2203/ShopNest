import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiHeart, FiPackage, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    closeMobile();
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={closeMobile}>
            <span className="navbar__logo-icon">🛍️</span>
            <span className="navbar__logo-text">ShopNest</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar__links">
            <NavLink to="/products" className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
              Products
            </NavLink>
          </div>

          {/* Desktop Actions */}
          <div className="navbar__actions">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="navbar__icon-btn" title="Cart">
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="navbar__badge">{cartCount > 99 ? '99+' : cartCount}</span>
                  )}
                </Link>

                {/* Wishlist */}
                <Link to="/wishlist" className="navbar__icon-btn" title="Wishlist">
                  <FiHeart size={20} />
                </Link>

                {/* User Dropdown */}
                <div className="navbar__dropdown" ref={dropdownRef}>
                  <button
                    className="navbar__avatar-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-expanded={dropdownOpen}
                    aria-label="User menu"
                  >
                    <div className="navbar__avatar">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="navbar__username">{user?.name?.split(' ')[0]}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="navbar__dropdown-menu">
                      <div className="navbar__dropdown-header">
                        <p className="navbar__dropdown-name">{user?.name}</p>
                        <p className="navbar__dropdown-email">{user?.email}</p>
                      </div>
                      <div className="navbar__dropdown-divider" />
                      <Link to="/orders" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FiPackage size={16} />
                        <span>My Orders</span>
                      </Link>
                      <Link to="/wishlist" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FiHeart size={16} />
                        <span>Wishlist</span>
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="navbar__dropdown-divider" />
                          <Link to="/admin" className="navbar__dropdown-item navbar__dropdown-item--admin" onClick={() => setDropdownOpen(false)}>
                            <FiShield size={16} />
                            <span>Admin Panel</span>
                          </Link>
                        </>
                      )}
                      <div className="navbar__dropdown-divider" />
                      <button className="navbar__dropdown-item navbar__dropdown-item--logout" onClick={handleLogout}>
                        <FiLogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="navbar__hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && <div className="navbar__mobile-overlay" onClick={closeMobile} />}
      <div className={`navbar__mobile-drawer ${mobileOpen ? 'navbar__mobile-drawer--open' : ''}`}>
        <div className="navbar__mobile-header">
          <span className="navbar__logo-text">ShopNest</span>
          <button className="navbar__hamburger" onClick={closeMobile} aria-label="Close menu">
            <FiX size={24} />
          </button>
        </div>

        {isAuthenticated && (
          <div className="navbar__mobile-user">
            <div className="navbar__avatar navbar__avatar--lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="navbar__mobile-name">{user?.name}</p>
              <p className="navbar__mobile-email">{user?.email}</p>
            </div>
          </div>
        )}

        <div className="navbar__mobile-links">
          <NavLink to="/products" className="navbar__mobile-link" onClick={closeMobile}>Products</NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/cart" className="navbar__mobile-link" onClick={closeMobile}>
                Cart {cartCount > 0 && <span className="navbar__badge navbar__badge--inline">{cartCount}</span>}
              </NavLink>
              <NavLink to="/orders" className="navbar__mobile-link" onClick={closeMobile}>My Orders</NavLink>
              <NavLink to="/wishlist" className="navbar__mobile-link" onClick={closeMobile}>Wishlist</NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="navbar__mobile-link navbar__mobile-link--admin" onClick={closeMobile}>
                  Admin Panel
                </NavLink>
              )}
              <button className="navbar__mobile-link navbar__mobile-link--logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="navbar__mobile-auth">
              <Link to="/login" className="btn btn-ghost" onClick={closeMobile}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobile}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
