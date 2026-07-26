import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import { 
  fetchDonors, 
  searchDonors, 
  deleteDonor,
  fetchDonorDetails,
  registerDonor,
  updateDonor
} from '../../../api/donarApi';
import DonorViewModal from '../../../components/Modal/DonorViewModal';
import DonorFormModal from '../../../components/Modal/DonorFormModal';
import SponsorshipForm from '../../../components/sponsorship/SponsorshipForm';
import { useNavigate } from 'react-router-dom';

const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [currentDonor, setCurrentDonor] = useState(null);
  const [showSponsorshipForm, setShowSponsorshipForm] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const navigate = useNavigate();

  // Load donors with pagination
  const loadDonors = async (page = 0, search = '') => {
    setIsLoading(true);
    try {
      let data;
      if (search) {
        data = await searchDonors(search);
        // Ensure data is an array
        setDonors(Array.isArray(data) ? data : []);
        setTotalPages(1);
      } else {
        data = await fetchDonors(page);
        setDonors(data?.content || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading donors:', error);
      toast.error(error.message || 'Failed to load donors');
      setDonors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonors(currentPage, searchTerm);
  }, [currentPage]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    loadDonors(0, searchTerm);
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    loadDonors(0, '');
  };

  // View donor details
  const handleViewDonor = async (id) => {
    try {
      const donor = await fetchDonorDetails(id);
      setCurrentDonor(donor);
      setViewModalOpen(true);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch donor details');
    }
  };

  // Add new donor
  const handleAddDonor = () => {
    setCurrentDonor(null);
    setFormModalOpen(true);
  };

  // Edit donor
  const handleEditDonor = async (id) => {
    try {
      const donor = await fetchDonorDetails(id);
      setCurrentDonor(donor);
      setFormModalOpen(true);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch donor details');
    }
  };

  // Save donor (create or update)
  const handleSaveDonor = async (formData) => {
    try {
      if (currentDonor) {
        // Update existing donor
        const updatedDonor = await updateDonor(currentDonor.donorId, formData);
        setDonors(prev => prev.map(d => 
          d.donorId === updatedDonor.donorId ? updatedDonor : d
        ));
        toast.success('Donor updated successfully');
      } else {
        // Create new donor
        const newDonor = await registerDonor(formData);
        setDonors(prev => [newDonor, ...prev]);
        toast.success('Donor created successfully');
      }
      setFormModalOpen(false);
      loadDonors(currentPage, searchTerm);
    } catch (error) {
      toast.error(error.message || 'Failed to save donor');
    }
  };

  // Delete donor
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await deleteDonor(id);
        toast.success('Donor deleted successfully');
        loadDonors(currentPage, searchTerm);
      } catch (error) {
        toast.error(error.message || 'Failed to delete donor');
      }
    }
  };

  // Add sponsorship for donor
  const handleAddSponsorship = (donorId) => {
    setSelectedDonorId(donorId);
    setShowSponsorshipForm(true);
  };

  // Statistics
  const stats = {
    total: donors.length,
    individual: donors.filter(d => d.type === 'INDIVIDUAL').length,
    organization: donors.filter(d => d.type === 'ORGANIZATION').length,
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Donor Management</h1>
        <p className="text-gray-500 mt-1">Manage all donors and their sponsorships</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Donors</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUserPlus className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Individual Donors</p>
              <p className="text-2xl font-bold text-green-600">{stats.individual}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaUserPlus className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Organizations</p>
              <p className="text-2xl font-bold text-purple-600">{stats.organization}</p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FaUserPlus className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                className="pl-10 pr-10 py-2 w-full md:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddDonor}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaPlus className="mr-2" /> Add Donor
            </button>
            <button
              onClick={() => navigate('/admin/sponsorships/new')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaPlus className="mr-2" /> Add Sponsorship
            </button>
          </div>
        </div>
      </div>

      {/* Donor Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading donors...</p>
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No donors match your search' : 'No donors found. Add your first donor!'}
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.donorId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {donor.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{donor.name}</div>
                          <div className="text-xs text-gray-500">ID: {donor.donorId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{donor.email}</div>
                      <div className="text-sm text-gray-500">{donor.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        donor.type === 'ORGANIZATION' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {donor.type === 'ORGANIZATION' ? 'Organization' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        donor.active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donor.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDonor(donor.donorId)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDonor(donor.donorId)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit Donor"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAddSponsorship(donor.donorId)}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="Add Sponsorship"
                        >
                          <FaPlus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(donor.donorId)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Donor"
                        >
                          <FaTrash className="h-4 w-4" />
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
        {!searchTerm && totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Donor Modal */}
      <DonorViewModal
        donor={currentDonor}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

      {/* Donor Form Modal (Add/Edit) */}
      <DonorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveDonor}
        initialData={currentDonor}
      />

      {/* Sponsorship Form Modal */}
      {showSponsorshipForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Sponsorship</h2>
              <button
                onClick={() => setShowSponsorshipForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <SponsorshipForm 
                donorId={selectedDonorId}
                onSuccess={() => {
                  setShowSponsorshipForm(false);
                  toast.success('Sponsorship added successfully');
                }}
                onCancel={() => setShowSponsorshipForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorManagement;