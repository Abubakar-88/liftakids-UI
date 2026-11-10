
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacherToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ Authentication ============

export const teacherLogin = async (mobile, password) => {
  const res = await api.post('/teacher/auth/login', { mobile, password });
  return res.data;
};

export const teacherChangePassword = async (teacherId, payload) => {
  const res = await api.post(`/teacher/auth/change-password/${teacherId}`, payload);
  return res.data;
};

export const getTeacherProfile = async (teacherId) => {
  const res = await api.get(`/teacher/auth/profile/${teacherId}`);
  return res.data;
};

export const teacherLogout = async (teacherId) => {
  try {
    await api.post(`/teacher/auth/logout/${teacherId}`);
  } catch (err) {
    console.warn('Logout API failed:', err.message);
  }
};

// ============ Dashboard ============

export const getTeacherDashboardStats = async (teacherId) => {
  const res = await api.get(`/teacher/dashboard/stats/${teacherId}`);
  return res.data;
};