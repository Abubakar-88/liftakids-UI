
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// টোকেন ইন্টারসেপ্টর
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('teacherToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ১. ক্লাসের সব স্টুডেন্টের রেজাল্ট দেখা
export const getClassResults = async (institutionId, className, subject, examName, academicYear) => {
  const res = await api.get('/institution/results/view', {
    params: { institutionId, className, subject, examName, academicYear }
  });
  return res.data;
};

// ২. নির্দিষ্ট স্টুডেন্টের ফুল রিপোর্ট কার্ড দেখা
export const getStudentReportCard = async (studentId, examName, academicYear) => {
  const res = await api.get(`/institution/results/student/${studentId}/report-card`, {
    params: { examName, academicYear }
  });
  return res.data;
};