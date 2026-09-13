// components/Modal/TeacherFormModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { createTeacher, updateTeacher, getValidClasses, getValidSubjects } from '../../../api/InstitutionManage/teacherApi';

const TeacherFormModal = ({ isOpen, onClose, onSuccess, teacher, isEditing, institutionId }) => {
  const [loading, setLoading] = useState(false);
  const [validClasses, setValidClasses] = useState([]);
  const [validSubjects, setValidSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    joiningDate: '',
    designation: '',
    department: '',
    specialization: '',
    emergencyContact: '',
    qualifications: [],
    experiences: []
  });

  const [qualification, setQualification] = useState({
    degree: '',
    institution: '',
    year: '',
    grade: '',
    isHighest: false
  });

  const [experience, setExperience] = useState({
    institution: '',
    position: '',
    fromDate: '',
    toDate: '',
    isCurrent: false,
    responsibilities: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadValidValues();
      if (teacher && isEditing) {
        setFormData({
          name: teacher.name || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          address: teacher.address || '',
          gender: teacher.gender || '',
          dateOfBirth: teacher.dateOfBirth || '',
          joiningDate: teacher.joiningDate || '',
          designation: teacher.designation || '',
          department: teacher.department || '',
          specialization: teacher.specialization || '',
          emergencyContact: teacher.emergencyContact || '',
          qualifications: teacher.qualifications || [],
          experiences: teacher.experiences || []
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          gender: '',
          dateOfBirth: '',
          joiningDate: '',
          designation: '',
          department: '',
          specialization: '',
          emergencyContact: '',
          qualifications: [],
          experiences: []
        });
      }
    }
  }, [isOpen, teacher, isEditing]);

  const loadValidValues = async () => {
    try {
      const [classes, subjects] = await Promise.all([
        getValidClasses(),
        getValidSubjects()
      ]);
      setValidClasses(classes);
      setValidSubjects(subjects);
    } catch (error) {
      console.error('Error loading valid values:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQualificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQualification(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExperience(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addQualification = () => {
    if (!qualification.degree || !qualification.institution) {
      toast.warning('Please fill degree and institution');
      return;
    }
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, { ...qualification }]
    }));
    setQualification({
      degree: '',
      institution: '',
      year: '',
      grade: '',
      isHighest: false
    });
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    if (!experience.institution || !experience.position) {
      toast.warning('Please fill institution and position');
      return;
    }
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { ...experience }]
    }));
    setExperience({
      institution: '',
      position: '',
      fromDate: '',
      toDate: '',
      isCurrent: false,
      responsibilities: ''
    });
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateTeacher(teacher.id, formData, institutionId);
        toast.success('Teacher updated successfully!');
      } else {
        await createTeacher(formData, institutionId);
        toast.success('Teacher created successfully!');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error(error.response?.data?.message || 'Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaUser className="mr-2 text-teal-600" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaBriefcase className="mr-2 text-teal-600" /> Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Senior Teacher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Specialization</option>
                    {validSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaGraduationCap className="mr-2 text-teal-600" /> Qualifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <input
                  type="text"
                  name="degree"
                  value={qualification.degree}
                  onChange={handleQualificationChange}
                  placeholder="Degree"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  name="institution"
                  value={qualification.institution}
                  onChange={handleQualificationChange}
                  placeholder="Institution"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number"
                  name="year"
                  value={qualification.year}
                  onChange={handleQualificationChange}
                  placeholder="Year"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="grade"
                    value={qualification.grade}
                    onChange={handleQualificationChange}
                    placeholder="Grade"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={addQualification}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              {formData.qualifications.length > 0 && (
                <div className="space-y-2">
                  {formData.qualifications.map((q, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{q.degree}</span> - {q.institution}
                        {q.year && <span className="text-gray-500 ml-2">({q.year})</span>}
                        {q.grade && <span className="text-gray-500 ml-2">Grade: {q.grade}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experiences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaBriefcase className="mr-2 text-teal-600" /> Experiences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  name="institution"
                  value={experience.institution}
                  onChange={handleExperienceChange}
                  placeholder="Institution"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  name="position"
                  value={experience.position}
                  onChange={handleExperienceChange}
                  placeholder="Position"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="date"
                  name="fromDate"
                  value={experience.fromDate}
                  onChange={handleExperienceChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="date"
                  name="toDate"
                  value={experience.toDate}
                  onChange={handleExperienceChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isCurrent"
                      checked={experience.isCurrent}
                      onChange={handleExperienceChange}
                      className="mr-2"
                    />
                    Current Position
                  </label>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Add Experience
                  </button>
                </div>
              </div>
              {formData.experiences.length > 0 && (
                <div className="space-y-2">
                  {formData.experiences.map((e, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{e.position}</span> at {e.institution}
                        {e.isCurrent && <span className="text-green-500 ml-2">(Current)</span>}
                        {e.fromDate && e.toDate && (
                          <span className="text-gray-500 ml-2">
                            ({new Date(e.fromDate).getFullYear()} - {new Date(e.toDate).getFullYear()})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Teacher' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherFormModal;