
import React from 'react';
import { 
  FaTimes, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaGraduationCap, FaCalendarAlt, FaHeart, FaSchool,
  FaBookOpen, FaUserFriends, FaInfoCircle
} from 'react-icons/fa';
import { format } from 'date-fns';

const ClassStudentDetailsModal = ({ student, classData, onClose }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaUser /> Student Details
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Profile Picture + Name */}
        <div className="p-6 text-center border-b border-gray-100">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.studentName}
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-teal-100 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-3xl font-bold mx-auto border-4 border-white shadow-md">
              {student.studentName?.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-800 mt-3">
            {student.studentName}
          </h3>
          <p className="text-sm text-gray-500">ID: {student.studentId}</p>
          
          {student.isSponsored && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <FaHeart className="text-green-600" /> Sponsored
            </span>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          
          {/* Class & Institution */}
          <div className="bg-teal-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-teal-800 mb-1">
              <FaSchool className="text-teal-600" />
              <span className="font-semibold">Institution & Class</span>
            </div>
            <p className="text-gray-700 text-sm ml-6">
              <span className="font-medium">{classData?.className || student.className}</span>
              {classData?.section && ` — Section ${classData.section}`}
            </p>
            <p className="text-gray-600 text-xs ml-6 mt-1">
              {student.institutionName || 'Institution not specified'}
            </p>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaUser className="text-teal-600" /> Personal Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FaCalendarAlt className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-gray-800">
                    {student.dateOfBirth
                      ? format(new Date(student.dateOfBirth), 'PPP')
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {student.gender && (
                <div className="flex items-start gap-2">
                  <FaUserFriends className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-gray-800">{student.gender}</p>
                  </div>
                </div>
              )}

              {student.guardianName && (
                <div className="flex items-start gap-2">
                  <FaUser className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Guardian</p>
                    <p className="text-gray-800">{student.guardianName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaPhone className="text-teal-600" /> Contact Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FaPhone className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-800">{student.contactNumber || 'Not provided'}</p>
                </div>
              </div>

              {student.email && (
                <div className="flex items-start gap-2">
                  <FaEnvelope className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-800 break-all">{student.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-gray-800">{student.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          {student.bio && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaBookOpen className="text-teal-600" /> Biography
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {student.bio}
              </div>
            </div>
          )}

          {/* Financial Rank */}
          {student.financial_rank && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-teal-600" /> Additional Info
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Financial Rank:</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  student.financial_rank?.toLowerCase() === 'urgent'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {student.financial_rank}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassStudentDetailsModal;