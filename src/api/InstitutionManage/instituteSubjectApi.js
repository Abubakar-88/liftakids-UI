
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

export const getSubjectById = async (subjectId) => {
  const response = await api.get(`/institution/subjects/${subjectId}`);
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

export const createMultipleSubjects = async (subjectDataList, institutionId) => {
  const response = await api.post('/institution/subjects/bulk', subjectDataList, {
    params: { institutionId }
  });
  return response.data;
};

export const setupDefaultSubjects = async (institutionId) => {
  const response = await api.post('/institution/subjects/setup-default', null, {
    params: { institutionId }
  });
  return response.data;
};