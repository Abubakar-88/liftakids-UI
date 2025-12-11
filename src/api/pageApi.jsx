import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/LiftAKids/api';

  export const getPageBySlug = async (slug) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pages/${slug}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Page not found
      }
      throw error;
    }
  }
  // Get all pages
 export const getAllPages = async () => {
    const response = await axios.get(`${API_BASE_URL}/pages`);
    return response.data;
  }

  // Save page (create or update)
 export const savePage = async (pageData) => {
    const response = await axios.post(`${API_BASE_URL}/pages`, pageData);
    return response.data;
  }

  // Delete page
  export const deletePage = async (id) => {
    await axios.delete(`${API_BASE_URL}/pages/${id}`);
  }

  // Get page by ID (admin)
 export const getPageById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/pages/admin/${id}`);
    return response.data;
  }

// Check slug availability
  export const checkSlugAvailability = async (slug) => {
    const response = await axios.get(`${API_BASE_URL}/pages/check-slug/${slug}`);
    return response.data;
  }
  
  // Create new page
  export const createPage = async (pageData) => {
    const response = await axios.post(`${API_BASE_URL}/pages/create`, pageData);
    return response.data;
  }

  // Contact Form Related APIs 
export const submitContactForm = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/contact/submit`, formData);
    return response.data;
  } catch (error) {
    // Handle validation errors from backend
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Validation failed');
    }
    throw error;
  }
}

//  Contact Page Management APIs (Admin)
export const createContactPage = async () => {
  const response = await axios.post(`${API_BASE_URL}/pages/create-contact-page`);
  return response.data;
}

export const checkContactPage = async () => {
  const response = await axios.get(`${API_BASE_URL}/pages/check-contact-page`);
  return response.data;
}

//  Contact Messages Management (Admin)
export const getContactMessages = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/contact/messages`);
  return response.data;
}

export const getUnreadMessages = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/contact/messages/unread`);
  return response.data;
}

export const markMessageAsRead = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/admin/contact/messages/${id}/read`);
  return response.data;
}

export const deleteContactMessage = async (id) => {
  await axios.delete(`${API_BASE_URL}/admin/contact/messages/${id}`);
}

export const getContactStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/contact/stats`);
  return response.data;
}