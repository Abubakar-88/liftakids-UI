
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/LiftAKids/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== Search Students ==========
export const searchStudentsForAdmission = async (institutionId, keyword = '', unassignedOnly = false, page = 0, size = 10) => {
  const response = await api.get('/institution/students/admission/search', {
    params: { institutionId, keyword, unassignedOnly, page, size }
  });
  return response.data;
};

// ========== Get Students by Class ==========
export const getStudentsByClass = async (classId, institutionId) => {
  const response = await api.get(`/institution/students/admission/class/${classId}`, {
    params: { institutionId }
  });
  return response.data;
};

// ========== Single Admit ==========
export const admitSingleStudent = async (studentId, classId, institutionId) => {
  const response = await api.post('/institution/students/admission/single', { studentId, classId }, {
    params: { institutionId }
  });
  return response.data;
};

// ========== Bulk Admit ==========
export const admitBulkStudents = async (studentIds, classId, institutionId) => {
  const response = await api.post('/institution/students/admission/bulk', { studentIds, classId }, {
    params: { institutionId }
  });
  return response.data;
};

// ========== Remove from Class ==========
export const removeStudentFromClass = async (studentId, institutionId) => {
  const response = await api.delete(`/institution/students/admission/${studentId}`, {
    params: { institutionId }
  });
  return response.data;
};