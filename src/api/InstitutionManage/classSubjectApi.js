
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Assign subjects to class
export const assignSubjectsToClass = async (classId, subjectIds) => {
  const response = await api.post(`/institution/class-subjects/class/${classId}/assign`, subjectIds);
  return response.data;
};

// Remove subject from class
export const removeSubjectFromClass = async (classId, subjectId) => {
  const response = await api.delete(`/institution/class-subjects/class/${classId}/subject/${subjectId}`);
  return response.data;
};

// Remove all subjects from class
export const removeAllSubjectsFromClass = async (classId) => {
  const response = await api.delete(`/institution/class-subjects/class/${classId}/subjects`);
  return response.data;
};

// Get subjects by class
export const getSubjectsByClass = async (classId) => {
  const response = await api.get(`/institution/class-subjects/class/${classId}/subjects`);
  return response.data;
};

// Get assignments by class
export const getAssignmentsByClass = async (classId) => {
  const response = await api.get(`/institution/class-subjects/class/${classId}/assignments`);
  return response.data;
};

// Check if subject assigned
export const isSubjectAssigned = async (classId, subjectId) => {
  const response = await api.get(`/institution/class-subjects/class/${classId}/subject/${subjectId}/check`);
  return response.data;
};