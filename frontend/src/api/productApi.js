import api from './axiosInstance';

export const productApi = {
  getProducts: (params = {}) =>
    api.get('/products', { params }),

  getProduct: (id) =>
    api.get(`/products/${id}`),

  searchProducts: (query, params = {}) =>
    api.get('/products/search', { params: { query, ...params } }),

  createProduct: (data) =>
    api.post('/products', data),

  updateProduct: (id, data) =>
    api.put(`/products/${id}`, data),

  deleteProduct: (id) =>
    api.delete(`/products/${id}`),
};
