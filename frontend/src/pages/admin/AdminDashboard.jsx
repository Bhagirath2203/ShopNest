import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiShoppingCart, FiUsers, FiDollarSign,
  FiClock, FiCheck, FiTruck, FiCheckCircle, FiXCircle,
  FiArrowRight, FiBox
} from 'react-icons/fi';
import { adminApi } from '../../api/adminApi';
import { formatPrice } from '../../utils/formatters';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getStats();
        setStats(res.data.data);
      } catch {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container fade-in">
          <h1 className="page-title">Admin Dashboard</h1>
          <div className="admin-stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: '130px', borderRadius: '16px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mainCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: FiBox,
      color: '#4f46e5',
      bg: '#eef2ff',
      link: '/admin/products',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: FiShoppingCart,
      color: '#0891b2',
      bg: '#ecfeff',
      link: '/admin/orders',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: FiUsers,
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: FiDollarSign,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
  ];

  const statusCards = [
    {
      label: 'Pending',
      value: stats?.pendingOrders ?? 0,
      icon: FiClock,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      label: 'Confirmed',
      value: stats?.confirmedOrders ?? 0,
      icon: FiCheck,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      label: 'Shipped',
      value: stats?.shippedOrders ?? 0,
      icon: FiTruck,
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      label: 'Delivered',
      value: stats?.deliveredOrders ?? 0,
      icon: FiCheckCircle,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'Cancelled',
      value: stats?.cancelledOrders ?? 0,
      icon: FiXCircle,
      color: '#dc2626',
      bg: '#fef2f2',
    },
  ];

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="admin-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="admin-header__subtitle">Overview of your store</p>
        </div>

        {/* ── Main Stat Cards ── */}
        <div className="admin-stats-grid">
          {mainCards.map((card) => {
            const Icon = card.icon;
            const content = (
              <div className="stat-card" key={card.label}>
                <div className="stat-card__icon" style={{ color: card.color, background: card.bg }}>
                  <Icon size={22} />
                </div>
                <div className="stat-card__info">
                  <span className="stat-card__label">{card.label}</span>
                  <span className="stat-card__value">{card.value}</span>
                </div>
                {card.link && <FiArrowRight className="stat-card__arrow" />}
              </div>
            );
            return card.link ? (
              <Link to={card.link} key={card.label} className="stat-card-link">
                {content}
              </Link>
            ) : (
              <div key={card.label}>{content}</div>
            );
          })}
        </div>

        {/* ── Order Status Cards ── */}
        <h2 className="admin-section-title">Orders by Status</h2>
        <div className="admin-status-grid">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div className="status-card" key={card.label}>
                <div className="status-card__icon" style={{ color: card.color, background: card.bg }}>
                  <Icon size={18} />
                </div>
                <span className="status-card__value">{card.value}</span>
                <span className="status-card__label">{card.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Quick Links ── */}
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="admin-actions">
          <Link to="/admin/products" className="admin-action-card">
            <FiBox size={20} />
            <span>Manage Products</span>
            <FiArrowRight />
          </Link>
          <Link to="/admin/orders" className="admin-action-card">
            <FiShoppingCart size={20} />
            <span>Manage Orders</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
