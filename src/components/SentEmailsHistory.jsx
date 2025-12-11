
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSentEmails, getSentEmailStats } from '../api/contactApi';

const SentEmailsHistory = () => {
  const [sentEmails, setSentEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    loadSentEmails();
    loadStats();
  }, []);

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
      const data = await getSentEmailStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading sent email stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sent Email History</h1>
          <p className="text-gray-600">View all emails sent from the admin panel</p>
        </div>
        
        {stats && (
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSent}</div>
              <div className="text-sm text-gray-600">Total Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.todaySent}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>
        )}
      </div>

      {/* Sent Emails List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Sent Emails</h3>
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
                onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
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
                      {email.senderName && (
                        <> | <strong>From:</strong> {email.senderName}</>
                      )}
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      Sent: {formatDate(email.sentAt)}
                    </p>

                    {/* Expanded View */}
                    {selectedEmail?.id === email.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Email Content</h5>
                        <div className="whitespace-pre-wrap text-gray-700 bg-white p-3 rounded border">
                          {email.message}
                        </div>
                        
                        {!email.success && email.errorMessage && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                            <strong className="text-red-800">Error:</strong> {email.errorMessage}
                          </div>
                        )}
                        
                        {email.contactMessageId && (
                          <div className="mt-3 text-sm text-gray-600">
                            <strong>Related to contact message ID:</strong> {email.contactMessageId}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Resend email functionality can be added here
                        toast.info('Resend functionality will be implemented');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Resend
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Reply to this email
                        toast.info('Reply functionality will be implemented');
                      }}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentEmailsHistory;