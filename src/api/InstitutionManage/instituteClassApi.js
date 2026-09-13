
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/LiftAKids/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============= Class Management =============

export const getAllClasses = async (institutionId) => {
  const response = await api.get('/institution/classes', {
    params: { institutionId }
  });
  return response.data;
};

export const getActiveClasses = async (institutionId) => {
  const response = await api.get('/institution/classes/active', {
    params: { institutionId }
  });
  return response.data;
};

export const getClassById = async (classId) => {
  const response = await api.get(`/institution/classes/${classId}`);
  return response.data;
};

export const createClass = async (classData, institutionId) => {
  const response = await api.post('/institution/classes', classData, {
    params: { institutionId }
  });
  return response.data;
};

export const updateClass = async (classId, classData, institutionId) => {
  const response = await api.put(`/institution/classes/${classId}`, classData, {
    params: { institutionId }
  });
  return response.data;
};

export const deleteClass = async (classId, institutionId) => {
  const response = await api.delete(`/institution/classes/${classId}`, {
    params: { institutionId }
  });
  return response.data;
};

export const getStudentCountByClass = async (classId) => {
  const response = await api.get(`/institution/classes/${classId}/student-count`);
  return response.data;
};

export const createMultipleClasses = async (classDataList, institutionId) => {
  const response = await api.post('/institution/classes/bulk', classDataList, {
    params: { institutionId }
  });
  return response.data;
};

export const setupDefaultClasses = async (institutionId) => {
  const response = await api.post('/institution/classes/setup-default', null, {
    params: { institutionId }
  });
  return response.data;
};

// ============= Subject Management =============

export const getAllSubjects = async (institutionId) => {
  const response = await api.get('/institution/subjects', {
    params: { institutionId }
  });
  return response.data;
};

export const getActiveSubjects = async (institutionId) => {
  const response = await api.get('/institution/subjects/active', {
    params: { institutionId }
  });
  return response.data;
};

export const createSubject = async (subjectData, institutionId) => {
  const response = await api.post('/institution/subjects', subjectData, {
    params: { institutionId }
  });
  return response.data;
};

export const updateSubject = async (subjectId, subjectData, institutionId) => {
  const response = await api.put(`/institution/subjects/${subjectId}`, subjectData, {
    params: { institutionId }
  });
  return response.data;
};

export const deleteSubject = async (subjectId, institutionId) => {
  const response = await api.delete(`/institution/subjects/${subjectId}`, {
    params: { institutionId }
  });
  return response.data;
};