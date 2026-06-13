import { useState, useEffect, useCallback } from 'react';
import {
  FiChevronLeft, FiChevronRight, FiPackage, FiFilter
} from 'react-icons/fi';
import { adminApi } from '../../api/adminApi';
import { formatPrice, formatDateShort } from '../../utils/formatters';
import { toast } from 'react-toastify';
import './AdminOrders.css';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLE = {
  PENDING:    { color: '#d97706', bg: '#fffbeb' },
  CONFIRMED:  { color: '#2563eb', bg: '#eff6ff' },
  SHIPPED:    { color: '#6366f1', bg: '#eef2ff' },
  DELIVERED:  { color: '#16a34a', bg: '#f0fdf4' },
  CANCELLED:  { color: '#dc2626', bg: '#fef2f2' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: 10 };
      if (filterStatus) params.status = filterStatus;
      const res = await adminApi.getAllOrders(params);
      const data = res.data.data;
      setOrders(data?.content || data?.orders || []);
      setTotalPages(data?.totalPages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await adminApi.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(orders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast.success(`Order #${orderId} → ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(0);
  };

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="ao-header">
          <h1 className="page-title">Manage Orders</h1>
          <div className="ao-filter">
            <FiFilter size={16} />
            <select
              className="form-input ao-filter__select"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="ao-table-wrapper">
          <table className="ao-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: '16px', borderRadius: '4px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ao-table__empty">
                    <FiPackage size={32} />
                    <span>No orders found</span>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const style = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING;
                  const itemCount = order.items?.length || 0;
                  return (
                    <tr key={order.id} className={updatingId === order.id ? 'ao-row--updating' : ''}>
                      <td className="ao-table__id">#{order.id}</td>
                      <td className="ao-table__customer">
                        {order.user?.name || order.userName || 'Customer'}
                      </td>
                      <td>{itemCount} item{itemCount !== 1 ? 's' : ''}</td>
                      <td className="ao-table__total">{formatPrice(order.totalAmount)}</td>
                      <td className="ao-table__date">{formatDateShort(order.createdAt)}</td>
                      <td>
                        <span
                          className="ao-status-badge"
                          style={{ color: style.color, background: style.bg }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-input ao-status-select"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={
                            updatingId === order.id ||
                            order.status === 'DELIVERED' ||
                            order.status === 'CANCELLED'
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="ao-pagination">
            <button
              className="ao-pagination__btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <FiChevronLeft /> Previous
            </button>
            <span className="ao-pagination__info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="ao-pagination__btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
