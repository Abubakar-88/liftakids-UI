// pages/dashboard/institution/ClassMonitorPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FaChalkboardTeacher, FaClock, FaPlay, FaCheckCircle,
  FaHourglassHalf, FaSync, FaFilter, FaMapMarkerAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  getTodayClassMonitor, 
  getClassMonitorByDay 
} from '../../../../api/InstitutionManage/teacherClassSessionApi';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Classes', color: 'bg-gray-600' },
  { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-blue-600' },
  { value: 'STARTED', label: 'Ongoing', color: 'bg-red-600' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-600' }
];

const ClassMonitorPage = () => {
  const institutionData = JSON.parse(localStorage.getItem('institutionData'));
  const institutionId = institutionData?.institutionsId;

  const [selectedDay, setSelectedDay] = useState(getTodayDisplayDay());
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function getTodayDisplayDay() {
    const dow = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(dow) ? dow : 'Saturday';
  }

  useEffect(() => {
    if (institutionId) fetchMonitor();
  }, [institutionId, selectedDay, filterStatus]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (institutionId) fetchMonitor(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [institutionId, selectedDay, filterStatus]);

  const fetchMonitor = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getClassMonitorByDay(
        selectedDay, 
        institutionId, 
        filterStatus === 'ALL' ? null : filterStatus
      );
      setMonitor(data);
    } catch (err) {
      console.error(err);
      if (!silent) toast.error('Failed to load monitor data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMonitor();
    toast.success('Refreshed');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'STARTED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full animate-pulse">🔴 Ongoing</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">✅ Completed</span>;
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">⏳ Not Started</span>;
    }
  };

  if (loading && !monitor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChalkboardTeacher className="text-teal-600" />
            Class Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track teacher class sessions in real-time
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 
                   flex items-center gap-2 disabled:opacity-50"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Day Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedDay === day
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {day}
              {day === getTodayDisplayDay() && (
                <span className="ml-2 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  TODAY
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-800">{monitor?.totalClasses || 0}</p>
            </div>
            <FaChalkboardTeacher className="text-gray-400 text-2xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700">Not Started</p>
              <p className="text-2xl font-bold text-blue-700">{monitor?.notStarted || 0}</p>
            </div>
            <FaHourglassHalf className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-700">Ongoing</p>
              <p className="text-2xl font-bold text-red-700">{monitor?.ongoing || 0}</p>
            </div>
            <FaPlay className="text-red-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-700">{monitor?.completed || 0}</p>
            </div>
            <FaCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FaFilter className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === f.value
                  ? `${f.color} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {!monitor?.schedules || monitor.schedules.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FaChalkboardTeacher className="text-5xl mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">No classes for {selectedDay}</p>
            <p className="text-sm mt-1">No scheduled classes found for this day</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {monitor.schedules.map((item) => (
              <div key={item.scheduleId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Teacher Avatar */}
                      <div className="flex items-center gap-2">
                        {item.teacherPhoto ? (
                          <img src={item.teacherPhoto} alt={item.teacherName}
                            className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                            {item.teacherName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.teacherName}</p>
                          <p className="text-xs text-gray-500 font-mono">{item.teacherCode}</p>
                        </div>
                      </div>

                      <span className="text-gray-300 hidden md:inline">|</span>

                      {/* Class Info */}
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {item.className} • <span className="text-teal-600">{item.subject}</span>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <FaClock className="text-gray-400" />
                            {item.startTime} - {item.endTime}
                          </span>
                          {item.room && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400" />
                              {item.room}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status + Timestamps */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {getStatusBadge(item.status)}
                      {item.startedAt && (
                        <span className="text-xs text-gray-500">
                          🕐 Started: {item.startedAt}
                        </span>
                      )}
                      {item.completedAt && (
                        <span className="text-xs text-gray-500">
                          ✓ Completed: {item.completedAt}
                        </span>
                      )}
                      {item.duration && (
                        <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded">
                          Duration: {item.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto Refresh Info */}
      <p className="text-xs text-gray-400 text-center">
        🔄 Auto-refreshes every 30 seconds
      </p>
    </div>
  );
};

export default ClassMonitorPage;