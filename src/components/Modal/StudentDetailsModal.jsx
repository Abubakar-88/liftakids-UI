import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaChartPie,
  FaFilter,
  FaTimes
} from 'react-icons/fa';

Modal.setAppElement('#root');

const StudentDetailsModal = ({
  isOpen,
  onClose,
  currentInstitution,
  currentStudents
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Calculate statistics whenever currentStudents changes
  useEffect(() => {
    if (currentStudents && Array.isArray(currentStudents)) {
      const total = currentStudents.length;
      const active = currentStudents.filter(student => student.active !== false).length;
      const inactive = total - active;
      
      setStats({
        total,
        active,
        inactive
      });
    }
  }, [currentStudents]);

  // Filter students based on active status
  const filteredStudents = currentStudents?.filter(student => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ACTIVE') return student.active !== false;
    if (activeFilter === 'INACTIVE') return student.active === false;
    return true;
  }) || [];

  // Calculate active percentage
  const activePercentage = stats.total > 0 
    ? Math.round((stats.active / stats.total) * 100) 
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="bg-white p-6 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FaUsers className="mr-3 text-blue-500" />
              Students of {currentInstitution?.institutionName || 'Institution'}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentInstitution?.email} • {currentInstitution?.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-800 font-medium">Total Students</div>
              </div>
              <FaUsers className="h-8 w-8 text-blue-400 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-blue-600">All enrolled students</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-green-800 font-medium">Active Students</div>
              </div>
              <FaUserCheck className="h-8 w-8 text-green-400 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-green-600">Currently active</div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-600">{stats.inactive}</div>
                <div className="text-sm text-gray-800 font-medium">Inactive Students</div>
              </div>
              <FaUserTimes className="h-8 w-8 text-gray-400 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-gray-600">Not currently active</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{activePercentage}%</div>
                <div className="text-sm text-purple-800 font-medium">Active Rate</div>
              </div>
              <FaChartPie className="h-8 w-8 text-purple-400 opacity-70" />
            </div>
            <div className="mt-2 text-xs text-purple-600">Percentage active</div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaFilter className="mr-2" /> Filter Students
            </h3>
            <div className="text-sm text-gray-500">
              Showing {filteredStudents.length} of {stats.total} students
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                activeFilter === 'ALL' 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <FaUsers className="mr-2" />
              All Students
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-20">
                {stats.total}
              </span>
            </button>
            
            <button
              onClick={() => setActiveFilter('ACTIVE')}
              className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                activeFilter === 'ACTIVE' 
                  ? 'bg-green-600 text-white ring-2 ring-green-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <FaUserCheck className="mr-2" />
              Active Only
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-20">
                {stats.active}
              </span>
            </button>
            
            <button
              onClick={() => setActiveFilter('INACTIVE')}
              className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                activeFilter === 'INACTIVE' 
                  ? 'bg-gray-600 text-white ring-2 ring-gray-300' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <FaUserTimes className="mr-2" />
              Inactive Only
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-20">
                {stats.inactive}
              </span>
            </button>
            
            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setActiveFilter('ALL')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FaTimes className="mr-1" /> Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaUsers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No students found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeFilter === 'ALL' 
                ? 'This institution has no students enrolled yet.' 
                : `No ${activeFilter.toLowerCase()} students found for this institution.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Student Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Academic Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Additional Info
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.studentName}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        ID: {student.studentId || 'N/A'}
                      </div>
                      {student.guardianName && (
                        <div className="text-sm text-gray-500 mt-1">
                          Guardian: {student.guardianName}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{student.grade || 'Not specified'}</div>
                      {student.classSection && (
                        <div className="text-sm text-gray-500 mt-1">
                          Section: {student.classSection}
                        </div>
                      )}
                      {student.rollNumber && (
                        <div className="text-sm text-gray-500 mt-1">
                          Roll: {student.rollNumber}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{student.contactNumber || 'N/A'}</div>
                      {student.email && (
                        <div className="text-sm text-gray-500 mt-1 break-all">
                          {student.email}
                        </div>
                      )}
                      {student.address && (
                        <div className="text-sm text-gray-500 mt-1">
                          {student.address}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.active !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.active !== false ? 'Active' : 'Inactive'}
                        </span>
                        
                        {student.enrollmentDate && (
                          <div className="text-xs text-gray-500">
                            Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                          </div>
                        )}
                        
                        {student.dateOfBirth && (
                          <div className="text-xs text-gray-500">
                            DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {student.gender && (
                          <div className="text-sm text-gray-600">
                            Gender: {student.gender}
                          </div>
                        )}
                        
                        {student.bloodGroup && (
                          <div className="text-sm text-gray-600">
                            Blood Group: {student.bloodGroup}
                          </div>
                        )}
                        
                        {student.disability && (
                          <div className="text-sm text-red-600">
                            Disability: {student.disability}
                          </div>
                        )}
                        
                        {student.specialNeeds && (
                          <div className="text-sm text-blue-600">
                            Special Needs: {student.specialNeeds}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>
                Institution: <span className="font-medium">{currentInstitution?.institutionName}</span>
              </p>
              <p className="mt-1">
                Location: <span className="font-medium">{currentInstitution?.villageOrHouse || 'N/A'}</span>
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                  <div className="text-xs text-gray-600">Inactive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{activePercentage}%</div>
                  <div className="text-xs text-gray-600">Active Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors flex items-center"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;