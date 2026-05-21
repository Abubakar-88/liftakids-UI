import axios from 'axios';

const API_BASE_URL = 'https://server.skyschooling.com/api'; 

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

 markAsRead: async (notificationId, userType, userId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`, null, {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async (userType, userId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/notifications/mark-all-read`, null, {
        params: { userType, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  // Get unread count
  // getUnreadCount: async (userType, userId) => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/notifications/unread/count`, {
  //       params: { userType, userId }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching unread count:', error);
  //     throw error;
  //   }
  // },

  // Get donor notifications (backward compatible)
   getDonorNotifications: async (donorId) => {
    try {
      console.log(`🔵 Calling API: ${API_BASE_URL}/notifications?userType=DONOR&userId=${donorId}`);
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        params: {
          userType: 'DONOR',
          userId: donorId
        }
      });
      console.log('✅ API Response status:', response.status);
      console.log('✅ API Response data:', response.data);
      console.log('✅ Data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log('✅ Data length:', response.data?.length);
      
      // 🔥 IMPORTANT: Return the data directly (it's already an array)
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching donor notifications:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Get institution notifications
getInstitutionNotifications: async (institutionId) => {
    try {
      console.log(`🔵 Calling API for institution: ${institutionId}`);
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        params: {
          userType: 'INSTITUTION',
          userId: institutionId
        }
      });
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching institution notifications:', error);
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