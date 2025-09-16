// api/institutionApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost/LiftAKids/api';

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
    const response = await axios.get(`${API_BASE_URL}/institution/${institutionId}`);
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
  const response = await api.get('/divisions');
  return response.data;
};

export const getDistricts = async (divisionId) => {
  const response = await api.get(`/districts?divisionId=${divisionId}`);
  return response.data;
};

export const getThanas = async (districtId) => {
  const response = await api.get(`/thanas?districtId=${districtId}`);
  return response.data;
};

export const getUnionsOrAreas = async (thanaId) => {
  const response = await api.get(`/unions-or-areas?thanaId=${thanaId}`);
  return response.data;
};