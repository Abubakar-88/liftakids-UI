// api/academicCalendarApi.js
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

// Create event
export const createEvent = async (eventData, institutionId, createdBy) => {
  const response = await api.post('/institution/academic-calendar/create', eventData, {
    params: { institutionId, createdBy }
  });
  return response.data;
};

// Get all events by institution
export const getEventsByInstitution = async (institutionId, page = 0, size = 10, sortBy = 'startDate', sortDir = 'desc') => {
  const response = await api.get(`/institution/academic-calendar/institution/${institutionId}`, {
    params: { page, size, sortBy, sortDir }
  });
  return response.data;
};

// Get event by ID
export const getEventById = async (id) => {
  const response = await api.get(`/institution/academic-calendar/${id}`);
  return response.data;
};

// Get events by date range
export const getEventsByDateRange = async (institutionId, startDate, endDate) => {
  const response = await api.get(`/institution/academic-calendar/institution/${institutionId}/date-range`, {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get upcoming events
export const getUpcomingEvents = async (institutionId) => {
  const response = await api.get(`/institution/academic-calendar/institution/${institutionId}/upcoming`);
  return response.data;
};

// Get ongoing events
export const getOngoingEvents = async (institutionId) => {
  const response = await api.get(`/institution/academic-calendar/institution/${institutionId}/ongoing`);
  return response.data;
};

// Update event
export const updateEvent = async (id, eventData, institutionId) => {
  const response = await api.put(`/institution/academic-calendar/${id}`, eventData, {
    params: { institutionId }
  });
  return response.data;
};

// Delete event
export const deleteEvent = async (id, institutionId) => {
  const response = await api.delete(`/institution/academic-calendar/${id}`, {
    params: { institutionId }
  });
  return response.data;
};

// Get event statistics
export const getEventStatistics = async (institutionId) => {
  const response = await api.get(`/institution/academic-calendar/institution/${institutionId}/stats`);
  return response.data;
};

// Get monthly statistics
export const getEventsByMonth = async (institutionId, year = 2024) => {
  const response = await api.get(`/institution/academic-calendar/institution/${institutionId}/monthly-stats`, {
    params: { year }
  });
  return response.data;
};

// Create multiple events
export const createMultipleEvents = async (eventsData, institutionId, createdBy) => {
  const response = await api.post('/institution/academic-calendar/create-multiple', eventsData, {
    params: { institutionId, createdBy }
  });
  return response.data;
};