// api/institutionApi.js
import axios from 'axios';

const API_BASE_URL = 'https://menboots.store/LiftAKids/api';

export const registerInstitution = async (institutionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/institutions`, institutionData);
    return response.data;
  } catch (error) {
    console.error('Error registering institution:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Registration failed' };
  }
};
export const loginInstitution = async (loginData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/institutions/login`,
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
// Approve or Reject institution
  export const updateInstitutionStatus = async (institutionId, action, adminId, reason = '') => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/institutions/${institutionId}/status`, null, {
        params: { action, adminId, reason }
      });
      return response.data;
    } catch (error) {
      console.error(`Error ${action} institution:`, error);
      throw error;
    }
  };

 export const bulkUpdateStatus = async (institutionId, action, adminId, reason = '') => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/institutions/bulk/status`, {
        institutionId,
        action,
        adminId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error(`Error bulk ${action}:`, error);
      throw error;
    }
  };
  export const getStatusStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/institutions/statistics/status`);
      
      // Handle both response structures
      const data = response.data;
      
      // If it's the DTO structure
      if (data.total !== undefined) {
        return data;
      }
      // If it's a plain object (alternative implementation)
      else {
        return {
          total: data.total || 0,
          approved: data.approved || 0,
          pending: data.pending || 0,
          rejected: data.rejected || 0,
          suspended: data.suspended || 0
        };
      }
      
    } catch (error) {
      console.error('Error fetching status statistics:', error);
      
      // Return default values on error
      return {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        suspended: 0
      };
    }
};
//  export const getStatusStatistics = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/institutions/statistics/status`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching status statistics:', error);
//       throw error;
//     }
//   }

// Update institution
export const updateInstitution = async (id, institutionData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/institutions/${id}`, institutionData);
    return response.data;
  } catch (error) {
    console.error('Error updating institution:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Update failed' };
  }
};

// Delete institution
export const deleteInstitution = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/institutions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting institution:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Deletion failed' };
  }
};

// Get single institution
export const getInstitution = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/institutions/${id}`);
    console.log('Institution data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching institution:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch institution' };
  }
};
// Get ALL institutions (for student add form)
export const getAllInstitutionsList = () => {
  return axios.get(`${API_BASE_URL}/institutions/all`);
};
// getAllInstitutions for paginated requests
export const getAllInstitutions = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/institutions`, {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sort: 'institutionName,asc'
      }
    });
    console.log('Fetched institutions:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error.response?.data || { message: 'Failed to fetch institutions' };
  }
};

// For filtered requests without pagination
export const getInstitutionsByUnion = async (unionOrAreaId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/institutions/by-union/${unionOrAreaId}`);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Error fetching institutions by union:', error);
    throw error.response?.data || { message: 'Failed to fetch institutions by union' };
  }
};
// Get student count by institution
export const getStudentCount = async (institutionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/institutions/${institutionId}/student-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student count:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch student count' };
  }
};

