import api from './axiosInstance';

export const adminApi = {
  getStats: () =>
    api.get('/admin/stats'),

  getAllOrders: (params = {}) =>
    api.get('/orders/admin/all', { params }),

  updateOrderStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),

  generateDescription: (productName) =>
    api.post('/ai/generate-description', { productName }),

  // Product management (admin)
  createProduct: (data) =>
    api.post('/products', data),

  updateProduct: (id, data) =>
    api.put(`/products/${id}`, data),

  deleteProduct: (id) =>
    api.delete(`/products/${id}`),

  // Category management (admin)
  createCategory: (data) =>
    api.post('/categories', data),

  deleteCategory: (id) =>
    api.delete(`/categories/${id}`),

  // Image upload
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
