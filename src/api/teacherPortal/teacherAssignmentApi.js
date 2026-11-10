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

// ═══════════════════════════════════════════════════════
// 📚 Teacher Assignment APIs
// ═══════════════════════════════════════════════════════

// 1️⃣ Teacher এর assigned class + subject list
export const getMyClassesSubjects = async (teacherId) => {
  const res = await api.get('/teacher/assignments/my-classes-subjects', {
    params: { teacherId }
  });
  return res.data.data; // ✅ .data.data রিটার্ন করুন
};

// 2️⃣ নতুন assignment তৈরি করা
export const createAssignment = async (teacherId, payload) => {
  const res = await api.post('/teacher/assignments', payload, {
    params: { teacherId }
  });
  return res.data.data; // ✅ .data.data রিটার্ন করুন
};

// 3️⃣ Assignment list
export const listAssignments = async (teacherId, classId, subjectId) => {
  const params = { teacherId };
  if (classId) params.classId = classId;
  if (subjectId) params.subjectId = subjectId;

  const res = await api.get('/teacher/assignments', { params });
  return res.data.data; // ✅ .data.data রিটার্ন করুন
};

// 4️⃣ একটা assignment এর detail
export const getAssignment = async (teacherId, id) => {
  const res = await api.get(`/teacher/assignments/${id}`, {
    params: { teacherId }
  });
  return res.data.data; // ✅ .data.data রিটার্ন করুন
};

// 5️⃣ Assignment update
export const updateAssignment = async (teacherId, id, payload) => {
  const res = await api.put(`/teacher/assignments/${id}`, payload, {
    params: { teacherId }
  });
  return res.data.data; // ✅ .data.data রিটার্ন করুন
};

// 6️⃣ Assignment delete
export const deleteAssignment = async (teacherId, id) => {
  const res = await api.delete(`/teacher/assignments/${id}`, {
    params: { teacherId }
  });
  return res.data.data; // এখানে success message আসে, তাই res.data ঠিক আছে
};

// 7️⃣ Assignment publish
export const publishAssignment = async (teacherId, id) => {
  const res = await api.post(`/teacher/assignments/${id}/publish`, {}, {
    params: { teacherId }
  });
  return res.data.data; // ✅ .data.data রিটার্ন করুন
};

// 8️⃣ Assignment stats
export const getAssignmentStats = async (teacherId) => {
  const res = await api.get('/teacher/assignments/stats', {
    params: { teacherId }
  });
  return res.data.data; // ✅ .data.data রিটার্ন করুন
};