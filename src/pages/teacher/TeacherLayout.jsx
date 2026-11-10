
import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherNavbar from '../../components/teacher/TeacherNavbar';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';

const TeacherLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNavbar />
      <div className="flex">
        <TeacherSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;