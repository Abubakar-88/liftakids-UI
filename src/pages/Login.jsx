import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginInstitution } from '../api/institutionApi';
import { loginDonor } from '../api/donarApi'; // Donor login API import করুন
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Role-specific configurations
  const roleConfig = {
    institution: {
      title: 'Institution Login',
      placeholder: 'Institution Email',
      defaultUsername: 'INST-',
      color: 'teal',
      apiLogin: loginInstitution
    },
    donar: {
      title: 'Donor Login',
      placeholder: 'Donor Email',
      defaultUsername: 'DON-',
      color: 'teal',
      apiLogin: loginDonor // Donor login function
    },
    admin: {
      title: 'Admin Login',
      placeholder: 'Admin Username',
      defaultUsername: 'ADM-',
      color: 'teal',
      apiLogin: null // Admin এর জন্য পরে implement করবেন
    }
  };

  const currentRole = roleConfig[role] || roleConfig.donar;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Institution login
      if (role === 'institution') {
        const response = await loginInstitution({
          email: username,
          password: password
        });

        if (response.success) {
          toast.success(response.message);
          localStorage.setItem('institutionData', JSON.stringify(response.institution));
          navigate('/institution/dashboard');
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } 
      // Donor login
      else if (role === 'donar') {
        const response = await loginDonor({
          email: username,
          password: password
        });

        if (response.success) {
          toast.success(response.message);
          localStorage.setItem('donorData', JSON.stringify(response.donor));
          navigate('/donor/dashboard');
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      }
      // Admin login (temporary simulation)
      else if (role === 'admin') {
        console.log(`Logging in as admin:`, username, password);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Temporary simulation for admin
        if (username === 'admin' && password === 'admin123') {
          toast.success('Admin login successful');
          localStorage.setItem('adminData', JSON.stringify({ username: username }));
          navigate('/admin/dashboard');
        } else {
          throw new Error('Invalid admin credentials');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-${currentRole.color}-600 flex items-center justify-center shadow-md`}>
          <span className="text-white text-2xl font-bold">LAK</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Lift A Kids</h1>
        <h2 className="text-xl font-semibold mt-2 text-gray-600">{currentRole.title}</h2>
      </div>

      {/* Login form */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username/Email field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-justify">
              {role === 'admin' ? 'Username' : 'Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type={role === 'admin' ? 'text' : 'email'}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={currentRole.placeholder}
                autoComplete={role === 'admin' ? 'username' : 'email'}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-justify">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
              isLoading 
                ? `bg-${currentRole.color}-400 cursor-not-allowed`
                : `bg-${currentRole.color}-600 hover:bg-${currentRole.color}-700`
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              `Login as ${currentRole.title.replace(' Login', '')}`
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={() => navigate(`/register/${role}`)}
            className={`text-${currentRole.color}-600 hover:underline font-medium`}
          >
            Register here
          </button>
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/chose-option')}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;