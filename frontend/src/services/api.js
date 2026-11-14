import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const taxGroupApi = {
  getAll: async () => {
    const response = await api.get('/tax-groups');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/tax-groups/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/tax-groups', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/tax-groups/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/tax-groups/${id}`);
    return response.data;
  },
};

export const taxDetailApi = {
  getAll: async () => {
    const response = await api.get('/tax-details');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/tax-details/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/tax-details', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/tax-details/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/tax-details/${id}`);
    return response.data;
  },
};

export const workMasterApi = {
  getAll: async () => {
    const response = await api.get('/work-masters');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/work-masters/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/work-masters', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/work-masters/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/work-masters/${id}`);
    return response.data;
  },
};

export default api;
