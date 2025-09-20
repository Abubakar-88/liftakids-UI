import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaLock, FaHandHoldingHeart, FaGraduationCap, FaCog, FaMoneyCheckAlt, FaSignOutAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
const DonarDashboard = () => {
  const navigate = useNavigate();
const [donorData, setDonorData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('donorData');
    if (data) {
      setDonorData(JSON.parse(data));
    }
  }, []);
  const donorId = donorData ? donorData.donorId : null;

  // Safe way to access donorId
  //const donor = JSON.parse(localStorage.getItem('donor'));

  return (
    <div className="min-h-screen bg-white p-4 font-sans flex flex-col items-center">
      {/* Title */}
       <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <FaHandHoldingHeart className="mr-2" /> Donor Portal
        </h1>

      {/* Welcome Card */}
      <div className="bg-blue-700 text-white rounded-xl p-4 w-full max-w-sm mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Welcome {donorData ? donorData.name : 'Donor'}</h2>
          <span className="text-xl">→</span>
        </div>
        <p className="text-xs mt-2 font-light">The standard Lorem Ipsum passage</p>
        <p className="text-xs italic mt-1">
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        </p>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-2 gap-6 mb-6 w-full max-w-xs">
        <div
          onClick={() => navigate('/donor/student-list-for-sponsor')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaUserPlus className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Add Sponsor</span>
        </div>

        <div
          onClick={() => navigate('/donar/sponsored-students')}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaGraduationCap className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Sponsored Student</span>
        </div>

        <div
          onClick={() => navigate(`/donar/settings/${donorId}`)}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <FaCog className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Settings</span>
        </div>

       <div
          onClick={() => navigate(`/donor/sponsored-students/${donorId}/payments`)}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <FaMoneyCheckAlt className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Payment History</span>
        </div>
      </div>
       
 <div className="grid grid-cols-2 gap-6 mb-6 w-full max-w-xs">
    {/* Logout Button  and password change*/}
         <div
          onClick={() => navigate(`/donor/password-change/${donorId}`)}
          className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100  w-30"
        >
          <FaLock  className="text-blue-700 text-4xl mb-2" />
          <span className="text-sm text-black text-center">Password Change</span>
        </div>
      <div
        onClick={() => navigate('/')}
        className="flex flex-col items-center bg-blue-50 p-4 rounded-xl cursor-pointer hover:bg-blue-100 w-30"
      >
        <FaSignOutAlt className="text-blue-700 text-2xl mb-2" />
        <span className="text-sm text-black text-center">Logout</span>
      </div>
 </div>

  
     
    </div>
  );
};

export default DonarDashboard;
