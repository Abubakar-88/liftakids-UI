import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        // Check for different user types
        const donorData = localStorage.getItem('donorData');
        const institutionData = localStorage.getItem('institutionData');
        const adminData = localStorage.getItem('adminData');

        let userType = null;
        let userData = null;

        if (donorData) {
          userType = 'DONOR';
          userData = JSON.parse(donorData);
        } else if (institutionData) {
          userType = 'INSTITUTION';
          userData = JSON.parse(institutionData);
        } else if (adminData) {
          userType = 'ADMIN';
          userData = JSON.parse(adminData);
        }

        if (userType && userData) {
          setUser({
            type: userType,
            data: userData,
            id: userData.donorId || userData.institutionId || userData.adminId || userData.id
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check authentication on route change
  useEffect(() => {
    if (loading) return;

    const currentPath = location.pathname;
    
    // If user is logged in and trying to access login pages, redirect to dashboard
    if (user) {
      if (currentPath.startsWith('/login')) {
        switch (user.type) {
          case 'DONOR':
            navigate('/donor/dashboard', { replace: true });
            break;
          case 'INSTITUTION':
            navigate('/institution/dashboard', { replace: true });
            break;
          case 'ADMIN':
            navigate('/admin/dashboard', { replace: true });
            break;
        }
      }
    }
  }, [location, user, loading, navigate]);

  const login = (userType, userData) => {
    // Store in localStorage based on user type
    switch (userType) {
      case 'DONOR':
        localStorage.setItem('donorData', JSON.stringify(userData));
        break;
      case 'INSTITUTION':
        localStorage.setItem('institutionData', JSON.stringify(userData));
        break;
      case 'ADMIN':
        localStorage.setItem('adminData', JSON.stringify(userData));
        break;
    }

    setUser({
      type: userType,
      data: userData,
      id: userData.donorId || userData.institutionId || userData.adminId || userData.id
    });

    // Redirect to dashboard
    switch (userType) {
      case 'DONOR':
        navigate('/donor/dashboard');
        break;
      case 'INSTITUTION':
        navigate('/institution/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
    }
  };

  const logout = () => {
    // Clear all user data
    localStorage.removeItem('donorData');
    localStorage.removeItem('institutionData');
    localStorage.removeItem('adminData');
    
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};