// Get students by institution (paginated)
export const getStudentsByInstitution = async (institutionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students/institution/${institutionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch students' };
  }
}
// export const getStudentsByInstitution = async (institutionId, page = 0, size = 10) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/institutions/${institutionId}`, {
//       params: { page, size }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching students:', error.response?.data || error.message);
//     throw error.response?.data || { message: 'Failed to fetch students' };
//   }
// }
export const searchInstitutions = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/institutions/search`, {
      params: {
        value: searchTerm  // Matches @RequestParam in your controller
      }
    });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Error searching institutions:', error);
    throw error.response?.data || { message: 'Failed to search institutions' };
  }
};
export const getSponsoredStudents = async (page = 0, size = 10) => {
  try {
    const institutionData = localStorage.getItem('institutionData');
    const institutionId = institutionData ? JSON.parse(institutionData).institutionsId : null;

    if (!institutionId) {
      throw new Error('Institution not found');
    }

    const response = await axios.get(`${API_BASE_URL}/institutions/${institutionId}/students-with-sponsors`, {
      params: {
        page,
        size,
        sort: 'studentName,asc'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching sponsored students:', error);
    throw error.response?.data || error.message;
  }
};
//Address Hierarchy APIs
export const getDivisions = async () => {
  const response = await api.get('${API_BASE_URL}/divisions');
  return response.data;
};

export const getDistricts = async (divisionId) => {
  const response = await api.get(`${API_BASE_URL}/districts?divisionId=${divisionId}`);
  return response.data;
};

export const getThanas = async (districtId) => {
  const response = await api.get(`${API_BASE_URL}/thanas?districtId=${districtId}`);
  return response.data;
};

export const getUnionsOrAreas = async (thanaId) => {
  const response = await api.get(`${API_BASE_URL}/unions-or-areas?thanaId=${thanaId}`);
  return response.data;
};

// Search all donors
    export const searchAllDonors = async (searchTerm) => {
    const response = await axios.get(`${API_BASE_URL}/donors/by/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    return response.data;
  }
  
  // Get all donors
  export const getAllDonors = async () => {
    const response = await axios.get(`${API_BASE_URL}/donors`);
    return response.data;
  }

  // Search students
   export const searchStudents = async (institutionId, searchTerm) => {
    const response = await axios.get(`${API_BASE_URL}/students/search?institutionId=${institutionId}&name=${searchTerm}`);
    return response.data;
  }
export const getPendingPaymentSponsorships = async (institutionId) => {
  try {
    console.log('🚀 API Call: Getting pending sponsorships for', institutionId);
    
    const response = await axios.get(
      `${API_BASE_URL}/institution/payments/pending-payment-sponsorships?institutionId=${institutionId}`
    );
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', response.data);
    console.log('✅ Response Length:', response.data?.length);
    
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('Error Details:', error.response?.data);
    throw error;
  }
};

export const getSponsorshipStats = async (institutionId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/institution/payments/sponsorship-stats?institutionId=${institutionId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching sponsorship stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sponsorship stats');
  }
};
export const getCompletedPaymentsByInstitution = async (institutionId) => {
   try {
    console.log('🚀 API Call: Getting completed payments for', institutionId);
    
    const response = await axios.get(
      `${API_BASE_URL}/institution/payments/completed-payments?institutionId=${institutionId}`
    );
    console.log('✅ Completed Payments API Response:', response.data);
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', response.data);
    console.log('✅ Response Length:', response.data?.length);
    
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('Error Details:', error.response?.data);
    throw error;
  }
};
// api/institutionApi.js - existing method ব্যবহার করুন
export const getPaymentHistoryByStudent = async (studentId, institutionId) => {
  try {
    console.log('🚀 Getting payment history for student:', studentId, 'institution:', institutionId);
    
    const response = await axios.get(
      `${API_BASE_URL}/institution/payments/student/${studentId}?institutionId=${institutionId}`
    );
    
    console.log('✅ Student Payment History:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Student payment history error:', error);
    throw error;
  }
};
//  export const getPendingPayments = async (institutionId) => {
//     const response = await axios.get(`${API_BASE_URL}/institution/payments/pending?institutionId=${institutionId}`);
//     return response.data;
//   }

  // Confirm payment
  export const confirmPayment = async (confirmationData) => {
    const response = await axios.post(`${API_BASE_URL}/institution/payments/confirm`, confirmationData);
    return response.data;
  }
// Process manual payment
export const processManualPayment = async (paymentData) => {
 try {
    const response = await axios.post(`${API_BASE_URL}/institution/payments/manual`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Manual payment API error:', error);
    throw new Error(error.response?.data?.message || 'Failed to process manual payment');
  }
};

// file upload for receipt
export const uploadReceiptFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'receipts');

  try {
    const response = await axios.post(
      `${API_BASE_URL}/institution/payments/upload-receipt`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Authorization': `Bearer ${localStorage.getItem('institutionToken')}` // যদি প্রয়োজন হয়
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.response?.data?.message || 'File upload failed');
  }
};
