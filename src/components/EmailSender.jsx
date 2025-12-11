
import { useState } from 'react';
import { toast } from 'react-toastify';
import { sendCustomEmail } from './../api/contactApi';

const EmailSender = ({ onClose, initialEmail = '' }) => {
  const [emailData, setEmailData] = useState({
    toEmail: initialEmail,
    subject: '',
    message: '',
    senderName: 'Lift A Kids Admin'
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailData.toEmail.trim()) {
      toast.error('Recipient email is required');
      return;
    }
    if (!emailData.subject.trim()) {
      toast.error('Email subject is required');
      return;
    }
    if (!emailData.message.trim()) {
      toast.error('Email message is required');
      return;
    }

    setSending(true);
    try {
      const result = await sendCustomEmail(emailData);
      
      if (result.success) {
        toast.success('Email sent successfully!');
        setEmailData({
          toEmail: initialEmail,
          subject: '',
          message: '',
          senderName: 'Lift A Kids Admin'
        });
        if (onClose) onClose();
      } else {
        toast.error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send email';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Send Email</h2>
          <p className="text-sm text-gray-600 mt-1">Send custom email to specific recipient</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recipient Email */}
          <div>
            <label htmlFor="toEmail" className="block text-sm font-medium text-gray-700 mb-1">
              To Email *
            </label>
            <input
              type="email"
              id="toEmail"
              name="toEmail"
              value={emailData.toEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="recipient@example.com"
              required
            />
          </div>

          {/* Sender Name */}
          <div>
            <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
              Sender Name
            </label>
            <input
              type="text"
              id="senderName"
              name="senderName"
              value={emailData.senderName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Lift A Kids Admin"
            />
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={emailData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email subject"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              rows="8"
              value={emailData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your email message here..."
              required
            />
          </div>

          {/* Character Count */}
          <div className="text-sm text-gray-500">
            {emailData.message.length} characters
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailSender;