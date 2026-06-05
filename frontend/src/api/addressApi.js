import api from './axiosInstance';

export const addressApi = {
  getAddresses: () =>
    api.get('/users/addresses'),

  createAddress: (data) =>
    api.post('/users/addresses', data),

  deleteAddress: (id) =>
    api.delete(`/users/addresses/${id}`),
};
