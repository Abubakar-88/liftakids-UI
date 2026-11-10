

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSave, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  updateSchedule, 
  getTeacherSchedule, 
  getValidClasses, 
  getValidSubjects, 
  getValidDays 
} from '../../../api/InstitutionManage/teacherApi';

const TeacherScheduleModal = ({ isOpen, onClose, teacher, institutionId }) => {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [validClasses, setValidClasses] = useState([]);
  const [validSubjects, setValidSubjects] = useState([]);
  const [validDays, setValidDays] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    className: '',
    subject: '',
    day: '',
    startTime: '',
    endTime: '',
    room: ''
  });
const [selectedDays, setSelectedDays] = useState([]);

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const toggleDay = (day) => {
  setSelectedDays(prev => 
    prev.includes(day) 
      ? prev.filter(d => d !== day)
      : [...prev, day]
  );
};

const selectAllDays = () => {
  if (selectedDays.length === DAYS.length) {
    setSelectedDays([]);
  } else {
    setSelectedDays([...DAYS]);
  }
};
  useEffect(() => {
    if (isOpen && teacher && institutionId) {
      loadAllData();
      fetchSchedule();
    }
  }, [isOpen, teacher, institutionId]);

  const loadAllData = async () => {
    try {
      const [classes, subjects, days] = await Promise.all([
        getValidClasses(institutionId),
        getValidSubjects(institutionId),
        getValidDays()
      ]);
      setValidClasses(classes || []);
      setValidSubjects(subjects || []);
      setValidDays(days || []);
    } catch (error) {
      console.error('Error loading valid values:', error);
      toast.error('Failed to load data');
    }
  };

  const fetchSchedule = async () => {
    try {
      const data = await getTeacherSchedule(teacher.id);
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    }
  };
const handleAddSchedule = () => {
  if (!newSchedule.className || !newSchedule.subject 
      || selectedDays.length === 0 
      || !newSchedule.startTime || !newSchedule.endTime) {
    toast.warning('Please select class, subject, days, and time');
    return;
  }

  if (newSchedule.startTime >= newSchedule.endTime) {
    toast.warning('End time must be after start time');
    return;
  }

  // Create schedule entries for each selected day
  const newEntries = [];
  const duplicates = [];

  for (const day of selectedDays) {
    const isDuplicate = schedules.some(s =>
      s.className === newSchedule.className &&
      s.subject === newSchedule.subject &&
      s.day === day &&
      s.startTime === newSchedule.startTime &&
      s.endTime === newSchedule.endTime
    );

    if (isDuplicate) {
      duplicates.push(day);
    } else {
      newEntries.push({
        className: newSchedule.className,
        subject: newSchedule.subject,
        day: day,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        room: newSchedule.room || ''
      });
    }
  }

  if (newEntries.length === 0) {
    toast.warning('All selected days already have this schedule');
    return;
  }

  if (duplicates.length > 0) {
    toast.warning(`Skipped duplicates: ${duplicates.join(', ')}`);
  }

  setSchedules(prev => [...prev, ...newEntries]);
  toast.success(`Added ${newEntries.length} schedule(s)`);

  // Reset form
  setNewSchedule({
    className: '',
    subject: '',
    day: '',
    startTime: '',
    endTime: '',
    room: ''
  });
  setSelectedDays([]);
};

  const handleRemoveSchedule = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

 const handleSave = async () => {
    // ✅ Prevent double-click
    if (loading) return;

    if (schedules.length === 0) {
        toast.warning('No schedule to save');
        return;
    }

    setLoading(true);
    try {
        // Convert to payload
        const payload = {
            schedules: schedules.map(s => ({
                className: s.className,
                subject: s.subject,
                day: s.day,
                startTime: s.startTime,
                endTime: s.endTime,
                room: s.room || ''
            }))
        };

        console.log('📤 Sending schedule payload:', payload);

        await updateSchedule(teacher.id, payload, institutionId);
        toast.success('Schedule updated successfully!');
        onClose();
    } catch (error) {
        console.error('Error saving schedule:', error);
        toast.error(error.response?.data?.message || 'Failed to save schedule');
    } finally {
        setLoading(false);
    }
};

  const handleNewScheduleChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  // Group schedules by day
  const groupedSchedules = validDays.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day === day);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaClock className="mr-2 text-teal-600" />
              Teacher Schedule
            </h2>
            <p className="text-sm text-gray-500">{teacher?.name} - {teacher?.teacherId}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Add Schedule Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <FaPlus className="mr-2 text-teal-600" /> Add Schedule
          </h3>

          {/* Row 1: Class + Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <select
              name="className"
              value={newSchedule.className}
              onChange={handleNewScheduleChange}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Class</option>
              {validClasses.map((cls, index) => (
                <option key={index} value={cls}>{cls}</option>
              ))}
            </select>

            <select
            name="subject"
            value={newSchedule.subject}
            onChange={handleNewScheduleChange}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Subject</option>
            {validSubjects.map((sub, index) => (
              <option key={index} value={sub}>{sub}</option>
            ))}
          </select>
          </div>

          {/* Row 2: DAY SELECTION (Multi-Checkbox) */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Days * <span className="text-xs text-gray-500">(one or more)</span>
              </label>
              <button
                type="button"
                onClick={selectAllDays}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                {selectedDays.length === DAYS.length ? '✕ Clear All' : '✓ Select All Weekdays'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-400'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>

            {selectedDays.length > 0 && (
              <p className="text-xs text-teal-600 mt-2">
                📅 {selectedDays.length} day(s) selected: {selectedDays.join(', ')}
              </p>
            )}
          </div>

          {/* Row 3: Time + Room */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="time"
              name="startTime"
              value={newSchedule.startTime}
              onChange={handleNewScheduleChange}
              className="px-3 py-2 border rounded-lg"
              placeholder="Start time"
            />
            <input
              type="time"
              name="endTime"
              value={newSchedule.endTime}
              onChange={handleNewScheduleChange}
              className="px-3 py-2 border rounded-lg"
              placeholder="End time"
            />
            <div className="flex gap-2">
              <input
                type="text"
                name="room"
                value={newSchedule.room}
                onChange={handleNewScheduleChange}
                placeholder="Room (optional)"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddSchedule}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 whitespace-nowrap flex items-center gap-1"
              >
                <FaPlus className="inline" /> Add
              </button>
            </div>
          </div>
        </div>

          {/* Schedule List */}
          <div className="space-y-6">
            {validDays.map((day) => {
              const daySchedules = groupedSchedules[day] || [];
              if (daySchedules.length === 0) return null;
              
              return (
                <div key={day}>
                  <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">{day}</h4>
                  <div className="space-y-2">
                    {daySchedules.map((schedule, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-medium text-gray-800">{schedule.className}</span>
                          <span className="text-gray-600">{schedule.subject}</span>
                          {schedule.room && (
                            <span className="text-sm text-gray-400">🏠 {schedule.room}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            ⏰ {schedule.startTime} - {schedule.endTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSchedule(schedules.indexOf(schedule))}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Remove"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {schedules.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FaClock className="text-5xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No schedule added yet</p>
                <p className="text-sm">Add schedule entries using the form above</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || schedules.length === 0}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              <FaSave className="mr-2" /> 
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherScheduleModal;