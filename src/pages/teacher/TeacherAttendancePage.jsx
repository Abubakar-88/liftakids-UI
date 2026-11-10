
import React, { useState, useEffect } from 'react';
import {
  FaClipboardCheck, FaCalendarAlt, FaCheckCircle,
  FaTimesCircle, FaClock, FaSave, FaUsers, FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
import { getAttendanceSheet, saveAttendance } from '../../api/teacherPortal/teacherAttendanceApi';
import { getValidClasses } from '../../api/InstitutionManage/teacherApi'; // Teacher's assigned classes

const TeacherAttendancePage = () => {
  const { teacher } = useTeacherAuth();
  
  // States
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load Classes on Mount
  useEffect(() => {
    if (teacher?.institutionId) {
      loadClasses();
    }
  }, [teacher?.institutionId]);

  // Load Attendance Sheet when Class or Date changes
  useEffect(() => {
    if (selectedClass && selectedDate && teacher?.teacherId) {
      fetchAttendanceSheet();
    }
  }, [selectedClass, selectedDate, teacher?.teacherId]);

  const loadClasses = async () => {
    try {
      const data = await getValidClasses(teacher.institutionId);
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClass(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load classes');
    }
  };

  const fetchAttendanceSheet = async () => {
    setLoading(true);
    try {
      const data = await getAttendanceSheet(selectedClass, selectedDate, teacher.teacherId);
      setStudents(data.students || []);
      setAlreadyMarked(data.alreadyMarked);
      updateStats(data.students || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (studentList) => {
    let present = 0, absent = 0, late = 0;
    studentList.forEach(s => {
      if (s.status === 'PRESENT') present++;
      else if (s.status === 'ABSENT') absent++;
      else if (s.status === 'LATE') late++;
    });
    setStats({
      total: studentList.length,
      present,
      absent,
      late
    });
  };

  const handleStatusChange = (studentId, newStatus) => {
    const updated = students.map(s => 
      s.studentId === studentId ? { ...s, status: newStatus } : s
    );
    setStudents(updated);
    updateStats(updated);
  };

  const handleRemarkChange = (studentId, remarks) => {
    const updated = students.map(s => 
      s.studentId === studentId ? { ...s, remarks } : s
    );
    setStudents(updated);
  };

  // Bulk Actions
  const markAllPresent = () => {
    const updated = students.map(s => ({ ...s, status: 'PRESENT' }));
    setStudents(updated);
    updateStats(updated);
    toast.info('All students marked Present');
  };

  const markAllAbsent = () => {
    const updated = students.map(s => ({ ...s, status: 'ABSENT' }));
    setStudents(updated);
    updateStats(updated);
    toast.info('All students marked Absent');
  };

  const handleSave = async () => {
    if (students.length === 0) return toast.warning('No students to save');
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        className: selectedClass,
        date: selectedDate,
        records: students.map(s => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks || ''
        }))
      };

      const resp = await saveAttendance(payload, teacher.teacherId);
      setAlreadyMarked(true);
      toast.success('Attendance saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaClipboardCheck /> Attendance
          </h1>
          <p className="text-teal-100 mt-1">Mark daily student attendance</p>
        </div>
        
        {alreadyMarked && (
          <div className="bg-green-500/20 border border-green-300 rounded-lg px-4 py-2 flex items-center gap-2 text-sm backdrop-blur-sm">
            <FaCheckCircle className="text-green-300" />
            Already marked for this date
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Stats & Bulk Action */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-xs text-green-700">Present</p>
            <p className="text-2xl font-bold text-green-700">{stats.present}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-xs text-red-700">Absent</p>
            <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-xs text-yellow-700">Late</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={markAllPresent}
              className="flex-1 md:flex-none px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition flex items-center justify-center gap-2"
            >
              <FaCheckCircle /> All Present
            </button>
            <button
              onClick={markAllAbsent}
              className="flex-1 md:flex-none px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center justify-center gap-2"
            >
              <FaTimesCircle /> All Absent
            </button>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="w-full md:w-auto px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {/* Student List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-500">Loading students...</p>
          </div>
        ) : !selectedClass ? (
          <div className="text-center py-16 text-gray-400">
            <FaUsers className="text-5xl mx-auto mb-4 text-gray-300" />
            <p>Please select a class to mark attendance</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaExclamationTriangle className="text-4xl mx-auto mb-3 text-yellow-400" />
            <p>No students found in this class</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <div key={student.studentId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  {/* Left: Student Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt={student.studentName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                        {student.studentName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{student.studentName}</p>
                      <p className="text-xs text-gray-500">Guardian: {student.guardianName || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Right: Status Toggles & Remarks */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
                    {/* Remarks Input (optional, can be hidden if too long) */}
                    <input
                      type="text"
                      placeholder="Remarks (optional)"
                      value={student.remarks || ''}
                      onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded text-sm w-full md:w-40 focus:ring-1 focus:ring-teal-500"
                    />

                    {/* Status Buttons */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                      <button
                        onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                          student.status === 'PRESENT' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-white'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                          student.status === 'ABSENT' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-white'
                        }`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.studentId, 'LATE')}
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                          student.status === 'LATE' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-500 hover:bg-white'
                        }`}
                      >
                        L
                      </button>
                    </div>
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

export default TeacherAttendancePage;