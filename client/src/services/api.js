import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roxiler_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user if unauthorized
      localStorage.removeItem('roxiler_token');
      localStorage.removeItem('roxiler_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (passwords) => api.put('/auth/change-password', passwords)
};

// Admin Services
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  getStores: (params) => api.get('/admin/stores', { params }),
  createStore: (storeData) => api.post('/admin/stores', storeData),
  getStoreDetails: (id) => api.get(`/admin/stores/${id}`),
  getStoreOwners: () => api.get('/admin/store-owners')
};

// Store Services (Public/User)
export const storesApi = {
  getStores: (params) => api.get('/stores', { params }),
  getStoreById: (id) => api.get(`/stores/${id}`)
};

// Rating Services (User)
export const ratingsApi = {
  submitRating: (data) => api.post('/ratings', data),
  modifyRating: (storeId, data) => api.put(`/ratings/${storeId}`, data),
  getMyRatings: () => api.get('/ratings/my-ratings')
};

// Store Owner Services
export const storeOwnerApi = {
  getDashboardStats: () => api.get('/store-owner/dashboard'),
  getStoreRatings: (params) => api.get('/store-owner/ratings', { params })
};

export default api;

