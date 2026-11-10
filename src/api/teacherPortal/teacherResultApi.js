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


// রেজাল্ট সেভ করা (Draft বা Publish)
export const saveResults = async (payload, teacherId) => {
  const res = await api.post('/teacher/results/save', payload, {
    params: { teacherId }
  });
  return res.data;
};
export const getResultSheet = async (className, subject, examName, academicYear, teacherId) => {
  const res = await api.get('/teacher/results/sheet', {
    params: { className, subject, examName, academicYear, teacherId }
  });
  return res.data;
};