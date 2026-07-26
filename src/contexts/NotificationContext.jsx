import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  isAdmin: false
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

  const isAdmin = userInfo?.type === 'ADMIN';

  // Load user info from localStorage
  const loadUserInfo = useCallback(() => {
    console.log('🔍 Loading user info from localStorage');
    
    try {
      // Check for donor data
      const donorData = localStorage.getItem('donorData');
      if (donorData) {
        const donor = JSON.parse(donorData);
        const userId = donor.donorId || donor.id;
        if (userId) {
          console.log('✅ Found donor:', { id: userId, name: donor.name });
          setUserInfo({
            type: 'DONOR',
            id: userId,
            name: donor.name,
            data: donor
          });
          return;
        }
      }
      
      // Check for institution data
      const institutionData = localStorage.getItem('institutionData');
      if (institutionData) {
        const institution = JSON.parse(institutionData);
        const userId = institution.institutionsId || institution.id;
        if (userId) {
          console.log('✅ Found institution:', { id: userId, name: institution.institutionName });
          setUserInfo({
            type: 'INSTITUTION',
            id: userId,
            name: institution.institutionName,
            data: institution
          });
          return;
        }
      }
      
      // Check for admin data
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        const admin = JSON.parse(adminData);
        const userId = admin.adminId || admin.id;
        if (userId) {
          console.log('✅ Found admin:', { id: userId, name: admin.name });
          setUserInfo({
            type: 'ADMIN',
            id: userId,
            name: admin.name,
            data: admin
          });
          return;
        }
      }
      
      console.log('❌ No valid user found in localStorage');
      setUserInfo(null);
    } catch (error) {
      console.error('Error loading user info:', error);
      setUserInfo(null);
    }
  }, []);

  // Fetch notifications using your API service
  const fetchNotifications = useCallback(async () => {
    console.log('🚀 fetchNotifications called');
    
    if (!userInfo || !userInfo.id) {
      console.log('⛔ No valid userInfo, skipping fetch');
      return;
    }

    setLoading(true);
    
    try {
      let data = [];
      
      if (userInfo.type === 'DONOR') {
        console.log('❤️ Fetching donor notifications for ID:', userInfo.id);
        data = await notificationService.getDonorNotifications(userInfo.id);
      } else if (userInfo.type === 'INSTITUTION') {
        console.log('🏫 Fetching institution notifications for ID:', userInfo.id);
        data = await notificationService.getInstitutionNotifications(userInfo.id);
      } else if (userInfo.type === 'ADMIN') {
        console.log('👑 Fetching admin notifications');
        data = await adminNotificationService.getAllNotifications(0, 50); // Adjust pagination as needed
      } else {
        console.log('❓ Unknown user type:', userInfo.type);
        data = [];
      }
      
      console.log('📦 Notifications received:', data);
      console.log('📦 Is array?', Array.isArray(data));
      console.log('📦 Count:', data?.length);
      
      if (Array.isArray(data)) {
        setNotifications(data);
        
        const unread = data.filter(n => n.status === 'UNREAD').length;
        console.log('📊 Unread count from notifications:', unread);
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  // Fetch unread count using your dedicated API
  const fetchUnreadCount = useCallback(async () => {
    console.log('🔢 fetchUnreadCount called');
    
    if (!userInfo || !userInfo.id) {
      console.log('⛔ No valid userInfo, skipping unread count');
      return;
    }

    try {
      let count = 0;
      
      if (userInfo.type === 'DONOR') {
        console.log('❤️ Fetching donor unread count for ID:', userInfo.id);
        const response = await notificationService.getUnreadCount('DONOR', userInfo.id);
         count = typeof response === 'number' ? response : response?.unreadCount || 0;
      } else if (userInfo.type === 'INSTITUTION') {
        console.log('🏫 Fetching institution unread count for ID:', userInfo.id);
       const response = await notificationService.getUnreadCount('INSTITUTION', userInfo.id);
      count = typeof response === 'number' ? response : response?.unreadCount || 0;
      } else if (userInfo.type === 'ADMIN') {
      console.log('👑 Fetching admin unread count for ID:', userInfo.id);
      
      // 🔥 Call admin unread count API
      const response = await adminNotificationService.getAdminUnreadCount(userInfo.id);
      console.log('Admin unread response:', response);
      
      // Handle response format from getAdminUnreadCount
      if (response && response.unreadCount !== undefined) {
        count = response.unreadCount;
      } else if (typeof response === 'number') {
        count = response;
      } else if (response && response.data && response.data.unreadCount !== undefined) {
        count = response.data.unreadCount;
      } else if (response && response.unreadCount === undefined && response.count !== undefined) {
        count = response.count;
      } else {
        console.warn('⚠️ Unknown admin unread response format:', response);
        count = 0;
      }
    }
      
      console.log('📊 Unread count from API:', count);
      
      // Handle different response formats
      if (typeof count === 'number') {
        setUnreadCount(count);
      } else if (count && typeof count === 'object') {
        setUnreadCount(count.unreadCount || count.count || 0);
      } else {
        setUnreadCount(0);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
      // Don't reset unreadCount on error, keep existing value
    }
  }, [userInfo]);

  const markAsRead = useCallback(async (notificationId) => {
  if (!userInfo || !userInfo.id) {
    console.log('⛔ Cannot mark as read: No user info');
    return false;
  }

  try {
    console.log(`📝 Marking notification ${notificationId} as read for ${userInfo.type} ${userInfo.id}`);
    
    // Update local state immediately (optimistic update)
    setNotifications(prev =>
      prev.map(notif => {
        const notifId = notif.notificationId || notif.id;
        if (notifId === notificationId && notif.status === 'UNREAD') {
          console.log('✅ Optimistically updating notification:', notifId);
          return { ...notif, status: 'READ' };
        }
        return notif;
      })
    );
    
    // Update unread count locally
    setUnreadCount(prev => {
      const newCount = Math.max(0, prev - 1);
      console.log(`📊 Updating unread count from ${prev} to ${newCount}`);
      return newCount;
    });
    
    // Call API
    await notificationService.markAsRead(notificationId, userInfo.type, userInfo.id);
    console.log('✅ API: Successfully marked as read');
    
    // Double-check with server to ensure consistency
    await fetchUnreadCount();
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to mark as read:', error);
    // Revert optimistic update on error
    console.log('🔄 Reverting optimistic update due to error');
    await fetchNotifications(); // This will restore the correct state
    return false;
  }
}, [userInfo, fetchNotifications, fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!userInfo || !userInfo.id) {
      return;
    }

    try {
      console.log('📝 Marking ALL notifications as read');
      
      // Update local state immediately
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, status: 'READ' }))
      );
      
      setUnreadCount(0);
      
      // Call API
      await notificationService.markAllAsRead(userInfo.type, userInfo.id);
      
      console.log('✅ Successfully marked all as read');
      
      // Refresh from server
      await fetchUnreadCount();
      
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Revert on error
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userInfo, fetchNotifications, fetchUnreadCount]);

  const refreshNotifications = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Load user info on mount
  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  // Fetch notifications and unread count when userInfo is ready
  useEffect(() => {
    if (userInfo && userInfo.id) {
      console.log('🔄 UserInfo ready, fetching data for:', userInfo.type, userInfo.id);
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userInfo, fetchNotifications, fetchUnreadCount]);

  // Polling for new notifications (every 30 seconds)
  useEffect(() => {
    if (!userInfo || !userInfo.id) {
      return;
    }
    
    const interval = setInterval(() => {
      console.log('⏰ Polling for new unread count...');
      fetchUnreadCount();
    }, 30000); // 30 seconds
    
    return () => {
      console.log('🧹 Clearing polling interval');
      clearInterval(interval);
    };
  }, [userInfo, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    userInfo,
    isAdmin,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    fetchNotifications,
    fetchUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};