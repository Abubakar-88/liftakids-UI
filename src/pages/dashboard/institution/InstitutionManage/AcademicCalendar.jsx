// pages/dashboard/institution/AcademicCalendar.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaCalendarAlt, 
  FaClock, FaFilter, FaEye, FaTimes, FaCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { 
  getEventsByInstitution, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getEventStatistics,
  getUpcomingEvents,
  getOngoingEvents
} from '../../../../api/InstitutionManage/academicCalendarApi';
import EventFormModal from '../../../../components/Modal/EventFormModal';
import EventDetailsModal from '../../../../components/Modal/EventDetailsModal';

const AcademicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const institutionId = JSON.parse(localStorage.getItem('institutionData'))?.institutionsId;

  useEffect(() => {
    if (institutionId) {
      fetchAllData();
    }
  }, [institutionId, currentPage, filter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [eventsData, statsData, upcomingData, ongoingData] = await Promise.all([
        getEventsByInstitution(institutionId, currentPage, 10, 'startDate', 'desc'),
        getEventStatistics(institutionId),
        getUpcomingEvents(institutionId),
        getOngoingEvents(institutionId)
      ]);

      setEvents(eventsData.content || []);
      setTotalPages(eventsData.totalPages || 1);
      setStats(statsData);
      setUpcomingEvents(upcomingData || []);
      setOngoingEvents(ongoingData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const createdBy = JSON.parse(localStorage.getItem('institutionData'))?.institutionsId;
      await createEvent(eventData, institutionId, createdBy);
      toast.success('Event created successfully!');
      setShowFormModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async (id, eventData) => {
    try {
      await updateEvent(id, eventData, institutionId);
      toast.success('Event updated successfully!');
      setShowFormModal(false);
      setIsEditing(false);
      setSelectedEvent(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id, institutionId);
        toast.success('Event deleted successfully!');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setShowFormModal(true);
  };

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

  const getEventTypeIcon = (type) => {
    const icons = {
      'EXAM': '📝',
      'HOLIDAY': '🎉',
      'EVENT': '🎪',
      'ASSIGNMENT': '📚',
      'MEETING': '🤝',
      'OTHER': '📌'
    };
    return icons[type] || icons.OTHER;
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filter === 'UPCOMING') return event.status === 'UPCOMING';
    if (filter === 'ONGOING') return event.status === 'ONGOING';
    if (filter === 'COMPLETED') return event.status === 'COMPLETED';
    return true;
  }).filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <FaCalendarAlt className="mr-3 text-blue-600" />
            Academic Calendar
          </h1>
          <p className="text-gray-500 mt-1">Manage your institution's academic events and schedules</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedEvent(null);
            setShowFormModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Add Event
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
            </div>
            <FaCalendarAlt className="text-blue-500 text-2xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-green-600">{stats.upcoming || 0}</p>
            </div>
            <FaClock className="text-green-500 text-2xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Ongoing</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.ongoing || 0}</p>
            </div>
            <FaCheck className="text-yellow-500 text-2xl opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-600">{stats.completed || 0}</p>
            </div>
            <FaEye className="text-gray-500 text-2xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FaClock className="text-blue-500 mr-2" /> Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.eventType)}`}>
                      {getEventTypeIcon(event.eventType)} {event.eventTypeDisplay}
                    </span>
                    <h3 className="font-semibold text-gray-800 mt-2">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{event.formattedDate}</p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(event)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{event.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{event.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.eventType)}`}>
                        {getEventTypeIcon(event.eventType)} {event.eventTypeDisplay}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{event.formattedDate}</div>
                      <div className="text-xs text-gray-400">{event.durationDays} days</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{event.targetAudienceDisplay}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(event)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage + 1} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EventFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setIsEditing(false);
          setSelectedEvent(null);
        }}
        onSave={isEditing ? handleUpdateEvent : handleCreateEvent}
        event={selectedEvent}
        isEditing={isEditing}
      />

      <EventDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
};

export default AcademicCalendar;