
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';

const EventFormModal = ({ isOpen, onClose, onSave, event, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    eventType: 'OTHER',
    eventColor: '#3b82f6',
    targetAudience: 'ALL',
    isPublic: true,
    location: '',
    attachmentUrl: ''
  });

  const eventTypes = [
    { value: 'EXAM', label: '📝 Exam' },
    { value: 'HOLIDAY', label: '🎉 Holiday' },
    { value: 'EVENT', label: '🎪 Event' },
    { value: 'ASSIGNMENT', label: '📚 Assignment' },
    { value: 'MEETING', label: '🤝 Meeting' },
    { value: 'OTHER', label: '📌 Other' }
  ];

  const targetAudiences = [
    { value: 'ALL', label: '👥 All' },
    { value: 'STUDENTS', label: '🎓 Students' },
    { value: 'TEACHERS', label: '👨‍🏫 Teachers' },
    { value: 'ADMIN', label: '👔 Admin' },
    { value: 'PARENTS', label: '👨‍👩‍👧 Parents' }
  ];

  useEffect(() => {
    if (event && isEditing) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate || '',
        endDate: event.endDate || '',
        eventType: event.eventType || 'OTHER',
        eventColor: event.eventColor || '#3b82f6',
        targetAudience: event.targetAudience || 'ALL',
        isPublic: event.isPublic !== undefined ? event.isPublic : true,
        location: event.location || '',
        attachmentUrl: event.attachmentUrl || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        eventType: 'OTHER',
        eventColor: '#3b82f6',
        targetAudience: 'ALL',
        isPublic: true,
        location: '',
        attachmentUrl: ''
      });
    }
  }, [event, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {targetAudiences.map(audience => (
                    <option key={audience.value} value={audience.value}>{audience.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Hall Room, Online, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Color</label>
              <input
                type="color"
                name="eventColor"
                value={formData.eventColor}
                onChange={handleChange}
                className="w-full h-12 px-2 py-1 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Public/Private */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Make this event public</label>
            </div>

            {/* Attachment URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment URL</label>
              <input
                type="url"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleChange}
                placeholder="https://example.com/file.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;