import axios from 'axios';

const API_BASE_URL = 'https://menboots.store/LiftAKids/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const notificationService = {
  // Get notifications by user type
  getNotifications: async (userType, userId) => {
    try {
      const response = await api.get('/notifications', {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread notifications
  getUnreadNotifications: async (userType, userId) => {
    try {
      const response = await api.get('/notifications/unread', {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async (userType, userId) => {
    try {
      const response = await api.get('/notifications/unread-count', {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId, userType, userId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`, null, {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async (userType, userId) => {
    try {
      const response = await api.put('/notifications/read-all', null, {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  // Get donor notifications (backward compatible)
  getDonorNotifications: async (donorId) => {
    try {
      const response = await api.get('/notifications/donor', {
        headers: { 'X-Donor-Id': donorId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching donor notifications:', error);
      throw error;
    }
  },

  // Get institution notifications
  getInstitutionNotifications: async (institutionId) => {
    try {
      const response = await api.get(`/notifications/institution/${institutionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institution notifications:', error);
      throw error;
    }
  },

  // Get admin notifications
  // getAdminNotifications: async () => {
  //   try {
  //     const response = await api.get('/admin/notifications');
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching admin notifications:', error);
  //     throw error;
  //   }
  // },

  // Create notification (for testing)
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications/create', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Subscribe to real-time notifications (WebSocket)
  subscribeToNotifications: (userType, userId, callback) => {
    // This would be implemented with WebSocket or SSE
    console.log(`Subscribing to ${userType} notifications for user ${userId}`);
    // Return unsubscribe function
    return () => console.log('Unsubscribed from notifications');
  }
};

export default notificationService;