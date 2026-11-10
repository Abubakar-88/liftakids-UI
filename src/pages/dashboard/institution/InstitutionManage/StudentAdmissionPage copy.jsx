// pages/dashboard/institution/StudentAdmissionPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaCheck, FaTimes, FaUserPlus, FaUsers, FaArrowLeft } from 'react-icons/fa';
import { getActiveClasses } from '../../../../api/InstitutionManage/instituteClassApi';
import {
  searchStudentsForAdmission,
  admitSingleStudent,
  admitBulkStudents,
  removeStudentFromClass
} from '../../../../api/InstitutionManage/studentAdmissionApi';

const StudentAdmissionPage = () => {
  const navigate = useNavigate();
  const institutionData = JSON.parse(localStorage.getItem('institutionData'));
  const institutionId = institutionData?.institutionsId;

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load classes
  useEffect(() => {
    if (institutionId) {
      fetchClasses();
    }
  }, [institutionId]);

  // Search students
  useEffect(() => {
    if (institutionId) {
      fetchStudents();
    }
  }, [institutionId, searchTerm, unassignedOnly, currentPage]);

  const fetchClasses = async () => {
    try {
      const data = await getActiveClasses(institutionId);
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClassId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await searchStudentsForAdmission(
        institutionId,
        searchTerm,
        unassignedOnly,
        currentPage,
        pageSize
      );
      setStudents(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection
  const toggleSelect = (student) => {
    setSelectedStudents(prev => {
      const exists = prev.some(s => s.studentId === student.studentId);
      if (exists) {
        return prev.filter(s => s.studentId !== student.studentId);
      } else {
        return [...prev, student];
      }
    });
  };

  // Select/Deselect all on current page
  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students);
    }
  };

  // Single admit
  const handleSingleAdmit = async (student) => {
    if (!selectedClassId) {
      toast.warning('Please select a class first');
      return;
    }
    setSubmitting(true);
    try {
      await admitSingleStudent(student.studentId, selectedClassId, institutionId);
      toast.success(`${student.studentName} admitted successfully!`);
      // Remove from list
      setSelectedStudents(prev => prev.filter(s => s.studentId !== student.studentId));
      fetchStudents();
    } catch (error) {
      console.error('Error admitting student:', error);
      toast.error(error.response?.data?.message || 'Failed to admit student');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk admit
  const handleBulkAdmit = async () => {
    if (selectedStudents.length === 0) {
      toast.warning('Please select at least one student');
      return;
    }
    if (!selectedClassId) {
      toast.warning('Please select a class');
      return;
    }
    if (!window.confirm(`Admit ${selectedStudents.length} students to the selected class?`)) {
      return;
    }
    setSubmitting(true);
    try {
      const studentIds = selectedStudents.map(s => s.studentId);
      await admitBulkStudents(studentIds, selectedClassId, institutionId);
      toast.success(`${selectedStudents.length} students admitted successfully!`);
      setSelectedStudents([]);
      fetchStudents();
    } catch (error) {
      console.error('Error bulk admitting:', error);
      toast.error(error.response?.data?.message || 'Failed to admit students');
    } finally {
      setSubmitting(false);
    }
  };

  // Remove from class (if needed)
  const handleRemoveFromClass = async (student) => {
    if (!window.confirm(`Remove ${student.studentName} from current class?`)) return;
    try {
      await removeStudentFromClass(student.studentId, institutionId);
      toast.success('Student removed from class');
      fetchStudents();
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/institution/manage')} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserPlus className="text-teal-600" /> Student Admission
          </h1>
          <p className="text-gray-500 text-sm">Admit students to classes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Search & Student List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, guardian, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={unassignedOnly}
                onChange={() => setUnassignedOnly(!unassignedOnly)}
                className="h-4 w-4 text-teal-600"
              />
              <span className="text-sm text-gray-700">Unassigned only</span>
            </label>
            <button onClick={fetchStudents} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Search
            </button>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-teal-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guardian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No students found</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.some(s => s.studentId === student.studentId)}
                          onChange={() => toggleSelect(student)}
                          className="h-4 w-4 text-teal-600"
                          disabled={student.isAdmitted}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{student.studentName}</div>
                        <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.guardianName}<br />
                        <span className="text-xs">{student.contactNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        {student.isAdmitted ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <FaCheck className="mr-1" /> Admitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!student.isAdmitted ? (
                          <button
                            onClick={() => handleSingleAdmit(student)}
                            disabled={submitting || !selectedClassId}
                            className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 disabled:opacity-50"
                          >
                            Admit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveFromClass(student)}
                            className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalElements > pageSize && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">Total {totalElements} students</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1">{currentPage + 1}</span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={(currentPage + 1) * pageSize >= totalElements}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Class Selection & Bulk Action */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Admission Controls</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Choose Class --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.className} {cls.section ? `(${cls.section})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Selected Students</p>
              <p className="text-2xl font-bold text-teal-600">{selectedStudents.length}</p>
            </div>

            <button
              onClick={handleBulkAdmit}
              disabled={submitting || selectedStudents.length === 0 || !selectedClassId}
              className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaUsers /> Bulk Admit ({selectedStudents.length})
            </button>

            <button
              onClick={() => setSelectedStudents([])}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear Selection
            </button>

            <div className="text-xs text-gray-400 mt-4">
              <p>• Select students from the list</p>
              <p>• Choose a class</p>
              <p>• Click "Bulk Admit" to admit all selected</p>
              <p>• Or click "Admit" on individual row</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAdmissionPage;