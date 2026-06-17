import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiTruck, FiShield, FiAward, FiHeadphones,
  FiMonitor, FiShoppingBag, FiBook, FiHome,
  FiActivity, FiStar, FiBox, FiGift,
  FiArrowRight, FiZap,
} from 'react-icons/fi';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { useAuth } from '../context/AuthContext';
import ProductGrid from '../components/product/ProductGrid';
import './HomePage.css';

// Map category names → icons
const CATEGORY_ICONS = {
  'Electronics':      FiMonitor,
  'Clothing':         FiShoppingBag,
  'Books':            FiBook,
  'Home & Kitchen':   FiHome,
  'Sports':           FiActivity,
  'Beauty':           FiStar,
  'Toys':             FiGift,
  'Groceries':        FiBox,
};

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch independently so one failure doesn't block the other
        const [productsRes, categoriesRes] = await Promise.allSettled([
          productApi.getProducts({ page: 0, size: 8 }),
          categoryApi.getCategories(),
        ]);

        // Products
        if (productsRes.status === 'fulfilled') {
          const productsData = productsRes.value.data.data;
          setFeaturedProducts(productsData.content || productsData);
        } else {
          console.error('Failed to load products:', productsRes.reason);
        }

        // Categories
        if (categoriesRes.status === 'fulfilled') {
          setCategories(categoriesRes.value.data.data || []);
        } else {
          console.error('Failed to load categories:', categoriesRes.reason);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* ═══ Hero ═══ */}
      <section className="hero">
        <div className="container">
          <div className="hero__content fade-in">
            <span className="hero__badge">
              <FiZap /> New Arrivals Every Week
            </span>
            <h1 className="hero__title">
              Discover the Best<br />
              <span className="hero__title-gradient">Products Online</span>
            </h1>
            <p className="hero__subtitle">
              From electronics to fashion, find everything you need at ShopNest.
              Premium quality, unbeatable prices, and lightning-fast delivery.
            </p>
            <div className="hero__actions">
              <Link to="/products" className="btn btn-primary hero__cta">
                Browse Products <FiArrowRight />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-ghost hero__cta">
                  Create Account
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/orders" className="btn btn-ghost hero__cta">
                  My Orders <FiArrowRight />
                </Link>
              )}
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-number">30+</span>
                <span className="hero__stat-label">Products</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">8</span>
                <span className="hero__stat-label">Categories</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">24/7</span>
                <span className="hero__stat-label">Support</span>
              </div>
            </div>
          </div>

          {/* Floating background decoration */}
          <div className="hero__floating">
            <div className="hero__floating-circle" />
            <div className="hero__floating-circle" />
            <div className="hero__floating-circle" />
          </div>
        </div>
      </section>

      {/* ═══ Categories ═══ */}
      <section className="home-section">
        <div className="container">
          <div className="home-section__header">
            <h2 className="home-section__title">Shop by Category</h2>
            <p className="home-section__subtitle">
              Browse through our curated collection of categories
            </p>
            <div className="home-section__divider" />
          </div>

          <div className="category-grid fade-in">
            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.name] || FiBox;
              return (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                >
                  <div className="category-card__icon">
                    <IconComponent />
                  </div>
                  <span className="category-card__name">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Featured Products ═══ */}
      <section className="home-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="home-section__header">
            <h2 className="home-section__title">Featured Products</h2>
            <p className="home-section__subtitle">
              Handpicked selections just for you
            </p>
            <div className="home-section__divider" />
          </div>

          <div className="fade-in">
            <ProductGrid products={featuredProducts} loading={loading} skeletonCount={8} />
          </div>

          <div className="home-section__footer">
            <Link to="/products" className="btn btn-primary btn-lg">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Why ShopNest ═══ */}
      <section className="home-section">
        <div className="container">
          <div className="home-section__header">
            <h2 className="home-section__title">Why ShopNest?</h2>
            <p className="home-section__subtitle">
              We're committed to making your shopping experience exceptional
            </p>
            <div className="home-section__divider" />
          </div>

          <div className="features-grid fade-in">
            <div className="feature-card">
              <div className="feature-card__icon feature-card__icon--shipping">
                <FiTruck />
              </div>
              <h3 className="feature-card__title">Free Shipping</h3>
              <p className="feature-card__desc">
                Free delivery on all orders over ₹999. No hidden charges.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon feature-card__icon--secure">
                <FiShield />
              </div>
              <h3 className="feature-card__title">Secure Payments</h3>
              <p className="feature-card__desc">
                Your transactions are 100% secure with encrypted payment processing.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon feature-card__icon--quality">
                <FiAward />
              </div>
              <h3 className="feature-card__title">Quality Products</h3>
              <p className="feature-card__desc">
                Every product is verified for quality before it reaches you.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon feature-card__icon--support">
                <FiHeadphones />
              </div>
              <h3 className="feature-card__title">24/7 Support</h3>
              <p className="feature-card__desc">
                Our support team is always available to help you out.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
