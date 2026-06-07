import api from './axiosInstance';

export const categoryApi = {
  getCategories: () =>
    api.get('/categories'),
};
