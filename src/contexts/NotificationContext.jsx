import React, { createContext, useState, useContext, useEffect } from 'react';
import notificationService from '../api/notificationsApi';
import adminNotificationService from '../api/adminNotificationsApi';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  userInfo: null,
  markAsRead: () => {},
  markAllAsRead: () => {},
  refreshNotifications: () => {},
  fetchNotifications: () => {},
  fetchUnreadCount: () => {},
  isAdmin: false,
  adminStats: null,
  fetchAdminStats: () => {}
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  // Check if user is admin
  const isAdmin = userInfo?.type === 'ADMIN';

  // Load user info from localStorage
  useEffect(() => {
    const loadUserInfo = () => {
      console.log('🔍 ===== LOADING USER INFO FROM LOCALSTORAGE =====');
      
      // Check for different user types
      const donorData = localStorage.getItem('donorData');
      const institutionData = localStorage.getItem('institutionData');
      const adminData = localStorage.getItem('adminData');

      console.log('donorData exists:', !!donorData);
      console.log('institutionData exists:', !!institutionData);
      console.log('adminData exists:', !!adminData);

      let userType = null;
      let userId = null;
      let userName = null;
      let userData = null;

      if (donorData) {
        try {
          const donor = JSON.parse(donorData);
          console.log('✅ Parsed donorData:', donor);
          userType = 'DONOR';
          userId = donor.donorId || donor.id;
          userName = donor.name || donor.fullName;
          userData = donor;
        } catch (e) {
          console.error('Error parsing donor data:', e);
        }
      } else if (institutionData) {
        try {
          const institution = JSON.parse(institutionData);
          console.log('✅ Parsed institutionData:', institution);
          userType = 'INSTITUTION';
          userId = institution.institutionsId || institution.id;
          userName = institution.institutionName || institution.name;
          userData = institution;
        } catch (e) {
          console.error('Error parsing institution data:', e);
        }
      } else if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          console.log('✅ Parsed adminData:', admin);
          userType = 'ADMIN';
          userId = admin.adminId || admin.id;
          userName = admin.name;
          userData = admin;
        } catch (e) {
          console.error('Error parsing admin data:', e);
        }
      }

      if (userType && userId) {
        const userInfoObj = {
          type: userType,
          id: userId,
          name: userName,
          data: userData
        };
        console.log('✅ Setting userInfo:', userInfoObj);
        setUserInfo(userInfoObj);
      } else {
        console.log('❌ No valid user info found');
        setUserInfo(null);
        // Reset counts when no user
        setUnreadCount(0);
        setNotifications([]);
      }
    };

    loadUserInfo();

    // Listen for storage changes
    const handleStorageChange = () => {
      console.log('🔄 Storage changed, reloading user info');
      loadUserInfo();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for changes (in case of multiple tabs)
    const storagePollInterval = setInterval(() => {
      const currentAdminData = localStorage.getItem('adminData');
      const currentInstitutionData = localStorage.getItem('institutionData');
      const currentDonorData = localStorage.getItem('donorData');
      
      if (currentAdminData !== (userInfo?.data ? JSON.stringify(userInfo.data) : null) ||
          currentInstitutionData !== (userInfo?.data ? JSON.stringify(userInfo.data) : null) ||
          currentDonorData !== (userInfo?.data ? JSON.stringify(userInfo.data) : null)) {
        console.log('🔄 Detected data change, reloading user info');
        loadUserInfo();
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(storagePollInterval);
    };
  }, []);

  // Fetch notifications when user info changes
  useEffect(() => {
    console.log('👤 UserInfo changed:', userInfo);
    
    if (userInfo && userInfo.id) {
      console.log(`🔄 Fetching notifications for ${userInfo.type}: ${userInfo.id}`);
      fetchNotifications();
      fetchUnreadCount();
      
      // If admin, fetch admin stats
      if (isAdmin) {
        fetchAdminStats();
      }
      
      // Set up polling for new notifications
      const interval = setInterval(() => {
        console.log('⏰ Polling for new notifications...');
        fetchUnreadCount();
        if (isAdmin) {
          fetchAdminStats();
        }
      }, 30000);

      return () => {
        console.log('🧹 Clearing notification polling interval');
        clearInterval(interval);
      };
    } else {
      console.log('⛔ No user info, clearing notifications');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [userInfo, isAdmin]);


  const fetchNotifications = async () => {
  if (!userInfo || !userInfo.id) {
    console.log('⛔ Cannot fetch notifications: No user info');
    return;
  }

  console.log(`📡 Fetching notifications for ${userInfo.type}: ${userInfo.id}`);
  setLoading(true);
  
  try {
    let response;
    
    if (isAdmin) {
  console.log('👑 Admin: Fetching all notifications');
  
  try {
    // Approach 1: Try getAllNotifications first
    response = await adminNotificationService.getAllNotifications(0, 20);
    console.log('✅ Admin getAllNotifications response:', response);
    
    // Check if response has content
    if (response && response.content && Array.isArray(response.content)) {
      console.log(`✅ Got ${response.content.length} admin notifications`);
    } else {
      console.log('⚠️ No content in response, trying dashboard...');
      
      // Approach 2: Try dashboard
      const dashboard = await adminNotificationService.getDashboardSummary();
      console.log('📋 Dashboard response:', dashboard);
      
      if (dashboard && dashboard.recentNotifications) {
        response = { content: dashboard.recentNotifications };
      } else if (dashboard && dashboard.statistics) {
        // If only statistics available, create sample from it
        const stats = dashboard.statistics;
        if (stats.unread > 0) {
          response = {
            content: [
              {
                notificationId: 'admin-stat-1',
                title: 'System Statistics',
                message: `You have ${stats.unread} unread notifications`,
                type: 'ADMIN_ALERT',
                status: 'UNREAD',
                createdAt: new Date().toISOString(),
                userId: userInfo.id,
                userType: 'ADMIN'
              }
            ]
          };
        }
      }
    }
  } catch (error) {
    console.error('❌ Admin API calls failed:', error);
    
    // Create development sample data
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Creating development sample notifications');
      response = {
        content: [
          {
            notificationId: 'dev-admin-1',
            title: 'Development Mode',
            message: 'API is not responding, showing sample data.',
            type: 'ADMIN_ALERT',
            status: 'UNREAD',
            createdAt: new Date().toISOString(),
            userId: userInfo.id,
            userType: 'ADMIN'
          },
          {
            notificationId: 'dev-admin-2',
            title: 'Sample Notification',
            message: 'This is sample notification data for development.',
            type: 'SYSTEM_ANNOUNCEMENT',
            status: 'READ',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            userId: userInfo.id,
            userType: 'ADMIN'
          }
        ]
      };
    } else {
      response = { content: [] };
    }
  }
} else if (userInfo.type === 'DONOR') {
      console.log('❤️ Donor: Fetching donor notifications');
      response = await notificationService.getDonorNotifications(userInfo.id);
      console.log('Donor notifications response:', response);
    } else if (userInfo.type === 'INSTITUTION') {
      console.log('🏫 Institution: Fetching institution notifications');
      response = await notificationService.getInstitutionNotifications(userInfo.id);
      console.log('Institution notifications response:', response);
    } else {
      console.log('❓ Unknown user type:', userInfo.type);
      response = { success: false, notifications: [] };
    }

    // Handle different response formats for ADMIN
    let notificationList = [];
    
    if (isAdmin) {
      // Handle admin response format
      if (response && response.content && Array.isArray(response.content)) {
        notificationList = response.content;
      } else if (Array.isArray(response)) {
        notificationList = response;
      } else if (response && Array.isArray(response.notifications)) {
        notificationList = response.notifications;
      } else if (response && Array.isArray(response.data)) {
        notificationList = response.data;
      } else if (response && response.recentNotifications && Array.isArray(response.recentNotifications)) {
        notificationList = response.recentNotifications;
      } else {
        console.warn('⚠️ Unexpected admin response format:', response);
        notificationList = [];
      }
    } else {
      // Handle donor/institution response format
      if (response && response.success) {
        notificationList = response.notifications || response.data || [];
      } else if (Array.isArray(response)) {
        notificationList = response;
      } else if (response && response.content && Array.isArray(response.content)) {
        notificationList = response.content;
      } else if (response && response.data && Array.isArray(response.data)) {
        notificationList = response.data;
      } else if (response && response.notifications && Array.isArray(response.notifications)) {
        notificationList = response.notifications;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        notificationList = [];
      }
    }
    
    console.log(`✅ Final notification list length: ${notificationList.length}`);
    
    if (notificationList.length > 0) {
      console.log('📋 First notification:', notificationList[0]);
    }
    
    // Set notifications
    setNotifications(notificationList);
    
    // For admin, also update unread count from these notifications
    if (isAdmin && notificationList.length > 0) {
      const newUnreadCount = notificationList.filter(n => n.status === 'UNREAD').length;
      console.log(`📊 Admin: ${newUnreadCount} unread in fetched notifications`);
      
      if (newUnreadCount !== unreadCount) {
        console.log(`🔄 Updating admin unreadCount from ${unreadCount} to ${newUnreadCount}`);
        setUnreadCount(newUnreadCount);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch notifications:', error);
    setNotifications([]);
    
    // For admin, create some sample notifications for testing
    if (isAdmin) {
      console.log('🎯 Creating sample notifications for admin testing');
      const sampleNotifications = [
        {
          notificationId: `admin-sample-${Date.now()}`,
          title: 'Welcome Admin!',
          message: 'You have successfully logged into the admin panel.',
          type: 'ADMIN_ALERT',
          status: 'UNREAD',
          createdAt: new Date().toISOString(),
          userId: userInfo.id,
          userType: 'ADMIN',
          actionUrl: '/admin/dashboard'
        },
        {
          notificationId: `admin-sample-${Date.now() + 1}`,
          title: 'System Update Required',
          message: 'Please review the latest system updates.',
          type: 'SYSTEM_ANNOUNCEMENT',
          status: 'READ',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          userId: userInfo.id,
          userType: 'ADMIN'
        }
      ];
      
      setNotifications(sampleNotifications);
      setUnreadCount(1);
    }
  } finally {
    setLoading(false);
  }
};
  // const fetchNotifications = async () => {
  //   if (!userInfo || !userInfo.id) {
  //     console.log('⛔ Cannot fetch notifications: No user info');
  //     return;
  //   }

  //   console.log(`📡 Fetching notifications for ${userInfo.type}: ${userInfo.id}`);
  //   setLoading(true);
    
  //   try {
  //     let response;
      
  //     if (isAdmin) {
  //       // Admin gets all notifications
  //       console.log('👑 Admin: Fetching all notifications');
  //       response = await adminNotificationService.getAllNotifications(0, 50);
  //       console.log('Admin notifications response:', response);
  //     } else if (userInfo.type === 'DONOR') {
  //       console.log('❤️ Donor: Fetching donor notifications');
  //       response = await notificationService.getDonorNotifications(userInfo.id);
  //       console.log('Donor notifications response:', response);
  //     } else if (userInfo.type === 'INSTITUTION') {
  //       console.log('🏫 Institution: Fetching institution notifications');
  //       response = await notificationService.getInstitutionNotifications(userInfo.id);
  //       console.log('Institution notifications response:', response);
  //     } else {
  //       console.log('❓ Unknown user type:', userInfo.type);
  //       response = { success: false, notifications: [] };
  //     }

  //     // Handle different response formats
  //     let notificationList = [];
      
  //     if (response && response.success) {
  //       notificationList = response.notifications || response.data || [];
  //     } else if (Array.isArray(response)) {
  //       notificationList = response;
  //     } else if (response && response.content && Array.isArray(response.content)) {
  //       notificationList = response.content;
  //     } else if (response && response.data && Array.isArray(response.data)) {
  //       notificationList = response.data;
  //     } else if (response && response.notifications && Array.isArray(response.notifications)) {
  //       notificationList = response.notifications;
  //     } else {
  //       console.warn('⚠️ Unexpected response format:', response);
  //       notificationList = [];
  //     }
      
  //     console.log(`✅ Got ${notificationList.length} notifications`);
      
  //     // Set notifications
  //     setNotifications(notificationList);
      
  //     // Update unread count from fetched notifications
  //     const newUnreadCount = notificationList.filter(n => n.status === 'UNREAD').length;
  //     console.log(`📊 ${newUnreadCount} unread notifications in fetched data`);
      
  //     if (newUnreadCount !== unreadCount) {
  //       console.log(`🔄 Updating unreadCount from ${unreadCount} to ${newUnreadCount}`);
  //       setUnreadCount(newUnreadCount);
  //     }
      
  //   } catch (error) {
  //     console.error('❌ Failed to fetch notifications:', error);
  //     setNotifications([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUnreadCount = async () => {
    if (!userInfo || !userInfo.id) {
      console.log('⛔ Cannot fetch unread count: No user info');
      return;
    }
    
    console.log('🔢 Fetching unread count for:', userInfo.type, userInfo.id);
    
    try {
      let count = 0;
      
      if (isAdmin) {
        // For admin, use the proper unread count API if available
        try {
          // First try to get unread count from API
          const response = await adminNotificationService.getStatistics();
          console.log('Admin stats response:', response);
          count = response.unreadCount || 0;
        } catch (apiError) {
          console.log('Admin unread API failed, using local calculation:', apiError);
          // Fallback to local calculation
          const allNotifications = notifications.filter(n => n.status === 'UNREAD');
          count = allNotifications.length;
        }
      } else if (userInfo.type === 'DONOR') {
        // Use the dedicated unread count API
        const response = await notificationService.getUnreadCount(userInfo.type, userInfo.id);
        console.log('Donor unread count response:', response);
        
        // Handle different response formats
        if (response && response.unreadCount !== undefined) {
          count = response.unreadCount;
        } else if (typeof response === 'number') {
          count = response;
        } else if (response && response.data && response.data.unreadCount !== undefined) {
          count = response.data.unreadCount;
        } else {
          // Fallback to local calculation
          const donorNotifications = notifications.filter(n => n.status === 'UNREAD');
          count = donorNotifications.length;
        }
      } else if (userInfo.type === 'INSTITUTION') {
        // Use the dedicated unread count API
        const response = await notificationService.getUnreadCount(userInfo.type, userInfo.id);
        console.log('Institution unread count response:', response);
        
        // Handle different response formats
        if (response && response.unreadCount !== undefined) {
          count = response.unreadCount;
        } else if (typeof response === 'number') {
          count = response;
        } else if (response && response.data && response.data.unreadCount !== undefined) {
          count = response.data.unreadCount;
        } else {
          // Fallback to local calculation
          const institutionNotifications = notifications.filter(n => n.status === 'UNREAD');
          count = institutionNotifications.length;
        }
      }
      
      console.log('✅ Setting unreadCount to:', count);
      setUnreadCount(count);
      
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
      
      // Ultimate fallback: Calculate from local notifications
      const localUnread = notifications.filter(n => n.status === 'UNREAD').length;
      console.log('⚠️ Using local fallback unread count:', localUnread);
      setUnreadCount(localUnread);
    }
  };

  const fetchAdminStats = async () => {
    if (!isAdmin) return;
    
    try {
      const stats = await adminNotificationService.getStatistics();
      setAdminStats(stats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!userInfo || !userInfo.id) {
      return;
    }

    try {
      console.log(`📝 Marking notification ${notificationId} as read`);
      
      // Update local state first
      setNotifications(prev =>
        prev.map(notif =>
          notif.notificationId === notificationId
            ? { ...notif, status: 'READ', readAt: new Date().toISOString() }
            : notif
        )
      );
      
      // Update unread count
      if (unreadCount > 0) {
        setUnreadCount(prev => prev - 1);
      }
      
      // Call API based on user type
      if (isAdmin) {
        await adminNotificationService.bulkMarkAsRead([notificationId], userInfo.id);
      } else {
        await notificationService.markAsRead(
          notificationId,
          userInfo.type,
          userInfo.id
        );
      }
      
      console.log('✅ Successfully marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      // Revert on error
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const markAllAsRead = async () => {
    if (!userInfo || !userInfo.id) {
      return;
    }

    try {
      console.log('📝 Marking ALL notifications as read');
      
      // Update local state first
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          status: 'READ',
          readAt: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
      // Call API based on user type
      if (isAdmin) {
        const notificationIds = notifications.map(n => n.notificationId);
        await adminNotificationService.bulkMarkAsRead(notificationIds, userInfo.id);
      } else {
        await notificationService.markAllAsRead(userInfo.type, userInfo.id);
      }
      
      console.log('✅ Successfully marked all as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Revert on error
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const refreshNotifications = () => {
    console.log('🔄 Manually refreshing notifications');
    fetchNotifications();
    fetchUnreadCount();
    if (isAdmin) {
      fetchAdminStats();
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    userInfo,
    isAdmin,
    adminStats,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    fetchNotifications,
    fetchUnreadCount,
    fetchAdminStats
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};