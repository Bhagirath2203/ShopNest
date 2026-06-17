import api from './axiosInstance';

export const orderApi = {
  placeOrder: (addressId) =>
    api.post('/orders/place', { addressId }),

  getOrders: () =>
    api.get('/orders'),

  getOrder: (id) =>
    api.get(`/orders/${id}`),

  // Admin endpoints
  getAllOrders: (params = {}) =>
    api.get('/orders/admin/all', { params }),

  updateOrderStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),

  cancelOrder: (id) =>
    api.post(`/orders/${id}/cancel`),
};
