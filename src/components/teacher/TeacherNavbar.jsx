// src/components/teacher/TeacherNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUserCircle, FaSignOutAlt, FaBars, FaTimes,
  FaChalkboardTeacher, FaUser, FaLock, FaBell
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { teacherLogout } from '../../api/teacherPortal/teacherAuthApi';

const TeacherNavbar = () => {
  const navigate = useNavigate();
  const { teacher, logoutTeacher } = useTeacherAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    try {
      if (teacher?.teacherId) {
        await teacherLogout(teacher.teacherId);
      }
    } catch (err) {
      console.warn('Logout API error:', err);
    }
    logoutTeacher();
    toast.success('Logged out successfully');
    navigate('/teacher/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </button>

          <Link to="/teacher/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <FaChalkboardTeacher className="text-white" />
            </div>
            <div className="hidden md:block">
              <p className="font-bold text-gray-800 text-sm">Lift A Kid</p>
              <p className="text-xs text-gray-500">Teacher Portal</p>
            </div>
          </Link>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3">

          {/* Notification Bell (placeholder) */}
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <FaBell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 focus:outline-none"
            >
              {teacher?.photoUrl ? (
                <img
                  src={teacher.photoUrl}
                  alt={teacher.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-teal-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                  {teacher?.name?.charAt(0).toUpperCase() || 'T'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {teacher?.name || 'Teacher'}
                </p>
                <p className="text-xs text-gray-500">
                  {teacher?.teacherCode || ''}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">
                    {teacher?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {teacher?.designation || 'Teacher'}
                  </p>
                  <p className="text-xs text-teal-600 font-mono mt-1">
                    {teacher?.teacherCode}
                  </p>
                </div>

                <button
                  onClick={() => { navigate('/teacher/profile'); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FaUser className="text-gray-400" /> My Profile
                </button>

                <button
                  onClick={() => { navigate('/teacher/change-password'); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FaLock className="text-gray-400" /> Change Password
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TeacherNavbar;