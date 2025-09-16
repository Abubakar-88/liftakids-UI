import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaPrint, FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ResultConfirmation = () => {
  const navigate = useNavigate();

  // Auto-redirect after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/institution/dashboard');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-12 bg-white min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>

        {/* Confirmation Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Results Submitted Successfully!</h2>
          <p className="text-gray-600">
            The student's terminal results have been successfully uploaded to the system.
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">Submission Details</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between">
              <span className="font-medium">Submission ID:</span>
              <span>#{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">Date & Time:</span>
              <span>{new Date().toLocaleString()}</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-green-600 font-medium">Processed</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-2 bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded"
          >
            <FaPrint />
            <span>Print Confirmation</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded">
            <FaEnvelope />
            <span>Email Receipt</span>
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/institution/dashboard')}
          className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default ResultConfirmation;