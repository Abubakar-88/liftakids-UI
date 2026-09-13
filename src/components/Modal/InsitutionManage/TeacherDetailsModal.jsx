
import React, { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, FaGraduationCap, FaBriefcase, FaChalkboardTeacher, FaBook, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';

const TeacherDetailsModal = ({ isOpen, onClose, teacher }) => {
  const [activeTab, setActiveTab] = useState('info'); // info, qualifications, experience, schedule

  if (!isOpen || !teacher) return null;

  const getStatusBadge = () => {
    if (!teacher.active) {
      return <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">Inactive</span>;
    }
    if (teacher.onLeave) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-sm rounded-full">On Leave</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">Active</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {teacher.photoUrl ? (
              <img
                src={teacher.photoUrl}
                alt={teacher.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-teal-600 font-bold text-xl">
                  {teacher.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{teacher.name}</h2>
              <p className="text-sm text-gray-500">Teacher ID: {teacher.teacherId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaUser className="inline mr-2" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('qualifications')}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'qualifications'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaGraduationCap className="inline mr-2" /> Qualifications
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'experience'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaBriefcase className="inline mr-2" /> Experience
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaClock className="inline mr-2" /> Schedule
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                {teacher.designation && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                    {teacher.designation}
                  </span>
                )}
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-3 text-gray-400" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center text-gray-600">
                    <FaPhone className="mr-3 text-gray-400" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.gender && (
                  <div className="flex items-center text-gray-600">
                    <FaUser className="mr-3 text-gray-400" />
                    <span>{teacher.gender}</span>
                  </div>
                )}
                {teacher.dateOfBirth && (
                  <div className="flex items-center text-gray-600">
                    <FaCalendar className="mr-3 text-gray-400" />
                    <span>DOB: {format(new Date(teacher.dateOfBirth), 'PPP')}</span>
                  </div>
                )}
                {teacher.joiningDate && (
                  <div className="flex items-center text-gray-600">
                    <FaCalendar className="mr-3 text-gray-400" />
                    <span>Joined: {format(new Date(teacher.joiningDate), 'PPP')}</span>
                  </div>
                )}
                {teacher.department && (
                  <div className="flex items-center text-gray-600">
                    <FaBriefcase className="mr-3 text-gray-400" />
                    <span>Department: {teacher.department}</span>
                  </div>
                )}
                {teacher.specialization && (
                  <div className="flex items-center text-gray-600">
                    <FaBook className="mr-3 text-gray-400" />
                    <span>Specialization: {teacher.specialization}</span>
                  </div>
                )}
                {teacher.address && (
                  <div className="flex items-center text-gray-600 col-span-2">
                    <FaMapMarkerAlt className="mr-3 text-gray-400" />
                    <span>{teacher.address}</span>
                  </div>
                )}
                {teacher.emergencyContact && (
                  <div className="flex items-center text-gray-600">
                    <FaPhone className="mr-3 text-gray-400" />
                    <span>Emergency: {teacher.emergencyContact}</span>
                  </div>
                )}
              </div>

              {/* Class Assignments */}
              {teacher.classAssignments?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Assigned Classes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teacher.classAssignments.map((assignment) => (
                      <div key={assignment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{assignment.className}</span>
                          {assignment.isClassTeacher && (
                            <span className="px-2 py-1 bg-teal-100 text-teal-600 text-xs rounded-full">
                              Class Teacher
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.subjectName} {assignment.sectionName && `| Section ${assignment.sectionName}`}
                        </div>
                        {assignment.academicYear && (
                          <div className="text-xs text-gray-400">Year: {assignment.academicYear}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div>
              {teacher.qualifications?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No qualifications added</p>
              ) : (
                <div className="space-y-4">
                  {teacher.qualifications.map((q, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{q.degree}</h4>
                          <p className="text-gray-600">{q.institution}</p>
                          {q.year && <p className="text-sm text-gray-500">Year: {q.year}</p>}
                          {q.grade && <p className="text-sm text-gray-500">Grade: {q.grade}</p>}
                        </div>
                        {q.isHighest && (
                          <span className="px-2 py-1 bg-teal-100 text-teal-600 text-xs rounded-full">
                            Highest
                          </span>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-sm text-gray-600 mt-2">{q.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div>
              {teacher.experiences?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No experience added</p>
              ) : (
                <div className="space-y-4">
                  {teacher.experiences.map((exp, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{exp.position}</h4>
                          <p className="text-gray-600">{exp.institution}</p>
                          {exp.fromDate && exp.toDate && (
                            <p className="text-sm text-gray-500">
                              {format(new Date(exp.fromDate), 'MMM yyyy')} - {exp.isCurrent ? 'Present' : format(new Date(exp.toDate), 'MMM yyyy')}
                            </p>
                          )}
                        </div>
                        {exp.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      {exp.responsibilities && (
                        <p className="text-sm text-gray-600 mt-2">{exp.responsibilities}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              {teacher.schedules?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No schedule set</p>
              ) : (
                <div className="space-y-4">
                  {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => {
                    const daySchedules = teacher.schedules?.filter(s => s.day === day) || [];
                    if (daySchedules.length === 0) return null;
                    return (
                      <div key={day}>
                        <h4 className="font-semibold text-gray-700 mb-2">{day}</h4>
                        <div className="space-y-2">
                          {daySchedules.map((schedule) => (
                            <div key={schedule.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                              <div>
                                <span className="font-medium">{schedule.className}</span>
                                <span className="text-gray-500 mx-2">|</span>
                                <span className="text-gray-600">{schedule.subjectName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                                {schedule.room && (
                                  <span className="text-sm text-gray-400">Room: {schedule.room}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsModal;