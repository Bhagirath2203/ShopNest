import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { wishlistApi } from '../api/wishlistApi';
import { productApi } from '../api/productApi';
import { formatPrice } from '../utils/formatters';
import { toast } from 'react-toastify';
import ProductCard from '../components/product/ProductCard';
import './WishlistPage.css';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      const wishlistItems = res.data.data || [];

      // Wishlist items contain product data already
      setItems(wishlistItems);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.toggleWishlist(productId);
      setItems(items.filter((item) => item.product?.id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container fade-in">
          <h1 className="page-title">My Wishlist</h1>
          <div className="wishlist-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container fade-in">
          <div className="wishlist-empty">
            <FiHeart size={56} />
            <h2>Your wishlist is empty</h2>
            <p>Save items you love for later.</p>
            <Link to="/products" className="btn btn-primary">
              <FiShoppingBag /> Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container fade-in">
        <h1 className="page-title">My Wishlist</h1>
        <p className="wishlist-subtitle">
          {items.length} item{items.length !== 1 ? 's' : ''} saved
        </p>

        <div className="wishlist-grid">
          {items.map((item) => (
            <div key={item.id} className="wishlist-card-wrapper">
              <ProductCard product={item.product} />
              <button
                className="wishlist-remove-btn"
                onClick={() => handleRemove(item.product?.id)}
                aria-label="Remove from wishlist"
              >
                <FiHeart style={{ fill: '#dc2626', color: '#dc2626' }} size={16} />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
