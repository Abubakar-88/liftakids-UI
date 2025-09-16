// components/FlashMessage.js
import { useEffect } from 'react';

const FlashMessage = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg`}>
      {message}
      <button 
        onClick={onClose}
        className="ml-2 font-bold"
      >
        ×
      </button>
    </div>
  );
};