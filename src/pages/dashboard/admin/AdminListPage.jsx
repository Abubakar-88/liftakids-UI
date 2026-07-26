import React, { useState, useEffect } from 'react';
import { 
  FaEdit, FaTrash, FaUserPlus, FaUserCheck, FaUserTimes, 
  FaSearch, FaFilter, FaSort, FaEye 
} from 'react-icons/fa';
import { 
  getAllAdmins, deleteAdmin, changeAdminStatus,
  getCurrentAdmin 
} from '../../../api/adminApi';
import CreateAdminModal from '../../../components/Modal/CreateAdminModal';
import EditAdminModal from '../../../components/Modal/EditAdminModal';
import { toast } from 'react-toastify';

const AdminListPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  useEffect(() => {
    fetchAdmins();
    const admin = getCurrentAdmin();
    setCurrentUser(admin);
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAllAdmins();
      // Ensure response is an array
      setAdmins(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
      setAdmins([]);
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
    const confirmMessage = currentStatus 
      ? 'Deactivating this admin will prevent them from accessing the system. Are you sure?' 
      : 'Activating this admin will restore their access. Are you sure?';
    
    if (window.confirm(confirmMessage)) {
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

  // Filter admins based on search and status
  const filteredAdmins = admins.filter(admin => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && admin.active === true) ||
      (filterStatus === 'INACTIVE' && admin.active === false);
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: admins.length,
    active: admins.filter(a => a.active === true).length,
    inactive: admins.filter(a => a.active === false).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Users Management</h1>
        <p className="text-gray-500 mt-1">Manage system administrators and their permissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Admins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserCheck className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Active Admins</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaUserCheck className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Inactive Admins</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaUserTimes className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or username..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter and Create Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
            >
              <FaUserPlus className="mr-2" />
              Create New Admin
            </button>
          </div>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'ALL' 
                      ? 'No admins match your search criteria' 
                      : 'No admins found. Create your first admin!'}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.adminId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-lg">
                            {admin.name?.charAt(0).toUpperCase()}
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
                      <div className="text-xs text-gray-500">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit Admin"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        
                        {currentUser?.adminId !== admin.adminId && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(admin.adminId, admin.active)}
                              className={admin.active 
                                ? 'text-yellow-600 hover:text-yellow-900' 
                                : 'text-green-600 hover:text-green-900'
                              }
                              title={admin.active ? 'Deactivate Admin' : 'Activate Admin'}
                            >
                              {admin.active ? <FaUserTimes className="h-5 w-5" /> : <FaUserCheck className="h-5 w-5" />}
                            </button>
                            
                            <button
                              onClick={() => handleDelete(admin.adminId)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete Admin"
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        {currentUser?.adminId === admin.adminId && (
                          <span className="text-gray-400 text-xs italic">(You)</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
  );
};

export default AdminListPage;