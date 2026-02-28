import axios from 'axios';

const API_BASE_URL = 'https://menboots.store/LiftAKids/api'; // আপনার backend URL

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login/admin';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const adminLogin = async (loginData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/login`,
      loginData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Admin Authentication
// export const adminLogin = async (credentials) => {
//   try {
//     const response = await adminApi.post('/admin/login', credentials);
//     if (response.success && response.token) {
//       localStorage.setItem('adminToken', response.token);
//       localStorage.setItem('adminUser', JSON.stringify(response.admin));
//     }
//     return response;
//   } catch (error) {
//     throw error;
//   }
// };

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

// Admin CRUD Operations
export const getAllAdmins = async () => {
  try {
    const response = await adminApi.get('/admin');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAdminById = async (adminId) => {
  try {
    const response = await adminApi.get(`/admin/${adminId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createFirstAdmin = async (adminData) => {
  try {
    const response = await adminApi.post('/admin/first', adminData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create admin by existing admin (requires authentication)
export const createAdmin = async (adminData, adminId) => {
  try {
    const response = await adminApi.post('/admin', adminData, {
      headers: {
        'X-Admin-Id': adminId
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateAdmin = async (adminId, adminData, updatedByAdminId) => {
  try {
    const response = await adminApi.put(`/admin/${adminId}`, adminData, {
      headers: {
        'X-Admin-Id': updatedByAdminId
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteAdmin = async (adminId, deletedByAdminId) => {
  try {
    await adminApi.delete(`/admin/${adminId}`, {
      headers: {
        'X-Admin-Id': deletedByAdminId
      }
    });
    return { success: true, message: 'Admin deleted successfully' };
  } catch (error) {
    throw error;
  }
};

export const changeAdminStatus = async (adminId, action, currentAdminId) => {
  try {
    const endpoint = action === 'activate' 
      ? `/admin/${adminId}/activate` 
      : `/admin/${adminId}/deactivate`;
    
    await adminApi.post(endpoint, {}, {
      headers: {
        'X-Admin-Id': currentAdminId
      }
    });
    
    return { 
      success: true, 
      message: `Admin ${action}d successfully` 
    };
  } catch (error) {
    throw error;
  }
};

export const updateAdminProfile = async (adminId, profileData) => {
  try {
    const response = await adminApi.put(`/admin/profile/${adminId}`, profileData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Change Password
export const changePassword = async (adminId, passwordData) => {
  try {
    const response = await adminApi.post(`/admin/${adminId}/change-password`, passwordData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Admin Statistics
export const getAdminStats = async () => {
  try {
    const response = await adminApi.get('/admin/stats');
    return response;
  } catch (error) {
    throw error;
  }
};

// Institution Management APIs
export const getInstitutions = async (params = {}) => {
  try {
    const response = await adminApi.get('/admin/institutions', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const approveInstitution = async (institutionId, adminId) => {
  try {
    const response = await adminApi.post(
      `/admin/institutions/${institutionId}/approve`,
      {},
      { headers: { 'X-Admin-Id': adminId } }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const rejectInstitution = async (institutionId, adminId, reason) => {
  try {
    const response = await adminApi.post(
      `/admin/institutions/${institutionId}/reject`,
      { reason },
      { headers: { 'X-Admin-Id': adminId } }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Student Management APIs
export const getStudents = async (params = {}) => {
  try {
    const response = await adminApi.get('/admin/students', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Donor Management APIs
export const getDonors = async (params = {}) => {
  try {
    const response = await adminApi.get('/admin/donors', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Area Management APIs
export const getDivisions = async () => {
  try {
    const response = await adminApi.get('/admin/divisions');
    return response;
  } catch (error) {
    throw error;
  }
};

export const createDivision = async (divisionData, adminId) => {
  try {
    const response = await adminApi.post('/admin/divisions', divisionData, {
      headers: { 'X-Admin-Id': adminId }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Similar APIs for District, Thana, Union
export const getDistricts = async (divisionId = null) => {
  try {
    const params = divisionId ? { divisionId } : {};
    const response = await adminApi.get('/admin/districts', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getThanas = async (districtId = null) => {
  try {
    const params = districtId ? { districtId } : {};
    const response = await adminApi.get('/admin/thanas', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Content Management APIs
export const getStaticPages = async () => {
  try {
    const response = await adminApi.get('/admin/pages');
    return response;
  } catch (error) {
    throw error;
  }
};

export const createPage = async (pageData, adminId) => {
  try {
    const response = await adminApi.post('/admin/pages', pageData, {
      headers: { 'X-Admin-Id': adminId }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getContactMessages = async (params = {}) => {
  try {
    const response = await adminApi.get('/admin/contact/messages', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Dashboard specific APIs
export const getDashboardStats = async () => {
  try {
    const response = await adminApi.get('/admin/dashboard/stats');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await adminApi.get('/admin/dashboard/activities', {
      params: { limit }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Utility functions
export const getCurrentAdmin = () => {
  const adminStr = localStorage.getItem('adminUser');
  return adminStr ? JSON.parse(adminStr) : null;
};

export const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem('adminToken');
};

export default adminApi;