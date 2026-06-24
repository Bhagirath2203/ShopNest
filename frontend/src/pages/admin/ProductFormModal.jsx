import { useState, useEffect, useRef } from 'react';
import { FiX, FiZap, FiLoader, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import { adminApi } from '../../api/adminApi';
import { categoryApi } from '../../api/categoryApi';
import { toast } from 'react-toastify';
import './ProductFormModal.css';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

/**
 * ProductFormModal — create/edit product with AI description generation
 * and drag-and-drop image upload.
 */
const ProductFormModal = ({ isOpen, onClose, product, onSaved }) => {
  const overlayRef = useRef();
  const fileInputRef = useRef();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const isEdit = !!product;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories();
        setCategories(res.data.data || []);
      } catch {
        // Categories might fail if none exist yet
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  // Pre-fill form for edit mode
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        categoryId: product.categoryId?.toString() || '',
        imageUrl: product.imageUrl || '',
      });
      // Show existing image as preview
      if (product.imageUrl) {
        const src = product.imageUrl.startsWith('/uploads')
          ? `${API_BASE}${product.imageUrl}`
          : product.imageUrl;
        setImagePreview(src);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    } else {
      setForm({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Image handling ──

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, WebP, or GIF.');
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm({ ...form, imageUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── AI description ──

  const handleGenerateAI = async () => {
    if (!form.name.trim()) {
      toast.warning('Enter a product name first');
      return;
    }
    try {
      setGenerating(true);
      const res = await adminApi.generateDescription(form.name.trim());
      const desc = res.data.data?.description || res.data.data || res.data.message || '';
      setForm({ ...form, description: typeof desc === 'string' ? desc : '' });
      toast.success('AI description generated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // ── Submit ──

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      let imageUrl = form.imageUrl;

      // Upload new image if one was selected
      if (imageFile) {
        setUploading(true);
        try {
          const uploadRes = await adminApi.uploadProductImage(imageFile);
          imageUrl = uploadRes.data.data?.imageUrl || imageUrl;
        } catch (err) {
          toast.error(err.response?.data?.message || 'Image upload failed');
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: parseInt(form.categoryId, 10),
        imageUrl: imageUrl || null,
      };

      let res;
      if (isEdit) {
        res = await adminApi.updateProduct(product.id, payload);
        toast.success('Product updated');
      } else {
        res = await adminApi.createProduct(payload);
        toast.success('Product created');
      }

      onSaved && onSaved(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-header__title">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button className="modal-header__close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Product Image</label>
            {imagePreview ? (
              <div className="image-upload__preview">
                <img src={imagePreview} alt="Preview" className="image-upload__img" />
                <button
                  type="button"
                  className="image-upload__remove"
                  onClick={removeImage}
                  title="Remove image"
                >
                  <FiTrash2 size={16} />
                </button>
                <span className="image-upload__change" onClick={() => fileInputRef.current?.click()}>
                  Change image
                </span>
              </div>
            ) : (
              <div
                className={`image-upload__dropzone ${dragActive ? 'image-upload__dropzone--active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FiUploadCloud size={32} className="image-upload__icon" />
                <span className="image-upload__text">
                  Drag & drop an image here, or <strong>click to browse</strong>
                </span>
                <span className="image-upload__hint">JPEG, PNG, WebP, GIF — max 5MB</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Bluetooth Headphones"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Description *</label>
              <button
                type="button"
                className="btn-ai"
                onClick={handleGenerateAI}
                disabled={generating || !form.name.trim()}
              >
                {generating ? (
                  <>
                    <FiLoader className="spin" size={14} /> Generating...
                  </>
                ) : (
                  <>
                    <FiZap size={14} /> Generate with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              className="form-input modal-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description — or click 'Generate with AI'"
              rows={5}
              required
            />
          </div>

          <div className="modal-form-row">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                className="form-input"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="999"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                className="form-input"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-input"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {uploading ? 'Uploading image...' : saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
