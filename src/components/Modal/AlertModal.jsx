
import React from 'react';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  const bgColor = {
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
    success: 'bg-green-50',
    error: 'bg-red-50'
  }[type];

  const textColor = {
    info: 'text-blue-800',
    warning: 'text-yellow-800',
    success: 'text-green-800',
    error: 'text-red-800'
  }[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${bgColor} p-6 rounded-lg shadow-lg max-w-md w-full`}>
        <h3 className={`${textColor} text-lg font-semibold mb-2`}>{title}</h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;