
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { teacherChangePassword } from '../../api/teacherPortal/teacherAuthApi';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';

const TeacherChangePasswordPage = () => {
  const navigate = useNavigate();
  const { teacher, updateTeacher, isAuthenticated } = useTeacherAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/teacher/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword) return toast.warning('Enter current password');
    if (!newPassword) return toast.warning('Enter new password');
    if (newPassword.length < 6) return toast.warning('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.warning('Passwords do not match');
    if (newPassword === currentPassword) return toast.warning('New password must be different');

    setLoading(true);
    try {
      await teacherChangePassword(teacher.teacherId, {
        currentPassword,
        newPassword,
        confirmPassword
      });

      toast.success('Password changed successfully!');
      updateTeacher({ mustChangePassword: false });
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error('Change password error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to change password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
              <FaShieldAlt className="text-3xl" />
            </div>
            <h1 className="text-2xl font-bold">Change Password</h1>
            <p className="text-orange-100 text-sm mt-1">
              For security, please change your password
            </p>
          </div>

          {/* Warning Banner */}
          {teacher?.mustChangePassword && (
            <div className="bg-yellow-50 border-b border-yellow-200 p-3 text-xs text-yellow-800 text-center">
              ⚠️ You must change your password before continuing
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">Password Requirements:</p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-2 ${formData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                  <FaCheckCircle className="text-xs" />
                  At least 6 characters
                </li>
                <li className={`flex items-center gap-2 ${formData.newPassword && formData.newPassword !== formData.currentPassword ? 'text-green-600' : ''}`}>
                  <FaCheckCircle className="text-xs" />
                  Different from current password
                </li>
                <li className={`flex items-center gap-2 ${formData.newPassword && formData.newPassword === formData.confirmPassword ? 'text-green-600' : ''}`}>
                  <FaCheckCircle className="text-xs" />
                  Passwords match
                </li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white 
                         rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherChangePasswordPage;