// components/Modal/InsitutionManage/ClassManagementModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaPlus, FaEdit, FaTrash, FaUsers, FaEye, 
  FaGraduationCap, FaBook, FaCheck, FaTimesCircle,
  FaChevronDown, FaChevronRight, FaUser, FaPhone, FaEnvelope,
  FaUserCheck, FaUserTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  getActiveClasses, 
  createClass, 
  updateClass, 
  deleteClass,
  getStudentCountByClass 
} from '../../../api/InstitutionManage/instituteClassApi';
import { 
  getSubjectsByClass, 
  assignSubjectsToClass, 
  removeSubjectFromClass 
} from '../../../api/InstitutionManage/classSubjectApi';
import { getActiveSubjects } from '../../../api/InstitutionManage/instituteSubjectApi';
import { getStudentsByClass, removeStudentFromClass } from '../../../api/InstitutionManage/studentAdmissionApi';
import StudentDetailsModal from './ClassStudentDetailsModal'; 
import ClassStudentListModal from './ClassStudentListModal';
const ClassManagementModal = ({ isOpen, onClose, institutionId }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    classOrder: 0
  });

  // Subject management states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedClassForSubjects, setSelectedClassForSubjects] = useState(null);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Student list states
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [classStudents, setClassStudents] = useState({});
  const [studentLoading, setStudentLoading] = useState({});
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
const [showStudentListModal, setShowStudentListModal] = useState(false);
const [selectedClassForStudents, setSelectedClassForStudents] = useState(null);

  useEffect(() => {
    if (isOpen && institutionId) {
      fetchClasses();
    }
  }, [isOpen, institutionId]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await getActiveClasses(institutionId);
      setClasses(response || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  // ========== Subject Management Functions ==========
  const handleManageSubjects = async (cls) => {
    setSelectedClassForSubjects(cls);
    setSubjectLoading(true);
    setShowSubjectModal(true);

    try {
      const assigned = await getSubjectsByClass(cls.id);
      setAssignedSubjects(assigned || []);
      const all = await getActiveSubjects(institutionId);
      const assignedIds = assigned.map(s => s.id);
      const available = all.filter(s => !assignedIds.includes(s.id));
      setAvailableSubjects(available || []);
    } catch (error) {
      console.error('Error loading subject data:', error);
      toast.error('Failed to load subjects');
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleAssignSubject = async (subjectId) => {
    try {
      await assignSubjectsToClass(selectedClassForSubjects.id, [subjectId]);
      toast.success('Subject assigned successfully!');
      handleManageSubjects(selectedClassForSubjects);
    } catch (error) {
      console.error('Error assigning subject:', error);
      toast.error('Failed to assign subject');
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    if (!window.confirm('Remove this subject from the class?')) return;
    try {
      await removeSubjectFromClass(selectedClassForSubjects.id, subjectId);
      toast.success('Subject removed successfully!');
      handleManageSubjects(selectedClassForSubjects);
    } catch (error) {
      console.error('Error removing subject:', error);
      toast.error('Failed to remove subject');
    }
  };

  // ========== Student List Functions ==========
  const toggleExpand = async (classId) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }
    setExpandedClassId(classId);
    // Fetch students if not already loaded
    if (!classStudents[classId]) {
      setStudentLoading(prev => ({ ...prev, [classId]: true }));
      try {
        const students = await getStudentsByClass(classId, institutionId);
        setClassStudents(prev => ({ ...prev, [classId]: students || [] }));
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setStudentLoading(prev => ({ ...prev, [classId]: false }));
      }
    }
  };

  const handleRemoveStudent = async (studentId, studentName, classId) => {
    if (!window.confirm(`Remove ${studentName} from this class?`)) return;
    try {
      await removeStudentFromClass(studentId, institutionId);
      toast.success(`${studentName} removed from class`);
      // Update local state
      setClassStudents(prev => ({
        ...prev,
        [classId]: prev[classId].filter(s => s.studentId !== studentId)
      }));
      // Update count in classes list
      setClasses(prev => prev.map(cls => {
        if (cls.id === classId) {
          return { ...cls, studentCount: (cls.studentCount || 0) - 1 };
        }
        return cls;
      }));
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    }
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // ========== Class CRUD Functions ==========
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createClass(formData, institutionId);
      toast.success('Class created successfully!');
      setShowAddForm(false);
      setFormData({ className: '', section: '', classOrder: 0 });
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateClass(editingClass.id, formData, institutionId);
      toast.success('Class updated successfully!');
      setEditingClass(null);
      setShowAddForm(false);
      setFormData({ className: '', section: '', classOrder: 0 });
      fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(classId, institutionId);
        toast.success('Class deleted successfully!');
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaGraduationCap className="mr-2 text-teal-600" />
            Class Management
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Add Class Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingClass(null);
                setFormData({ className: '', section: '', classOrder: 0 });
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
            >
              <FaPlus className="mr-2" /> Add Class
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingClass) && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <form onSubmit={editingClass ? handleEdit : handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Class Name (e.g., Class 5)"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Section (e.g., A)"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Order (e.g., 5)"
                    value={formData.classOrder}
                    onChange={(e) => setFormData({ ...formData, classOrder: parseInt(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingClass(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingClass ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Class List with Expandable Students */}
         {/* Class List */}
<div className="space-y-3">
  {loading && classes.length === 0 ? (
    <div className="text-center py-8 text-gray-500">Loading...</div>
  ) : classes.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <FaGraduationCap className="text-4xl mx-auto mb-3 text-gray-300" />
      <p>No classes added yet</p>
      <p className="text-sm">Add your first class using the button above</p>
    </div>
  ) : (
    classes.map((cls) => (
      <div
        key={cls.id}
        className="bg-gray-50 p-4 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
      >
        {/* Left: Class Info */}
        <div className="flex items-center gap-4">
          <div className="bg-teal-100 p-3 rounded-full">
            <FaGraduationCap className="text-teal-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{cls.className}</h4>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {cls.section && <span>Section: {cls.section}</span>}
              <span>|</span>
              <span>Order: {cls.classOrder}</span>
              <span>|</span>
              <span className="flex items-center text-blue-600">
                <FaUsers className="mr-1" /> {cls.studentCount || 0} Students
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Manage Subjects */}
          <button
            onClick={() => handleManageSubjects(cls)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
            title="Manage Subjects"
          >
            <FaBook />
          </button>

          {/* View Students (Modal) */}
          <button
            onClick={() => {
              setSelectedClassForStudents(cls);
              setShowStudentListModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View Students"
          >
            <FaUsers />
          </button>

          {/* Edit Class */}
          <button
            onClick={() => {
              setEditingClass(cls);
              setShowAddForm(true);
              setFormData({
                className: cls.className,
                section: cls.section || '',
                classOrder: cls.classOrder,
              });
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Edit"
          >
            <FaEdit />
          </button>

          {/* Delete Class */}
          <button
            onClick={() => handleDelete(cls.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    ))
  )}
</div>

          {/* Subject Management Modal */}
          {showSubjectModal && selectedClassForSubjects && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaBook className="mr-2 text-indigo-600" />
                    Subjects for {selectedClassForSubjects.className}
                  </h3>
                  <button onClick={() => { setShowSubjectModal(false); setSelectedClassForSubjects(null); }} className="text-gray-500 hover:text-gray-700">
                    <FaTimes />
                  </button>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">📌 Assigned Subjects</h4>
                    {subjectLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : assignedSubjects.length === 0 ? (
                      <p className="text-gray-500 text-sm">No subjects assigned to this class</p>
                    ) : (
                      <div className="space-y-2">
                        {assignedSubjects.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <div>
                              <span className="font-medium">{sub.subjectName}</span>
                              {sub.subjectCode && <span className="text-sm text-gray-500 ml-2">({sub.subjectCode})</span>}
                            </div>
                            <button onClick={() => handleRemoveSubject(sub.id)} className="text-red-500 hover:text-red-700" title="Remove subject">
                              <FaTimesCircle />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">📚 Available Subjects</h4>
                    {subjectLoading ? (
                      <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : availableSubjects.length === 0 ? (
                      <p className="text-gray-500 text-sm">All subjects are already assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {availableSubjects.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div>
                              <span className="font-medium">{sub.subjectName}</span>
                              {sub.subjectCode && <span className="text-sm text-gray-500 ml-2">({sub.subjectCode})</span>}
                            </div>
                            <button onClick={() => handleAssignSubject(sub.id)} className="text-green-500 hover:text-green-700" title="Assign subject">
                              <FaCheck />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    <p>💡 Click <FaCheck className="inline text-green-500" /> to add subject</p>
                    <p>💡 Click <FaTimesCircle className="inline text-red-500" /> to remove subject</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Details Modal */}
          {showStudentDetails && selectedStudent && (
            <StudentDetailsModal
              student={selectedStudent}
              onClose={() => { setShowStudentDetails(false); setSelectedStudent(null); }}
            />
          )}

          {/* Class Student List Modal */}
          {showStudentListModal && selectedClassForStudents && (
            <ClassStudentListModal
              isOpen={showStudentListModal}
              onClose={() => {
                setShowStudentListModal(false);
                setSelectedClassForStudents(null);
                fetchClasses(); // Refresh count in case students removed
              }}
              classData={selectedClassForStudents}
              institutionId={institutionId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassManagementModal;