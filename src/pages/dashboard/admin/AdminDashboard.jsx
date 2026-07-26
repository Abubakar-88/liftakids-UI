// AdminDashboard.jsx - Final
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { useState } from 'react';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    // 👇 h-screen থেকে min-h-screen এ পরিবর্তন
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - h-full থাকবে */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-30 h-full`}>
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-0'} transition-all duration-300 ease-in-out min-h-screen flex flex-col`}>
        {/* Navbar - sticky */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <AdminNavbar sidebarCollapsed={sidebarCollapsed} onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        
        {/* Content - scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;