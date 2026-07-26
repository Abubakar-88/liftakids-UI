// api/blogApi.js
import axios from 'axios';

const API_BASE_URL = 'https://server.skyschooling.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all blogs (admin)
export const getAllBlogsAdmin = async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
  const response = await api.get('/blogs/admin/all', {
    params: { page, size, sortBy, sortDir }
  });
  return response.data;
};

// Create blog
export const createBlog = async (blogData, adminId) => {
  const response = await api.post('/blogs/admin/create', blogData, {
    params: { adminId }
  });
  return response.data;
};

// Update blog
export const updateBlog = async (id, blogData, adminId) => {
  const response = await api.put(`/blogs/admin/${id}`, blogData, {
    params: { adminId }
  });
  return response.data;
};

// Delete blog
export const deleteBlog = async (id, adminId) => {
  const response = await api.delete(`/blogs/admin/${id}`, {
    params: { adminId }
  });
  return response.data;
};

// Get blog by id
export const getBlogById = async (id) => {
  const response = await api.get(`/blogs/public/${id}`);
  return response.data;
};



// Update blog status (publish/unpublish)
export const updateBlogStatus = async (id, published, adminId) => {
  const response = await api.patch(`/blogs/admin/${id}/status`, null, {
    params: { published, adminId }
  });
  return response.data;
};
export const getBlogBySlug = async (slug) => {
  try {
    const response = await api.get(`/blogs/public/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    throw error;
  }
};

export const getBlogSeoMeta = async (slug) => {
  try {
    const response = await api.get(`/blogs/public/slug/${slug}/seo-meta`);
    return response.data;
  } catch (error) {
    console.error('Error fetching SEO meta:', error);
    throw error;
  }
};
// Get SEO meta for blog
export const getAllPublishedBlogs = async (page = 0, size = 9, sortBy = 'createdAt', sortDir = 'desc') => {
  console.log('🌐 API Call: getAllPublishedBlogs', { page, size, sortBy, sortDir });
  try {
    const response = await api.get('/blogs/public', {
      params: { page, size, sortBy, sortDir }
    });
    console.log('✅ API Response:', response);
    console.log('✅ Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('❌ Error response:', error.response);
    throw error;
  }
};

export const getFeaturedBlogs = async (page = 0, size = 3) => {
  const response = await api.get('/blogs/public/featured', {
    params: { page, size }
  });
  return response.data;
};

export const getLatestBlogs = async (page = 0, size = 5) => {
  const response = await api.get('/blogs/public/latest', {
    params: { page, size }
  });
  return response.data;
};

export const getBlogsByCategory = async (category, page = 0, size = 9) => {
  const response = await api.get(`/blogs/public/category/${category}`, {
    params: { page, size }
  });
  return response.data;
};

export const searchBlogs = async (keyword, page = 0, size = 9) => {
  const response = await api.get('/blogs/public/search', {
    params: { keyword, page, size }
  });
  return response.data;
};

export const getAllCategories = async () => {
  const response = await api.get('/blogs/public/categories');
  return response.data;
};

