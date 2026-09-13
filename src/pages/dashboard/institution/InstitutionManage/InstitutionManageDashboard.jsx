import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCalendarAlt, FaChartLine, FaUsers, 
  FaMoneyBillWave, FaGraduationCap, FaUniversity,
  FaUserPlus, FaFileAlt, FaBell, FaCog, FaHome,
  FaChalkboardTeacher, FaBook, FaClock, FaUserGraduate,
  FaSchool, FaHandHoldingHeart, FaFileInvoice
} from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import NotificationBell from '../../../../components/NotificationBell';
import AcademicCalendar from '../InstitutionManage/AcademicCalendar';
import TeacherList from './TeacherList'; // 👈 TeacherList import করুন
import ClassManagementModal from '../../../../components/Modal/InsitutionManage/ClassManagementModal';
import SubjectManagementModal from '../../../../components/Modal/InsitutionManage/SubjectManagementModal';
import StudentAdmissionPage from './StudentAdmissionPage';

const InstitutionManageDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [institutionData, setInstitutionData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const data = localStorage.getItem('institutionData');
    if (data) {
      setInstitutionData(JSON.parse(data));
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Render different sections based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection institutionData={institutionData} />;
      case 'calendar':
        return <AcademicCalendar />;
      case 'teachers': // 👈 Teacher Management Tab
        return <TeacherList />;
      case 'students':
        return <div className="text-center py-12 text-gray-500">Student Management (Coming Soon)</div>;
      case 'classes':
      return (
        <ClassManagementModal
          isOpen={true}
          onClose={() => setActiveTab('overview')}  // 👈 X ক্লিক করলে overview এ যাবে
          institutionId={institutionData?.institutionsId}
        />
      );
    case 'subjects':
      return (
        <SubjectManagementModal
          isOpen={true}
          onClose={() => setActiveTab('overview')}  // 👈 X ক্লিক করলে overview এ যাবে
          institutionId={institutionData?.institutionsId}
        />
      );
      case 'admission':
      return <StudentAdmissionPage />;
      case 'payments':
        return <div className="text-center py-12 text-gray-500">Payment Management (Coming Soon)</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-500">Settings (Coming Soon)</div>;
      default:
        return <OverviewSection institutionData={institutionData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/institution/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <FaArrowLeft className="text-gray-600 text-xl" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <FaUniversity className="mr-2 text-teal-600" />
                Institution Management
              </h1>
              <p className="text-xs text-gray-500">
                {institutionData?.institutionName || 'Manage your institution'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 overflow-x-auto">
        <nav className="flex gap-1 py-2 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-teal-50 text-teal-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaHome className="text-sm" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'calendar' 
                ? 'bg-teal-50 text-teal-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaCalendarAlt className="text-sm" /> Academic Calendar
          </button>
          {/* 👇 NEW: Teacher Management Tab */}
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'teachers' 
                ? 'bg-purple-50 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaChalkboardTeacher className="text-sm" /> Teachers
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'students' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaUsers className="text-sm" /> Students
          </button>
          
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'classes' 
                ? 'bg-purple-50 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaGraduationCap className="text-sm" /> Classes
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'subjects' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaBook className="text-sm" /> Subjects
          </button>
          <button
            onClick={() => setActiveTab('admission')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'admission' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaUserPlus className="text-sm" /> Admission
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'payments' 
                ? 'bg-green-50 text-green-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaMoneyBillWave className="text-sm" /> Payments
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'settings' 
                ? 'bg-gray-50 text-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaCog className="text-sm" /> Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

// Overview Section Component (আপডেটেড)
const OverviewSection = ({ institutionData }) => {
  const navigate = useNavigate();
  
  const stats = [
    { label: 'Total Students', value: '0', icon: <FaUsers className="text-blue-500" />, color: 'bg-blue-50' },
    { label: 'Total Teachers', value: '0', icon: <FaChalkboardTeacher className="text-purple-500" />, color: 'bg-purple-50' },
    { label: 'Academic Events', value: '0', icon: <FaCalendarAlt className="text-teal-500" />, color: 'bg-teal-50' },
    { label: 'Sponsorships', value: '0', icon: <FaHandHoldingHeart className="text-green-500" />, color: 'bg-green-50' },
  ];

  const quickActions = [
    { label: 'Add Event', icon: <FaCalendarAlt />, path: '/institution/manage/calendar', color: 'bg-teal-100 text-teal-700' },
    { label: 'Add Teacher', icon: <FaChalkboardTeacher />, path: '/institution/manage/teachers', color: 'bg-purple-100 text-purple-700' },
    { label: 'Add Student', icon: <FaUserPlus />, path: '/institution/add-student', color: 'bg-blue-100 text-blue-700' },
    { label: 'View Students', icon: <FaUsers />, path: '/institution/student-list', color: 'bg-cyan-100 text-cyan-700' },
     { label: 'Manage Classes', icon: <FaGraduationCap />, path: '/institution/manage/classes', color: 'bg-purple-100 text-purple-700' },
    { label: 'Manage Subjects', icon: <FaBook />, path: '/institution/manage/subjects', color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Admit Students', icon: <FaUserPlus />, path: '/institution/manage/admission', color: 'bg-teal-100 text-teal-700' },
    { label: 'Payments', icon: <FaMoneyBillWave />, path: '/institution/payment-confirmation', color: 'bg-green-100 text-green-700' },
    { label: 'Results', icon: <FaFileAlt />, path: '/institution/result-upload', color: 'bg-yellow-100 text-yellow-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome to Institution Management</h2>
        <p className="text-teal-100 mt-1">
          {institutionData?.institutionName || 'Manage your institution effectively'}
        </p>
        <p className="text-teal-200 text-sm mt-2">
          Use the tabs above to navigate between different management sections
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-xl p-4 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              <span className="text-2xl opacity-70">{stat.icon}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} p-4 rounded-xl text-center hover:shadow-md transition-all transform hover:scale-105`}
            >
              <div className="text-2xl flex justify-center">{action.icon}</div>
              <span className="text-xs font-medium mt-2 block">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstitutionManageDashboard;