import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = ({ children }) => {
  return (
    <div className="flex h-screen w-auto">
      {/* Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 left-0 bg-gray-800">
        <AdminSidebar />
      </aside>

      {/* Main Content (shifted by sidebar width) */}
      <div className="flex flex-col flex-1 ml-0 bg-gray-100 min-h-screen">
        {/* Navbar */}
        <div className="sticky top-0 z-10">
          <AdminNavbar />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
