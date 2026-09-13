// pages/dashboard/institution/TeacherList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, 
  FaEnvelope, FaPhone, FaChalkboardTeacher, 
  FaClock, FaChevronLeft, FaChevronRight, FaUserCheck,
  FaUserTimes, FaUserClock
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  getAllTeachersList,
  deleteTeacher,
  searchTeachers,
  getTeacherStatistics
} from '../../../../api/InstitutionManage/teacherApi';
import TeacherFormModal from '../../../../components/Modal/InsitutionManage/TeacherFormModal';
import TeacherDetailsModal from '../../../../components/Modal/InsitutionManage/TeacherDetailsModal';
import TeacherScheduleModal from '../../../../components/Modal/InsitutionManage/TeacherScheduleModal';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [size, setSize] = useState(10);
  const [error, setError] = useState(null);

  const institutionData = JSON.parse(localStorage.getItem('institutionData'));
  const institutionId = institutionData?.institutionsId;

  console.log('🔍 TeacherList Component Mounted');
  console.log('📌 Institution ID:', institutionId);

  // ============= Data Fetching =============

  useEffect(() => {
    if (institutionId) {
      fetchData();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    if (institutionId) {
      fetchData();
    }
  }, [currentPage, size, filterStatus]);

  const fetchData = async () => {
    if (!institutionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching teachers for institution:', institutionId);
      
      const response = await getAllTeachersList(institutionId);
      
      console.log('📦 API Response:', response);
      
      let teachersData = [];
      let total = 0;
      let pages = 1;

      if (Array.isArray(response)) {
        teachersData = response;
        total = response.length;
        pages = 1;
      } else if (response?.content) {
        teachersData = response.content;
        total = response.totalElements || 0;
        pages = response.totalPages || 1;
      } else {
        teachersData = [];
        total = 0;
        pages = 1;
      }

      setTeachers(teachersData);
      setTotalElements(total);
      setTotalPages(pages);
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      setError(error.message || 'Failed to load teachers');
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!institutionId) return;
    
    try {
      const data = await getTeacherStatistics(institutionId);
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ============= Handlers =============

  // 👇 এই ফাংশনটি ডিফাইন করা আছে
  const handleAddNew = () => {
    console.log('🆕 Add New Teacher clicked');
    setSelectedTeacher(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  const handleViewSchedule = (teacher) => {
    setSelectedTeacher(teacher);
    setShowScheduleModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await deleteTeacher(id, institutionId);
        toast.success('Teacher deleted successfully');
        fetchData();
        fetchStats();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchData();
      return;
    }

    setLoading(true);
    try {
      const response = await searchTeachers(institutionId, searchTerm, 0, size);
      
      let teachersData = [];
      let total = 0;
      let pages = 1;

      if (Array.isArray(response)) {
        teachersData = response;
        total = response.length;
        pages = 1;
      } else if (response?.content) {
        teachersData = response.content;
        total = response.totalElements || 0;
        pages = response.totalPages || 1;
      } else {
        teachersData = [];
        total = 0;
        pages = 1;
      }

      setTeachers(teachersData);
      setTotalElements(total);
      setTotalPages(pages);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error searching teachers:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedTeacher(null);
    setIsEditing(false);
    fetchData();
    fetchStats();
  };

  // ============= Helper Functions =============

  const getStatusBadge = (teacher) => {
    if (!teacher.active) {
      return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Inactive</span>;
    }
    if (teacher.onLeave) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">On Leave</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>;
  };

  const getStatusIcon = (teacher) => {
    if (!teacher.active) return <FaUserTimes className="text-red-500" />;
    if (teacher.onLeave) return <FaUserClock className="text-yellow-500" />;
    return <FaUserCheck className="text-green-500" />;
  };

  // ============= Filtered Data =============

  const filteredTeachers = teachers.filter(teacher => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return teacher.active && !teacher.onLeave;
    if (filterStatus === 'ON_LEAVE') return teacher.onLeave;
    if (filterStatus === 'INACTIVE') return !teacher.active;
    return true;
  });

  // ============= Loading & Error States =============

  if (loading && teachers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="ml-3 text-gray-500">Loading teachers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!institutionId) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-yellow-500 text-4xl mb-4">🏫</div>
        <p className="text-gray-600">No institution found. Please login again.</p>
        <button 
          onClick={() => navigate('/login/institution')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Login
        </button>
      </div>
    );
  }

  // ============= Main Render =============

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <FaChalkboardTeacher className="mr-3 text-teal-600" />
            Teacher Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your institution's teachers and their assignments</p>
          {institutionData && (
            <p className="text-xs text-gray-400 mt-1">
              Institution: {institutionData.institutionName}
            </p>
          )}
        </div>
        {/* 👇 এখানে handleAddNew কল হচ্ছে */}
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Add Teacher
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-teal-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
            </div>
            <FaChalkboardTeacher className="text-teal-500 text-2xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
            </div>
            <FaUserCheck className="text-green-500 text-2xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.onLeave || 0}</p>
            </div>
            <FaUserClock className="text-yellow-500 text-2xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {(stats.total || 0) - (stats.active || 0) - (stats.onLeave || 0)}
              </p>
            </div>
            <FaUserTimes className="text-red-500 text-2xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or teacher ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'ALL'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'ACTIVE'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('ON_LEAVE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'ON_LEAVE'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              On Leave
            </button>
            <button
              onClick={() => setFilterStatus('INACTIVE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'INACTIVE'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-400 text-4xl mb-3">👨‍🏫</div>
                    <p className="text-gray-500">
                      {searchTerm ? 'No teachers match your search' : 'No teachers found. Add your first teacher!'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={handleAddNew}
                        className="mt-3 text-teal-600 hover:text-teal-700 font-medium"
                      >
                        + Add Teacher
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {teacher.photoUrl ? (
                          <img
                            src={teacher.photoUrl}
                            alt={teacher.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                            <span className="text-teal-600 font-semibold">
                              {teacher.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{teacher.name}</p>
                          <p className="text-xs text-gray-500">ID: {teacher.teacherId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {teacher.email}
                        </div>
                        {teacher.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="mr-2 text-gray-400" />
                            {teacher.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">{teacher.designation || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{teacher.department || 'N/A'}</div>
                      {teacher.specialization && (
                        <div className="text-xs text-teal-600 mt-1">{teacher.specialization}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.classAssignments?.slice(0, 3).map((assignment) => (
                          <span
                            key={assignment.id}
                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                          >
                            {assignment.className}
                          </span>
                        ))}
                        {(teacher.classAssignments?.length || 0) > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{(teacher.classAssignments?.length || 0) - 3}
                          </span>
                        )}
                        {!teacher.classAssignments?.length && (
                          <span className="text-xs text-gray-400">No classes</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(teacher)}
                        {getStatusBadge(teacher)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleView(teacher)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleViewSchedule(teacher)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Schedule"
                        >
                          <FaClock />
                        </button>
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              Showing {filteredTeachers.length} of {totalElements} teachers
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TeacherFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedTeacher(null);
          setIsEditing(false);
        }}
        onSuccess={handleFormSuccess}
        teacher={selectedTeacher}
        isEditing={isEditing}
        institutionId={institutionId}
      />

      <TeacherDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />

      <TeacherScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
        institutionId={institutionId}
      />
    </div>
  );
};

export default TeacherList;