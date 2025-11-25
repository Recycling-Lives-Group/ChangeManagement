import axios from 'axios';
import type { ApiResponse, ChangeRequest, User, ChangeRequestFormData } from '@cm/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    department: string;
    phone: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Changes API
export const changesApi = {
  getChanges: async (params?: any) => {
    const response = await api.get<ApiResponse<ChangeRequest[]>>('/changes', { params });
    return response.data;
  },

  getChange: async (id: string) => {
    const response = await api.get<ApiResponse<ChangeRequest>>(`/changes/${id}`);
    return response.data;
  },

  createChange: async (data: ChangeRequestFormData) => {
    const response = await api.post<ApiResponse<ChangeRequest>>('/changes', data);
    return response.data;
  },

  updateChange: async (id: string, data: Partial<ChangeRequestFormData>) => {
    const response = await api.put<ApiResponse<ChangeRequest>>(`/changes/${id}`, data);
    return response.data;
  },

  deleteChange: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/changes/${id}`);
    return response.data;
  },

  approveChange: async (id: string, comments?: string, level?: string) => {
    const response = await api.post<ApiResponse<ChangeRequest>>(`/changes/${id}/approve`, {
      comments,
      level,
    });
    return response.data;
  },

  rejectChange: async (id: string, comments: string, level?: string) => {
    const response = await api.post<ApiResponse<ChangeRequest>>(`/changes/${id}/reject`, {
      comments,
      level,
    });
    return response.data;
  },
};

export default api;
