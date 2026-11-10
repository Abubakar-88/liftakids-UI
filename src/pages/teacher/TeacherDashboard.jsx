// src/pages/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  FaChalkboardTeacher, FaUsers, FaCalendarDay, FaTasks,
  FaClock, FaBullhorn, FaBook, FaMapMarkerAlt, FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { getTeacherDashboardStats } from '../../api/teacherPortal/teacherAuthApi';
import { startClass, completeClass, resetClassSession } from '../../api/InstitutionManage/teacherClassSessionApi';
const TeacherDashboard = () => {
  const { teacher } = useTeacherAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const [showCompleteCustom, setShowCompleteCustom] = useState(false);
const [customEndTimeVal, setCustomEndTimeVal] = useState('');
  useEffect(() => {
    if (teacher?.teacherId) {
      fetchStats();
    }
  }, [teacher?.teacherId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getTeacherDashboardStats(teacher.teacherId);
      setStats(data);
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            ✅ Done
          </span>
        );
      case 'ONGOING':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            🔴 Ongoing
          </span>
        );
      case 'UPCOMING':
      default:
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            ⏳ Upcoming
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">MEDIUM</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">LOW</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ═══════════ WELCOME CARD ═══════════ */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              👋 Welcome, {stats?.teacherName || teacher?.name}!
            </h1>
            <p className="text-teal-100 mt-1">
              {stats?.designation || teacher?.designation} • {stats?.institutionName || teacher?.institutionName}
            </p>
            <p className="text-teal-200 text-sm mt-1 font-mono">
              {stats?.teacherCode || teacher?.teacherCode}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2 text-sm"
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ═══════════ STATS CARDS ═══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <StatCard
          icon={<FaBook className="text-teal-600" />}
          bgColor="bg-teal-50"
          borderColor="border-teal-200"
          label="Total Classes"
          value={stats?.totalClasses || 0}
        />

        <StatCard
          icon={<FaUsers className="text-blue-600" />}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
          label="Total Students"
          value={stats?.totalStudents || 0}
        />

        <StatCard
          icon={<FaCalendarDay className="text-purple-600" />}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          label="Today's Classes"
          value={stats?.todayClasses || 0}
        />

        <StatCard
          icon={<FaTasks className="text-orange-600" />}
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
          label="Pending Tasks"
          value={stats?.pendingTaskCount || 0}
        />
      </div>

      {/* ═══════════ MAIN GRID ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

 {/* ═══════════ TODAY'S SCHEDULE ═══════════ */}
<div className="bg-white rounded-xl shadow-sm p-5">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
      <FaClock className="text-teal-600" /> Today's Schedule
    </h2>
  </div>

  {!stats?.todaySchedule || stats.todaySchedule.length === 0 ? (
    <div className="text-center py-10 text-gray-400">
      <FaCalendarDay className="text-4xl mx-auto mb-3" />
      <p className="text-sm">No classes scheduled for today 🎉</p>
    </div>
  ) : (
    <div className="space-y-3">
      {/* 👇 এখানে ScheduleItem ব্যবহার করুন */}
      {stats.todaySchedule.map((item) => (
        <ScheduleItem
          key={item.scheduleId}
          item={item}
          teacherId={teacher.teacherId}
          onActionComplete={fetchStats} 
        />
      ))}
    </div>
  )}
</div>



        {/* ═══════════ RECENT NOTICES ═══════════ */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaBullhorn className="text-orange-500" /> Recent Notices
            </h2>
            <span className="text-xs text-gray-500">
              {stats?.recentNotices?.length || 0} notice(s)
            </span>
          </div>

          {!stats?.recentNotices || stats.recentNotices.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FaBullhorn className="text-4xl mx-auto mb-3" />
              <p className="text-sm">No notices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-gray-800 text-sm flex-1">
                      {notice.title}
                    </p>
                    {getPriorityBadge(notice.priority)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {notice.createdAt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ PENDING TASKS ═══════════ */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" /> Pending Tasks
          </h2>
          <span className="text-xs text-gray-500">
            {stats?.pendingTasks?.length || 0} task(s)
          </span>
        </div>

        {!stats?.pendingTasks || stats.pendingTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FaTasks className="text-4xl mx-auto mb-3" />
            <p className="text-sm">No pending tasks 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.pendingTasks.map((task, idx) => (
              <div
                key={idx}
                className="border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-yellow-700 uppercase">
                      {task.type}
                    </span>
                    <p className="font-medium text-gray-800 mt-1">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {task.description}
                    </p>
                    {task.className && (
                      <p className="text-xs text-teal-600 mt-1">
                        Class: {task.className}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// HELPER COMPONENT: Stat Card
// ═══════════════════════════════════════════
const StatCard = ({ icon, bgColor, borderColor, label, value }) => (
  <div className={`${bgColor} ${borderColor} border rounded-xl p-4 transition hover:shadow-md`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

const ScheduleItem = ({ item, teacherId, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(item.status || 'NOT_STARTED');
  
  // ✅ Start Custom Time States
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState('');

  // ✅ Complete Custom Time States
  const [showCompleteCustom, setShowCompleteCustom] = useState(false);
  const [customEndTimeVal, setCustomEndTimeVal] = useState('');

  // লাইভ টাইমার
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const startTimeInMinutes = parseTime(item.startTime);
  const endTimeInMinutes = parseTime(item.endTime);

  const canStartNow = currentTimeInMinutes >= (startTimeInMinutes - 10);
  const isMissed = currentTimeInMinutes > endTimeInMinutes;

  // ================== START LOGIC ==================
  const handleCustomStartSubmit = async () => {
    if (!customTimeValue) return toast.warning('Please select a time');
    await handleStart(customTimeValue);
  };

  const handleStart = async (customTime = null) => {
    setLoading(true);
    try {
      const payload = {
        scheduleId: item.scheduleId,
        customStartTime: customTime ? customTime + ":00" : null
      };

      const resp = await startClass(item.scheduleId, teacherId, payload);
      if (resp.success) {
        toast.success('Class started successfully!');
        setStatus('STARTED');
        setShowCustomInput(false);
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(resp.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start class');
    } finally {
      setLoading(false);
    }
  };

   // ================== COMPLETE LOGIC ==================
  const handleCompleteSubmit = async (customEndTime = null) => {
    if (!window.confirm(`Are you sure you want to mark ${item.className} - ${item.subject} as COMPLETED?`)) {
      return; 
    }
    
    setLoading(true);
    try {
      const payload = {
        // যদি কাস্টম টাইম থাকে তবে সেটা যাবে, না থাকলে null যাবে
        customEndTime: customEndTime ? customEndTime + ":00" : null 
      };

      const resp = await completeClass(item.scheduleId, teacherId, payload); 
      if (resp.success) {
        toast.success('Class completed successfully!');
        setStatus('COMPLETED');
        setShowCompleteCustom(false);
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(resp.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete class');
    } finally {
      setLoading(false);
    }
  };
  // ================== RESET LOGIC ==================
  const handleResetForTest = async () => {
    if (!window.confirm("Reset this class status to NOT_STARTED for testing?")) return;
    
    setLoading(true);
    try {
      await resetClassSession(item.scheduleId, teacherId);
      toast.success("Class status reset successfully!");
      setStatus('NOT_STARTED'); 
      if (onActionComplete) onActionComplete(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`border-2 rounded-lg p-3 transition ${
      status === 'STARTED' ? 'border-red-300 bg-red-50' 
      : status === 'COMPLETED' ? 'border-green-300 bg-green-50'
      : 'border-gray-200 hover:border-teal-300 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800">{item.className}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-teal-600 font-medium">{item.subject}</span>
            
            {status === 'STARTED' && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">🔴 Ongoing</span>}
            {status === 'COMPLETED' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✅ Completed</span>}
            {status === 'NOT_STARTED' && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">⏳ Not Started</span>}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">⏰ {item.startTime} - {item.endTime}</span>
            {item.room && <span className="flex items-center gap-1">🏠 {item.room}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 items-end">
          
          {/* ═══════════ NOT STARTED ACTIONS ═══════════ */}
          {status === 'NOT_STARTED' && !showCustomInput && (
            <>
              {isMissed ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition shadow-sm"
                >
                  🕒 Late Start (Custom)
                </button>
              ) : (
                <button
                  onClick={() => handleStart(null)}
                  disabled={loading || !canStartNow}
                  title={!canStartNow ? `You can start from ${item.startTime}` : 'Start Class'}
                  className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition shadow-sm ${
                    canStartNow ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? '...' : '▶ Start Class'}
                </button>
              )}
            </>
          )}
          
          {showCustomInput && (
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-300">
              <span className="text-xs font-medium text-gray-700">Start Time:</span>
              <input
                type="time"
                value={customTimeValue}
                onChange={(e) => setCustomTimeValue(e.target.value)}
                className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                onClick={handleCustomStartSubmit}
                disabled={loading}
                className="px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowCustomInput(false)}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}

        {/* ═══════════ STARTED ACTIONS ═══════════ */}
{status === 'STARTED' && !showCompleteCustom && (
  <div className="flex gap-2">
      <button 
        onClick={() => setShowCompleteCustom(true)} 
        className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition"
      >
          🕒 Custom
      </button>
      <button 
        onClick={() => handleCompleteSubmit(null)} // 👈 এখানে null পাস হচ্ছে (Complete Now)
        disabled={loading}
        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
      >
          {loading ? '...' : '✓ Complete Now'}
      </button>
  </div>
)}

{/* কাস্টম Complete ইনপুট */}
{showCompleteCustom && (
  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-300">
    <span className="text-xs font-medium text-gray-700">End Time:</span>
    <input 
      type="time" 
      value={customEndTimeVal} 
      onChange={(e) => setCustomEndTimeVal(e.target.value)} 
      className="px-2 py-1 text-sm border rounded"
    />
    <button 
      onClick={() => handleCompleteSubmit(customEndTimeVal)} // 👈 এখানে কাস্টম টাইম পাস হচ্ছে
      disabled={loading} 
      className="px-2 py-1 bg-teal-600 text-white text-xs rounded"
    >
      Confirm
    </button>
    <button 
      onClick={() => setShowCompleteCustom(false)} 
      className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded"
    >
      Cancel
    </button>
  </div>
)}
         

          {/* ═══════════ COMPLETED ACTIONS ═══════════ */}
          {status === 'COMPLETED' && (
            <button
              onClick={handleResetForTest}
              disabled={loading}
              className="px-3 py-1.5 mt-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition border border-gray-300"
            >
              🔄 Reset (Test Only)
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
export default TeacherDashboard;