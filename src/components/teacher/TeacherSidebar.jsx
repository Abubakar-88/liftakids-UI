// src/components/teacher/TeacherSidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome, FaCalendarAlt, FaClipboardCheck, FaFileAlt,
  FaTasks, FaUsers, FaBullhorn, FaChartBar, FaUser,
  FaChevronDown, FaChevronRight, FaLock
} from 'react-icons/fa';

const TeacherSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { to: '/teacher/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { to: '/teacher/schedule', icon: <FaCalendarAlt />, label: 'My Schedule' },
    { to: '/teacher/attendance', icon: <FaClipboardCheck />, label: 'Attendance' },
    { to: '/teacher/results', icon: <FaFileAlt />, label: 'Result Upload' },
    { to: '/teacher/assignments', icon: <FaTasks />, label: 'Assignments' },
    { to: '/teacher/students', icon: <FaUsers />, label: 'My Students', disabled: true },
    { to: '/teacher/events', icon: <FaBullhorn />, label: 'Events & Notices', disabled: true },
    { to: '/teacher/reports', icon: <FaChartBar />, label: 'Reports', disabled: true },
    { to: '/teacher/profile', icon: <FaUser />, label: 'My Profile' },
    { to: '/teacher/change-password', icon: <FaLock />, label: 'Change Password' }
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
};

const NavItem = ({ to, icon, label, disabled }) => {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed text-sm">
        <span className="text-base">{icon}</span>
        <span>{label}</span>
        <span className="ml-auto text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">Soon</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-teal-50 text-teal-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-50'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export default TeacherSidebar;