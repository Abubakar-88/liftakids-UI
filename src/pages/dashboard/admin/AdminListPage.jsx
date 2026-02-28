import React, { useState, useEffect } from 'react';
import { 
  FaEdit, FaTrash, FaUserPlus, FaUserCheck, FaUserTimes, 
  FaSearch, FaFilter, FaSort 
} from 'react-icons/fa';
import { 
  getAllAdmins, deleteAdmin, changeAdminStatus,
  getCurrentAdmin 
} from '../../../api/adminApi';
import CreateAdminModal from '../../../components/Modal/CreateAdminModal';
import EditAdminModal from '../../../components/Modal/EditAdminModal';
import { toast } from 'react-toastify';
import AdminDashboard from '../admin/AdminDashboard';

const AdminListPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchAdmins();
    const admin = getCurrentAdmin();
    setCurrentUser(admin);
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAllAdmins();
      setAdmins(response);
    } catch (error) {
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const currentAdmin = getCurrentAdmin();
        await deleteAdmin(adminId, currentAdmin.adminId);
        toast.success('Admin deleted successfully');
        fetchAdmins();
      } catch (error) {
        toast.error(error.message || 'Failed to delete admin');
      }
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this admin?`)) {
      try {
        const currentAdmin = getCurrentAdmin();
        await changeAdminStatus(adminId, action, currentAdmin.adminId);
        toast.success(`Admin ${action}d successfully`);
        fetchAdmins();
      } catch (error) {
        toast.error(error.message || `Failed to ${action} admin`);
      }
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminDashboard>
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Users Management</h1>
        <p className="text-gray-600">Manage system administrators and their permissions</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaUserPlus className="mr-2" />
            Create New Admin
          </button>
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved Institutions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.adminId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {admin.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{admin.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.email}</div>
                    <div className="text-sm text-gray-500">
                      ID: {admin.adminId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.approvedInstitutionsCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      
                      {currentUser?.adminId !== admin.adminId && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(admin.adminId, admin.active)}
                            className={admin.active 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                            }
                            title={admin.active ? 'Deactivate' : 'Activate'}
                          >
                            {admin.active ? <FaUserTimes /> : <FaUserCheck />}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(admin.adminId)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No admins found</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Create your first admin
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAdmins();
          }}
        />
      )}

      {showEditModal && selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
            fetchAdmins();
          }}
        />
      )}
    </div>
    </AdminDashboard>
  );
};

export default AdminListPage;