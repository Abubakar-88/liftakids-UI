import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaUserGraduate,
  FaSchool,
  FaHandHoldingUsd,
  FaBriefcase,
  FaHandHoldingHeart,
  FaFileAlt,
  FaChartBar,
  FaCog,
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

  return (
    <div className=" bg-gray-800 text-white h-screen">
      <div className="p-4 border-b border-gray-700 h-16 flex items-center">
        <h2 className="text-xl font-bold">Lift A Kids Admin</h2>
      </div>

      <nav className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        <NavItem to="/admin/dashboard" icon={<FaHome />} text="Dashboard" exact />
         <NavItem to="/admin/institution-manage" icon={<FaSchool />} text="Institution Management" />
        <NavItem to="/admin/student-manage" icon={<FaUserGraduate />} text="Student Management" />
        {/* Institution Dropdown */}
        <div className="mb-2">
          <button 
            onClick={() => toggleMenu('institution')}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <div className="flex items-center">
              <FaSchool className="mr-3" />
              <span>Institution</span>
            </div>
            {openMenus.institution ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenus.institution && (
            <div className="ml-8 mt-1">
              <NavItem to="/admin/institutions" text="Institution List" />
              <NavItem to="/admin/institutions/add" text="Add Institution" />
            </div>
          )}
        </div>

        {/* Student Dropdown */}
        <div className="mb-2">
          <button 
            onClick={() => toggleMenu('student')}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <div className="flex items-center">
              <FaUserGraduate className="mr-3" />
              <span>Student</span>
            </div>
            {openMenus.student ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {openMenus.student && (
            <div className="ml-8 mt-1">
              <NavItem to="/admin/students" text="Student List" />
              <NavItem to="/admin/students/add" text="Add Student" />
              <NavItem to="/admin/students/sponsors" text="Sponsor List" />
            </div>
          )}
        </div>

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