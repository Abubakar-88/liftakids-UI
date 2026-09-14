// api/teacherApi.js
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

// ============= CRUD Operations =============

// Get all teachers with pagination
export const getAllTeachers = async (institutionId, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
  const response = await api.get('/institution/teachers', {
    params: { institutionId, page, size, sortBy, sortDir }
  });
  return response.data;
};

// Get all teachers list (no pagination)
export const getAllTeachersList = async (institutionId) => {
  const response = await api.get('/institution/teachers/list', {
    params: { institutionId }
  });
  return response.data;
};

// Get teacher by ID
export const getTeacherById = async (id) => {
  const response = await api.get(`/institution/teachers/${id}`);
  return response.data;
};

// Create teacher
export const createTeacher = async (teacherData, institutionId) => {
  const response = await api.post('/institution/teachers', teacherData, {
    params: { institutionId }
  });
  return response.data;
};

// Update teacher
export const updateTeacher = async (id, teacherData, institutionId) => {
  const response = await api.put(`/institution/teachers/${id}`, teacherData, {
    params: { institutionId }
  });
  return response.data;
};

// Delete teacher
export const deleteTeacher = async (id, institutionId) => {
  const response = await api.delete(`/institution/teachers/${id}`, {
    params: { institutionId }
  });
  return response.data;
};

// ============= Search =============

export const searchTeachers = async (institutionId, keyword, page = 0, size = 10) => {
  const response = await api.get('/institution/teachers/search', {
    params: { institutionId, keyword, page, size }
  });
  return response.data;
};

// ============= Class Assignment =============
export const assignClass = async (teacherId, assignmentData) => {
  const response = await api.post(`/institution/teachers/${teacherId}/assign-class`, assignmentData);
  return response.data;
};

export const removeClassAssignment = async (assignmentId) => {
  const response = await api.delete(`/institution/teachers/assignments/${assignmentId}`);
  return response.data;
};

export const updateClassAssignments = async (teacherId, assignments, institutionId) => {
  const response = await api.put(`/institution/teachers/${teacherId}/assignments`, assignments, {
    params: { institutionId }
  });
  return response.data;
};

export const getTeacherClassAssignments = async (teacherId) => {
  const response = await api.get(`/institution/teachers/${teacherId}/assignments`);
  return response.data;
};

export const getTeachersByClass = async (className, institutionId) => {
  const response = await api.get(`/institution/teachers/by-class/${className}`, {
    params: { institutionId }
  });
  return response.data;
};
// ============= Schedule =============
export const updateSchedule = async (teacherId, scheduleData, institutionId) => {
  const response = await api.put(`/institution/teachers/${teacherId}/schedule`, scheduleData, {
    params: { institutionId }
  });
  return response.data;
};

export const getTeacherSchedule = async (teacherId) => {
  const response = await api.get(`/institution/teachers/${teacherId}/schedule`);
  return response.data;
};

export const getTeacherScheduleByDay = async (teacherId, day) => {
  const response = await api.get(`/institution/teachers/${teacherId}/schedule/${day}`);
  return response.data;
};

export const updateDaySchedule = async (teacherId, day, daySchedules, institutionId) => {
  const response = await api.put(`/institution/teachers/${teacherId}/schedule/${day}`, daySchedules, {
    params: { institutionId }
  });
  return response.data;
};

// ============= Statistics =============

export const getTeacherStatistics = async (institutionId) => {
  const response = await api.get('/institution/teachers/statistics', {
    params: { institutionId }
  });
  return response.data;
};

export const getTeacherStats = async (teacherId) => {
  const response = await api.get(`/institution/teachers/${teacherId}/stats`);
  return response.data;
};


// ============= Valid Values (Institution-specific) =============
export const getValidClasses = async (institutionId) => {
  const response = await api.get('/institution/teachers/valid-classes', {
    params: { institutionId }
  });
  return response.data;
};

export const getValidSubjects = async (institutionId) => {
  const response = await api.get('/institution/teachers/valid-subjects', {
    params: { institutionId }
  });
  return response.data;
};

export const getValidDays = async () => {
  const response = await api.get('/institution/teachers/valid-days');
  return response.data;
};

// ============= Student Management =============

export const getStudentsByTeacher = async (teacherId) => {
  const response = await api.get(`/institution/teachers/${teacherId}/students`);
  return response.data;
};

// ============= Academic =============

export const enterGrades = async (teacherId, gradeData) => {
  const response = await api.post(`/institution/teachers/${teacherId}/enter-grade`, gradeData);
  return response.data;
};

export const getTeacherPerformance = async (teacherId) => {
  const response = await api.get(`/institution/teachers/${teacherId}/performance`);
  return response.data;
};

export const getTeacherAttendance = async (teacherId) => {
  const response = await api.get(`/institution/teachers/${teacherId}/attendance`);
  return response.data;
};

// ============= Communication =============

export const sendMessageToStudents = async (teacherId, messageData) => {
  const response = await api.post(`/institution/teachers/${teacherId}/message-students`, messageData);
  return response.data;
};

export const sendMessageToParents = async (teacherId, messageData) => {
  const response = await api.post(`/institution/teachers/${teacherId}/message-parents`, messageData);
  return response.data;
};

export const getTeacherNotices = async (teacherId) => {
  const response = await api.get(`/institution/teachers/${teacherId}/notices`);
  return response.data;
};