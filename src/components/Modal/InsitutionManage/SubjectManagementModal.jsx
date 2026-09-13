// components/Modal/SubjectManagementModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaBook, FaGraduationCap } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  getActiveSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../../../api/InstitutionManage/instituteSubjectApi';

const SubjectManagementModal = ({ isOpen, onClose, institutionId }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen && institutionId) {
      fetchSubjects();
    }
  }, [isOpen, institutionId]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await getActiveSubjects(institutionId);
      setSubjects(response || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSubject(formData, institutionId);
      toast.success('Subject created successfully!');
      setShowAddForm(false);
      setFormData({ subjectName: '', subjectCode: '', description: '' });
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSubject(editingSubject.id, formData, institutionId);
      toast.success('Subject updated successfully!');
      setEditingSubject(null);
      setShowAddForm(false);
      setFormData({ subjectName: '', subjectCode: '', description: '' });
      fetchSubjects();
    } catch (error) {
      console.error('Error updating subject:', error);
      toast.error('Failed to update subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(subjectId, institutionId);
        toast.success('Subject deleted successfully!');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Failed to delete subject');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaBook className="mr-2 text-teal-600" />
            Subject Management
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingSubject(null);
                setFormData({ subjectName: '', subjectCode: '', description: '' });
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
            >
              <FaPlus className="mr-2" /> Add Subject
            </button>
          </div>

          {(showAddForm || editingSubject) && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <form onSubmit={editingSubject ? handleEdit : handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Subject Name"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject Code (optional)"
                    value={formData.subjectCode}
                    onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 mt-3"
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSubject(null);
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
                    {loading ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {loading && subjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaBook className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>No subjects added yet</p>
                <p className="text-sm">Add your first subject using the button above</p>
              </div>
            ) : (
              subjects.map((sub) => (
                <div key={sub.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <FaBook className="text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{sub.subjectName}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {sub.subjectCode && <span>Code: {sub.subjectCode}</span>}
                        {sub.description && <span className="truncate max-w-xs">{sub.description}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSubject(sub);
                        setShowAddForm(true);
                        setFormData({
                          subjectName: sub.subjectName,
                          subjectCode: sub.subjectCode || '',
                          description: sub.description || ''
                        });
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
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
        </div>
      </div>
    </div>
  );
};

export default SubjectManagementModal;