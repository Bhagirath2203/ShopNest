import api from './axiosInstance';

export const cartApi = {
  getCart: () =>
    api.get('/cart'),

  addToCart: (productId, quantity) =>
    api.post('/cart/add', { productId, quantity }),

  updateItem: (itemId, quantity) =>
    api.put(`/cart/item/${itemId}`, null, { params: { quantity } }),

  removeItem: (itemId) =>
    api.delete(`/cart/item/${itemId}`),

  clearCart: () =>
    api.delete('/cart'),
};
