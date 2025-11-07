import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ===== AUTH API =====
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
  logout: () => api.get('/auth/logout'),
};

// ===== PETS API =====
export const petsAPI = {
  // Get all pets with filters
  getAll: (params) => {
    // Filter out undefined/empty values
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    return api.get('/pets', { params: cleanParams });
  },

  // Search pets
  search: (query) => api.get('/pets/search', { params: { query } }),

  // Get single pet
  getById: (petId) => api.get(`/pets/${petId}`),

  // Get similar pets
  getSimilar: (petId) => api.get(`/pets/${petId}/similar`),

  // Get featured pets
  getFeatured: (limit = 6) => api.get('/pets/featured', { params: { limit } }),

  // Get pets by shelter
  getByShelter: (shelterId) => api.get(`/pets/by-shelter/${shelterId}`),

  // Create pet (no auth required for now)
  create: (formData) => {
    return api.post('/pets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update pet
  update: (petId, formData) => {
    return api.put(`/pets/${petId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete pet
  delete: (petId) => api.delete(`/pets/${petId}`),
};

// ===== APPLICATIONS API =====
export const applicationsAPI = {
  create: (applicationData) => api.post('/applications', applicationData),
  getById: (applicationId) => api.get(`/applications/${applicationId}`),
  getByUser: (userId) => api.get(`/applications/user/${userId}`),
  getByPet: (petId) => api.get(`/applications/pet/${petId}`),
  getByShelter: (shelterId) => api.get(`/applications/shelter/${shelterId}`),
  update: (applicationId, updates) => api.put(`/applications/${applicationId}`, updates),
  updateStatus: (applicationId, status, rejectionReason) =>
    api.put(`/applications/${applicationId}/status`, { status, rejectionReason }),
  delete: (applicationId) => api.delete(`/applications/${applicationId}`),
};

// ===== USERS API =====
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => {
    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getById: (userId) => api.get(`/users/${userId}`),
  addFavorite: (petId) => api.post(`/favorites/${petId}`),
  removeFavorite: (petId) => api.delete(`/favorites/${petId}`),
  getFavorites: () => api.get('/favorites'),
  getFavoritePets: () => api.get('/favorites/pets'),
};

// ===== SHELTERS API =====
export const sheltersAPI = {
  getAll: () => api.get('/shelters'),
  getById: (shelterId) => api.get(`/shelters/${shelterId}`),
  update: (shelterId, updates) => api.put(`/shelters/${shelterId}`, updates),
  getStats: (shelterId) => api.get(`/shelters/${shelterId}/stats`),
};

export default api;