import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaGraduationCap, FaCreditCard, FaSignOutAlt, FaNotesMedical,FaUsers  } from 'react-icons/fa';
import { PiExamFill } from 'react-icons/pi'; // If not available, replace with another icon from react-icons
import { useState, useEffect } from 'react';
const InstitutionDashboard = () => {
  const navigate = useNavigate();
 const [institutionData, setInstitutionData] = useState(null);

  // Load institution data from localStorage
  useEffect(() => {
    const data = localStorage.getItem('institutionData');
    if (data) {
      setInstitutionData(JSON.parse(data));
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('institutionData');
    // Redirect to login
    navigate('/login/institution');
  };


  return (
    <div className="min-h-screen bg-white p-4 font-sans flex flex-col items-center">
      {/* Title */}
      <h1 className="text-2xl font-bold text-center text-black mb-4">Institution Dashboard</h1>

      {/* Welcome Card with Institution Name */}
      <div className="bg-blue-700 text-white rounded-xl p-4 w-full max-w-sm mb-6">
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
        {institutionData && (
          <div className="mt-2 text-xs">
            <p>Email: {institutionData.email}</p>
            <p>Phone: {institutionData.phone}</p>
            <p>Type: {institutionData.type}</p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-2 gap-6 mb-6 w-full max-w-xs">
        {/* Sponsored */}
        <div
          onClick={() => navigate('/institution/sponsored-students')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaNotesMedical className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Sponsored</span>
        </div>

        {/* Result */}
        <div
          onClick={() => navigate('/institution/result-upload')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <PiExamFill className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Result</span>
        </div>

        {/* Add Student */}
        <div
          onClick={() => navigate('/institution/add-student')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaGraduationCap className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Add Student</span>
        </div>

        {/* Add Payment */}
        <div
          onClick={() => navigate('/institution/add-payment')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaCreditCard className="text-black text-4xl mb-2" />
          <span className="text-sm text-black text-center">Add Payment Method</span>
        </div>

    {/* Student List */}
        <div
          onClick={() => navigate('/institution/student-list')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaUsers className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Student List</span>
        </div>
      
 {/* Logout */}
       <div
          onClick={handleLogout}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaSignOutAlt className="text-blue-700 text-2xl mb-2" />
          <span className="text-sm text-black text-center">Logout</span>
        </div>
 {/* Institution Info Summary
      {institutionData && (
        <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mt-4">
          <h3 className="text-lg font-semibold text-center mb-2">Institution Information</h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Name:</span> {institutionData.institutionName}</p>
            <p><span className="font-medium">Type:</span> {institutionData.type}</p>
            <p><span className="font-medium">Email:</span> {institutionData.email}</p>
            <p><span className="font-medium">Phone:</span> {institutionData.phone}</p>
            {institutionData.villageOrHouse && (
              <p><span className="font-medium">Address:</span> {institutionData.villageOrHouse}</p>
            )}
          </div>
        </div>
      )} */}
      </div>

     
    </div>
  );
};

export default InstitutionDashboard;
