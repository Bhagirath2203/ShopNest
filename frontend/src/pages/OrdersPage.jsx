import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight, FiShoppingBag } from 'react-icons/fi';
import { orderApi } from '../api/orderApi';
import { formatPrice, formatDateShort } from '../utils/formatters';
import { toast } from 'react-toastify';
import './OrdersPage.css';

const STATUS_MAP = {
  PENDING:   { label: 'Pending',   color: '#d97706', bg: '#fffbeb' },
  CONFIRMED: { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff' },
  PROCESSING:{ label: 'Processing',color: '#7c3aed', bg: '#f5f3ff' },
  SHIPPED:   { label: 'Shipped',   color: '#6366f1', bg: '#eef2ff' },
  DELIVERED: { label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrders();
        setOrders(res.data.data || []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container fade-in">
          <h1 className="page-title">My Orders</h1>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px', marginBottom: '1rem' }} />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="container fade-in">
          <div className="orders-empty">
            <FiPackage size={56} />
            <h2>No orders yet</h2>
            <p>You haven't placed any orders. Start shopping!</p>
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
        <h1 className="page-title">My Orders</h1>
        <p className="orders-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

        <div className="orders-list">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
            const itemCount = order.items?.length || 0;
            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="order-card"
              >
                <div className="order-card__top">
                  <div className="order-card__id">
                    <FiPackage />
                    <span>Order #{order.id}</span>
                  </div>
                  <span
                    className="order-card__status"
                    style={{ color: status.color, background: status.bg }}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="order-card__details">
                  <span className="order-card__date">
                    {formatDateShort(order.createdAt)}
                  </span>
                  <span className="order-card__items">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className="order-card__total">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>

                <FiChevronRight className="order-card__arrow" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
