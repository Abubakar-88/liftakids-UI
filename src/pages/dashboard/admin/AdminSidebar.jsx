// AdminSidebar.jsx
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUserGraduate,
  FaSchool,
  FaFile, 
  FaNewspaper,
  FaEnvelope,
  FaHandHoldingUsd,
  FaUsersCog,
  FaBriefcase,
  FaHandHoldingHeart,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaInbox,
  FaDrawPolygon,
  FaChevronDown,
  FaChevronUp,
  FaHeart,
  FaBars,
  FaTimes,
  FaUserShield,
  FaTag,
  FaEye,
  FaThLarge
} from 'react-icons/fa';

const AdminSidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    areaManage: false,
    content: false,
    userManage: false
  });

  // Auto expand menu based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/division') || path.includes('/admin/district') || 
        path.includes('/admin/thana') || path.includes('/admin/union')) {
      setOpenMenus(prev => ({ ...prev, areaManage: true }));
    }
    if (path.includes('/admin/pages') || path.includes('/admin/articles') || 
        path.includes('/admin/contact-management')) {
      setOpenMenus(prev => ({ ...prev, content: true }));
    }
  }, [location]);

  const toggleMenu = (menu) => {
    if (!collapsed) {
      setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  return (
    <div className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-full flex flex-col shadow-xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo Area */}
      <div className={`p-4 border-b border-gray-700 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center">
              <FaHeart className="h-4 w-4 text-white" />
            </div>
            <h2 className="ml-2 text-lg font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Lift A Kids
            </h2>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center">
            <FaHeart className="h-4 w-4 text-white" />
          </div>
        )}
        <button 
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
        >
          {collapsed ? <FaBars className="h-4 w-4" /> : <FaTimes className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar text-left">
        <div className="space-y-1 pl-0">
          <NavItem to="/admin/dashboard" icon={<FaHome />} text="Dashboard" collapsed={collapsed} />
          <NavItem to="/admin/admin-manage" icon={<FaUserShield />} text="Admin Management" collapsed={collapsed} />
          
          {/* User Management Dropdown */}
          <DropdownMenu
            icon={<FaUsersCog />}
            title="User Management"
            collapsed={collapsed}
            isOpen={openMenus.userManage}
            onToggle={() => toggleMenu('userManage')}
            className="pl-0"
          >
            <NavItem to="/admin/donar-manage" icon={<FaHandHoldingHeart />} text="Donor Management" collapsed={collapsed} nested />
            <NavItem to="/admin/institution-manage" icon={<FaSchool />} text="Institution Management" collapsed={collapsed} nested />
            <NavItem to="/admin/student-manage" icon={<FaUserGraduate />} text="Student Management" collapsed={collapsed} nested />
            <NavItem to="/admin/sponsor-manage" icon={<FaBriefcase />} text="Sponsor Management" collapsed={collapsed} nested />
          </DropdownMenu>

          {/* Area Management Dropdown */}
          <DropdownMenu
            icon={<FaDrawPolygon />}
            title="Area Management"
            collapsed={collapsed}
            isOpen={openMenus.areaManage}
            onToggle={() => toggleMenu('areaManage')}
            
          >
            <NavItem to="/admin/division-manage" text="Divisions" collapsed={collapsed} nested />
            <NavItem to="/admin/district-manage" text="Districts" collapsed={collapsed} nested />
            <NavItem to="/admin/thana-manage" text="Thanas" collapsed={collapsed} nested />
            <NavItem to="/admin/union-or-area-manage" text="Unions/Areas" collapsed={collapsed} nested />
          </DropdownMenu>

          {/* Content Management Dropdown */}
          <DropdownMenu
            icon={<FaNewspaper />}
            title="Content Management"
            collapsed={collapsed}
            isOpen={openMenus.content}
            onToggle={() => toggleMenu('content')}
          >
            <NavItem to="/admin/articles" icon={<FaNewspaper />} text="Articles/Blog" collapsed={collapsed} nested />
            <NavItem to="/admin/articles/create" text="Create New Article" collapsed={collapsed} nested />
            <NavItem to="/admin/pages" text="Static Pages" collapsed={collapsed} nested />
            <NavItem to="/admin/contact-management" text="Contact Messages" collapsed={collapsed} nested badge={5} />
          </DropdownMenu>
            <NavItem to="/admin/articles" icon={<FaUserShield />} text="Blog Management" collapsed={collapsed} />
          <NavItem to="/admin/results" icon={<FaFileAlt />} text="Results" collapsed={collapsed} />
          <NavItem to="/admin/reports" icon={<FaChartBar />} text="Reports" collapsed={collapsed} />
          <NavItem to="/admin/settings" icon={<FaCog />} text="Settings" collapsed={collapsed} />
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400 text-center">
          <p>© 2024 Lift A Kids</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      )}
    </div>
  );
};

// NavItem Component
const NavItem = ({ to, icon, text, collapsed = false, nested = false, badge = null }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        group flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-lg
        transition-all duration-200 ease-in-out
        ${nested ? 'ml-6' : ''}
        ${isActive 
          ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }
      `}
      title={collapsed ? text : ''}
    >
      <span className={`${collapsed ? 'text-xl' : 'text-lg'} ${!collapsed && 'mr-3'}`}>
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 text-sm font-medium">{text}</span>
          {badge && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
      {collapsed && badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );
};

// DropdownMenu Component
const DropdownMenu = ({ icon, title, collapsed, isOpen, onToggle, children }) => {
  if (collapsed) {
    return (
      <div className="relative group">
        <div className="flex justify-center py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors">
          <span className="text-xl">{icon}</span>
        </div>
        {/* Tooltip */}
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 shadow-xl min-w-[160px]">
            <div className="font-medium pb-1 border-b border-gray-600 mb-1">{title}</div>
            <div className="space-y-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
      >
        <div className="flex items-center">
          <span className="text-lg mr-3">{icon}</span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <span className="transition-transform duration-200">
          {isOpen ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="pl-0 mt-1 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;