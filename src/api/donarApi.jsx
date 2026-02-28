// api/donarApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/LiftAKids/api';
// api/donarApi.js ফাইল check করুন
export const registerDonor = async (donorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donorData),
    });

    if (!response.ok) {
      // response JSON না হলে text হিসেবে পড়ো
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = await response.text();
      }
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
export const loginDonor = async (credentials) => {
  try {
    console.log('Donor API called with:', credentials); // Debug log
    const response = await axios.post(`${API_BASE_URL}/donors/login`, credentials);
    console.log('Donor API response:', response);
    return response.data;
  } catch (error) {
    console.error('Donor API error:', error.response || error);
    throw error;
  }
};
// export const loginDonor = async (loginData) => {
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}/donors/login`,
//       loginData,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     throw error.response.data;
//   }
// };

// export const registerDonor = async (donorData) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/donors`, donorData);
//     return response.data;
//   } catch (error) {
//     console.error('Error registering donor:', error);
//     throw error;
//   }
// };

export const fetchDonors = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donors/all`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch donors');
  }
};

export const searchDonors = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donors/search`, {
      params: { searchTerm }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search donors');
  }
};

export const getSponsorshipsByDonorId = async (donorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/donors/${donorId}/sponsorships`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sponsorships by donor ID:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch sponsorships');
    }
  }

export const deleteDonor = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/donors/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete donor');
  }
};

export const fetchDonorDetails = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donors/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch donor details');
  }
};

export const fetchSponsoredStudents = async (donorId) => {
  try {
    const response = await axios.get(`/api/sponsorships/donor/${donorId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sponsored students');
  }
}

  export const updateDonor = async (donorId, donorData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/donors/update/${donorId}`, donorData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update donor');
  }                     
  }
  
 export const changeDonorPassword = async (donorId, passwordData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/donors/${donorId}/change-password`, passwordData);    
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);

    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

export const getDonorById = async (donorId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donors/${donorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donor by ID:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch donor');
  } 
};