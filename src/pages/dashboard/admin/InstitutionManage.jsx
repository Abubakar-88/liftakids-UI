import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import AdminDashboard from "./AdminDashboard";
import {
  getDivisions,
  getDistrictsByDivision,
  getThanasByDistrict,
  getUnionsByThanaId,
} from '../../../api/areaApi';
import { FaSchool, FaEdit, FaTrash, FaUsers, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { getStudentsByInstitution} from '../../../api/studentApi';
import {
  getAllInstitutions,
  registerInstitution,
  getInstitutionsByUnion,
  updateInstitution,
  searchInstitutions,
 
  deleteInstitution,
} from '../../../api/institutionApi';

Modal.setAppElement('#root');

const InstitutionManager = () => {
  // State management
  const [formData, setFormData] = useState({
    institutionName: '',
    divisionId: '',
    districtId: '',
    thanaId: '',
    unionOrAreaId: '',
    type: '',
    email: '',
    phone: '',
    villageOrHouse: '',
    password: ''
  });

  const [filters, setFilters] = useState({
    divisionId: '',
    districtId: '',
    thanaId: '',
    unionOrAreaId: '',
    search: ''
  });

  const [data, setData] = useState({
    divisions: [],
    districts: [],
    thanas: [],
    unionOrAreas: [],
    institutions: [],
    currentStudents: []
  });

  const [uiState, setUiState] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    isLoading: false,
    isInstitutionModalOpen: false,
    isStudentModalOpen: false,
    editingId: null,
    currentInstitution: null
  });

  // Fetch data functions
  const fetchDivisions = async () => {
    try {
      const res = await getDivisions();
      setData(prev => ({ ...prev, divisions: res.data }));
    } catch (error) {
      toast.error('Failed to load divisions');
    }
  };

  const fetchDistricts = async (divisionId) => {
    try {
      const res = await getDistrictsByDivision(divisionId);
      setData(prev => ({ ...prev, districts: res.data }));
    } catch (error) {
      toast.error('Failed to load districts');
    }
  };

  const fetchThanas = async (districtId) => {
    try {
      const res = await getThanasByDistrict(districtId);
      setData(prev => ({ ...prev, thanas: res.data }));
    } catch (error) {
      toast.error('Failed to load thanas');
    }
  };

  const fetchUnions = async (thanaId) => {
    try {
      const res = await getUnionsByThanaId(thanaId);
      setData(prev => ({ ...prev, unionOrAreas: res.data }));
    } catch (error) {
      toast.error('Failed to load unions/areas');
    }
  };

  const fetchInstitutions = async () => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      let res;
      if (filters.unionOrAreaId) {
        res = await getInstitutionsByUnion(filters.unionOrAreaId);
        setData(prev => ({
          ...prev,
          institutions: Array.isArray(res.data) ? res.data : [],
          totalPages: 1,
          totalElements: Array.isArray(res.data) ? res.data.length : 0
        }));
      } else if (filters.search) {
        res = await searchInstitutions(filters.search);
        const institutionsArray = Array.isArray(res.data) ? 
          res.data : 
          (res.data ? [res.data] : []);
        
        setData(prev => ({
          ...prev,
          institutions: institutionsArray,
          totalPages: 1,
          totalElements: institutionsArray.length
        }));
      } else {
        const params = {
          page: uiState.currentPage - 1,
          size: uiState.pageSize
        };
        res = await getAllInstitutions(params);
        setData(prev => ({
          ...prev,
          institutions: res.content || [],
          totalPages: res.totalPages || 1,
          totalElements: res.totalElements || 0
        }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load institutions');
      setData(prev => ({ ...prev, institutions: [] }));
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchStudents = async (institutionId) => {
  try {
    setUiState(prev => ({ ...prev, isLoading: true }));
    const students = await getStudentsByInstitution(institutionId);
    setData(prev => ({ ...prev, currentStudents: students })); // No .data here if API returns array directly
  } catch (error) {
    toast.error('Failed to load students');
    setData(prev => ({ ...prev, currentStudents: [] })); // Reset to empty array on error
  } finally {
    setUiState(prev => ({ ...prev, isLoading: false }));
  }
};
//   const fetchStudents = async (institutionId) => {
//     try {
//       const res = await getStudentsByInstitution(institutionId);
//       setData(prev => ({ ...prev, currentStudents: res.data }));
//     } catch (error) {
//       toast.error('Failed to load students');
//     }
//   };

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setUiState(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      if (uiState.editingId) {
        await updateInstitution(uiState.editingId, formData);
        toast.success('🎉 Institution updated successfully!');
      } else {
        await registerInstitution(formData);
        toast.success('✨ New institution created successfully!');
      }
      
      resetForm();
      fetchInstitutions();
      closeInstitutionModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         'Failed to save institution. Please try again.';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleEdit = async (institution) => {
    // Set initial form data
    const initialFormData = {
      institutionName: institution.institutionName,
      divisionId: institution.division?.divisionId || institution.divisionId || '',
      districtId: institution.district?.districtId || institution.districtId || '',
      thanaId: institution.thana?.thanaId || institution.thanaId || '',
      unionOrAreaId: institution.unionOrArea?.unionOrAreaId || institution.unionOrAreaId || '',
      type: institution.type,
      email: institution.email,
      phone: institution.phone,
      villageOrHouse: institution.villageOrHouse || '',
      password: ''
    };

    setFormData(initialFormData);

    try {
      // Load dependent dropdowns based on initial form data
      if (initialFormData.divisionId) {
        await fetchDistricts(initialFormData.divisionId);
      }
      if (initialFormData.districtId) {
        await fetchThanas(initialFormData.districtId);
      }
      if (initialFormData.thanaId) {
        await fetchUnions(initialFormData.thanaId);
      }

      // Open modal in edit mode
      setUiState(prev => ({
        ...prev,
        editingId: institution.institutionsId,
        isInstitutionModalOpen: true
      }));
    } catch (error) {
      toast.error('Failed to load location data for editing');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await deleteInstitution(id);
        toast.success('🗑️ Institution deleted successfully!');
        fetchInstitutions();
      } catch (error) {
        toast.error('Failed to delete institution');
      }
    }
  };

  const handleViewStudents = (institution) => {
    setUiState(prev => ({ 
      ...prev, 
      currentInstitution: institution, 
      isStudentModalOpen: true 
    }));
    fetchStudents(institution.institutionsId);
  };

  // Modal control functions
  const openInstitutionModal = () => {
    resetForm();
    setUiState(prev => ({ ...prev, isInstitutionModalOpen: true }));
  };

  const closeInstitutionModal = () => {
    setUiState(prev => ({ ...prev, isInstitutionModalOpen: false, editingId: null }));
  };

  const closeStudentModal = () => {
    setUiState(prev => ({ ...prev, isStudentModalOpen: false }));
  };

  const resetForm = () => {
    setFormData({
      institutionName: '',
      divisionId: '',
      districtId: '',
      thanaId: '',
      unionOrAreaId: '',
      type: '',
      email: '',
      phone: '',
      villageOrHouse: '',
      password: ''
    });
  };

  const resetFilters = () => {
    setFilters({
      divisionId: '',
      districtId: '',
      thanaId: '',
      unionOrAreaId: '',
      search: ''
    });
    setUiState(prev => ({ ...prev, currentPage: 1 }));
  };

  // Location dropdown handlers
  const handleDivisionChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      districtId: '',
      thanaId: '',
      unionOrAreaId: ''
    }));

    if (value) {
      await fetchDistricts(value);
    } else {
      setData(prev => ({
        ...prev,
        districts: [],
        thanas: [],
        unionOrAreas: []
      }));
    }
  };

  const handleDistrictChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      thanaId: '',
      unionOrAreaId: ''
    }));

    if (value) {
      await fetchThanas(value);
    } else {
      setData(prev => ({
        ...prev,
        thanas: [],
        unionOrAreas: []
      }));
    }
  };

  const handleThanaChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      unionOrAreaId: ''
    }));

    if (value) {
      await fetchUnions(value);
    } else {
      setData(prev => ({
        ...prev,
        unionOrAreas: []
      }));
    }
  };

  // Effects
  useEffect(() => {
    fetchDivisions();
    fetchInstitutions();
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [filters, uiState.currentPage]);

  return (
    <AdminDashboard>
      <div className="flex flex-col h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <FaSchool className="mr-2" /> Institution Management
          </h1>
          <button
            onClick={openInstitutionModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <span>+ Add Institution</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaFilter className="mr-2" /> Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <FaTimes className="mr-1" /> Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Location Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
              <select
                name="divisionId"
                value={filters.divisionId}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Divisions</option>
                {data.divisions.map(div => (
                  <option key={div.divisionId} value={div.divisionId}>
                    {div.divisionName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select
                name="districtId"
                value={filters.districtId}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!filters.divisionId}
              >
                <option value="">All Districts</option>
                {data.districts.map(dist => (
                  <option key={dist.districtId} value={dist.districtId}>
                    {dist.districtName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thana</label>
              <select
                name="thanaId"
                value={filters.thanaId}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!filters.districtId}
              >
                <option value="">All Thanas</option>
                {data.thanas.map(thana => (
                  <option key={thana.thanaId} value={thana.thanaId}>
                    {thana.thanaName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Union/Area</label>
              <select
                name="unionOrAreaId"
                value={filters.unionOrAreaId}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!filters.thanaId}
              >
                <option value="">All Unions/Areas</option>
                {data.unionOrAreas.map(union => (
                  <option key={union.unionOrAreaId} value={union.unionOrAreaId}>
                    {union.unionOrAreaName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name..."
                    className="w-full p-2 pl-8 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-2.5 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Institution Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg shadow-md overflow-hidden">
          {uiState.isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading institutions...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.institutions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                          No institutions found
                        </td>
                      </tr>
                    ) : (
                      data.institutions.map(inst => (
                        <tr key={inst.institutionsId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 w-1/4">
                            <div className="font-medium text-gray-900">{inst.institutionName}</div>
                          </td>
                          <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{inst.email}</div>
                          </td>
                          <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{inst.phone}</div>
                          </td>
                          <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {inst.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 w-1/4">
                            <div className="text-sm text-gray-500">{inst.villageOrHouse}</div>
                          </td>
                          <td className="px-6 py-4 w-1/12 whitespace-nowrap">
                            <button
                              onClick={() => handleViewStudents(inst)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <FaUsers className="mr-1" /> {inst.students?.length || 0}
                            </button>
                          </td>
                          <td className="px-6 py-4 w-1/12 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inst.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inst.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 w-1/6 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(inst)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(inst.institutionsId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                    disabled={uiState.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, uiState.totalPages) }))}
                    disabled={uiState.currentPage === uiState.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(uiState.currentPage - 1) * uiState.pageSize + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(uiState.currentPage * uiState.pageSize, data.institutions.length)}</span> of{' '}
                      <span className="font-medium">{data.institutions.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                        disabled={uiState.currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: uiState.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setUiState(prev => ({ ...prev, currentPage: page }))}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            uiState.currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, uiState.totalPages) }))}
                        disabled={uiState.currentPage === uiState.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Institution Form Modal */}
        <Modal
          isOpen={uiState.isInstitutionModalOpen}
          onRequestClose={closeInstitutionModal}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {uiState.editingId ? 'Edit Institution' : 'Add New Institution'}
              </h2>
              <button
                onClick={closeInstitutionModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name*</label>
                  <input
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type*</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="NURANI MADARASHA">Nurani Madrasha</option>
                    <option value="KAWMI">Kawmi Madrasha</option>
                    <option value="SCHOOL">School</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division*</label>
                  <select
                    name="divisionId"
                    value={formData.divisionId}
                    onChange={handleDivisionChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Division</option>
                    {data.divisions.map(div => (
                      <option key={div.divisionId} value={div.divisionId}>
                        {div.divisionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District*</label>
                  <select
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleDistrictChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={!formData.divisionId}
                    required
                  >
                    <option value="">Select District</option>
                    {data.districts.map(dist => (
                      <option key={dist.districtId} value={dist.districtId}>
                        {dist.districtName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thana*</label>
                  <select
                    name="thanaId"
                    value={formData.thanaId}
                    onChange={handleThanaChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={!formData.districtId}
                    required
                  >
                    <option value="">Select Thana</option>
                    {data.thanas.map(thana => (
                      <option key={thana.thanaId} value={thana.thanaId}>
                        {thana.thanaName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Union/Area*</label>
                  <select
                    name="unionOrAreaId"
                    value={formData.unionOrAreaId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={!formData.thanaId}
                    required
                  >
                    <option value="">Select Union/Area</option>
                    {data.unionOrAreas.map(union => (
                      <option key={union.unionOrAreaId} value={union.unionOrAreaId}>
                        {union.unionOrAreaName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village/House No</label>
                <input
                  type="text"
                  name="villageOrHouse"
                  value={formData.villageOrHouse}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {!uiState.editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeInstitutionModal}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  disabled={uiState.isLoading}
                >
                  {uiState.isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : uiState.editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Student Details Modal */}
        <Modal
          isOpen={uiState.isStudentModalOpen}
          onRequestClose={closeStudentModal}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Students of {uiState.currentInstitution?.institutionName}
              </h2>
              <button
                onClick={closeStudentModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {data.currentStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found for this institution</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.currentStudents.map(student => (
                      <tr key={student.studentId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{student.studentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.contactNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {student.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={closeStudentModal}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminDashboard>
  );
};

export default InstitutionManager;