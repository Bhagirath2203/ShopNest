import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">🛍️</span>
              <span className="footer__logo-text">ShopNest</span>
            </Link>
            <p className="footer__tagline">
              Premium shopping experience with curated products for every need.
            </p>
            <div className="footer__socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="GitHub">
                <FiGithub size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Twitter">
                <FiTwitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                <FiInstagram size={18} />
              </a>
              <a href="mailto:support@shopnest.com" className="footer__social-link" aria-label="Email">
                <FiMail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__heading">Shop</h4>
            <nav className="footer__links">
              <Link to="/products" className="footer__link">All Products</Link>
              <Link to="/products?category=Electronics" className="footer__link">Electronics</Link>
              <Link to="/products?category=Clothing" className="footer__link">Clothing</Link>
              <Link to="/products?category=Books" className="footer__link">Books</Link>
            </nav>
          </div>

          {/* Account */}
          <div className="footer__section">
            <h4 className="footer__heading">Account</h4>
            <nav className="footer__links">
              <Link to="/orders" className="footer__link">My Orders</Link>
              <Link to="/wishlist" className="footer__link">Wishlist</Link>
              <Link to="/cart" className="footer__link">Cart</Link>
            </nav>
          </div>

          {/* Support */}
          <div className="footer__section">
            <h4 className="footer__heading">Support</h4>
            <nav className="footer__links">
              <span className="footer__link footer__link--static">Contact Us</span>
              <span className="footer__link footer__link--static">FAQ</span>
              <span className="footer__link footer__link--static">Shipping Info</span>
              <span className="footer__link footer__link--static">Returns</span>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} ShopNest. Built with ❤️ by Bhagirath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
