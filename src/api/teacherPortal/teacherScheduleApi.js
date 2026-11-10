
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

export const getWeeklySchedule = async (teacherId) => {
  const res = await api.get(`/teacher/schedule/weekly/${teacherId}`);
  return res.data;
};