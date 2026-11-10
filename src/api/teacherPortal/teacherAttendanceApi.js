
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacherToken') || localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// হাজিরার শীট লোড করা
export const getAttendanceSheet = async (className, date, teacherId) => {
  const res = await api.get('/teacher/attendance/sheet', {
    params: { className, date, teacherId }
  });
  return res.data;
};

// হাজিরা সেভ করা
export const saveAttendance = async (payload, teacherId) => {
  const res = await api.post('/teacher/attendance/save', payload, {
    params: { teacherId }
  });
  return res.data;
};