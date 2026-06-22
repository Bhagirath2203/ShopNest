import { useState, useEffect, useCallback } from 'react';
import { handleImageError, getPlaceholderImage } from '../../utils/imageFallback';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiChevronLeft, FiChevronRight, FiBox
} from 'react-icons/fi';
import { productApi } from '../../api/productApi';
import { adminApi } from '../../api/adminApi';
import { formatPrice } from '../../utils/formatters';
import { toast } from 'react-toastify';
import ProductFormModal from './ProductFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, size: 10 };
      if (search.trim()) params.search = search.trim();
      const res = await productApi.getProducts(params);
      const data = res.data.data;
      setProducts(data?.products || data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleCreate = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product) => {
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminApi.deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = () => {
    fetchProducts();
  };

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="ap-header">
          <h1 className="page-title">Manage Products</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus /> Add Product
          </button>
        </div>

        {/* ── Search ── */}
        <div className="ap-search">
          <FiSearch className="ap-search__icon" />
          <input
            className="form-input ap-search__input"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* ── Table ── */}
        <div className="ap-table-wrapper">
          <table className="ap-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: '16px', borderRadius: '4px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="ap-table__empty">
                    <FiBox size={32} />
                    <span>No products found</span>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="ap-table__id">#{p.id}</td>
                    <td>
                      <img
                        className="ap-table__image"
                        src={p.imageUrl || getPlaceholderImage(p.name, p.categoryName, 50)}
                        alt={p.name}
                        onError={(e) => handleImageError(e, p.name, p.categoryName, 50)}
                      />
                    </td>
                    <td className="ap-table__name">{p.name}</td>
                    <td className="ap-table__category">{p.categoryName || '—'}</td>
                    <td className="ap-table__price">{formatPrice(p.price)}</td>
                    <td>
                      <span className={`ap-stock-badge${p.stock <= 5 ? ' ap-stock-badge--low' : ''}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`ap-active-dot${p.active !== false ? ' ap-active-dot--yes' : ''}`} />
                    </td>
                    <td>
                      <div className="ap-actions">
                        <button
                          className="ap-action-btn ap-action-btn--edit"
                          onClick={() => handleEdit(p)}
                          aria-label="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="ap-action-btn ap-action-btn--delete"
                          onClick={() => handleDelete(p)}
                          aria-label="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="ap-pagination">
            <button
              className="ap-pagination__btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <FiChevronLeft /> Previous
            </button>
            <span className="ap-pagination__info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="ap-pagination__btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}

        {/* ── Modal ── */}
        <ProductFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          product={editProduct}
          onSaved={handleSaved}
        />

        {/* ── Delete Confirmation ── */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
};

export default AdminProducts;
