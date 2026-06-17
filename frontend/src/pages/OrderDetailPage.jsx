import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiPackage, FiChevronRight, FiMapPin, FiXCircle,
  FiCheck, FiTruck, FiClock, FiCheckCircle
} from 'react-icons/fi';
import { orderApi } from '../api/orderApi';
import { formatPrice, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './OrderDetailPage.css';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    color: '#d97706', bg: '#fffbeb', icon: FiClock },
  CONFIRMED:  { label: 'Confirmed',  color: '#2563eb', bg: '#eff6ff', icon: FiCheck },
  PROCESSING: { label: 'Processing', color: '#7c3aed', bg: '#f5f3ff', icon: FiPackage },
  SHIPPED:    { label: 'Shipped',    color: '#6366f1', bg: '#eef2ff', icon: FiTruck },
  DELIVERED:  { label: 'Delivered',  color: '#16a34a', bg: '#f0fdf4', icon: FiCheckCircle },
  CANCELLED:  { label: 'Cancelled',  color: '#dc2626', bg: '#fef2f2', icon: FiXCircle },
};

const TIMELINE_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrder(id);
        setOrder(res.data.data);
      } catch {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await orderApi.cancelOrder(id);
      setOrder({ ...order, status: 'CANCELLED' });
      toast.success('Order cancelled');
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container fade-in">
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;
  const items = order.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0
  );
  const gst = Math.round(subtotal * 0.18);

  // Timeline progress
  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="page">
      <div className="container fade-in">

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/orders">My Orders</Link>
          <FiChevronRight className="breadcrumb__separator" />
          <span className="breadcrumb__current">Order #{order.id}</span>
        </nav>

        {/* ── Header ── */}
        <div className="od-header">
          <div className="od-header__left">
            <h1 className="od-header__title">Order #{order.id}</h1>
            <span className="od-header__date">Placed on {formatDate(order.createdAt)}</span>
          </div>
          <span
            className="od-header__status"
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            <StatusIcon size={14} />
            {statusCfg.label}
          </span>
        </div>

        {/* ── Timeline ── */}
        {!isCancelled && (
          <div className="od-timeline">
            {TIMELINE_STEPS.map((step, idx) => {
              const isActive = idx <= currentStepIdx;
              const cfg = STATUS_CONFIG[step];
              const StepIcon = cfg.icon;
              return (
                <div
                  key={step}
                  className={`od-timeline__step${isActive ? ' od-timeline__step--active' : ''}`}
                >
                  <div className="od-timeline__dot">
                    <StepIcon size={16} />
                  </div>
                  <span className="od-timeline__label">{cfg.label}</span>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className={`od-timeline__line${idx < currentStepIdx ? ' od-timeline__line--active' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isCancelled && (
          <div className="od-cancelled-banner">
            <FiXCircle size={20} />
            <span>This order was cancelled</span>
          </div>
        )}

        <div className="od-layout">
          {/* ── Items ── */}
          <div className="od-items">
            <h3 className="od-section-title">Order Items ({items.length})</h3>
            {items.map((item) => (
              <div key={item.id} className="od-item">
                <img
                  className="od-item__image"
                  src={item.productImageUrl || `https://picsum.photos/seed/${item.productId || item.id}/80/80`}
                  alt={item.productName || 'Product'}
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/def${item.id}/80/80`;
                  }}
                />
                <div className="od-item__info">
                  <span className="od-item__name">
                    {item.productName || `Product #${item.productId}`}
                  </span>
                  <span className="od-item__qty">Qty: {item.quantity}</span>
                  <span className="od-item__unit">{formatPrice(item.price)} each</span>
                </div>
                <span className="od-item__subtotal">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* ── Sidebar: Summary + Address ── */}
          <div className="od-sidebar">
            {/* Summary */}
            <div className="od-summary">
              <h3 className="od-section-title">Payment Summary</h3>
              <div className="od-summary__row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="od-summary__row">
                <span>GST (18%)</span>
                <span>{formatPrice(gst)}</span>
              </div>
              <div className="od-summary__row">
                <span>Delivery</span>
                <span className={subtotal >= 500 ? 'od-summary__free' : ''}>
                  {subtotal >= 500 ? 'FREE' : formatPrice(40)}
                </span>
              </div>
              <hr className="od-summary__divider" />
              <div className="od-summary__row od-summary__row--total">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className="od-address">
                <h3 className="od-section-title">
                  <FiMapPin /> Delivery Address
                </h3>
                <p className="od-address__text">
                  {order.address.street}<br />
                  {order.address.city}, {order.address.state} {order.address.zipCode}<br />
                  {order.address.phone && <span>📞 {order.address.phone}</span>}
                </p>
              </div>
            )}

            {/* Cancel button */}
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button
                className="btn btn-ghost od-cancel-btn"
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
              >
                <FiXCircle /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        <ConfirmDialog
          open={showCancelConfirm}
          title="Cancel Order"
          message="Are you sure you want to cancel this order? This action cannot be undone."
          confirmText="Cancel Order"
          variant="danger"
          loading={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setShowCancelConfirm(false)}
        />
      </div>
    </div>
  );
};

export default OrderDetailPage;
