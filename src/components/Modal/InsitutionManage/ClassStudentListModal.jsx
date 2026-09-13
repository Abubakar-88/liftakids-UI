// components/Modal/InsitutionManage/ClassStudentListModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaEye, FaUserTimes, FaUsers, FaChevronLeft, 
  FaChevronRight, FaSearch, FaUser 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getStudentsByClass, removeStudentFromClass } from '../../../api/InstitutionManage/studentAdmissionApi';
import ClassStudentDetailsModal from './ClassStudentDetailsModal';

const ClassStudentListModal = ({ isOpen, onClose, classData, institutionId }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const PER_PAGE = 10;

  // Fetch students when modal opens
  useEffect(() => {
    if (isOpen && classData && institutionId) {
      fetchStudents();
      setCurrentPage(1);
      setSearchTerm('');
    }
  }, [isOpen, classData, institutionId]);

  // Filter students by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(s =>
          s.studentName?.toLowerCase().includes(term) ||
          s.guardianName?.toLowerCase().includes(term) ||
          s.contactNumber?.toLowerCase().includes(term)
        )
      );
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudentsByClass(classData.id, institutionId);
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (student) => {
    if (!window.confirm(`Remove ${student.studentName} from ${classData.className}?`)) return;

    setRemovingId(student.studentId);
    try {
      await removeStudentFromClass(student.studentId, institutionId);
      toast.success(`${student.studentName} removed from class`);
      
      // Update local state
      const updated = students.filter(s => s.studentId !== student.studentId);
      setStudents(updated);
      setFilteredStudents(
        searchTerm.trim()
          ? updated.filter(s =>
              s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.guardianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : updated
      );
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / PER_PAGE);
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!isOpen || !classData) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaUsers className="text-2xl" />
              <div>
                <h2 className="text-lg font-bold">
                  Students of {classData.className}
                </h2>
                <p className="text-xs text-teal-100">
                  {classData.section && `Section ${classData.section} | `}
                  Total {students.length} students
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, guardian, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Student List Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FaUsers className="text-5xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  {searchTerm ? 'No matching students' : 'No students in this class'}
                </p>
                <p className="text-sm mt-1">
                  {searchTerm ? 'Try a different search term' : 'Admit students to see them here'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentStudents.map((student, index) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
                  >
                    {/* Left: Serial + Avatar + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-semibold text-gray-400 w-6 flex-shrink-0">
                        {startIndex + index + 1}.
                      </span>
                      
                      {/* Avatar */}
                      {student.photoUrl ? (
                        <img
                          src={student.photoUrl}
                          alt={student.studentName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold flex-shrink-0">
                          {student.studentName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {student.studentName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                          {student.guardianName && (
                            <span className="truncate">Guardian: {student.guardianName}</span>
                          )}
                          {student.contactNumber && (
                            <>
                              <span className="hidden sm:inline">|</span>
                              <span className="hidden sm:inline">{student.contactNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleRemove(student)}
                        disabled={removingId === student.studentId}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove from Class"
                      >
                        <FaUserTimes />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {filteredStudents.length > 0 && (
            <div className="border-t border-gray-200 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{startIndex + 1}</span>–
                <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                <span className="font-medium">{filteredStudents.length}</span> students
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FaChevronLeft className="text-sm" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // Show first, last, current, and adjacent pages
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => {
                    // Add ellipsis
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => goToPage(page)}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-teal-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Close */}
          <div className="border-t border-gray-200 bg-gray-50 p-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Student Details Modal (separate) */}
      {showDetails && selectedStudent && (
        <ClassStudentDetailsModal
          student={selectedStudent}
          classData={classData}
          onClose={() => {
            setShowDetails(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </>
  );
};

export default ClassStudentListModal;