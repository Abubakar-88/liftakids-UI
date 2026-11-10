
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

// Fee Structure
export const createFeeStructure = async (dto, institutionId) => {
  const res = await api.post('/institution/fees/structure', dto, { params: { institutionId } });
  return res.data;
};

export const getFeeStructuresByClass = async (classId, institutionId) => {
  const res = await api.get(`/institution/fees/structure/class/${classId}`, { params: { institutionId } });
  return res.data;
};

export const getAllFeeStructures = async (institutionId) => {
  const res = await api.get('/institution/fees/structure/all', { params: { institutionId } });
  return res.data;
};

export const updateFeeStructure = async (id, dto, institutionId) => {
  const res = await api.put(`/institution/fees/structure/${id}`, dto, { params: { institutionId } });
  return res.data;
};

export const deleteFeeStructure = async (id, institutionId) => {
  const res = await api.delete(`/institution/fees/structure/${id}`, { params: { institutionId } });
  return res.data;
};

// Student Fee Status
export const assignFeesToStudent = async (studentId, feeTypes, institutionId) => {
  const res = await api.post(`/institution/fees/assign/${studentId}`, feeTypes, { params: { institutionId } });
  return res.data;
};

export const getStudentFeeStatus = async (studentId, institutionId) => {
  const res = await api.get(`/institution/fees/status/student/${studentId}`, { params: { institutionId } });
  return res.data;
};

export const getStudentsFeeStatusByClass = async (classId, institutionId) => {
  const res = await api.get(`/institution/fees/status/class/${classId}`, { params: { institutionId } });
  return res.data;
};

// Payment
export const collectPayment = async (dto, institutionId, collectedBy = 'Admin') => {
  const res = await api.post('/institution/fees/collect', dto, { params: { institutionId, collectedBy } });
  return res.data;
};

export const collectBulkPayment = async (dto, institutionId, collectedBy = 'Admin') => {
  const res = await api.post('/institution/fees/collect/bulk', dto, { params: { institutionId, collectedBy } });
  return res.data;
};
export const collectMultiMonthPayment = async (dto, institutionId, collectedBy = 'Admin') => {
  const res = await api.post('/institution/fees/collect/multi-month', dto, {
    params: { institutionId, collectedBy }
  });
  return res.data;
};
// History
export const searchPayments = async (institutionId, { classId, feeType, fromDate, toDate, page = 0, size = 10 }) => {
  const res = await api.get('/institution/fees/payments', {
    params: { institutionId, classId, feeType, fromDate, toDate, page, size }
  });
  return res.data;
};

export const getStudentPaymentHistory = async (studentId) => {
  const res = await api.get(`/institution/fees/payments/student/${studentId}`);
  return res.data;
};

// Due
export const getStudentsWithDue = async (classId, institutionId, feeType) => {
  const res = await api.get(`/institution/fees/due/class/${classId}`, {
    params: { institutionId, feeType }
  });
  return res.data;
};

// Receipt
export const getReceipt = async (receiptNumber) => {
  const res = await api.get(`/institution/fees/receipt/${receiptNumber}`);
  return res.data;
};

// Statistics
export const getFeeStatistics = async (institutionId, classId) => {
  const res = await api.get('/institution/fees/statistics', { params: { institutionId, classId } });
  return res.data;
};