import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacherToken') 
             || localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ═══════════ Teacher Actions ═══════════
// src/api/InstitutionManage/teacherClassSessionApi.js
export const startClass = async (scheduleId, teacherId, payload = null) => {
  const res = await api.post(`/teacher/class-session/${scheduleId}/start`, payload, {
    params: { teacherId }
  });
  return res.data;
};
export const resetClassSession = async (scheduleId, teacherId) => {
  const res = await api.post(`/teacher/class-session/${scheduleId}/reset`, null, {
    params: { teacherId }
  });
  return res.data;
};
export const completeClass = async (scheduleId, teacherId, payload = null) => {
  // 👈 payload টি ৩ নম্বর আর্গুমেন্ট হিসেবে যুক্ত করুন
  const res = await api.post(`/teacher/class-session/${scheduleId}/complete`, payload, {
    params: { teacherId }
  });
  return res.data;
};

// ═══════════ Admin Monitoring ═══════════
export const getTodayClassMonitor = async (institutionId, status) => {
  const res = await api.get('/institution/class-monitor/today', {
    params: { institutionId, status }
  });
  return res.data;
};

export const getClassMonitorByDay = async (day, institutionId, status) => {
  const res = await api.get(`/institution/class-monitor/day/${day}`, {
    params: { institutionId, status }
  });
  return res.data;
};