import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, FaCheckCircle, FaExclamationTriangle, 
  FaEnvelope, FaMoneyBillWave, FaUserCheck, 
  FaUserTimes, FaFilter, FaSync,
  FaUserPlus, FaUserEdit, FaHandHoldingHeart,
  FaHandshake, FaEdit, FaChild, FaChartLine,
  FaExclamationCircle, FaClock, FaShieldAlt,
  FaBullhorn, FaInfoCircle, FaTimesCircle,
  FaCalendarAlt, FaSchool, FaGraduationCap,
  FaUsers, FaDonate, FaHeart, FaUserShield,
  FaHome, FaTimes
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

// Notification Details Modal Component
const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Notification Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-full">
              {notification.type === 'PAYMENT_RECEIVED' && <FaMoneyBillWave className="text-green-500" />}
              {notification.type === 'SPONSORSHIP_CREATED' && <FaHandshake className="text-blue-500" />}
              {notification.type === 'INSTITUTION_APPROVED' && <FaUserCheck className="text-green-500" />}
              {notification.type === 'ADMIN_MESSAGE' && <FaUserShield className="text-orange-500" />}
              {!['PAYMENT_RECEIVED','SPONSORSHIP_CREATED','INSTITUTION_APPROVED','ADMIN_MESSAGE'].includes(notification.type) && <FaBell className="text-gray-500" />}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{notification.title}</h4>
              <p className="text-sm text-gray-500">
                {format(new Date(notification.createdAt), 'PPPpp')}
              </p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{notification.message}</p>
          </div>
          {notification.relatedEntityType && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Related:</strong> {notification.relatedEntityType} #{notification.relatedEntityId}
              </p>
              {notification.relatedEntityName && (
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {notification.relatedEntityName}
                </p>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserNotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Check authentication and redirect admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.type === 'ADMIN') {
      navigate('/admin/notifications');
      return;
    }
    
    if (!['DONOR', 'INSTITUTION'].includes(user.type)) {
      navigate('/notifications');
    }
  }, [user, navigate]);

  
 // ============================================================
