import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
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
import AdminDashboard from './AdminDashboard';
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
const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/sponsorships/new');
  };
  const loadDonors = async (page = 0, search = '') => {
  setIsLoading(true);
  try {
    let data;
    if (search) {
      data = await searchDonors(search);
      setDonors(data);
      setTotalPages(1);
    } else {
      data = await fetchDonors(page);
      setDonors(data.content);
      setTotalPages(data.totalPages);
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    loadDonors(currentPage);
  }, [currentPage]);

  const handleViewDonor = async (id) => {
    try {
      const donor = await fetchDonorDetails(id);
      setCurrentDonor(donor);
      setViewModalOpen(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddDonor = () => {
    setCurrentDonor(null);
    setFormModalOpen(true);
  };

  const handleEditDonor = async (id) => {
    try {
      const donor = await fetchDonorDetails(id);
      setCurrentDonor(donor);
      setFormModalOpen(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

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
    } catch (error) {
      throw error; // Throw to be caught in the form component
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      try {
        await deleteDonor(id);
        toast.success('Donor deleted successfully');
        loadDonors(currentPage);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDonors(0, searchTerm);
  };
  const handleAddSponsor = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };
  return (
    <AdminDashboard>
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Donor Management</h1>
         <div className="flex gap-2">
                <button
                onClick={handleAddDonor}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                <FaPlus className="mr-2" /> Add Donor
                </button>
             <button
              onClick={handleClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Add Student Sponsor
            </button>
            </div>
      </div>

   <div className="bg-white p-4 rounded shadow mb-6">
  <form onSubmit={handleSearch} className="flex">
    <div className="relative flex-grow mr-2">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search by name, email or phone"
        className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            loadDonors(0); // Reset to first page with all donors
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg
            className="h-5 w-5 text-gray-400 hover:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      Search
    </button>
  </form>
</div>

      {/* Donor Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : donors.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  No donors found
                </td>
              </tr>
            ) : (
              donors.map((donor) => (
                <tr key={donor.donorId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{donor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{donor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{donor.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      donor.type === 'ORGANIZATION' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {donor.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleViewDonor(donor.donorId)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditDonor(donor.donorId)}
                      className="text-green-500 hover:text-green-700 p-1"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(donor.donorId)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!searchTerm && (
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50">
            <div>
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <DonorViewModal
        donor={currentDonor}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

      {/* Form Modal (for both add and edit) */}
      <DonorFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveDonor}
        initialData={currentDonor}
      />
    </div>
    </AdminDashboard>
  );
};

export default DonorManagement;