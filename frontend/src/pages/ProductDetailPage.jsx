import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart, FiChevronRight,
  FiMinus, FiPlus, FiTruck, FiChevronLeft, FiStar
} from 'react-icons/fi';
import { productApi } from '../api/productApi';
import { handleImageError, getPlaceholderImage } from '../utils/imageFallback';
import { wishlistApi } from '../api/wishlistApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatters';
import { toast } from 'react-toastify';
import ProductCard from '../components/product/ProductCard';
import StarRating from '../components/product/StarRating';
import ReviewSection from '../components/product/ReviewSection';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import './ProductDetailPage.css';

/* ── Utility: mock specs per category ── */
const CATEGORY_SPECS = {
  Electronics: [
    ['Brand', 'ShopNest Certified'],
    ['Connectivity', 'Bluetooth / Wi-Fi / USB-C'],
    ['Battery', 'Up to 20 hrs'],
    ['Warranty', '1 Year Manufacturer'],
    ['Weight', 'Approx. 250g'],
  ],
  Clothing: [
    ['Material', '100% Premium Cotton'],
    ['Fit', 'Regular Fit'],
    ['Care', 'Machine Wash Cold'],
    ['Country of Origin', 'India'],
    ['Available Sizes', 'XS, S, M, L, XL, XXL'],
  ],
  Books: [
    ['Language', 'English'],
    ['Format', 'Paperback'],
    ['Publisher', 'Penguin Books'],
    ['Pages', '320'],
    ['ISBN', 'Available on request'],
  ],
  'Home & Kitchen': [
    ['Material', 'Food-grade Stainless Steel'],
    ['Capacity', '5 Litres'],
    ['Dimensions', '25 × 25 × 30 cm'],
    ['Weight', '1.2 kg'],
    ['Warranty', '1 Year'],
  ],
  Sports: [
    ['Material', 'High-strength Nylon'],
    ['Weight', '350g'],
    ['Size', 'Standard'],
    ['Gender', 'Unisex'],
    ['Warranty', '6 Months'],
  ],
  Beauty: [
    ['Skin Type', 'All Skin Types'],
    ['Volume', '200ml'],
    ['Cruelty Free', 'Yes'],
    ['Shelf Life', '24 Months'],
    ['Dermatologist Tested', 'Yes'],
  ],
  Default: [
    ['Brand', 'ShopNest Certified'],
    ['Condition', 'Brand New'],
    ['Warranty', '1 Year'],
    ['Country of Origin', 'India'],
    ['Returns', '30-Day Easy Returns'],
  ],
};

/* ── Delivery date (5 days from now) ── */
const getDeliveryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

