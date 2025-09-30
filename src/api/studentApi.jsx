import axios from 'axios';

const API_BASE_URL = 'http://localhost/LiftAKids/api';


// After (fixed for multipart form data)
export const addStudent = async (formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/students/addStudent`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Add student error:', error.response?.data);
    throw error;
  }
}
export const fetchStudentLists = async (institutionId, page = 0, size = 10, search = '') => {
  try {
    const params = { page, size, ...(search && { search }) };

    const response = await axios.get(
      `${API_BASE_URL}/students/institution/${institutionId}/withPagination`,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error.response?.data || error.message;
  }
};

// export const addStudent = async (studentData) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/students/addStudent`, studentData);
//     return response.data;
//   } catch (error) {
//     console.error('Error adding student:', error.response?.data || error.message);
//     throw error.response?.data || { message: 'Failed to add student' };
//   }
// };
export const getInstitutionName = async (institutionId) => {
  const response = await fetch(`${API_BASE_URL}/institutions/${institutionId}/name`);
  if (!response.ok) {
    throw new Error('Failed to fetch institution name');
  }
  return response.json();
};



export const getTopUnsponsoredUrgentStudents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students/unsponsored/urgent/top3`);
    return response.data;
  } catch (error) {
    console.error('Error fetching urgent unsponsored students:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch urgent students');
  }
};
// api/studentApi.js
export const fetchStudents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error; // Re-throw to handle in component
  }
};
export const getStudentById = (id) => {
  return axios.get(`${API_BASE_URL}/students/${id}`);
};
// export const getStudentsByInstitution = async (institutionId) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/students/institution/${institutionId}`);
//     return { data: response.data }; 
//   } catch (error) {
//     console.error('Error fetching students:', error.response?.data || error.message);
//     throw error.response?.data || { message: 'Failed to fetch students' };
//   }
// }
export const getStudentsByInstitution = async (institutionsId) => {
  const response = await axios.get(`${API_BASE_URL}/students/institution/${institutionsId}`);
  return response.data; // This should be your student array
};
// export const getStudentsByInstitution = async (institutionId) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/students/institution/${institutionId}`);
//     return { 
//       data: response.data,
//       status: response.status 
//     };
//   } catch (error) {
//     console.error('API Error:', {
//       url: error.config?.url,
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });
//     throw error;
//   }
// };
export const searchStudents = (params) => 
  axios.get(`${API_BASE_URL}/students/search`, { params });

// Add other student-related API calls here
// Add other student-related API calls here
export const submitResults = async (studentId, files) => {
  const formData = new FormData();
  formData.append('studentId', studentId);
  
  if (files.firstTerminalFile) {
    formData.append('resultImage', files.firstTerminalFile);
  }
  if (files.secondTerminalFile) {
    formData.append('resultImage', files.secondTerminalFile);
  }

  // Fix the endpoint URL to match your backend
  const response = await fetch(`${API_BASE_URL}/results/upload`, {
    method: 'POST',
    body: formData
    // Note: Don't set Content-Type header for FormData - browser will set it automatically
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit results');
  }
  return await response.json();
};

export const getAllStudents = async (page, size, sortBy, sortDir) => {
  try {
    const params = new URLSearchParams({
      page: page,
      size: size,
      sortBy: sortBy,
      sortDir: sortDir
    });
    
    const response = await fetch(`${API_BASE_URL}/students/all?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};
// export const getAllStudents = (page = 0, size = 10, sort = 'studentName,asc') => {
//   return axios.get(`${API_BASE_URL}/students/all`, {
//     params: {
//       page,
//       size,
//       sort
//     },
//     paramsSerializer: params => {
//       // Custom serialization to match Spring's Pageable format
//       return Object.entries(params)
//         .map(([key, value]) => {
//           if (key === 'sort') {
//             return `sort=${encodeURIComponent(value)}`;
//           }
//           return `${key}=${encodeURIComponent(value)}`;
//         })
//         .join('&');
//     }
//   });
// };

export const fetchStudentList = async () => {
  const response = await fetch(`${API_BASE_URL}/students/list`);
  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return await response.json();
};

export const fetchStudentResults = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/results/student/${studentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }
  return await response.json();
};
export const deleteStudent = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Add authorization if needed
      // 'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    // Only try to parse JSON if there's content
    const errorText = await response.text();
    try {
      const errorData = errorText ? JSON.parse(errorText) : {};
      throw new Error(errorData.message || 'Failed to delete student');
    } catch {
      throw new Error(errorText || 'Failed to delete student');
    }
  }
  
  // Successful deletion returns no content
  return null;
};
export const updateStudent = async (studentId, formData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/students/updateStudent/${studentId}`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update student error:', error.response?.data);
    throw error;
  }
}
// export const updateStudent = async (studentId, data) => {
//   const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data)
//   });
//   if (!response.ok) {
//     throw new Error('Failed to update student');
//   }
//   return await response.json();
// };


export const updateStudentBio = async (studentId, bio) => {
  const response = await fetch(`/students/${studentId}/bio`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bio })
  });
  if (!response.ok) {
    throw new Error('Failed to update bio');
  }
  return await response.json();
};


// export const getCurrentInstitution = async () => {
//   const response = await fetch('/api/institutions/current', {
//     method: 'GET',
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('token')}`
//     }
//   });
//   if (!response.ok) {
//     throw new Error('Failed to fetch current institution');
//   }
//   return response.json();
// };