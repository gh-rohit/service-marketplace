// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'https://service-marketplace-backend-kc0j.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Providers endpoints
export const providersAPI = {
  getApproved: (params) => api.get('/providers/approved', { params }),
  getById: (id) => api.get(`/providers/${id}`),
  getProviderStats: () => api.get('/providers/dashboard/stats'),
  updateProviderProfile: (data) => api.put('/users/provider/profile', data),
  getPendingProviders: () => api.get('/admin/providers/pending'),
  approveProvider: (id, data) => api.put(`/admin/providers/${id}/approve`, data),
};

// Services endpoints
export const servicesAPI = {
  createRequest: (data) => api.post('/services/request', data),
  getCustomerRequests: () => api.get('/services/customer/requests'),
  getProviderRequests: (status) => 
    api.get('/services/provider/requests', { params: { status } }),
  updateRequestStatus: (id, data) => 
    api.put(`/services/requests/${id}/status`, data),
  markAsComplete: (id) => api.put(`/services/requests/${id}/complete`),
  rateService: (id, data) => api.post(`/services/requests/${id}/rate`, data),
  getRequestById: (id) => api.get(`/services/requests/${id}`),
};

// Admin endpoints - UPDATED TO MATCH YOUR BACKEND
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Users management
  getAllUsers: async () => {
    // Get all users by combining customer and provider info
    try {
      // First get all users
      const usersResponse = await api.get('/admin/users');
      return usersResponse;
    } catch (error) {
      // If /admin/users doesn't exist, create endpoint in backend or use alternative
      console.log('Admin users endpoint not available');
      throw error;
    }
  },
  
  // User status management
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // Service requests
  getAllRequests: (params) => api.get('/admin/requests', { params }),
};

// Users endpoints - NEW: We need to create this endpoint in backend
export const usersAPI = {
  // This will need a new endpoint in your backend
  getAllUsers: async () => {
    try {
      // First try to get users from existing endpoints
      const response = await api.get('/admin/users/all');
      return response;
    } catch (error) {
      // Fallback: Get users from auth or other endpoints
      console.log('Users endpoint not available');
      throw error;
    }
  },
};

// Notifications endpoints
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export default api;
