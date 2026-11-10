import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL; // আপনার backend URL

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
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get('/admin');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAdminById = async (adminId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get(`/admin/${adminId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createFirstAdmin = async (adminData) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.post('/admin/first', adminData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create admin by existing admin (requires authentication)
export const createAdmin = async (adminData, adminId) => {
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.put(`/admin/profile/${adminId}`, profileData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Change Password
export const changePassword = async (adminId, passwordData) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.post(`/admin/${adminId}/change-password`, passwordData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Admin Statistics
export const getAdminStats = async () => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get('/admin/stats');
    return response;
  } catch (error) {
    throw error;
  }
};

// Institution Management APIs
export const getInstitutions = async (params = {}) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get('/admin/institutions', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const approveInstitution = async (institutionId, adminId) => {
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get('/admin/students', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Donor Management APIs
export const getDonors = async (params = {}) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get('/admin/donors', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Area Management APIs
export const getDivisions = async () => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get('/admin/divisions');
    return response;
  } catch (error) {
    throw error;
  }
};

export const createDivision = async (divisionData, adminId) => {
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
  try {
    const params = divisionId ? { divisionId } : {};
    const response = await adminApi.get('/admin/districts', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getThanas = async (districtId = null) => {
  // eslint-disable-next-line no-useless-catch
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
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await adminApi.get('/admin/pages');
    return response;
  } catch (error) {
    throw error;
  }
};

export const createPage = async (pageData, adminId) => {
  // eslint-disable-next-line no-useless-catch
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
 
    const response = await adminApi.get('/admin/contact/messages', { params });
    return response;

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

// Dashboard specific APIs
export const getDashboardStats = async () => {
  try {
    console.log('📡 Fetching dashboard stats...');
    const response = await adminApi.get('/admin/dashboard/stats');
    console.log('✅ Dashboard stats response:', response);
    
    // Response is already the data due to interceptor
    return response;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    // Return default values instead of throwing
    return {
      totalDonors: 0,
      totalInstitutions: 0,
      totalStudents: 0,
      activeSponsorships: 0,
      totalSponsorships: 0,
      totalPayments: 0,
      totalRevenue: 0
    };
  }
};

export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await adminApi.get('/admin/dashboard/activities', {
      params: { limit }
    });
    return response;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};





export default adminApi;