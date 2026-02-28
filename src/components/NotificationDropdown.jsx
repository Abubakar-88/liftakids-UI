import React from 'react';
import { 
  FaTimes, FaCheckCircle, FaExclamationTriangle, 
  FaInfoCircle, FaEnvelope, FaMoneyBillWave,
  FaUserCheck, FaUserTimes, FaBell, FaGraduationCap,
  FaCog, FaUserShield, FaBroadcastTower, FaChartLine
} from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onClose, isAdminView = false }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead
  } = useNotifications();
  
  const { user } = useAuth();

  const handleViewAllNotifications = () => {
    if (!user) {
      navigate('/login');
      onClose();
      return;
    }
    
    const userType = user.type?.toUpperCase();
    
    // Admin gets special admin page
    if (isAdminView && userType === 'ADMIN') {
      navigate('/admin/notifications');
    } else {
      switch (userType) {
        case 'DONOR':
          navigate('/donor/notifications');
          break;
        case 'INSTITUTION':
          navigate('/institution/notifications');
          break;
        case 'ADMIN':
          navigate('/admin/notifications');
          break;
        default:
          navigate('/notifications');
      }
    }
    
    onClose();
  };

  const handleAdminDashboard = () => {
    if (user?.type === 'ADMIN') {
      navigate('/admin/notifications');
      onClose();
    }
  };

  const getUserSpecificText = () => {
    if (!user) return 'View all notifications';
    
    const userType = user.type?.toUpperCase();
    
    if (isAdminView) {
      return 'Go to Admin Dashboard';
    }
    
    switch (userType) {
      case 'DONOR':
        return 'View all donor notifications';
      case 'INSTITUTION':
        return 'View all institution notifications';
      case 'ADMIN':
        return 'View all admin notifications';
      default:
        return 'View all notifications';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'INSTITUTION_APPROVED':
      case 'DONOR_REGISTRATION':
        return <FaUserCheck className="text-green-500" />;
      case 'INSTITUTION_REJECTED':
        return <FaUserTimes className="text-red-500" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        return <FaMoneyBillWave className="text-blue-500" />;
      case 'SPONSORSHIP_CREATED':
      case 'CHILD_SPONSORED':
        return <FaGraduationCap className="text-purple-500" />;
      case 'ADMIN_ALERT':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'INSTITUTION_REGISTRATION':
        return <FaEnvelope className="text-teal-500" />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <FaBroadcastTower className="text-indigo-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'INSTITUTION_APPROVED':
      case 'PAYMENT_RECEIVED':
        return 'bg-green-50 border-green-200';
      case 'INSTITUTION_REJECTED':
      case 'PAYMENT_FAILED':
        return 'bg-red-50 border-red-200';
      case 'SPONSORSHIP_CREATED':
      case 'CHILD_SPONSORED':
        return 'bg-purple-50 border-purple-200';
      case 'ADMIN_ALERT':
        return 'bg-yellow-50 border-yellow-200';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status === 'UNREAD') {
      await markAsRead(notification.notificationId);
    }
    
    if (notification.actionUrl) {
      // Use navigate for SPA navigation
      navigate(notification.actionUrl);
    }
    
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex 
                     justify-between items-center z-10">
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-800">
            {isAdminView ? 'Admin Notifications' : 'Notifications'}
          </h3>
          {isAdminView && (
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
              Admin View
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {notifications.some(n => n.status === 'UNREAD') && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Admin Quick Actions (Only for Admin View) */}
      {isAdminView && user?.type === 'ADMIN' && (
        <div className="p-3 bg-purple-50 border-b border-purple-100">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                navigate('/admin/notifications/send');
                onClose();
              }}
              className="flex-1 px-3 py-2 bg-white text-purple-600 text-xs font-medium rounded-lg 
                       border border-purple-200 hover:bg-purple-50 flex items-center justify-center"
            >
              <FaBroadcastTower className="mr-1" /> Send
            </button>
            <button
              onClick={() => {
                navigate('/admin/notifications/analytics');
                onClose();
              }}
              className="flex-1 px-3 py-2 bg-white text-blue-600 text-xs font-medium rounded-lg 
                       border border-blue-200 hover:bg-blue-50 flex items-center justify-center"
            >
              <FaChartLine className="mr-1" /> Analytics
            </button>
            <button
              onClick={handleAdminDashboard}
              className="flex-1 px-3 py-2 bg-white text-green-600 text-xs font-medium rounded-lg 
                       border border-green-200 hover:bg-green-50 flex items-center justify-center"
            >
              <FaCog className="mr-1" /> Manage
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="p-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaBell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-sm mt-1">
              {isAdminView 
                ? "You'll see system notifications here"
                : "You'll be notified when something arrives"}
            </p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.notificationId}
              onClick={() => handleNotificationClick(notification)}
              className={`
                p-3 mb-2 rounded-lg border cursor-pointer 
                transition-all duration-200 hover:shadow-md
                ${getNotificationColor(notification.type)}
                ${notification.status === 'UNREAD' ? 'border-l-4 border-blue-500' : ''}
              `}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-800 text-sm truncate">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  {/* Additional info for admin */}
                  {isAdminView && notification.userType && (
                    <div className="flex items-center mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {notification.userType}
                      </span>
                      {notification.userName && (
                        <span className="text-xs text-gray-500 ml-2">
                          {notification.userName}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {notification.status === 'UNREAD' && (
                    <div className="flex items-center mt-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                      <span className="text-xs text-blue-600 font-medium">New</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show more indicator */}
      {notifications.length > 5 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing 5 of {notifications.length} notifications
          </p>
        </div>
      )}
      
      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
        <button
          onClick={handleViewAllNotifications}
          className="block w-full text-center text-sm font-medium text-blue-600 
                   hover:text-blue-800 hover:bg-blue-50 py-2 rounded transition-colors"
        >
          {getUserSpecificText()}
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;