
import React from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaLink, FaFile } from 'react-icons/fa';
import { format } from 'date-fns';

const EventDetailsModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  const getEventTypeColor = (type) => {
    const colors = {
      'EXAM': 'bg-red-100 text-red-800',
      'HOLIDAY': 'bg-green-100 text-green-800',
      'EVENT': 'bg-purple-100 text-purple-800',
      'ASSIGNMENT': 'bg-yellow-100 text-yellow-800',
      'MEETING': 'bg-blue-100 text-blue-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.OTHER;
  };

  const getStatusColor = (status) => {
    const colors = {
      'UPCOMING': 'text-blue-600 bg-blue-50',
      'ONGOING': 'text-green-600 bg-green-50',
      'COMPLETED': 'text-gray-600 bg-gray-50'
    };
    return colors[status] || colors.COMPLETED;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getEventTypeColor(event.eventType)}`}>
              {event.eventTypeDisplay}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{event.title}</h2>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaCalendarAlt className="text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{event.formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaClock className="text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{event.durationDays} days</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaMapMarkerAlt className="text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaUsers className="text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Audience</p>
                <p className="font-medium">{event.targetAudienceDisplay}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-4 rounded-lg">
                {event.description}
              </div>
            </div>
          )}

          {/* Attachment */}
          {event.attachmentUrl && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Attachment</h3>
              <a
                href={event.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FaLink /> <FaFile /> View Attachment
              </a>
            </div>
          )}

          {/* Institution Info */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>Institution: {event.institutionName}</p>
            <p>Created: {format(new Date(event.createdAt), 'PPP')}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;