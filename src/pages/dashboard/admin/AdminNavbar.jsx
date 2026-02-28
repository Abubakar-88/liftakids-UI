import { useState, useEffect } from 'react';
import { FaBell, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import NotificationBell from '../../../components/NotificationBell';
import { getCurrentAdmin, adminLogout } from '../../../api/adminApi';
const AdminNavbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
const navigate = useNavigate();
const { logout } = useAuth();
 const [loading, setLoading] = useState(true);
 const [admin, setAdmin] = useState(null);
useEffect(() => {
    // Get admin data from localStorage
    const adminData = getCurrentAdmin();
    setAdmin(adminData);
    setLoading(false);
  }, []);
 const handleLogout = () => {
    logout(); // Use AuthContext logout

  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Search bar */}
        <div className="flex items-center">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center space-x-4">
            {/* Notification Bell with Error Boundary */}
              <div className="flex items-center space-x-4">
                <NotificationBell />
              </div>
          {/* Notifications */}
          {/* <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none relative">
            <FaBell className="h-5 w-5" />
            <span className="sr-only"> <NotificationBell /></span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button> */}

          {/* User dropdown */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <FaUserCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-sm font-medium text-gray-700 hidden md:block">
                {admin?.name || 'Admin User'}
                <span className="block text-xs text-gray-500">
                  {admin?.email || 'Super Admin'}
                </span>
              </div>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button 
                  onClick={() => navigate('/admin/profile')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </button>
                <button 
                  onClick={() => navigate('/admin/settings')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                <div className="border-t border-gray-200"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;