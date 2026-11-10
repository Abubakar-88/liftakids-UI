
import React, { createContext, useContext, useState, useEffect } from 'react';

const TeacherAuthContext = createContext(null);

export const useTeacherAuth = () => {
  const ctx = useContext(TeacherAuthContext);
  if (!ctx) throw new Error('useTeacherAuth must be used inside TeacherAuthProvider');
  return ctx;
};

export const TeacherAuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('teacherToken');
    const storedTeacher = localStorage.getItem('teacherData');

    if (storedToken && storedTeacher) {
      setToken(storedToken);
      try {
        setTeacher(JSON.parse(storedTeacher));
      } catch {
        localStorage.removeItem('teacherData');
      }
    }
    setLoading(false);
  }, []);

  const loginTeacher = (loginResponse) => {
    localStorage.setItem('teacherToken', loginResponse.token);
    localStorage.setItem('teacherData', JSON.stringify({
      teacherId: loginResponse.teacherId,
      teacherCode: loginResponse.teacherCode,
      name: loginResponse.name,
      designation: loginResponse.designation,
      photoUrl: loginResponse.photoUrl,
      institutionId: loginResponse.institutionId,
      institutionName: loginResponse.institutionName,
      mustChangePassword: loginResponse.mustChangePassword
    }));
    setToken(loginResponse.token);
    setTeacher({
      teacherId: loginResponse.teacherId,
      teacherCode: loginResponse.teacherCode,
      name: loginResponse.name,
      designation: loginResponse.designation,
      photoUrl: loginResponse.photoUrl,
      institutionId: loginResponse.institutionId,
      institutionName: loginResponse.institutionName,
      mustChangePassword: loginResponse.mustChangePassword
    });
  };

  const updateTeacher = (partial) => {
    const updated = { ...teacher, ...partial };
    localStorage.setItem('teacherData', JSON.stringify(updated));
    setTeacher(updated);
  };

  const logoutTeacher = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherData');
    setToken(null);
    setTeacher(null);
  };

  const value = {
    teacher,
    token,
    loading,
    isAuthenticated: !!token,
    loginTeacher,
    logoutTeacher,
    updateTeacher
  };

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
};