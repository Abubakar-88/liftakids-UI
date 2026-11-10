// src/pages/teacher/TeacherLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMobileAlt, FaLock, FaEye, FaEyeSlash, FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { teacherLogin } from '../../api/teacherPortal/teacherAuthApi';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const { loginTeacher } = useTeacherAuth();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!mobile.trim()) return toast.warning('Please enter mobile number');
    if (!password) return toast.warning('Please enter password');

    const cleanedMobile = mobile.replace(/\s+/g, '');
    if (!/^01[0-9]{9}$/.test(cleanedMobile)) {
      return toast.warning('Please enter a valid 11-digit mobile number');
    }

    setLoading(true);
    try {
      const resp = await teacherLogin(cleanedMobile, password);

      if (!resp.success) {
        toast.error(resp.message || 'Login failed');
        return;
      }

      loginTeacher(resp);
      toast.success(`Welcome, ${resp.name}!`);

      // Force password change
      if (resp.mustChangePassword) {
        navigate('/teacher/change-password');
      } else {
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4 text-sm"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
              <FaChalkboardTeacher className="text-3xl" />
            </div>
            <h1 className="text-2xl font-bold">Teacher Login</h1>
            <p className="text-teal-100 text-sm mt-1">
              Login with your registered mobile number
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMobileAlt className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  maxLength={15}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                             transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="off"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                             transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
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
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="px-6 pb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <p className="font-semibold mb-1">🔒 First time login?</p>
              <p>
                Your default password is the last 6 digits of your registered mobile number.
                Please change it after first login.
              </p>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Forgot password? Contact your Institution Admin.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Lift A Kid. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default TeacherLoginPage;