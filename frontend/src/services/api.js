import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  verify: () => api.get('/api/auth/verify'),
};

export const itemAPI = {
  getAll: (params) => api.get('/api/items/items', { params }),
  getOne: (id) => api.get(`/api/items/items/${id}`),
  create: (data) => api.post('/api/items/items', data),
  update: (id, data) => api.put(`/api/items/items/${id}`, data),
  delete: (id) => api.delete(`/api/items/items/${id}`),
  getMyItems: () => api.get('/api/items/my-items'),
  getStats: () => api.get('/api/items/stats'),
};

export const claimAPI = {
  submit: (data) => api.post('/api/claims/claims', {
    item_id: data.item_id || data.itemId,
    description: data.description || data.message,
  }),
  getByItem: (itemId) => api.get(`/api/claims/claims/item/${itemId}`),
  getMyClaims: () => api.get('/api/claims/claims/my'),
  updateStatus: (id, status) => api.patch(`/api/claims/claims/${id}/status`, { status }),
  getStats: () => api.get('/api/claims/stats'),
};

export const notifAPI = {
  getByUser: (userId) => api.get(`/api/notifications/notifications/${userId}`),
  getAll: () => api.get('/api/notifications/notifications'),
  markRead: (id) => api.patch(`/api/notifications/notifications/${id}/read`),
};

export const searchAPI = {
  search: (params) => api.get('/api/search/search', { params }),
  suggest: (q) => api.get('/api/search/suggest', { params: { q } }),
  trending: () => api.get('/api/search/trending'),
};

export default api;