// components/NotificationBell.js - Updated version
import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import { useAuth } from '../contexts/AuthContext';

const NotificationBell = () => {
  const { unreadCount, notifications, refreshNotifications } = useNotifications();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const prevCountRef = useRef(0);

  // Force re-render when notifications change
  useEffect(() => {
    console.log('🔔 Bell: Notifications changed, count:', notifications.length);
    setForceUpdate(prev => prev + 1);
  }, [notifications]);

  // Debug log - show all details
  useEffect(() => {
    console.log('🔔 NotificationBell FULL DEBUG:', {
      unreadCount,
      notificationsCount: notifications.length,
      notifications: notifications.slice(0, 3), // Show first 3
      userType: user?.type,
      userId: user?.id
    });
    
    // Log unread notifications
    const unreadNotifications = notifications.filter(n => n.status === 'UNREAD');
    console.log(`📊 Unread notifications: ${unreadNotifications.length}`, unreadNotifications);
    
  }, [unreadCount, notifications, user, forceUpdate]);

  // Animation for new notifications
  useEffect(() => {
    console.log(`🔔 Animation check: prev=${prevCountRef.current}, current=${unreadCount}`);
    
    if (unreadCount > prevCountRef.current) {
      console.log('🎯 New notification! Starting animation...');
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
    
    prevCountRef.current = unreadCount || 0;
  }, [unreadCount]);

  // Manual refresh button for testing
  const handleManualRefresh = () => {
    console.log('🔄 Manually refreshing notifications...');
    refreshNotifications();
  };

  if (!user) {
    return null;
  }

  // Calculate unread count directly from notifications
  const directUnreadCount = notifications.filter(n => n.status === 'UNREAD').length;
  const displayCount = unreadCount || directUnreadCount || 0;
  
  console.log(`🔢 Display Count: context=${unreadCount}, direct=${directUnreadCount}, final=${displayCount}`);

  return (
    <div className="relative">
      {/* Test Button (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleManualRefresh}
          className="absolute -top-8 right-0 text-xs bg-blue-500 text-white px-2 py-1 rounded"
          title="Refresh notifications"
        >
          🔄
        </button>
      )}
      
      <button
        onClick={() => {
          console.log('🔔 Bell clicked, dropdown will show');
          console.log('Current notifications:', notifications);
          setShowDropdown(!showDropdown);
        }}
        className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                   focus:outline-none relative transition-colors duration-200 group"
        aria-label={`Notifications (${displayCount} unread)`}
        title={`${displayCount} unread notifications`}
      >
        <FaBell className="h-5 w-5" />
        
        {/* Unread count badge - Always show if there are notifications */}
        {(displayCount > 0 || notifications.length > 0) && (
          <>
            {/* Ping animation */}
            {isAnimating && (
              <span className="
                absolute -top-1 -right-1 h-5 w-5 rounded-full 
                bg-red-500 animate-ping opacity-75
              " />
            )}
            
            {/* Main badge */}
            <span className={`
              absolute -top-1 -right-1 h-5 w-5 rounded-full 
              ${displayCount > 0 ? 'bg-red-500' : 'bg-gray-400'}
              text-white text-xs flex items-center justify-center
              font-bold border-2 border-white
              transition-all duration-200
              ${displayCount > 0 ? 'scale-100' : 'scale-90'}
            `}>
              {displayCount > 9 ? '9+' : displayCount}
            </span>
            
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block">
              <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {displayCount} unread • {notifications.length} total
              </div>
            </div>
          </>
        )}
        
        {/* If no notifications, show empty state */}
        {notifications.length === 0 && displayCount === 0 && (
          <span className="
            absolute -top-1 -right-1 h-2 w-2 rounded-full 
            bg-gray-300 border border-white
          " />
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg 
                        shadow-xl z-50 border border-gray-200">
            <NotificationDropdown onClose={() => setShowDropdown(false)} />
          </div>
        </>
      )}
      
      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-8 right-0 text-xs text-gray-500 whitespace-nowrap">
          {displayCount} / {notifications.length}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;