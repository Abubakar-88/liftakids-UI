// hooks/usePasswordChange.js
import { useState, useCallback } from 'react';
import { changeDonorPassword } from '../api/donarApi';

export const usePasswordChange = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const changePassword = useCallback(async (passwordData) => {
    // Get donorId from localStorage inside the function
    const donorData = localStorage.getItem('donorData');
    if (!donorData) {
      const errorMsg = 'Donor information not found. Please login again.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const parsedData = JSON.parse(donorData);
    const donorId = parsedData.donorId;
    
    if (!donorId) {
      const errorMsg = 'Donor ID is required';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Changing password for donor ID:', donorId);

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await changeDonorPassword(donorId, passwordData);
      setSuccess(true);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  };

  return {
    changePassword,
    isLoading,
    error,
    success,
    resetState,
  };
};