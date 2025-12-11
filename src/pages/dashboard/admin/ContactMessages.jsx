import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import EmailSender from '../../../components/EmailSender';
import {
  getContactMessages,
  getContactStats,
  markAsRead,
  markAsUnread,
  deleteMessage,
  replyToMessage,
  bulkMarkAsRead,
  getSentEmails,
  getSentEmailStats
} from '../../../api/contactApi';

const ContactMessages = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [replyingToMessage, setReplyingToMessage] = useState(null); // FIXED: Separate state for reply
  const [selectedSentEmail, setSelectedSentEmail] = useState(null);
  const [stats, setStats] = useState(null);
  const [sentEmailStats, setSentEmailStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [expandedMessages, setExpandedMessages] = useState(new Set());

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
      loadStats();
    } else {
      loadSentEmails();
      loadSentEmailStats();
    }
  }, [activeTab, currentPage]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages(currentPage, 10);
      setMessages(data.messages);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadSentEmails = async () => {
    try {
      setLoading(true);
      const data = await getSentEmails();
      setSentEmails(data);
    } catch (error) {
      console.error('Error loading sent emails:', error);
      toast.error('Failed to load sent emails');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getContactStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSentEmailStats = async () => {
    try {
      const data = await getSentEmailStats();
      setSentEmailStats(data);
    } catch (error) {
      console.error('Error loading sent email stats:', error);
    }
  };

  const handleSendEmail = (email) => {
    setSelectedEmail(email);
    setShowEmailModal(true);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success('Marked as read');
      loadMessages();
      loadStats();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await markAsUnread(id);
      toast.success('Marked as unread');
      loadMessages();
      loadStats();
    } catch (error) {
      toast.error('Failed to mark as unread');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id);
        toast.success('Message deleted');
        loadMessages();
        loadStats();
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const handleReply = async (message) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setReplying(true);
    try {
      await replyToMessage(message.id, {
        replyMessage: replyText,
        copyToAdmin: true
      });
      toast.success('Reply sent successfully');
      setReplyText('');
      setReplyingToMessage(null); // FIXED: Close reply section after sending
      loadMessages();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  // FIXED: Proper reply handler
  const handleStartReply = (message) => {
    setReplyingToMessage(message.id);
    setReplyText(''); // Clear previous reply text
    // Auto-expand the message when replying
    if (!expandedMessages.has(message.id)) {
      setExpandedMessages(prev => new Set(prev).add(message.id));
    }
  };

  // FIXED: Cancel reply handler
  const handleCancelReply = () => {
    setReplyingToMessage(null);
    setReplyText('');
  };

  const handleBulkMarkAsRead = async () => {
    const unreadIds = messages.filter(msg => !msg.read).map(msg => msg.id);
    if (unreadIds.length === 0) {
      toast.info('No unread messages');
      return;
    }

    try {
      await bulkMarkAsRead(unreadIds);
      toast.success(`Marked ${unreadIds.length} messages as read`);
      loadMessages();
      loadStats();
    } catch (error) {
      toast.error('Failed to mark messages as read');
    }
  };

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
        // Also close reply if collapsing
        if (replyingToMessage === messageId) {
          setReplyingToMessage(null);
          setReplyText('');
        }
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && activeTab === 'messages' && messages.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600">Manage contact messages and sent emails</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          {activeTab === 'messages' && (
            <button
              onClick={handleBulkMarkAsRead}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark All Read
            </button>
          )}
          
          <button
            onClick={() => {
              setSelectedEmail('');
              setShowEmailModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Email
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('messages')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contact Messages
            {stats && (
              <span className="ml-2 py-0.5 px-2 text-xs bg-gray-200 rounded-full">
                {stats.totalMessages}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('sent-emails')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sent-emails'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sent Emails
            {sentEmailStats && (
              <span className="ml-2 py-0.5 px-2 text-xs bg-gray-200 rounded-full">
                {sentEmailStats.totalSent}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Stats Overview */}
      {activeTab === 'messages' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats cards - unchanged */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.readMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayMessages}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'messages' ? (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Contact Messages</h3>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                <p className="mt-1 text-sm text-gray-500">Contact form submissions will appear here.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {messages.map((message) => {
                    const isExpanded = expandedMessages.has(message.id);
                    const hasReply = message.adminReply;
                    const isReplying = replyingToMessage === message.id; // FIXED: Check if this message is being replied to

                    return (
                      <div key={message.id} className={`p-6 hover:bg-gray-50 ${!message.read ? 'bg-blue-50' : ''}`}>
                        {/* Message Header - Always Visible */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 
                                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                                onClick={() => toggleMessageExpansion(message.id)}
                              >
                                {message.name}
                              </h4>
                              {!message.read && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                              {hasReply && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Replied
                                </span>
                              )}
                              {isReplying && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Replying...
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Email:</strong> {message.email} | <strong>Phone:</strong> {message.phone || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Subject:</strong> {message.subject}
                            </p>
                            <p className="text-xs text-gray-500">
                              Received: {formatDate(message.createdAt || message.submittedAt)}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            {/* Email Button */}
                            <button
                              onClick={() => handleSendEmail(message.email)}
                              className="text-indigo-600 hover:text-indigo-800 p-1 rounded"
                              title={`Send email to ${message.name}`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>

                            {/* Reply Button */}
                            <button
                              onClick={() => handleStartReply(message)}
                              className={`p-1 rounded ${
                                isReplying 
                                  ? 'text-yellow-600 bg-yellow-100' 
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                              title="Reply to message"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>

                            {/* Read/Unread Toggle */}
                            {message.read ? (
                              <button
                                onClick={() => handleMarkAsUnread(message.id)}
                                className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                                title="Mark as unread"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleMarkAsRead(message.id)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                title="Mark as read"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(message.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                              title="Delete message"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>

                            {/* Expand/Collapse Button */}
                            <button
                              onClick={() => toggleMessageExpansion(message.id)}
                              className="text-gray-600 hover:text-gray-800 p-1 rounded"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              <svg 
                                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content - Collapsible */}
                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            {/* Original Message */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-2">Original Message:</h5>
                              <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                            </div>

                            {/* Admin Reply Section */}
                            {hasReply && (
                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium text-green-900">Admin Reply:</h5>
                                  <div className="text-xs text-green-600">
                                    {message.repliedBy && `By: ${message.repliedBy}`}
                                    {message.repliedAt && ` at ${formatDate(message.repliedAt)}`}
                                  </div>
                                </div>
                                <p className="text-green-800 whitespace-pre-wrap">{message.adminReply}</p>
                              </div>
                            )}

                            {/* Reply Input Section - FIXED: Show only when this specific message is being replied to */}
                            {isReplying && (
                              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <h5 className="font-medium text-yellow-900 mb-2">Reply to {message.name}:</h5>
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type your reply here..."
                                  rows="4"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                <div className="mt-2 flex justify-end space-x-2">
                                  <button
                                    onClick={handleCancelReply}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(message)}
                                    disabled={replying}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {replying ? 'Sending...' : 'Send Reply'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Sent Emails Tab Content (unchanged) */
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sent Email History</h3>
            </div>

            {sentEmails.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sent emails</h3>
                <p className="mt-1 text-sm text-gray-500">Emails sent from admin will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sentEmails.map((email) => (
                  <div 
                    key={email.id} 
                    className={`p-6 hover:bg-gray-50 cursor-pointer ${
                      !email.success ? 'bg-red-50' : ''
                    }`}
                    onClick={() => setSelectedSentEmail(selectedSentEmail?.id === email.id ? null : email)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{email.subject}</h4>
                          {email.success ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Failed
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>To:</strong> {email.toEmail}
                        </p>
                        
                        <p className="text-sm text-gray-500 mb-2">
                          Sent: {formatDate(email.sentAt)}
                        </p>

                        {selectedSentEmail?.id === email.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">Email Content</h5>
                            <div className="whitespace-pre-wrap text-gray-700 bg-white p-3 rounded border">
                              {email.message}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailSender 
          initialEmail={selectedEmail}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedEmail('');
          }}
        />
      )}
    </div>
  );
};

export default ContactMessages;