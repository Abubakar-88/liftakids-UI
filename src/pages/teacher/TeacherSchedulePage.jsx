
import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaBook,
  FaChalkboardTeacher, FaSync, FaCheckCircle, FaHourglassHalf
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { getWeeklySchedule } from '../../api/teacherPortal/teacherScheduleApi';

const TeacherSchedulePage = () => {
  const { teacher } = useTeacherAuth();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');

  // আজকের দিনটি ডিফল্ট হিসেবে সেট করার লজিক
  const getTodayName = () => {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    // শুক্রবার ছুটি থাকলে শনিবার সিলেক্ট হবে
    if (day === 'Friday') return 'Saturday';
    return day;
  };

  useEffect(() => {
    if (teacher?.teacherId) {
      fetchSchedule();
    }
  }, [teacher?.teacherId]);

  // প্রথমবার লোড হলে আজকের দিন সিলেক্ট হবে
  useEffect(() => {
    if (scheduleData && scheduleData.days && !selectedDay) {
      const today = getTodayName();
      const hasToday = scheduleData.days.some(d => d.day === today && d.classCount > 0);
      // আজকের দিনে ক্লাস থাকলে সেটাই দেখাবে, না থাকলে শনিবার
      setSelectedDay(hasToday ? today : 'Saturday');
    }
  }, [scheduleData, selectedDay]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await getWeeklySchedule(teacher.teacherId);
      setScheduleData(data);
    } catch (err) {
      console.error('Schedule fetch error:', err);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchedule();
    setRefreshing(false);
    toast.success('Schedule refreshed');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'STARTED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">🔴 Ongoing</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✅ Completed</span>;
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">⏳ Upcoming</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="mt-4 text-gray-500">Loading your schedule...</p>
      </div>
    );
  }

  const todayName = getTodayName();
  const activeDayData = scheduleData?.days?.find(d => d.day === selectedDay);

  return (
    <div className="space-y-6">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start md:items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FaCalendarAlt /> My Schedule
            </h1>
            <p className="text-teal-100 mt-2 text-sm md:text-base">
              {scheduleData?.teacherName} • {scheduleData?.designation}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2 text-sm font-medium"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-teal-100 text-xs">Total Classes</p>
            <p className="text-2xl font-bold">{scheduleData?.totalClasses || 0}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-teal-100 text-xs">Total Days</p>
            <p className="text-2xl font-bold">{scheduleData?.totalDays || 0}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm col-span-2">
            <p className="text-teal-100 text-xs">Institution</p>
            <p className="text-lg font-bold truncate">{scheduleData?.institutionName}</p>
          </div>
        </div>
      </div>

      {/* ═══════════ DAY TABS ═══════════ */}
      <div className="bg-white rounded-xl shadow-sm p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {scheduleData?.days?.map((day) => {
            const isSelected = selectedDay === day.day;
            const isToday = todayName === day.day;

            return (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`relative px-4 md:px-6 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center min-w-[100px] ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{day.day}</span>
                <span className={`text-xs mt-1 ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                  {day.classCount} Classes
                </span>
                
                {/* Today Indicator */}
                {isToday && (
                  <span className="absolute -top-2 -right-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    TODAY
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════ SCHEDULE LIST ═══════════ */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">
            {selectedDay}'s Classes
          </h2>
          <span className="text-sm text-gray-500">
            {activeDayData?.classCount || 0} total
          </span>
        </div>

        {!activeDayData || activeDayData.classes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaHourglassHalf className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No Classes on {selectedDay}</p>
            <p className="text-sm mt-1">Enjoy your free time! 🎉</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeDayData.classes.map((cls) => (
              <div key={cls.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  {/* Left: Class Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                      <FaBook className="text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg">{cls.className}</h3>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium text-teal-600">{cls.subject}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-gray-400" />
                          {cls.startTime} - {cls.endTime}
                        </span>
                        {cls.room && (
                          <span className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-gray-400" />
                            Room: {cls.room}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status */}
                  <div className="flex-shrink-0 md:text-right">
                    {getStatusBadge(cls.status)}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-2">
        <FaCheckCircle className="text-green-500" />
        Status shows your real-time class progress
      </p>

    </div>
  );
};

export default TeacherSchedulePage;