import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUniversity, FaGraduationCap, FaCreditCard,FaMoneyBillWave, FaSignOutAlt, FaNotesMedical, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { PiExamFill } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import NotificationBell from '../../../components/NotificationBell';

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const [institutionData, setInstitutionData] = useState(null);
const { logout } = useAuth();
  // Load institution data from localStorage
  useEffect(() => {
    const data = localStorage.getItem('institutionData');
    if (data) {
      setInstitutionData(JSON.parse(data));
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white p-4 font-sans flex flex-col items-center">

       <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaUniversity className="mr-2" /> Institution Dashboard
              </h1>
              
              {/* Notification Bell with Error Boundary */}
              <div className="flex items-center space-x-4">
                <NotificationBell />
              </div>
            </div>
      

      {/* Welcome Card with Institution Name */}
      <div className="bg-teal-600 text-white rounded-xl p-4 w-full max-w-sm mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Welcome {institutionData ? institutionData.institutionName : 'Institution'}
          </h2>
          <span className="text-xl">→</span>
        </div>
        <p className="text-xs mt-2 font-light">
          {institutionData ? `We're glad to have you back, ${institutionData.institutionName}` : 'Welcome to your dashboard'}
        </p>
        <p className="text-xs italic mt-1">
          "Education is the most powerful weapon which you can use to change the world."
        </p>
        
        {/* Display additional institution info if available */}
        {/* {institutionData && (
          <div className="mt-2 text-xs">
            <p>Email: {institutionData.email}</p>
            <p>Phone: {institutionData.phone}</p>
            <p>Type: {institutionData.type}</p>
           
          </div>
        )} */}
      </div>

      {/* Menu Items - Now 3 columns for better layout */}
      <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-md">
        {/* Sponsored */}
        <div
          onClick={() => navigate('/institution/sponsored-students')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <FaNotesMedical className="text-teal-700 text-3xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Sponsored Students</span>
        </div>

        {/* Payment Confirmation - NEW BUTTON */}
        <div
          onClick={() => navigate('/institution/payment-confirmation')}
          className="flex flex-col items-center bg-green-50 p-4 rounded-xl cursor-pointer hover:bg-green-100 transition-colors border border-green-200"
        >
          <FaCheckCircle className="text-green-600 text-3xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Payment Confirmation</span>
        </div>

        {/* Result */}
        <div
          onClick={() => navigate('/institution/result-upload')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <PiExamFill className="text-teal-700 text-3xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Result Upload</span>
        </div>

        {/* Add Student */}
        <div
          onClick={() => navigate('/institution/add-student')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <FaGraduationCap className="text-teal-700 text-3xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Add Student</span>
        </div>

        {/* Student List */}
        <div
          onClick={() => navigate('/institution/student-list')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <FaUsers className="text-teal-700 text-3xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Student List</span>
        </div>

        {/* Add Payment Method */}
        {/* <div
          onClick={() => navigate('/institution/add-payment')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <FaCreditCard className="text-teal-700 text-3xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Payment Methods</span>
        </div> */}
         {/* Manual Payment Entry */}
        <div
          onClick={() => navigate('/institution/manual-payment')}
          className="flex flex-col items-center bg-green-50 p-4 rounded-xl cursor-pointer hover:bg-green-100 transition-colors border border-green-200"
        >
          <FaMoneyBillWave className="text-green-600 text-3xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Manual Payment</span>
        </div>
          {/* Logout */}
          <div
          onClick={handleLogout}
          className="flex flex-col items-center bg-red-50 p-4 rounded-xl cursor-pointer hover:bg-red-100 transition-colors col-span-3"
        >
          <FaSignOutAlt className="text-red-600 text-2xl mb-2" />
          <span className="text-xs text-black text-center font-medium">Logout</span>
        </div>
      </div>

      {/* Quick Stats Card (Optional) */}
      <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div 
            onClick={() => navigate('/institution/payment-confirmation')}
            className="bg-white p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow text-center border border-green-200"
          >
            <div className="text-green-600 font-semibold">Confirm Payments</div>
            <div className="text-xs text-gray-600 mt-1">Verify donor payments</div>
          </div>
          <div 
            onClick={() => navigate('/institution/student-list')}
            className="bg-white p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow text-center border border-blue-200"
          >
            <div className="text-blue-600 font-semibold">Manage Students</div>
            <div className="text-xs text-gray-600 mt-1">View all students</div>
          </div>
        </div>
      </div>

      {/* Institution Info Summary */}
      {institutionData && (
        <div className="w-full max-w-sm bg-teal-50 rounded-lg p-4 mt-4 border border-teal-200">
          <h3 className="text-lg font-semibold text-center mb-2 text-teal-800">Institution Information</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-teal-700">Name:</span>
              <span>{institutionData.institutionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-teal-700">Type:</span>
              <span>{institutionData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-teal-700">Email:</span>
              <span>{institutionData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-teal-700">Phone:</span>
              <span>{institutionData.phone}</span>
            </div>
            {institutionData.villageOrHouse && (
              <div className="flex justify-between">
                <span className="font-medium text-teal-700">Address:</span>
                <span className="text-right">{institutionData.villageOrHouse}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionDashboard;