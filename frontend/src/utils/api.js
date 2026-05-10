import axios from 'axios';

// In dev with vite proxy, use "/api" so requests stay on :5173 and proxy forwards to Railway or local API
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const projectAPI = {
  create: (data) => api.post('/projects', data),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, memberId) => api.post(`/projects/${id}/members`, { memberId }),
};

export const taskAPI = {
  create: (projectId, data) => api.post(`/tasks/${projectId}`, data),
  getAll: (projectId) => api.get(`/tasks/${projectId}`),
  update: (projectId, taskId, data) => api.put(`/tasks/${projectId}/${taskId}`, data),
  /** Status-only change (kanban Move); avoids full task body validation on PUT */
  updateStatus: (projectId, taskId, newStatus) =>
    api.patch(`/tasks/${projectId}/${taskId}/status`, { newStatus }),
  delete: (projectId, taskId) => api.delete(`/tasks/${projectId}/${taskId}`),
  getStats: () => api.get('/tasks/stats/dashboard'),
};

export default api;
