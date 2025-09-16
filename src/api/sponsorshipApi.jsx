import axios from "axios";

const API_BASE_URL = 'http://localhost/LiftAKids/api';

// Donor Search API
export const searchDonors = async (searchTerm) => {
  return axios.get(`${API_BASE_URL}/donors/search?searchTerm=${searchTerm}`);
};

// Student Search API
export const searchStudents = async (filters) => {
  const params = new URLSearchParams();
  if (filters.studentName) params.append('studentName', filters.studentName);
  if (filters.guardianName) params.append('guardianName', filters.guardianName);
  if (filters.gender) params.append('gender', filters.gender);
  if (filters.contactNumber) params.append('contactNumber', filters.contactNumber);
  
  return axios.get(`${API_BASE_URL}/students/search?${params.toString()}`);
};

// Sponsorship API
export const createSponsorship = async (data) => {
  return axios.post(`${API_BASE_URL}/sponsorships`, data);
};
// export const processPayment = async (id, data) => {
//   // Format dates to yyyy-MM before sending
//   const payload = {
//     ...data,
//     startDate: formatToMonthYear(data.startDate),
//     endDate: formatToMonthYear(data.endDate)
//   };
  
//   return axios.post(`${API_BASE_URL}/sponsorships/${id}/payments`, payload);
// };
export const processPayment = async (sponsorshipId, paymentData) => {
  try {
    // Format dates to ensure proper month/year handling
    const formatDate = (dateString) => {
      try {
        // Handle both full dates (from Date inputs) and yyyy-MM format
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          // If not a valid date, assume it's already in yyyy-MM format
          return dateString;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      } catch (error) {
        console.error('Date formatting error:', error);
        throw new Error('Invalid date format');
      }
    };

    // Prepare payload with properly formatted dates
    const payload = {
      ...paymentData,
      startDate: formatDate(paymentData.startDate),
      endDate: formatDate(paymentData.endDate),
      sponsorshipId // Include sponsorshipId in payload if needed
    };

    console.log('Sending payment payload:', payload);

    const response = await axios.post(
      `${API_BASE_URL}/sponsorships/${sponsorshipId}/payment`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
    
  } catch (error) {
    console.error('Payment processing error:', {
      error: error.response?.data || error.message,
      request: {
        sponsorshipId,
        payload: paymentData
      }
    });
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'Payment processing failed'
    );
  }
};

export const checkSponsorshipExists = async (sponsorshipId) => {
  try {
    const response = await api.get(`${API_BASE}/sponsorships/${sponsorshipId}/exists`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // Sponsorship doesn't exist
    }
    console.error('Error checking sponsorship:', error);
    throw error;
  }
};
export const getSponsorshipByDonorStudent = async (donorId, studentId) => {
  try {
    const response = await api.get(`/sponsorships?donorId=${donorId}&studentId=${studentId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // No sponsorship found
    }
    console.error('Error fetching sponsorship:', error);
    throw error;
  }
};
export const getSponsorshipByStudent = async (donorId, studentId) => {
  try {
    const response = await api.get(`/sponsorships?donorId=${donorId}&studentId=${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sponsorship:', error);
    throw error;
  }
};
// Helper function to format dates
const formatToMonthYear = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// export const processPayment = async (sponsorshipId, data) => {
//   return axios.post(`${API_BASE_URL}/sponsorships/${sponsorshipId}/payments`, data);
// };

export const getDonorSponsorships = async (donorId) => {
  return axios.get(`${API_BASE_URL}/sponsorships/donor/${donorId}`);
};

export const getStudentSponsorships = async (studentId) => {
  return axios.get(`${API_BASE_URL}/sponsorships/student/${studentId}`);
};

export const fetchSponsorships = async (params) => {
  try {
    // Clean up params
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => 
        value !== '' && value !== null && value !== undefined
      )
    );
    return await axios.get(`${API_BASE_URL}/sponsorships`, { params: cleanParams });
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    throw error;
  }
};

export const sponsorshipStatusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'COMPLETED', label: 'Completed', color: 'blue' },
  { value: 'PAUSED', label: 'Paused', color: 'orange' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
];

export const paymentMethodOptions = [
  { value: 'CREDIT_CARD', label: 'Credit Card', color: 'geekblue' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', color: 'purple' },
  { value: 'PAYPAL', label: 'PayPal', color: 'blue' },
  { value: 'TEST', label: 'Test Payment', color: 'gray' },
];