/* ── Deterministic mock bought count from product id ── */
const getMockBought = (id) => {
  const seed = Number(id) || 1;
  return ((seed * 71 + 17) % 4000) + 200; // 200 – 4199
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [recentIds, addRecentId] = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Gallery state
  const [images, setImages] = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  // Tabs
  const [activeTab, setActiveTab] = useState('description');

  /* ─ Fetch product ─ */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProduct(id);
        const p = res.data.data;
        setProduct(p);

        // Build gallery with reliable placeholder images
        const placeholder = getPlaceholderImage(p.name, p.categoryName, 600);

        const gallery = [
          p.imageUrl || placeholder,
          placeholder,
          getPlaceholderImage(p.name, p.categoryName, 600),
          getPlaceholderImage(p.name, p.categoryName, 600),
        ];
        setImages(gallery);
        setActiveImg(0);

        // Track recently viewed
        addRecentId(Number(id));

        // Fetch similar products (same category)
        if (p.categoryId) {
          try {
            const simRes = await productApi.getProducts({ categoryId: p.categoryId, size: 5 });
            const all = simRes.data.data?.content || [];
            setSimilarProducts(all.filter((item) => item.id !== p.id).slice(0, 4));
          } catch { /* non-critical */ }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setQuantity(1);
    setActiveTab('description');

    // Check if product is wishlisted
    if (isAuthenticated) {
      wishlistApi.getWishlist()
        .then((res) => {
          const items = res.data.data || [];
          setWishlisted(items.some((item) => String(item.product?.id) === String(id)));
        })
        .catch(() => {});
    }
  }, [id, navigate, addRecentId, isAuthenticated]);

  /* ─ Fetch recently viewed products (excluding current) ─ */
  useEffect(() => {
    const toFetch = recentIds.filter((rid) => rid !== Number(id)).slice(0, 5);
    if (toFetch.length < 2) { setRecentProducts([]); return; }

    let alive = true;
    Promise.all(toFetch.map((rid) => productApi.getProduct(rid).catch(() => null)))
      .then((results) => {
        if (!alive) return;
        setRecentProducts(results.filter(Boolean).map((r) => r.data.data));
      });
    return () => { alive = false; };
  }, [recentIds, id]);

  /* ─ Page title ─ */
  useEffect(() => {
    if (product) document.title = `${product.name} | ShopNest`;
    return () => { document.title = 'ShopNest — Premium Shopping'; };
  }, [product]);

  /* ─ Auto-scroll to #reviews when navigating from order page ─ */
  useEffect(() => {
    if (!loading && location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
      }
    }
  }, [loading, location.hash]);

  /* ─ Keyboard gallery nav ─ */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  setActiveImg((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setActiveImg((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length]);

  const getStockStatus = useCallback(() => {
    if (!product) return {};
    if (product.stock === 0)  return { label: 'Out of Stock',            className: 'product-detail__stock--out' };
    if (product.stock < 5)    return { label: `Only ${product.stock} left`, className: 'product-detail__stock--low' };
    return { label: 'In Stock', className: 'product-detail__stock--in' };
  }, [product]);

  const maxQty = product ? Math.min(product.stock, 10) : 1;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to your cart');
      navigate('/login');
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getSpecs = () => {
    const catName = product?.categoryName || product?.category?.name || 'Default';
    return CATEGORY_SPECS[catName] || CATEGORY_SPECS.Default;
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="product-detail__skeleton">
            <div className="product-detail__skeleton-image skeleton" />
            <div className="product-detail__skeleton-info">
              <div className="product-detail__skeleton-category skeleton" />
              <div className="product-detail__skeleton-title skeleton" />
              <div className="product-detail__skeleton-price skeleton" />
              <div className="product-detail__skeleton-stock skeleton" />
              <div className="product-detail__skeleton-desc skeleton" />
              <div className="product-detail__skeleton-actions">
                <div className="product-detail__skeleton-btn skeleton" />
                <div className="product-detail__skeleton-btn-small skeleton" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const stockStatus = getStockStatus();
  const avgRating = product.averageRating || 0;
  const reviewCount = product.totalReviews || 0;
  const boughtCount = getMockBought(id);
  const isFreeDelivery = product.price >= 500;
  const specs = getSpecs();

  return (
    <div className="product-detail">
      <div className="container fade-in">

        {/* ── Breadcrumb ── */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight className="breadcrumb__separator" />
          <Link to="/products">Products</Link>
          <FiChevronRight className="breadcrumb__separator" />
          {product.categoryName && (
            <>
              <Link to={`/products?categoryId=${product.categoryId}`}>{product.categoryName}</Link>
              <FiChevronRight className="breadcrumb__separator" />
            </>
          )}
          <span className="breadcrumb__current">{product.name}</span>
        </nav>

        {/* ── Main Grid ── */}
        <div className="product-detail__grid">

          {/* ══ IMAGE GALLERY ══ */}
          <div className="product-gallery">
            {/* Main image */}
            <div className="product-gallery__main">
              <img
                className="product-gallery__image"
                src={images[activeImg]}
                alt={`${product.name} — view ${activeImg + 1}`}
                onError={(e) => handleImageError(e, product.name, product.categoryName, 600)}
              />

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    className="product-gallery__arrow product-gallery__arrow--prev"
                    onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                    disabled={activeImg === 0}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    className="product-gallery__arrow product-gallery__arrow--next"
                    onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                    disabled={activeImg === images.length - 1}
                    aria-label="Next image"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}

              {/* Counter */}
              <span className="product-gallery__counter">
                {activeImg + 1} / {images.length}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="product-gallery__thumbs">
              {images.map((src, i) => (
                <div
                  key={i}
                  className={`product-gallery__thumb${i === activeImg ? ' product-gallery__thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    onError={(e) => handleImageError(e, product.name, product.categoryName, 150)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ══ PRODUCT INFO ══ */}
          <div className="product-detail__info">

            {/* Category badge */}
            {product.categoryName && (
              <span className="product-detail__category">{product.categoryName}</span>
            )}

            {/* Name */}
            <h1 className="product-detail__name">{product.name}</h1>

            {/* Rating */}
            <div className="product-detail__rating">
              <StarRating rating={avgRating} size={16} />
              <span className="product-detail__rating-count">
                {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}{reviewCount > 0 ? ` (${reviewCount.toLocaleString()} ${reviewCount === 1 ? 'review' : 'reviews'})` : ''}
              </span>
              <span className="product-detail__bought">
                {boughtCount.toLocaleString()}+ bought
              </span>
            </div>

            {/* Price */}
            <span className="product-detail__price">
              {formatPrice(product.price)}
            </span>

            {/* Stock */}
            <span className={`product-detail__stock ${stockStatus.className}`}>
              <span className="product-detail__stock-dot" />
              {stockStatus.label}
            </span>

            <hr className="product-detail__divider" />

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="product-detail__quantity-row">
                <span className="product-detail__quantity-label">Quantity</span>
                <div className="quantity-selector">
                  <button
                    className="quantity-selector__btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus />
                  </button>
                  <span className="quantity-selector__value">{quantity}</span>
                  <button
                    className="quantity-selector__btn"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    aria-label="Increase quantity"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="product-detail__actions">
              <button
                className="btn btn-primary product-detail__add-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
              >
                <FiShoppingCart />
                {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                className={`product-detail__wishlist-btn${wishlisted ? ' product-detail__wishlist-btn--active' : ''}`}
                onClick={async () => {
                  if (!isAuthenticated) {
                    toast.info('Please log in to add to wishlist');
                    return;
                  }
                  try {
                    const res = await wishlistApi.toggleWishlist(product.id);
                    const added = res.data.data;
                    setWishlisted(added);
                    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
                  } catch {
                    toast.error('Failed to update wishlist');
                  }
                }}
                title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Toggle wishlist"
              >
                <FiHeart style={{ fill: wishlisted ? '#ef4444' : 'none' }} />
              </button>
            </div>

            {/* ── Delivery Section ── */}
            <div className="product-detail__delivery">
              <div className="delivery__title">
                <FiTruck /> Delivery
              </div>

              {isAuthenticated ? (
                <div className="delivery__estimate">
                  {isFreeDelivery ? (
                    <>
                      <strong>Free delivery</strong> by {getDeliveryDate()}
                    </>
                  ) : (
                    <>
                      ₹40 delivery charge · Arrives by {getDeliveryDate()}
                    </>
                  )}
                </div>
              ) : (
                <div className="delivery__estimate">
                  <Link to="/login">Login</Link> to see delivery options for your area
                </div>
              )}

              <div className="delivery__options">
                <span className="delivery__badge delivery__badge--free">
                  <FiTruck size={12} /> Free Standard
                </span>
                <span className="delivery__badge">⚡ Express — ₹99</span>
                <span className="delivery__badge">🚀 Same Day — ₹149</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ DESCRIPTION / SPECS TABS ══ */}
        <div className="product-detail__tabs-section">
          <div className="product-tabs__nav">
            <button
              className={`product-tabs__btn${activeTab === 'description' ? ' product-tabs__btn--active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`product-tabs__btn${activeTab === 'specs' ? ' product-tabs__btn--active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
          </div>

          <div className="product-tabs__content">
            {activeTab === 'description' ? (
              <div className="product-tabs__desc">
                <p>{product.description || 'No description available for this product.'}</p>
              </div>
            ) : (
              <table className="product-specs__table">
                <tbody>
                  {specs.map(([key, val]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ══ REVIEWS & RATINGS ══ */}
        <div id="reviews">
          <ReviewSection productId={id} />
        </div>

        {/* ══ SIMILAR PRODUCTS ══ */}
        {similarProducts.length > 0 && (
          <div className="product-section">
            <div className="product-section__header">
              <h2 className="product-section__title">Similar Products</h2>
              {product.categoryId && (
                <Link
                  to={`/products?categoryId=${product.categoryId}`}
                  className="product-section__link"
                >
                  View all in {product.categoryName} →
                </Link>
              )}
            </div>
            <div className="product-section__grid">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ══ RECENTLY VIEWED ══ */}
        {recentProducts.length >= 2 && (
          <div className="product-section">
            <div className="product-section__header">
              <h2 className="product-section__title">Recently Viewed</h2>
            </div>
            <div className="product-section__strip">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
