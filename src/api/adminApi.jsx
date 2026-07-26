import axios from 'axios';
// আপনার backend URL
const API_BASE_URL = 'https://server.skyschooling.com/api'; // আপনার backend URL

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
 
    const response = await adminApi.get('/admin');
    return response;
 
};

export const getAdminById = async (adminId) => {
  
    const response = await adminApi.get(`/admin/${adminId}`);
    return response;
 
};

export const createFirstAdmin = async (adminData) => {

    const response = await adminApi.post('/admin/first', adminData);
    return response;
 
};

// Create admin by existing admin (requires authentication)
export const createAdmin = async (adminData, adminId) => {
 
    const response = await adminApi.post('/admin', adminData, {
      headers: {
        'X-Admin-Id': adminId
      }
    });
    return response;
  
};

export const updateAdmin = async (adminId, adminData, updatedByAdminId) => {
 
    const response = await adminApi.put(`/admin/${adminId}`, adminData, {
      headers: {
        'X-Admin-Id': updatedByAdminId
      }
    });
    return response;
 
};

export const deleteAdmin = async (adminId, deletedByAdminId) => {
 
    await adminApi.delete(`/admin/${adminId}`, {
      headers: {
        'X-Admin-Id': deletedByAdminId
      }
    });
    return { success: true, message: 'Admin deleted successfully' };

};

export const changeAdminStatus = async (adminId, action, currentAdminId) => {

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
 
};

export const updateAdminProfile = async (adminId, profileData) => {
  
    const response = await adminApi.put(`/admin/profile/${adminId}`, profileData);
    return response;
 
};

// Change Password
export const changePassword = async (adminId, passwordData) => {
 
    const response = await adminApi.post(`/admin/${adminId}/change-password`, passwordData);
    return response;
 
};

// Admin Statistics
export const getAdminStats = async () => {
  
    const response = await adminApi.get('/admin/stats');
    return response;
  
};

// Institution Management APIs
export const getInstitutions = async (params = {}) => {
  
    const response = await adminApi.get('/admin/institutions', { params });
    return response;
  
};

export const approveInstitution = async (institutionId, adminId) => {

    const response = await adminApi.post(
      `/admin/institutions/${institutionId}/approve`,
      {},
      { headers: { 'X-Admin-Id': adminId } }
    );
    return response;
  
};

export const rejectInstitution = async (institutionId, adminId, reason) => {
  
    const response = await adminApi.post(
      `/admin/institutions/${institutionId}/reject`,
      { reason },
      { headers: { 'X-Admin-Id': adminId } }
    );
    return response;
 
};

// Student Management APIs
export const getStudents = async (params = {}) => {
  
    const response = await adminApi.get('/admin/students', { params });
    return response;
 
};

// Donor Management APIs
export const getDonors = async (params = {}) => {
 
    const response = await adminApi.get('/admin/donors', { params });
    return response;
 
};

// Area Management APIs
export const getDivisions = async () => {
  
    const response = await adminApi.get('/admin/divisions');
    return response;
  
};

export const createDivision = async (divisionData, adminId) => {
  
    const response = await adminApi.post('/admin/divisions', divisionData, {
      headers: { 'X-Admin-Id': adminId }
    });
    return response;
  
};

// Similar APIs for District, Thana, Union
export const getDistricts = async (divisionId = null) => {
  
    const params = divisionId ? { divisionId } : {};
    const response = await adminApi.get('/admin/districts', { params });
    return response;
 
};

export const getThanas = async (districtId = null) => {
 
    const params = districtId ? { districtId } : {};
    const response = await adminApi.get('/admin/thanas', { params });
    return response;
 
};

// Content Management APIs
export const getStaticPages = async () => {
  
    const response = await adminApi.get('/admin/pages');
    return response;

};

export const createPage = async (pageData, adminId) => {
 
    const response = await adminApi.post('/admin/pages', pageData, {
      headers: { 'X-Admin-Id': adminId }
    });
    return response;
 
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