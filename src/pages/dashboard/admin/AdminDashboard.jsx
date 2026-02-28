import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentActivities } from '../../../api/adminApi';

const AdminDashboard = ({ children }) => {
   const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
   useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        getDashboardStats(),
        getRecentActivities(5)
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
