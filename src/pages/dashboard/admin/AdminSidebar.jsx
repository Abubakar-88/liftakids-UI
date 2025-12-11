import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaUserGraduate,
  FaSchool,
  FaFile, 
  FaNewspaper ,
  FaEnvelope ,
  FaHandHoldingUsd,
  FaBriefcase,
  FaHandHoldingHeart,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaInbox ,
  FaDrawPolygon,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const AdminSidebar = () => {
  const [openMenus, setOpenMenus] = useState({
    institution: false,
    student: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };
const AdvancedNavItem = ({ to, icon, text, exact = false, badgeCount = 0 }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) => 
      `flex items-center justify-between p-2 rounded mb-1 hover:bg-gray-700 transition-colors ${
        isActive ? 'bg-gray-700 border-l-4 border-teal-500' : ''
      }`
    }
  >
    <div className="flex items-center">
      {icon && <span className="mr-3">{icon}</span>}
      <span>{text}</span>
    </div>
    {badgeCount > 0 && (
      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-6 text-center">
        {badgeCount > 99 ? '99+' : badgeCount}
      </span>
    )}
  </NavLink>
);
  return (
    <div className=" bg-gray-800 text-white h-screen">
      <div className="p-4 border-b border-gray-700 h-16 flex items-center">
        <h2 className="text-xl font-bold">Lift A Kids Admin</h2>
      </div>

      <nav className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        <NavItem to="/admin/dashboard" icon={<FaHome />} text="Dashboard" exact />
         <NavItem to="/admin/institution-manage" icon={<FaSchool />} text="Institution Management" />
        <NavItem to="/admin/student-manage" icon={<FaUserGraduate />} text="Student Management" />


         {/* Area Manage Dropdown */}
        <div className="mb-2">
          <button 
            onClick={() => toggleMenu('areaManage')}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <div className="flex items-center">
              <FaDrawPolygon className="mr-3" />
              <span>Area Manage</span>
            </div>
            {openMenus.areaManage ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenus.areaManage && (
            <div className="ml-8 mt-1">
              <NavItem to="/admin/division-manage" text="Divisions Manage" />
              <NavItem to="/admin/district-manage" text="District Manage" />
              <NavItem to="/admin/thana-manage" text="Thana Manage" />
              <NavItem to="/admin/union-or-area-manage" text="Union Or Area Manage" />
            </div>
          )}
        </div>





       {/* <NavItem to="/admin/division-manage" icon={<FaHandHoldingUsd />} text="DivisionsManage" /> */}




        <NavItem to="/admin/donar-manage" icon={<FaHandHoldingHeart />} text="Donor Manage" />
        <NavItem to="/admin/sponsor-manage" icon={<FaBriefcase />} text="Sponsor Manage" />
        <NavItem to="/admin/results" icon={<FaFileAlt />} text="Results" />
        <NavItem to="/admin/reports" icon={<FaChartBar />} text="Reports" />
        <NavItem to="/admin/settings" icon={<FaCog />} text="Settings" />

    {/* Content Management Dropdown */}
        <div className="mb-2">
          <button 
            onClick={() => toggleMenu('content')}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <div className="flex items-center">
              <FaFile className="mr-3" />
              <span>Content Manage</span>
            </div>
            {openMenus.content ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenus.content && (
            <div className="ml-8 mt-1">
              <NavItem to="/admin/pages" text="Static Pages" />
              <NavItem to="/admin/pages/create" text="Create New Page" />
              <NavItem to="/admin/articles" text="Articles/Blog" />
              <NavItem to="/admin/contact-management" text="Contact Manage" />
            </div>
          )}
        </div>

<AdvancedNavItem 
  to="/admin/contact/messages" 
  icon={<FaInbox />} 
  text="Contact Messages" 
  badgeCount={5} // Dynamic count backend থেকে fetch করে set করতে পারবেন
/>
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, text, exact = false }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) => 
      `flex items-center p-2 rounded mb-1 hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
    }
  >
    {icon && <span className="mr-3">{icon}</span>}
    {text}
  </NavLink>
);

export default AdminSidebar;