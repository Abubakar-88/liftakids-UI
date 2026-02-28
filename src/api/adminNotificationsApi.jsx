import axios from 'axios';

const API_BASE_URL = 'https://menboots.store/LiftAKids/api';

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

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success [${response.config.method.toUpperCase()} ${response.config.url}]:`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API Error [${error.config?.method?.toUpperCase()} ${error.config?.url}]:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

const adminNotificationService = {
  // Get all notifications (paginated)
  getAllNotifications: async (page = 0, size = 20) => {
    try {
      console.log(`📡 Fetching admin notifications page ${page}, size ${size}`);
      const response = await api.get('/admin/notifications/all', {
        params: { 
          page,
          size,
          sort: 'createdAt,desc'
        }
      });
      
      console.log('📦 Raw admin notifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all notifications:', error);
      
      // For development/testing, return sample data
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Returning development sample data');
        return {
          content: [
            {
              id: 1,
              notificationId: 'admin-dev-1',
              title: 'Sample Admin Notification 1',
              message: 'This is a sample notification for testing.',
              type: 'ADMIN_ALERT',
              status: 'UNREAD',
              createdAt: new Date().toISOString(),
              userId: 1,
              userType: 'ADMIN'
            },
            {
              id: 2,
              notificationId: 'admin-dev-2',
              title: 'System Update',
              message: 'System maintenance scheduled for tonight.',
              type: 'SYSTEM_ANNOUNCEMENT',
              status: 'READ',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              userId: 1,
              userType: 'ADMIN'
            }
          ],
          totalElements: 2,
          totalPages: 1,
          number: 0,
          size: 20
        };
      }
      
      throw error;
    }
  },

  // Get unread count for admin
  getAdminUnreadCount: async (adminId) => {
    try {
      console.log(`🔢 Fetching unread count for admin: ${adminId}`);
      const response = await api.get('/admin/notifications/unread-count', {
        params: { adminId }
      });
      
      console.log('📊 Unread count response:', response.data);
      
      // Handle different response formats
      const data = response.data;
      
      if (data && data.unreadCount !== undefined) {
        return { unreadCount: data.unreadCount };
      } else if (typeof data === 'number') {
        return { unreadCount: data };
      } else if (data && data.data && data.data.unreadCount !== undefined) {
        return { unreadCount: data.data.unreadCount };
      }
      
      // If format not recognized, fallback to statistics
      console.log('⚠️ Unread count format not recognized, falling back to statistics');
      return await adminNotificationService.getStatistics();
      
    } catch (error) {
      console.error('❌ Error fetching admin unread count:', error);
      
      // Fallback to statistics
      try {
        const stats = await adminNotificationService.getStatistics();
        console.log('📊 Fallback to statistics:', stats);
        return { unreadCount: stats.unreadCount || 0 };
      } catch (statsError) {
        console.error('❌ Statistics also failed:', statsError);
        return { unreadCount: 0 };
      }
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      console.log('📊 Fetching admin statistics');
      const response = await api.get('/admin/notifications/statistics');
      
      console.log('📈 Statistics raw response:', response.data);
      
      const data = response.data;
      
      // Extract unread count from various possible formats
      let unreadCount = 0;
      let totalCount = 0;
      let readCount = 0;
      let todayCount = 0;
      
      // Format 1: Direct properties
      if (data.unreadCount !== undefined) {
        unreadCount = data.unreadCount;
      } else if (data.unread !== undefined) {
        unreadCount = data.unread;
      } else if (data.unreadNotifications !== undefined) {
        unreadCount = data.unreadNotifications;
      }
      
      // Format 2: Nested statistics object
      if (data.statistics) {
        const stats = data.statistics;
        if (stats.unreadCount !== undefined) {
          unreadCount = stats.unreadCount;
        } else if (stats.unread !== undefined) {
          unreadCount = stats.unread;
        }
      }
      
      // Get other counts
      if (data.totalCount !== undefined) {
        totalCount = data.totalCount;
      } else if (data.total !== undefined) {
        totalCount = data.total;
      }
      
      if (data.readCount !== undefined) {
        readCount = data.readCount;
      } else if (data.read !== undefined) {
        readCount = data.read;
      }
      
      if (data.todayCount !== undefined) {
        todayCount = data.todayCount;
      } else if (data.today !== undefined) {
        todayCount = data.today;
      }
      
      return {
        unreadCount,
        totalCount,
        readCount,
        todayCount,
        rawData: data
      };
      
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      return {
        unreadCount: 0,
        totalCount: 0,
        readCount: 0,
        todayCount: 0,
        error: true,
        message: error.message
      };
    }
  },

  // Filter notifications
  filterNotifications: async (filter) => {
    try {
      const response = await api.post('/admin/notifications/filter', filter);
      return response.data;
    } catch (error) {
      console.error('Error filtering notifications:', error);
      throw error;
    }
  },

  // Get analytics
  getAnalytics: async (startDate, endDate) => {
    try {
      const response = await api.get('/admin/notifications/analytics', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Bulk mark as read
  bulkMarkAsRead: async (notificationIds, adminId) => {
    try {
      const response = await api.put('/admin/notifications/bulk/mark-read', {
        notificationIds,
        adminId
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk marking as read:', error);
      throw error;
    }
  },

  // Bulk delete
  bulkDelete: async (notificationIds, adminId) => {
    try {
      const response = await api.delete('/admin/notifications/bulk/delete', {
        data: { notificationIds, adminId }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting:', error);
      throw error;
    }
  },

  // Send system announcement
  sendSystemAnnouncement: async (title, message, actionUrl, adminId) => {
    try {
      const response = await api.post('/admin/notifications/announcement', {
        title,
        message,
        actionUrl,
        adminId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending system announcement:', error);
      throw error;
    }
  },

  // Send to user type
  sendToUserType: async (userType, title, message, actionUrl, adminId) => {
    try {
      const response = await api.post('/admin/notifications/send-to-usertype', {
        userType,
        title,
        message,
        actionUrl,
        adminId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending to user type:', error);
      throw error;
    }
  },

  // Clear old notifications
  clearOldNotifications: async (days, adminId) => {
    try {
      const response = await api.delete('/admin/notifications/clear-old', {
        params: { days, adminId }
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      throw error;
    }
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    try {
      console.log('📋 Fetching admin dashboard summary');
      const response = await api.get('/admin/notifications/dashboard');
      console.log('📋 Dashboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      
      // Return sample for development
      if (process.env.NODE_ENV === 'development') {
        return {
          statistics: {
            total: 2,
            read: 1,
            unread: 1,
            today: 1
          },
          recentNotifications: [
            {
              id: 1,
              title: 'Sample Dashboard Notification',
              message: 'This appears on dashboard',
              type: 'ADMIN_ALERT',
              status: 'UNREAD',
              createdAt: new Date().toISOString()
            }
          ],
          weeklyAnalytics: {
            total: 2,
            byType: { 'ADMIN_ALERT': 2 }
          }
        };
      }
      
      throw error;
    }
  },

  // Create notifications
  createAdminNotification: async (notificationData) => {
    try {
      const response = await api.post('/admin/notifications/create/admin', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  },

  createInstitutionNotification: async (notificationData) => {
    try {
      const response = await api.post('/admin/notifications/create/institution', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating institution notification:', error);
      throw error;
    }
  },

  createDonorNotification: async (notificationData) => {
    try {
      const response = await api.post('/admin/notifications/create/donor', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating donor notification:', error);
      throw error;
    }
  },

  // Test function to check API connectivity
  testConnection: async () => {
    try {
      console.log('🔌 Testing admin notifications API connection...');
      
      const endpoints = [
        '/admin/notifications/all?page=0&size=1',
        '/admin/notifications/statistics',
        '/admin/notifications/dashboard'
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          results.push({
            endpoint,
            status: '✅ OK',
            data: response.data
          });
        } catch (error) {
          results.push({
            endpoint,
            status: '❌ FAILED',
            error: error.message
          });
        }
      }
      
      console.log('📋 API Test Results:', results);
      return results;
      
    } catch (error) {
      console.error('❌ API Test Error:', error);
      return { error: error.message };
    }
  }
};

export default adminNotificationService;