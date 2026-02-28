import React, { useState, useEffect } from 'react';
import { 
  FaBell, FaCheckCircle, FaExclamationTriangle, 
  FaEnvelope, FaMoneyBillWave, FaUserCheck, 
  FaUserTimes, FaFilter, FaTrash, FaSync,
  FaUserPlus, FaUserEdit, FaHandHoldingHeart,
  FaHandshake, FaEdit, FaChild, FaChartLine,
  FaExclamationCircle, FaClock, FaShieldAlt,
  FaBullhorn,FaTimes,  FaInfoCircle, FaTimesCircle,
  FaCalendarAlt, FaSchool, FaGraduationCap,
  FaUsers, FaUserCog, FaCog, FaDownload,
  FaPaperPlane, FaBroadcastTower, FaBullseye
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import adminNotificationService from '../../../api/adminNotificationsApi';

const AdminNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    byUserType: {}
  });
  
  // Filters
  const [filter, setFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [userTypeFilter, setUserTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  // Bulk operations
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Modal states
  const [showSendModal, setShowSendModal] = useState(false);
  const [showSystemAnnouncementModal, setShowSystemAnnouncementModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    actionUrl: ''
  });

  const [sendForm, setSendForm] = useState({
    userType: 'DONOR',
    title: '',
    message: '',
    actionUrl: ''
  });

  // Initial fetch
  useEffect(() => {
    if (user && user.type === 'ADMIN') {
      fetchNotifications();
      fetchStatistics();
    }
  }, [user]);
// Admin notification page এর useEffect এ যোগ করুন
useEffect(() => {
  const fetchAdminNotifications = async () => {
    try {
      const response = await adminNotificationService.getAllNotifications(0, 50);
      setNotifications(response.content || []);
      setTotalNotifications(response.totalElements || 0);
      
      // 🔥 IMPORTANT: Share with NotificationBell
      window.dispatchEvent(new CustomEvent('admin-notifications-loaded', {
        detail: { 
          notifications: response.content || [],
          timestamp: new Date().toISOString()
        }
      }));
      
      // Also store in localStorage
      localStorage.setItem('adminPageNotifications', JSON.stringify(response.content || []));
      
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    }
  };
  
  fetchAdminNotifications();
}, []);
  // Apply filters
  useEffect(() => {
    if (notifications.length === 0) {
      setFilteredNotifications([]);
      return;
    }

    let filtered = [...notifications];

    // Status filter
    if (filter === 'UNREAD') {
      filtered = filtered.filter(n => n.status === 'UNREAD');
    } else if (filter === 'READ') {
      filtered = filtered.filter(n => n.status === 'READ');
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // User type filter
    if (userTypeFilter !== 'ALL') {
      filtered = filtered.filter(n => n.userType === userTypeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term) ||
        (n.userName && n.userName.toLowerCase().includes(term)) ||
        n.type.toLowerCase().includes(term)
      );
    }

    // Date range filter
    if (dateRange.startDate) {
      filtered = filtered.filter(n => 
        new Date(n.createdAt) >= new Date(dateRange.startDate)
      );
    }
    if (dateRange.endDate) {
      filtered = filtered.filter(n => 
        new Date(n.createdAt) <= new Date(dateRange.endDate)
      );
    }

    // Pagination
    const startIdx = page * pageSize;
    const endIdx = startIdx + pageSize;
    const paginated = filtered.slice(startIdx, endIdx);
    
    setFilteredNotifications(paginated);
    setTotalPages(Math.ceil(filtered.length / pageSize));
  }, [notifications, filter, typeFilter, userTypeFilter, searchTerm, dateRange, page]);

  const fetchNotifications = async () => {
  setLoading(true);
  try {
    const response = await adminNotificationService.getAllNotifications(page, pageSize);
    
    console.log('API Response:', response); // Debug log
    
    // Spring Page response structure:
    // {
    //   "content": [...], // Array of notifications
    //   "pageable": {...},
    //   "totalElements": number,
    //   "totalPages": number,
    //   "last": boolean,
    //   "size": number,
    //   "number": number,
    //   "sort": {...},
    //   "first": boolean,
    //   "numberOfElements": number,
    //   "empty": boolean
    // }
    
    if (response && Array.isArray(response.content)) {
      setNotifications(response.content);
      
      // Update pagination info
      if (response.totalPages !== undefined) {
        setTotalPages(response.totalPages);
      }
      if (response.totalElements !== undefined) {
        setStats(prev => ({ ...prev, total: response.totalElements }));
      }
    } else {
      setNotifications([]);
      console.warn('Unexpected response format:', response);
    }
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Check if it's a 400 Bad Request
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
    
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};
//   const fetchNotifications = async () => {
//     setLoading(true);
//     try {
//       const response = await adminNotificationService.getAllNotifications(page, pageSize);
//       setNotifications(response.content || response.notifications || response);
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       setNotifications([]);
//     } finally {
//       setLoading(false);
//     }
//   };

  const fetchStatistics = async () => {
    try {
      const response = await adminNotificationService.getStatistics();
      setStats(response);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await adminNotificationService.bulkMarkAsRead(selectedNotifications, user.id);
      await fetchNotifications();
      setSelectedNotifications([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk marking as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedNotifications.length} notifications?`)) {
      return;
    }
    
    try {
      await adminNotificationService.bulkDelete(selectedNotifications, user.id);
      await fetchNotifications();
      setSelectedNotifications([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  const handleSendSystemAnnouncement = async () => {
    try {
      await adminNotificationService.sendSystemAnnouncement(
        announcementForm.title,
        announcementForm.message,
        announcementForm.actionUrl,
        user.id
      );
      
      setShowSystemAnnouncementModal(false);
      setAnnouncementForm({ title: '', message: '', actionUrl: '' });
      await fetchNotifications();
      alert('System announcement sent successfully!');
    } catch (error) {
      console.error('Error sending system announcement:', error);
      alert('Failed to send system announcement');
    }
  };

  const handleSendToUserType = async () => {
    try {
      await adminNotificationService.sendToUserType(
        sendForm.userType,
        sendForm.title,
        sendForm.message,
        sendForm.actionUrl,
        user.id
      );
      
      setShowSendModal(false);
      setSendForm({ userType: 'DONOR', title: '', message: '', actionUrl: '' });
      await fetchNotifications();
      alert(`Notification sent to all ${sendForm.userType}s successfully!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const handleClearOldNotifications = async () => {
    const days = prompt('Clear notifications older than how many days?', '30');
    if (!days || isNaN(days)) return;
    
    if (!window.confirm(`Clear notifications older than ${days} days?`)) {
      return;
    }
    
    try {
      await adminNotificationService.clearOldNotifications(parseInt(days), user.id);
      await fetchNotifications();
      alert('Old notifications cleared successfully!');
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      alert('Failed to clear old notifications');
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminNotificationService.exportNotifications({
        userType: userTypeFilter !== 'ALL' ? userTypeFilter : null,
        notificationType: typeFilter !== 'ALL' ? typeFilter : null,
        status: filter !== 'ALL' ? filter : null,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        searchTerm: searchTerm || null
      });
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting notifications:', error);
      alert('Failed to export notifications');
    }
  };

  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const selectAllOnPage = () => {
    const pageIds = filteredNotifications.map(n => n.notificationId);
    setSelectedNotifications(pageIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  // Get unique values for filters
  const notificationTypes = notifications && Array.isArray(notifications) 
  ? [...new Set(notifications.map(n => n.type))] 
  : [];

const userTypes = notifications && Array.isArray(notifications)
  ? [...new Set(notifications.map(n => n.userType).filter(Boolean))]
  : [];
//   const notificationTypes = [...new Set(notifications.map(n => n.type))];
//   const userTypes = [...new Set(notifications.map(n => n.userType).filter(Boolean))];

  // Helper functions (same as before but enhanced)
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'INSTITUTION_REGISTRATION':
        return <FaEnvelope className="text-teal-500 text-xl" />;
      case 'INSTITUTION_APPROVED':
        return <FaUserCheck className="text-green-500 text-xl" />;
      case 'INSTITUTION_REJECTED':
        return <FaUserTimes className="text-red-500 text-xl" />;
      case 'INSTITUTION_SUSPENDED':
        return <FaExclamationTriangle className="text-orange-500 text-xl" />;
      case 'DONOR_REGISTRATION':
        return <FaUserPlus className="text-green-500 text-xl" />;
      case 'PAYMENT_RECEIVED':
      case 'DONOR_PAYMENT_SUCCESS':
        return <FaMoneyBillWave className="text-green-500 text-xl" />;
      case 'DONOR_PAYMENT_FAILED':
        return <FaMoneyBillWave className="text-red-500 text-xl" />;
      case 'SPONSORSHIP_CREATED':
        return <FaHandshake className="text-blue-500 text-xl" />;
      case 'CHILD_SPONSORED':
        return <FaChild className="text-pink-500 text-xl" />;
      case 'ADMIN_ALERT':
        return <FaShieldAlt className="text-purple-500 text-xl" />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <FaBullhorn className="text-blue-500 text-xl" />;
      default:
        return <FaBell className="text-gray-500 text-xl" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'INSTITUTION_APPROVED':
      case 'DONOR_REGISTRATION':
      case 'PAYMENT_RECEIVED':
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      case 'INSTITUTION_REJECTED':
      case 'DONOR_PAYMENT_FAILED':
      case 'ERROR':
        return 'bg-red-50 border-red-200';
      case 'INSTITUTION_SUSPENDED':
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'ADMIN_ALERT':
        return 'bg-purple-50 border-purple-200';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case 'DONOR':
        return <FaHandHoldingHeart className="text-blue-500" />;
      case 'INSTITUTION':
        return <FaSchool className="text-green-500" />;
      case 'ADMIN':
        return <FaUserCog className="text-purple-500" />;
      default:
        return <FaUsers className="text-gray-500" />;
    }
  };

  if (!user || user.type !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Admin Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <FaBell className="mr-3 text-blue-500" />
                Admin Notifications
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                  {stats.total} total
                </span>
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and monitor all system notifications
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowSystemAnnouncementModal(true)}
                className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 
                         flex items-center transition-colors"
              >
                <FaBroadcastTower className="mr-2" /> System Announcement
              </button>
              <button
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 
                         flex items-center transition-colors"
              >
                <FaPaperPlane className="mr-2" /> Send Notification
              </button>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 
                         flex items-center transition-colors"
              >
                <FaSync className="mr-2" /> Refresh
              </button>
            </div>
          </div>

          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800 font-medium">Total</div>
              <div className="flex items-center mt-2">
                <FaBell className="text-blue-400 mr-2" />
                <span className="text-xs text-blue-600">All notifications</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{stats.unread}</div>
              <div className="text-sm text-yellow-800 font-medium">Unread</div>
              <div className="flex items-center mt-2">
                <FaExclamationCircle className="text-yellow-400 mr-2" />
                <span className="text-xs text-yellow-600">Need attention</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600">{stats.read}</div>
              <div className="text-sm text-green-800 font-medium">Read</div>
              <div className="flex items-center mt-2">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span className="text-xs text-green-600">Already viewed</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">
                {notificationTypes.length}
              </div>
              <div className="text-sm text-purple-800 font-medium">Notification Types</div>
              <div className="flex items-center mt-2">
                <FaFilter className="text-purple-400 mr-2" />
                <span className="text-xs text-purple-600">Different categories</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
              <div className="text-3xl font-bold text-teal-600">
                {userTypes.length}
              </div>
              <div className="text-sm text-teal-800 font-medium">User Types</div>
              <div className="flex items-center mt-2">
                <FaUsers className="text-teal-400 mr-2" />
                <span className="text-xs text-teal-600">Different users</span>
              </div>
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowStatsModal(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                       flex items-center transition-colors"
            >
              <FaChartLine className="mr-2" /> View Analytics
            </button>
            <button
              onClick={handleClearOldNotifications}
              className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 
                       flex items-center transition-colors"
            >
              <FaTrash className="mr-2" /> Clear Old
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 
                       flex items-center transition-colors"
            >
              <FaDownload className="mr-2" /> Export
            </button>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 
                       flex items-center transition-colors"
            >
              <FaCog className="mr-2" /> Bulk Actions
            </button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-yellow-800 flex items-center">
                  <FaCog className="mr-2" /> Bulk Actions
                </h3>
                <p className="text-sm text-yellow-600">
                  {selectedNotifications.length} notifications selected
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={selectAllOnPage}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 
                           text-sm font-medium"
                >
                  Select All on Page
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                           text-sm font-medium"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkMarkAsRead}
                  disabled={selectedNotifications.length === 0}
                  className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 
                           disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Mark Selected as Read
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedNotifications.length === 0}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 
                           disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section (Enhanced for Admin) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Filters & Search</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search notifications..."
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
                Notification Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            {/* User Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Users</option>
                {userTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('ALL');
                  setTypeFilter('ALL');
                  setUserTypeFilter('ALL');
                  setSearchTerm('');
                  setDateRange({ startDate: null, endDate: null });
                  setPage(0);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 w-full"
              >
                Clear All Filters
              </button>
            </div>
          </div>
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
                {searchTerm || filter !== 'ALL' || typeFilter !== 'ALL' || userTypeFilter !== 'ALL'
                  ? "No notifications match your current filters"
                  : "No notifications in the system yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                    {selectedNotifications.length > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({selectedNotifications.length} selected)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Page {page + 1} of {totalPages}
                  </div>
                </div>
              </div>
              
              {filteredNotifications.map((notification) => {
                const colors = getNotificationColor(notification.type);
                const isSelected = selectedNotifications.includes(notification.notificationId);
                
                return (
                  <div
                    key={notification.notificationId}
                    className={`p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      {/* Checkbox for selection */}
                      <div className="mr-3 mt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectNotification(notification.notificationId)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Icon */}
                      <div className="mr-4 flex-shrink-0">
                        <div className={`p-3 rounded-lg ${colors.replace('border', 'bg').split(' ')[0]}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              {/* User Type Badge */}
                              {notification.userType && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center">
                                  {getUserTypeIcon(notification.userType)}
                                  <span className="ml-1">{notification.userType}</span>
                                </span>
                              )}
                              
                              {/* Status Badge */}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                notification.status === 'UNREAD' 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notification.status}
                              </span>
                              
                              {/* Type Badge */}
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {notification.type.replace(/_/g, ' ')}
                              </span>
                              
                              {/* Date */}
                              <span className="text-xs text-gray-500">
                                {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {notification.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{notification.message}</p>
                        
                        {/* Additional Info for Admin */}
                        <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-500">
                          {notification.userId && (
                            <span>User ID: {notification.userId}</span>
                          )}
                          {notification.userName && (
                            <span>User: {notification.userName}</span>
                          )}
                          {notification.relatedEntityType && notification.relatedEntityId && (
                            <span>
                              {notification.relatedEntityType}: #{notification.relatedEntityId}
                            </span>
                          )}
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Details →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                      disabled={page === 0}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-2">
                      {[...Array(totalPages).keys()].map(p => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1 rounded-lg ${
                            page === p
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {p + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                      disabled={page === totalPages - 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* System Announcement Modal */}
      {showSystemAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaBroadcastTower className="mr-3 text-indigo-500" />
                  System Announcement
                </h3>
                <button
                  onClick={() => setShowSystemAnnouncementModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter announcement title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter announcement message"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={announcementForm.actionUrl}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, actionUrl: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/action"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSystemAnnouncementModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendSystemAnnouncement}
                  disabled={!announcementForm.title || !announcementForm.message}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send to All Users
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaPaperPlane className="mr-3 text-green-500" />
                  Send Notification
                </h3>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send to User Type *
                  </label>
                  <select
                    value={sendForm.userType}
                    onChange={(e) => setSendForm(prev => ({ ...prev, userType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="DONOR">All Donors</option>
                    <option value="INSTITUTION">All Institutions</option>
                    <option value="ADMIN">All Admins</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={sendForm.title}
                    onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter notification title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={sendForm.message}
                    onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter notification message"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={sendForm.actionUrl}
                    onChange={(e) => setSendForm(prev => ({ ...prev, actionUrl: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://example.com/action"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToUserType}
                  disabled={!sendForm.title || !sendForm.message}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats/Modal (simplified for now) */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaChartLine className="mr-3 text-blue-500" />
                  Notification Analytics
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-blue-800">Total</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.unread}</div>
                    <div className="text-sm text-yellow-800">Unread</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.read}</div>
                    <div className="text-sm text-green-800">Read</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(stats.byUserType || {}).length}
                    </div>
                    <div className="text-sm text-purple-800">User Types</div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Distribution by User Type</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.byUserType || {}).map(([userType, count]) => (
                      <div key={userType} className="flex items-center justify-between">
                        <span className="text-gray-600">{userType}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;