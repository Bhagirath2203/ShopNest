import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiTrash2, FiMinus, FiPlus,
  FiArrowRight, FiShoppingBag
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './CartPage.css';

const CartPage = () => {
  const { cart, cartCount, updateQuantity, removeItem, clearCart, loading } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity, 0
  );
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      setUpdatingId(itemId);
      await updateQuantity(itemId, newQty);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingId(itemId);
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
      setShowClearConfirm(false);
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className="page">
        <div className="container fade-in">
          <div className="cart-empty">
            <FiShoppingCart size={56} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn-primary">
              <FiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="cart-header">
          <h1 className="page-title">Shopping Cart</h1>
          <span className="cart-header__count">{cartCount} items</span>
        </div>

        <div className="cart-layout">
          {/* ── Items List ── */}
          <div className="cart-items">
            {items.map((item) => (
              <div
                key={item.id}
                className={`cart-item${updatingId === item.id ? ' cart-item--updating' : ''}`}
              >
                <Link to={`/products/${item.productId}`} className="cart-item__image-link">
                  <img
                    className="cart-item__image"
                    src={item.productImageUrl || `https://picsum.photos/seed/${item.productId}/200/200`}
                    alt={item.productName}
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${item.productId || 'def'}/200/200`;
                    }}
                  />
                </Link>

                <div className="cart-item__details">
                  <Link to={`/products/${item.productId}`} className="cart-item__name">
                    {item.productName}
                  </Link>
                  <span className="cart-item__price">{formatPrice(item.price)}</span>
                </div>

                <div className="cart-item__controls">
                  <div className="quantity-selector">
                    <button
                      className="quantity-selector__btn"
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingId === item.id}
                      aria-label="Decrease quantity"
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity-selector__value">{item.quantity}</span>
                    <button
                      className="quantity-selector__btn"
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                      disabled={updatingId === item.id}
                      aria-label="Increase quantity"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <span className="cart-item__subtotal">
                    {formatPrice((item.price || 0) * item.quantity)}
                  </span>

                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(item.id)}
                    disabled={updatingId === item.id}
                    aria-label="Remove item"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-items__footer">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowClearConfirm(true)}>
                <FiTrash2 /> Clear Cart
              </button>
              <Link to="/products" className="btn btn-ghost btn-sm">
                <FiShoppingBag /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="cart-summary">
            <h3 className="cart-summary__title">Order Summary</h3>
            <div className="cart-summary__row">
              <span>Subtotal ({cartCount} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-summary__row">
              <span>GST (18%)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--delivery">
              <span>Delivery</span>
              <span className="cart-summary__free">
                {subtotal >= 500 ? 'FREE' : formatPrice(40)}
              </span>
            </div>
            <hr className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>{formatPrice(total + (subtotal < 500 ? 40 : 0))}</span>
            </div>

            <button
              className="btn btn-primary btn-lg cart-summary__checkout"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <FiArrowRight />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Cart"
        message="Remove all items from your cart? This cannot be undone."
        confirmText="Clear All"
        variant="danger"
        onConfirm={handleClearCart}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default CartPage;
