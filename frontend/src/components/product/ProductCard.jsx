import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { wishlistApi } from '../../api/wishlistApi';
import { getPlaceholderImage } from '../../utils/imageFallback';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  const { id, name, price, stock, imageUrl, categoryName } = product;

  // Set image source with fallback
  useEffect(() => {
    setImgSrc(imageUrl || getPlaceholderImage(name, categoryName));
  }, [imageUrl, name, categoryName]);

  // Stock status
  const getStockStatus = () => {
    if (stock === 0) return { label: 'Out of Stock', className: 'product-card__stock--out' };
    if (stock < 5) return { label: 'Low Stock', className: 'product-card__stock--low' };
    return { label: 'In Stock', className: 'product-card__stock--in' };
  };

  const stockStatus = getStockStatus();

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent card navigation

    if (!isAuthenticated) {
      toast.info('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    if (stock === 0) return;

    try {
      setAddingToCart(true);
      await addToCart(id, 1);
      toast.success(`${name} added to cart!`);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* Image */}
      <div className="product-card__image-wrapper">
        <img
          className="product-card__image"
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={() => setImgSrc(getPlaceholderImage(name, categoryName))}
        />

        {/* Category badge */}
        {categoryName && (
          <span className="product-card__category">{categoryName}</span>
        )}

        {/* Wishlist button */}
        <button
          className={`product-card__wishlist${wishlisted ? ' product-card__wishlist--active' : ''}`}
          onClick={async (e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              toast.info('Please log in to use wishlist');
              return;
            }
            try {
              const res = await wishlistApi.toggleWishlist(id);
              const added = res.data.data;
              setWishlisted(added);
              toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
            } catch {
              toast.error('Failed to update wishlist');
            }
          }}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <FiHeart style={{ fill: wishlisted ? '#ef4444' : 'none' }} />
        </button>
      </div>

      {/* Body */}
      <div className="product-card__body">
        <h3 className="product-card__name">{name}</h3>

        <div className="product-card__price-row">
          <span className="product-card__price">{formatPrice(price)}</span>
          <span className={`product-card__stock ${stockStatus.className}`}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="product-card__actions">
        <button
          className={`product-card__add-btn ${addingToCart ? 'product-card__add-btn--loading' : ''}`}
          onClick={handleAddToCart}
          disabled={stock === 0 || addingToCart}
        >
          <FiShoppingCart />
          {addingToCart ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

// Skeleton loading card
export const ProductCardSkeleton = () => (
  <div className="product-card-skeleton">
    <div className="product-card-skeleton__image skeleton" />
    <div className="product-card-skeleton__body">
      <div className="product-card-skeleton__title skeleton" />
      <div className="product-card-skeleton__price skeleton" />
      <div className="product-card-skeleton__btn skeleton" />
    </div>
  </div>
);

export default ProductCard;
