// src/pages/teacher/TeacherProfilePage.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUser, FaPhone, FaEnvelope, FaIdBadge, FaBriefcase,
  FaGraduationCap, FaCalendarAlt, FaUniversity, FaLock
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { getTeacherProfile } from '../../api/teacherPortal/teacherAuthApi';

const TeacherProfilePage = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacher?.teacherId) {
      fetchProfile();
    }
  }, [teacher?.teacherId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getTeacherProfile(teacher.teacherId);
      setProfile(data);
    } catch (err) {
      console.error('Profile error:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaUser className="text-teal-600" /> My Profile
        </h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* Top Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 h-32"></div>

        {/* Info Section */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16">

            {/* Avatar */}
            <div className="w-28 h-28 rounded-full border-4 border-white bg-teal-100 flex items-center justify-center shadow-lg">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-teal-600">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name + Designation */}
            <div className="flex-1 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-sm text-teal-600 font-medium mt-1">
                {profile.designation || 'Teacher'}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {profile.teacherCode}
              </p>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => navigate('/teacher/change-password')}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 
                         flex items-center gap-2 text-sm font-medium shadow-md"
            >
              <FaLock /> Change Password
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

            <InfoField
              icon={<FaPhone className="text-teal-500" />}
              label="Mobile Number"
              value={profile.phone || 'N/A'}
            />

            <InfoField
              icon={<FaEnvelope className="text-teal-500" />}
              label="Email"
              value={profile.email || 'N/A'}
            />

            <InfoField
              icon={<FaBriefcase className="text-teal-500" />}
              label="Department"
              value={profile.department || 'N/A'}
            />

            <InfoField
              icon={<FaGraduationCap className="text-teal-500" />}
              label="Specialization"
              value={profile.specialization || 'N/A'}
            />

            <InfoField
              icon={<FaIdBadge className="text-teal-500" />}
              label="Gender"
              value={profile.gender || 'N/A'}
            />

            <InfoField
              icon={<FaCalendarAlt className="text-teal-500" />}
              label="Joining Date"
              value={
                profile.joiningDate
                  ? new Date(profile.joiningDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'N/A'
              }
            />

            <InfoField
              icon={<FaUniversity className="text-teal-500" />}
              label="Institution"
              value={profile.institutionName || 'N/A'}
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* Last Login Info */}
      {profile.lastLoginAt && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-600">
          <span className="font-medium">Last Login:</span>{' '}
          {new Date(profile.lastLoginAt).toLocaleString('en-GB')}
        </div>
      )}
    </div>
  );
};

// Helper Component
const InfoField = ({ icon, label, value, fullWidth }) => (
  <div className={`${fullWidth ? 'md:col-span-2' : ''}`}>
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="text-lg">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
      </div>
    </div>
  </div>
);

export default TeacherProfilePage;