// 🔥 Custom Notification Click Handler (Final)
// ============================================================
const handleNotificationClick = async (notification) => {
  // Mark as read if unread
  if (notification.status === 'UNREAD') {
    await markAsRead(notification.notificationId || notification.id);
  }

  // If notification is expired, do nothing
  if (notification.expired) {
    return;
  }

  const userType = user?.type?.toUpperCase();
  const type = notification.type;
  const donorId = user?.id || user?.donorId; // Get donor ID from user object

  // ----- Institution User -----
  if (userType === 'INSTITUTION') {
    // Payment related → redirect to payment confirmation
    if (type === 'PENDING_PAYMENT' || type === 'PAYMENT_CONFIRMED' || type === 'NEW_DONATION') {
      navigate('/institution/payment-confirmation');
      return;
    }
    // Sponsorship related → redirect to sponsored students
    if (type === 'SPONSORSHIP_CREATED' || type === 'STUDENT_SPONSORED' || type === 'PAYMENT_COMPLETED') {
      navigate('/institution/sponsored-students');
      return;
    }
    // Admin messages, registration, etc. → show details modal
    setSelectedNotification(notification);
    setShowDetailModal(true);
    return;
  }

  // ----- Donor User -----
  if (userType === 'DONOR') {
    // Sponsorship created (pending payment) → go to sponsored students list (pending tab)
    if (type === 'SPONSORSHIP_CREATED' || type === 'PENDING_PAYMENT') {
      navigate('/donor/sponsored-students');
      return;
    }
    // Payment received / success → go to payment history with donor ID
    if (type === 'PAYMENT_RECEIVED' || type === 'PAYMENT_SUCCESS' || type === 'PAYMENT_CONFIRMED') {
      if (donorId) {
        navigate(`/donor/sponsored-students/${donorId}/payments`);
      } else {
        // Fallback if donorId not found
        navigate('/donor/sponsored-students');
      }
      return;
    }
    // Other notifications → show details modal
    setSelectedNotification(notification);
    setShowDetailModal(true);
    return;
  }

  // Fallback: show details modal for any other case
  setSelectedNotification(notification);
  setShowDetailModal(true);
};
  // ============================================================

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'UNREAD' && notif.status !== 'UNREAD') return false;
    if (filter === 'READ' && notif.status !== 'READ') return false;
    
    if (typeFilter !== 'ALL' && notif.type !== typeFilter) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        notif.title?.toLowerCase().includes(term) ||
        notif.message?.toLowerCase().includes(term) ||
        notif.type?.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Get unique notification types
  const notificationTypes = [...new Set(notifications.map(n => n.type))];

  // Get user-specific data
  const getUserSpecificData = () => {
    if (!user) return { title: 'Notifications', subtitle: '' };
    
    switch(user.type) {
      case 'DONOR':
        return {
          title: 'Donor Notifications',
          subtitle: `Welcome ${user.name || 'Donor'}`,
          icon: <FaHeart className="text-red-500 text-2xl" />,
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          userTypeText: 'Donor',
          dashboardLink: '/donor/dashboard'
        };
      case 'INSTITUTION':
        return {
          title: 'Institution Notifications',
          subtitle: user.data?.institutionName || 'Your Institution',
          icon: <FaSchool className="text-blue-500 text-2xl" />,
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          userTypeText: 'Institution',
          dashboardLink: '/institution/dashboard'
        };
      default:
        return {
          title: 'Notifications',
          subtitle: '',
          icon: <FaBell className="text-gray-500 text-2xl" />,
          bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          userTypeText: 'User',
          dashboardLink: '/dashboard'
        };
    }
  };

  // Get icon based on type
  const getNotificationIcon = (type) => {
    const commonIcons = {
      'SUCCESS': <FaCheckCircle className="text-green-500 text-xl" />,
      'ERROR': <FaTimesCircle className="text-red-500 text-xl" />,
      'WARNING': <FaExclamationTriangle className="text-yellow-500 text-xl" />,
      'INFO': <FaInfoCircle className="text-blue-500 text-xl" />
    };

    const donorIcons = {
      'DONOR_REGISTRATION': <FaUserPlus className="text-green-500 text-xl" />,
      'DONOR_APPROVED': <FaUserCheck className="text-green-500 text-xl" />,
      'DONOR_REJECTED': <FaUserTimes className="text-red-500 text-xl" />,
      'DONOR_PAYMENT_SUCCESS': <FaMoneyBillWave className="text-green-500 text-xl" />,
      'DONOR_PAYMENT_FAILED': <FaMoneyBillWave className="text-red-500 text-xl" />,
      'SPONSORSHIP_CREATED': <FaHandshake className="text-blue-500 text-xl" />,
      'SPONSORSHIP_UPDATED': <FaEdit className="text-yellow-500 text-xl" />,
      'SPONSORSHIP_COMPLETED': <FaCheckCircle className="text-green-500 text-xl" />,
      'CHILD_SPONSORED': <FaChild className="text-pink-500 text-xl" />,
      'CHILD_PROGRESS_UPDATE': <FaChartLine className="text-teal-500 text-xl" />,
      'CHILD_NEED_UPDATE': <FaExclamationCircle className="text-orange-500 text-xl" />,
      'PAYMENT_RECEIVED': <FaDonate className="text-green-500 text-xl" />,
      'PAYMENT_DUE': <FaClock className="text-yellow-500 text-xl" />,
      'PAYMENT_OVERDUE': <FaExclamationTriangle className="text-red-500 text-xl" />
    };

    const institutionIcons = {
      'INSTITUTION_REGISTRATION': <FaEnvelope className="text-teal-500 text-xl" />,
      'INSTITUTION_APPROVED': <FaUserCheck className="text-green-500 text-xl" />,
      'INSTITUTION_REJECTED': <FaUserTimes className="text-red-500 text-xl" />,
      'INSTITUTION_SUSPENDED': <FaExclamationTriangle className="text-orange-500 text-xl" />,
      'INSTITUTION_PROFILE_UPDATE': <FaUserEdit className="text-blue-500 text-xl" />,
      'PAYMENT_RECEIVED': <FaMoneyBillWave className="text-green-500 text-xl" />,
      'NEW_DONATION': <FaDonate className="text-yellow-500 text-xl" />,
      'CHILD_ENROLLED': <FaUsers className="text-purple-500 text-xl" />,
      'CHILD_ATTENDANCE_UPDATE': <FaChartLine className="text-teal-500 text-xl" />,
      'MONTHLY_REPORT_READY': <FaCalendarAlt className="text-indigo-500 text-xl" />,
      'ADMIN_MESSAGE': <FaUserShield className="text-orange-500 text-xl" />,
      'SYSTEM_ANNOUNCEMENT': <FaBullhorn className="text-blue-500 text-xl" />
    };

    if (user?.type === 'DONOR') {
      return donorIcons[type] || commonIcons[type] || <FaHeart className="text-gray-500 text-xl" />;
    }
    
    if (user?.type === 'INSTITUTION') {
      return institutionIcons[type] || commonIcons[type] || <FaSchool className="text-gray-500 text-xl" />;
    }

    return commonIcons[type] || <FaBell className="text-gray-500 text-xl" />;
  };

  // Get color based on type
  const getNotificationColor = (type) => {
    const successTypes = [
      'DONOR_REGISTRATION', 'DONOR_APPROVED', 'DONOR_PAYMENT_SUCCESS',
      'INSTITUTION_APPROVED', 'PAYMENT_RECEIVED', 'NEW_DONATION',
      'SPONSORSHIP_CREATED', 'SPONSORSHIP_COMPLETED', 'CHILD_SPONSORED', 
      'SUCCESS'
    ];
    
    const errorTypes = [
      'DONOR_PAYMENT_FAILED', 'DONOR_REJECTED', 'INSTITUTION_REJECTED',
      'PAYMENT_OVERDUE', 'ERROR'
    ];
    
    const warningTypes = [
      'INSTITUTION_SUSPENDED', 'PAYMENT_DUE', 'WARNING',
      'CHILD_NEED_UPDATE'
    ];

    if (successTypes.includes(type)) {
      return 'bg-green-50 border-green-200 hover:bg-green-100';
    }
    if (errorTypes.includes(type)) {
      return 'bg-red-50 border-red-200 hover:bg-red-100';
    }
    if (warningTypes.includes(type)) {
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    }
    
    return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
  };

  // Get type display text
  const getNotificationTypeText = (type) => {
    const typeMap = {
      'DONOR_REGISTRATION': 'Registration Complete',
      'DONOR_APPROVED': 'Account Approved',
      'DONOR_REJECTED': 'Registration Rejected',
      'DONOR_PAYMENT_SUCCESS': 'Payment Successful',
      'DONOR_PAYMENT_FAILED': 'Payment Failed',
      'SPONSORSHIP_CREATED': 'Sponsorship Started',
      'SPONSORSHIP_UPDATED': 'Sponsorship Updated',
      'SPONSORSHIP_COMPLETED': 'Sponsorship Completed',
      'CHILD_SPONSORED': 'Child Sponsored',
      'CHILD_PROGRESS_UPDATE': 'Progress Update',
      'CHILD_NEED_UPDATE': 'Needs Update',
      'PAYMENT_RECEIVED': 'Payment Received',
      'PAYMENT_DUE': 'Payment Due',
      'PAYMENT_OVERDUE': 'Payment Overdue',
      
      'INSTITUTION_REGISTRATION': 'Registration',
      'INSTITUTION_APPROVED': 'Account Approved',
      'INSTITUTION_REJECTED': 'Registration Rejected',
      'INSTITUTION_SUSPENDED': 'Account Suspended',
      'INSTITUTION_PROFILE_UPDATE': 'Profile Updated',
      'NEW_DONATION': 'New Donation',
      'CHILD_ENROLLED': 'New Student',
      'CHILD_ATTENDANCE_UPDATE': 'Attendance Update',
      'MONTHLY_REPORT_READY': 'Report Ready',
      'ADMIN_MESSAGE': 'Admin Message',
      'SYSTEM_ANNOUNCEMENT': 'System Announcement',
      
      'SUCCESS': 'Success',
      'ERROR': 'Error',
      'WARNING': 'Warning',
      'INFO': 'Information'
    };
    
    return typeMap[type] || type.replace(/_/g, ' ');
  };

  // Get user-specific stats
  const getUserStats = () => {
    const unread = notifications.filter(n => n.status === 'UNREAD').length;
    const read = notifications.filter(n => n.status === 'READ').length;
    const today = notifications.filter(n => {
      const notifDate = new Date(n.createdAt);
      const today = new Date();
      return notifDate.toDateString() === today.toDateString();
    }).length;

    return { unread, read, today };
  };

  if (!user || !['DONOR', 'INSTITUTION'].includes(user.type)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <FaBell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userData = getUserSpecificData();
  const stats = getUserStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`rounded-xl shadow-lg p-6 mb-6 border ${userData.bgColor} ${userData.borderColor}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="p-4 bg-white rounded-xl shadow-sm mr-4">
                {userData.icon}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {userData.title}
                </h1>
                <p className="text-gray-600 mt-1">{userData.subtitle}</p>
                <div className="flex items-center mt-2">
                  <span className="px-3 py-1 bg-white text-gray-600 text-sm rounded-full border">
                    {userData.userTypeText}
                  </span>
                  <button
                    onClick={() => navigate(userData.dashboardLink)}
                    className="ml-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FaHome className="mr-1" /> Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={refreshNotifications}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 
                         border border-blue-200 flex items-center transition-colors"
              >
                <FaSync className="mr-2" /> Refresh
              </button>
              <button
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                <FaCheckCircle className="mr-2" /> Mark all as read
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total Notifications</div>
              <div className="flex items-center mt-2">
                <FaBell className="text-blue-400 mr-2" />
                <span className="text-xs text-gray-500">All notifications</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-3xl font-bold text-yellow-600">{stats.unread}</div>
              <div className="text-sm text-gray-600">Unread</div>
              <div className="flex items-center mt-2">
                <FaExclamationCircle className="text-yellow-400 mr-2" />
                <span className="text-xs text-gray-500">Need attention</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-3xl font-bold text-green-600">{stats.read}</div>
              <div className="text-sm text-gray-600">Read</div>
              <div className="flex items-center mt-2">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span className="text-xs text-gray-500">Already viewed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Notifications
              </label>
              <input
                type="text"
                placeholder="Search by title or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex space-x-2">
                {['ALL', 'UNREAD', 'READ'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg flex-1 ${
                      filter === status
                        ? status === 'ALL' ? 'bg-gray-800 text-white' 
                          : status === 'UNREAD' ? 'bg-yellow-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {getNotificationTypeText(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active Filters */}
          {(filter !== 'ALL' || typeFilter !== 'ALL' || searchTerm) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filter !== 'ALL' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                    Status: {filter}
                  </span>
                )}
                {typeFilter !== 'ALL' && (
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                    Type: {getNotificationTypeText(typeFilter)}
                  </span>
                )}
                {searchTerm && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-sm rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setFilter('ALL');
                    setTypeFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <FaBell className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700">No notifications found</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                {searchTerm 
                  ? `No notifications match your search for "${searchTerm}"`
                  : filter !== 'ALL'
                  ? `You don't have any ${filter.toLowerCase()} notifications`
                  : "You're all caught up! No notifications at the moment."}
              </p>
              {(searchTerm || filter !== 'ALL' || typeFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setFilter('ALL');
                    setTypeFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Clear filters and show all
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                  </div>
                  <div className="text-sm text-gray-600">
                    Sorted by: <span className="font-medium">Newest first</span>
                  </div>
                </div>
              </div>
              
              {filteredNotifications.map((notification, index) => {
                const colors = getNotificationColor(notification.type);
                // Check if notification is expired (you may have a field, if not, we can skip)
                const isExpired = notification.expired || false;
                
                return (
                  <div
                    key={notification.notificationId || notification.id || index}
                    onClick={() => {
                      if (!isExpired) {
                        handleNotificationClick(notification);
                      }
                    }}
                    className={`p-6 transition-all duration-200 ${colors} ${
                      notification.status === 'UNREAD' ? 'border-l-4 border-blue-500' : ''
                    } ${isExpired ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start">
                      {/* Icon */}
                      <div className="mr-4 flex-shrink-0">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                notification.status === 'UNREAD' 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notification.status}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {getNotificationTypeText(notification.type)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(notification.createdAt), 'MMM dd, yyyy')}
                              </span>
                              {isExpired && (
                                <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                  Expired
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {notification.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            {notification.status === 'UNREAD' && !isExpired && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.notificationId || notification.id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{notification.message}</p>
                        
                        {/* Related info */}
                        {(notification.relatedEntityType || notification.actionUrl) && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {notification.relatedEntityType && notification.relatedEntityId && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {notification.relatedEntityType}: #{notification.relatedEntityId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notification Details Modal */}
      {showDetailModal && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedNotification(null);
          }}
        />
      )}
    </div>
  );
};

export default UserNotificationsPage;