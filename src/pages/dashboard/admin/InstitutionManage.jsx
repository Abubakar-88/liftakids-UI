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
import { 
  FaSchool, FaEdit, FaClock, FaTrash, FaUsers, FaFilter, FaSearch, FaTimes, 
  FaCheck, FaTimesCircle, FaPause, FaPlay, FaBan, FaCog, FaDownload,
  FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaCheckCircle
} from 'react-icons/fa';
import { getStudentsByInstitution } from '../../../api/studentApi';
import {
  getAllInstitutions,
  registerInstitution,
  getInstitutionsByUnion,
  updateInstitution,
  searchInstitutions,
  updateInstitutionStatus,
  bulkUpdateStatus,
  deleteInstitution,
  getStatusStatistics
} from '../../../api/institutionApi';

// Import Modal Components
import InstitutionFormModal from '../../../components/Modal/InstitutionFormModal';
import StatusChangeModal from '../../../components/Modal/StatusChangeModal';
import StudentDetailsModal from '.././../../components/Modal/StudentDetailsModal';

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
    teacherName: '',
    teacherDesignation: '',
    aboutInstitution: '',
    villageOrHouse: '',
    password: ''
  });

  // **SEPARATE FILTERS**: Status filter completely independent
  const [statusFilter, setStatusFilter] = useState('ALL'); // Only status filter
  
  const [locationFilters, setLocationFilters] = useState({ // Separate location/search filters
    divisionId: '',
    districtId: '',
    thanaId: '',
    unionOrAreaId: '',
    search: ''
  });

  const [data, setData] = useState({
    // Old arrays (keep for compatibility if needed)
    divisions: [],
    districts: [],
    thanas: [],
    unionOrAreas: [],
    
    // For institution form
    formDivisions: [],
    formDistricts: [],
    formThanas: [],
    formUnionOrAreas: [],
    
    // For filters
    filterDivisions: [],
    filterDistricts: [],
    filterThanas: [],
    filterUnionOrAreas: [],
    
    institutions: [],
    currentStudents: [],
    statusStats: {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      suspended: 0
    }
  });

  const [uiState, setUiState] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    isLoading: false,
    isInstitutionModalOpen: false,
    isStudentModalOpen: false,
    editingId: null,
    currentInstitution: null,
    showStatusModal: false,
    showBulkActions: false,
    selectedInstitutions: [],
    selectedAction: '',
    reason: ''
  });

  const [statusModalData, setStatusModalData] = useState({
    institution: null,
    action: '',
    title: '',
    message: '',
    confirmButtonText: '',
    confirmButtonColor: '',
    requiresReason: false
  });

  // Initialize data on component mount
  useEffect(() => {
    fetchDivisions();
    fetchInstitutions();
    fetchStatusStatistics();
    
    // Initialize all arrays to empty if undefined
    setData(prev => ({
      ...prev,
      formDivisions: [],
      formDistricts: [],
      formThanas: [],
      formUnionOrAreas: [],
      filterDivisions: [],
      filterDistricts: [],
      filterThanas: [],
      filterUnionOrAreas: [],
      institutions: [],
      currentStudents: []
    }));
  }, []);

  // Fetch status statistics
// Fetch status statistics - updated version
const fetchStatusStatistics = async () => {
  try {
    const stats = await getStatusStatistics();
    
    // Make sure stats has all required properties
    const completeStats = {
      total: stats?.total || 0,
      approved: stats?.approved || 0,
      pending: stats?.pending || 0,
      rejected: stats?.rejected || 0,
      suspended: stats?.suspended || 0
    };
    
    setData(prev => ({ ...prev, statusStats: completeStats }));
    
    // Log for debugging
    console.log('Status stats loaded:', completeStats);
    
  } catch (error) {
    console.error('Error fetching status statistics:', error);
    
    // Set default values on error
    const defaultStats = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      suspended: 0
    };
    
    setData(prev => ({ ...prev, statusStats: defaultStats }));
  }
};
  // Fetch functions for FORM
  const fetchDistrictsForForm = async (divisionId) => {
    try {
      const res = await getDistrictsByDivision(divisionId);
      setData(prev => ({ 
        ...prev, 
        formDistricts: res.data || [] 
      }));
    } catch (error) {
      toast.error('Failed to load districts');
      setData(prev => ({ ...prev, formDistricts: [] }));
    }
  };

  const fetchThanasForForm = async (districtId) => {
    try {
      const res = await getThanasByDistrict(districtId);
      setData(prev => ({ 
        ...prev, 
        formThanas: res.data || [] 
      }));
    } catch (error) {
      toast.error('Failed to load thanas');
      setData(prev => ({ ...prev, formThanas: [] }));
    }
  };

  const fetchUnionsForForm = async (thanaId) => {
    try {
      const res = await getUnionsByThanaId(thanaId);
      setData(prev => ({ 
        ...prev, 
        formUnionOrAreas: res.data || [] 
      }));
    } catch (error) {
      toast.error('Failed to load unions/areas');
      setData(prev => ({ ...prev, formUnionOrAreas: [] }));
    }
  };

  // Fetch functions for FILTER dropdowns
 // Fetch functions for FILTER dropdowns - WITH DEBUGGING
const fetchDistrictsForFilter = async (divisionId) => {
  try {
    console.log(`🔄 [FILTER] Fetching districts for divisionId: ${divisionId}`);
    
    const response = await getDistrictsByDivision(divisionId);
    
    console.log(`✅ [FILTER] Full axios response:`, response);
    console.log(`✅ [FILTER] Response.data:`, response.data);
    console.log(`✅ [FILTER] Is array?`, Array.isArray(response.data));
    
    // 🔥 CORRECT: Use response.data
    const districtsData = Array.isArray(response.data) ? response.data : [];
    
    console.log(`✅ [FILTER] Districts data:`, districtsData);
    console.log(`✅ [FILTER] Districts count:`, districtsData.length);
    
    // Extract district names for debugging
    const districtNames = districtsData.map(d => d.districtName);
    console.log(`✅ [FILTER] District names:`, districtNames);
    
    setData(prev => {
      const newState = { 
        ...prev, 
        filterDistricts: districtsData 
      };
      console.log('📝 [FILTER] Setting filterDistricts:', newState.filterDistricts);
      return newState;
    });
    
  } catch (error) {
    console.error(`❌ [FILTER] Error fetching districts:`, error);
    console.error(`❌ [FILTER] Error details:`, error.response?.data || error.message);
    
    toast.error('Failed to load districts');
    setData(prev => ({ ...prev, filterDistricts: [] }));
  }
};

  const fetchThanasForFilter = async (districtId) => {
    try {
      const res = await getThanasByDistrict(districtId);
      setData(prev => ({ 
        ...prev, 
        filterThanas: res.data || [] 
      }));
    } catch (error) {
      toast.error('Failed to load thanas');
      setData(prev => ({ ...prev, filterThanas: [] }));
    }
  };

  const fetchUnionsForFilter = async (thanaId) => {
    try {
      const res = await getUnionsByThanaId(thanaId);
      setData(prev => ({ 
        ...prev, 
        filterUnionOrAreas: res.data || [] 
      }));
    } catch (error) {
      toast.error('Failed to load unions/areas');
      setData(prev => ({ ...prev, filterUnionOrAreas: [] }));
    }
  };

  // Handle filter changes
  const handleLocationFilterChange = async (e) => {
  const { name, value } = e.target;
  
  console.log(`🔄 Filter change: ${name} = ${value}`);
  
  // Create a copy of current filters
  const updatedFilters = { ...locationFilters, [name]: value };
  
  if (name === 'divisionId') {
    updatedFilters.districtId = '';
    updatedFilters.thanaId = '';
    updatedFilters.unionOrAreaId = '';
    
    console.log(`📞 Fetching districts for division: ${value}`);
    
    if (value) {
      try {
        // Clear previous districts first
        setData(prev => ({ 
          ...prev, 
          filterDistricts: [],
          filterThanas: [],
          filterUnionOrAreas: []
        }));
        
        // Then fetch new districts
        await fetchDistrictsForFilter(value);
        
        console.log('✅ Districts fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching districts:', error);
      }
    } else {
      // If division is cleared, clear all dependent filters
      setData(prev => ({ 
        ...prev, 
        filterDistricts: [],
        filterThanas: [],
        filterUnionOrAreas: []
      }));
    }
  }
  
  if (name === 'districtId') {
    updatedFilters.thanaId = '';
    updatedFilters.unionOrAreaId = '';
    
    console.log(`📞 Fetching thanas for district: ${value}`);
    
    if (value) {
      try {
        // Clear previous thanas first
        setData(prev => ({ 
          ...prev, 
          filterThanas: [],
          filterUnionOrAreas: []
        }));
        
        // Then fetch new thanas
        await fetchThanasForFilter(value);
        
        console.log('✅ Thanas fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching thanas:', error);
      }
    } else {
      setData(prev => ({ 
        ...prev, 
        filterThanas: [],
        filterUnionOrAreas: []
      }));
    }
  }
  
  if (name === 'thanaId') {
    updatedFilters.unionOrAreaId = '';
    
    console.log(`📞 Fetching unions for thana: ${value}`);
    
    if (value) {
      try {
        // Clear previous unions first
        setData(prev => ({ 
          ...prev, 
          filterUnionOrAreas: []
        }));
        
        // Then fetch new unions
        await fetchUnionsForFilter(value);
        
        console.log('✅ Unions fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching unions:', error);
      }
    } else {
      setData(prev => ({ ...prev, filterUnionOrAreas: [] }));
    }
  }
  
  // Update the filters state
  setLocationFilters(updatedFilters);
  setUiState(prev => ({ ...prev, currentPage: 1 }));
  
  console.log('📍 Updated locationFilters:', updatedFilters);
};

  // Fetch divisions
  const fetchDivisions = async () => {
    try {
      const res = await getDivisions();
      setData(prev => ({ 
        ...prev, 
        divisions: res.data || [],
        formDivisions: res.data || [],
        filterDivisions: res.data || []
      }));
    } catch (error) {
      toast.error('Failed to load divisions');
      setData(prev => ({ 
        ...prev, 
        divisions: [],
        formDivisions: [],
        filterDivisions: []
      }));
    }
  };


// Add this function to fetch student counts for all institutions
const fetchStudentCounts = async (institutions) => {
  if (!institutions || institutions.length === 0) return institutions;
  
  try {
    // Create a map of institutionId to student count
    const studentCounts = {};
    
    // Fetch student counts for each institution
    for (const institution of institutions) {
      try {
        const students = await getStudentsByInstitution(institution.institutionsId);
        const studentCount = Array.isArray(students) ? students.length : 0;
        
        // Count active students
        const activeStudents = Array.isArray(students) 
          ? students.filter(student => student.active !== false).length 
          : 0;
        
        studentCounts[institution.institutionsId] = {
          total: studentCount,
          active: activeStudents
        };
      } catch (error) {
        console.error(`Error fetching students for institution ${institution.institutionsId}:`, error);
        studentCounts[institution.institutionsId] = { total: 0, active: 0 };
      }
    }
    
    // Update institutions with student counts
    return institutions.map(inst => ({
      ...inst,
      studentCount: studentCounts[inst.institutionsId]?.total || 0,
      activeStudentCount: studentCounts[inst.institutionsId]?.active || 0
    }));
    
  } catch (error) {
    console.error('Error fetching student counts:', error);
    return institutions.map(inst => ({
      ...inst,
      studentCount: 0,
      activeStudentCount: 0
    }));
  }
};




  // Fetch institutions
//   const fetchInstitutions = async () => {
//   try {
//     setUiState(prev => ({ ...prev, isLoading: true }));
    
//     let res;
//     let allInstitutions = [];
    
//     if (locationFilters.unionOrAreaId) {
//       res = await getInstitutionsByUnion(locationFilters.unionOrAreaId);
//       allInstitutions = Array.isArray(res.data) ? res.data : [];
      
//     } else if (locationFilters.search) {
//       res = await searchInstitutions(locationFilters.search);
//       allInstitutions = Array.isArray(res.data) ? 
//         res.data : 
//         (res.data ? [res.data] : []);
        
//     } else {
//       const params = {
//         page: uiState.currentPage - 1,
//         size: uiState.pageSize
//       };
//       res = await getAllInstitutions(params);
//       allInstitutions = res.content || [];
//       setData(prev => ({
//         ...prev,
//         totalPages: res.totalPages || 1,
//         totalElements: res.totalElements || 0
//       }));
//     }
    
//     // ✅ **CORRECTED STATUS FILTER LOGIC**
//     let filteredInstitutions = allInstitutions;
    
//     if (statusFilter !== 'ALL') {
//       filteredInstitutions = allInstitutions.filter(inst => {
//         // First, determine the actual current status
//         const getActualStatus = (inst) => {
//           // Priority 1: Check suspended (highest priority)
//           if (inst.suspended === true || inst.status?.toUpperCase() === 'SUSPENDED') {
//             return 'SUSPENDED';
//           }
          
//           // Priority 2: Check rejected
//           if (inst.rejected === true || inst.status?.toUpperCase() === 'REJECTED') {
//             return 'REJECTED';
//           }
          
//           // Priority 3: Check approved/active
//           if (inst.isApproved === true || inst.approved === true || 
//               inst.status?.toUpperCase() === 'APPROVED' || 
//               inst.status?.toUpperCase() === 'ACTIVE') {
//             return 'APPROVED';
//           }
          
//           // Priority 4: Default to pending
//           return 'PENDING';
//         };
        
//         const actualStatus = getActualStatus(inst);
//         return actualStatus === statusFilter;
//       });
//     }
    
//     // For union/search filters, we need to handle pagination locally
//     const totalFiltered = filteredInstitutions.length;
//     const totalPages = Math.ceil(totalFiltered / uiState.pageSize);
    
//     // Apply pagination
//     const startIdx = (uiState.currentPage - 1) * uiState.pageSize;
//     const endIdx = startIdx + uiState.pageSize;
//     const paginatedInstitutions = filteredInstitutions.slice(startIdx, endIdx);
    
//     setData(prev => ({
//       ...prev,
//       institutions: paginatedInstitutions,
//       totalPages: locationFilters.unionOrAreaId || locationFilters.search ? 
//         totalPages : 
//         res.totalPages || 1,
//       totalElements: locationFilters.unionOrAreaId || locationFilters.search ? 
//         totalFiltered : 
//         res.totalElements || 0
//     }));
    
//     // Debug log
//     console.log('Filter Results:', {
//       statusFilter,
//       totalAll: allInstitutions.length,
//       totalFiltered: filteredInstitutions.length,
//       showing: paginatedInstitutions.length,
//       statusBreakdown: allInstitutions.reduce((acc, inst) => {
//         const status = getStatusBadge(inst).text;
//         acc[status] = (acc[status] || 0) + 1;
//         return acc;
//       }, {})
//     });
    
//   } catch (error) {
//     toast.error(error.message || 'Failed to load institutions');
//     setData(prev => ({ ...prev, institutions: [] }));
//   } finally {
//     setUiState(prev => ({ ...prev, isLoading: false }));
//   }
// };
const fetchInstitutions = async () => {
  try {
    setUiState(prev => ({ ...prev, isLoading: true }));
    
    let res;
    let allInstitutions = [];
    
    if (locationFilters.unionOrAreaId) {
      res = await getInstitutionsByUnion(locationFilters.unionOrAreaId);
      allInstitutions = Array.isArray(res.data) ? res.data : [];
      
    } else if (locationFilters.search) {
      res = await searchInstitutions(locationFilters.search);
      allInstitutions = Array.isArray(res.data) ? 
        res.data : 
        (res.data ? [res.data] : []);
        
    } else {
      const params = {
        page: uiState.currentPage - 1,
        size: uiState.pageSize
      };
      res = await getAllInstitutions(params);
      allInstitutions = res.content || [];
      setData(prev => ({
        ...prev,
        totalPages: res.totalPages || 1,
        totalElements: res.totalElements || 0
      }));
    }
    
    // ✅ **CORRECTED STATUS FILTER LOGIC**
    let filteredInstitutions = allInstitutions;
    
    if (statusFilter !== 'ALL') {
      filteredInstitutions = allInstitutions.filter(inst => {
        // First, determine the actual current status
        const getActualStatus = (inst) => {
          // Priority 1: Check suspended (highest priority)
          if (inst.suspended === true || inst.status?.toUpperCase() === 'SUSPENDED') {
            return 'SUSPENDED';
          }
          
          // Priority 2: Check rejected
          if (inst.rejected === true || inst.status?.toUpperCase() === 'REJECTED') {
            return 'REJECTED';
          }
          
          // Priority 3: Check approved/active
          if (inst.isApproved === true || inst.approved === true || 
              inst.status?.toUpperCase() === 'APPROVED' || 
              inst.status?.toUpperCase() === 'ACTIVE') {
            return 'APPROVED';
          }
          
          // Priority 4: Default to pending
          return 'PENDING';
        };
        
        const actualStatus = getActualStatus(inst);
        return actualStatus === statusFilter;
      });
    }
    
    // ✅ **FETCH STUDENT COUNTS FOR FILTERED INSTITUTIONS**
    const institutionsWithStudentCounts = await fetchStudentCounts(filteredInstitutions);
    
    // For union/search filters, we need to handle pagination locally
    const totalFiltered = institutionsWithStudentCounts.length;
    const totalPages = Math.ceil(totalFiltered / uiState.pageSize);
    
    // Apply pagination
    const startIdx = (uiState.currentPage - 1) * uiState.pageSize;
    const endIdx = startIdx + uiState.pageSize;
    const paginatedInstitutions = institutionsWithStudentCounts.slice(startIdx, endIdx);
    
    setData(prev => ({
      ...prev,
      institutions: paginatedInstitutions,
      totalPages: locationFilters.unionOrAreaId || locationFilters.search ? 
        totalPages : 
        res.totalPages || 1,
      totalElements: locationFilters.unionOrAreaId || locationFilters.search ? 
        totalFiltered : 
        res.totalElements || 0
    }));
    
    // Debug log
    console.log('Filter Results with Student Counts:', {
      statusFilter,
      totalAll: allInstitutions.length,
      totalFiltered: filteredInstitutions.length,
      showing: paginatedInstitutions.length,
      institutions: paginatedInstitutions.map(inst => ({
        name: inst.institutionName,
        studentCount: inst.studentCount,
        activeStudentCount: inst.activeStudentCount
      }))
    });
    
  } catch (error) {
    toast.error(error.message || 'Failed to load institutions');
    setData(prev => ({ ...prev, institutions: [] }));
  } finally {
    setUiState(prev => ({ ...prev, isLoading: false }));
  }
};
  // Fetch students
  const fetchStudents = async (institutionId) => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      const students = await getStudentsByInstitution(institutionId);
      setData(prev => ({ ...prev, currentStudents: students }));
    } catch (error) {
      toast.error('Failed to load students');
      setData(prev => ({ ...prev, currentStudents: [] }));
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle status change
  const handleStatusChange = async (institution, action) => {
    const adminId = localStorage.getItem('adminId') || '1';
    
    const modalConfigs = {
      approve: {
        title: 'Approve Institution',
        message: `Are you sure you want to approve ${institution.institutionName}?`,
        confirmButtonText: 'Approve',
        confirmButtonColor: 'bg-green-600 hover:bg-green-700'
      },
      reject: {
        title: 'Reject Institution',
        message: `Are you sure you want to reject ${institution.institutionName}?`,
        confirmButtonText: 'Reject',
        confirmButtonColor: 'bg-red-600 hover:bg-red-700'
      },
      suspend: {
        title: 'Suspend Institution',
        message: `Are you sure you want to suspend ${institution.institutionName}?`,
        confirmButtonText: 'Suspend',
        confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700'
      },
      activate: {
        title: 'Activate Institution',
        message: `Are you sure you want to activate ${institution.institutionName}?`,
        confirmButtonText: 'Activate',
        confirmButtonColor: 'bg-blue-600 hover:bg-blue-700'
      }
    };

    const config = modalConfigs[action];
    
    setStatusModalData({
      institution,
      action,
      title: config.title,
      message: config.message,
      confirmButtonText: config.confirmButtonText,
      confirmButtonColor: config.confirmButtonColor,
      requiresReason: action === 'reject' || action === 'suspend'
    });
    
    setUiState(prev => ({ ...prev, showStatusModal: true, reason: '' }));
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!statusModalData.institution) return;
    
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      const { institution, action } = statusModalData;
      
      await updateInstitutionStatus(
        institution.institutionsId,
        action,
        localStorage.getItem('adminId') || '1',
        uiState.reason
      );
      
      toast.success(`✅ Institution ${action}d successfully!`);
      
      // Refresh data
      fetchInstitutions();
      fetchStatusStatistics();
      
      // Close modal
      setUiState(prev => ({ 
        ...prev, 
        showStatusModal: false, 
        reason: '',
        isLoading: false 
      }));
      setStatusModalData({
        institution: null,
        action: '',
        title: '',
        message: '',
        confirmButtonText: '',
        confirmButtonColor: ''
      });
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${statusModalData.action} institution`;
      toast.error(`❌ ${errorMessage}`);
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Bulk status change
  const handleBulkStatusChange = async () => {
    if (uiState.selectedInstitutions.length === 0) {
      toast.warning('Please select at least one institution');
      return;
    }
    
    if (!uiState.selectedAction) {
      toast.warning('Please select an action');
      return;
    }
    
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      await bulkUpdateStatus(
        uiState.selectedInstitutions,
        uiState.selectedAction,
        localStorage.getItem('adminId') || '1',
        uiState.reason
      );
      
      toast.success(`✅ ${uiState.selectedInstitutions.length} institutions ${uiState.selectedAction}ed successfully!`);
      
      // Refresh data
      fetchInstitutions();
      fetchStatusStatistics();
      
      // Reset selection
      setUiState(prev => ({ 
        ...prev, 
        selectedInstitutions: [],
        selectedAction: '',
        reason: '',
        showBulkActions: false,
        isLoading: false 
      }));
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to bulk ${uiState.selectedAction}`;
      toast.error(`❌ ${errorMessage}`);
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Toggle institution selection
  const toggleInstitutionSelection = (institutionId) => {
    setUiState(prev => {
      if (prev.selectedInstitutions.includes(institutionId)) {
        return {
          ...prev,
          selectedInstitutions: prev.selectedInstitutions.filter(id => id !== institutionId)
        };
      } else {
        return {
          ...prev,
          selectedInstitutions: [...prev.selectedInstitutions, institutionId]
        };
      }
    });
  };

  // Select all on current page
  const selectAllOnPage = () => {
    const pageIds = data.institutions.map(inst => inst.institutionsId);
    setUiState(prev => ({ 
      ...prev, 
      selectedInstitutions: pageIds 
    }));
  };

  // Clear selection
  const clearSelection = () => {
    setUiState(prev => ({ 
      ...prev, 
      selectedInstitutions: [] 
    }));
  };

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Status filter change
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setUiState(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle form submission
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
      fetchStatusStatistics();
      closeInstitutionModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         'Failed to save institution. Please try again.';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle edit institution
  const handleEdit = async (institution) => {
    const initialFormData = {
      institutionName: institution.institutionName,
      divisionId: institution.division?.divisionId || institution.divisionId || '',
      districtId: institution.district?.districtId || institution.districtId || '',
      thanaId: institution.thana?.thanaId || institution.thanaId || '',
      unionOrAreaId: institution.unionOrArea?.unionOrAreaId || institution.unionOrAreaId || '',
      type: institution.type,
      email: institution.email,
      phone: institution.phone,
      teacherName: institution.teacherName,
      teacherDesignation: institution.teacherDesignation,
      aboutInstitution: institution.aboutInstitution,

      villageOrHouse: institution.villageOrHouse || '',
      password: ''
    };

    setFormData(initialFormData);

    try {
      // Reset form arrays first
      setData(prev => ({
        ...prev,
        formDistricts: [],
        formThanas: [],
        formUnionOrAreas: []
      }));

      // Load form data
      if (initialFormData.divisionId) {
        await fetchDistrictsForForm(initialFormData.divisionId);
      }
      if (initialFormData.districtId) {
        await fetchThanasForForm(initialFormData.districtId);
      }
      if (initialFormData.thanaId) {
        await fetchUnionsForForm(initialFormData.thanaId);
      }

      setUiState(prev => ({
        ...prev,
        editingId: institution.institutionsId,
        isInstitutionModalOpen: true
      }));
    } catch (error) {
      toast.error('Failed to load location data for editing');
    }
  };

  // Handle delete institution
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await deleteInstitution(id);
        toast.success('🗑️ Institution deleted successfully!');
        fetchInstitutions();
        fetchStatusStatistics();
      } catch (error) {
        toast.error('Failed to delete institution');
      }
    }
  };

  // Handle view students
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
    
    // Reset form location arrays
    setData(prev => ({
      ...prev,
      formDistricts: [],
      formThanas: [],
      formUnionOrAreas: []
    }));
    
    setUiState(prev => ({ ...prev, isInstitutionModalOpen: true }));
  };

  const closeInstitutionModal = () => {
    setUiState(prev => ({ ...prev, isInstitutionModalOpen: false, editingId: null }));
  };

  const closeStudentModal = () => {
    setUiState(prev => ({ ...prev, isStudentModalOpen: false }));
  };

  const closeStatusModal = () => {
    setUiState(prev => ({ ...prev, showStatusModal: false, reason: '' }));
    setStatusModalData({
      institution: null,
      action: '',
      title: '',
      message: '',
      confirmButtonText: '',
      confirmButtonColor: ''
    });
  };

  // Reset form
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
      teacherName: '',
      teacherDesignation: '',
      villageOrHouse: '',
      password: ''
    });
  };

  // Reset functions
  const resetStatusFilter = () => {
    setStatusFilter('ALL');
    setUiState(prev => ({ ...prev, currentPage: 1 }));
  };

  const resetLocationFilters = () => {
    setLocationFilters({
      divisionId: '',
      districtId: '',
      thanaId: '',
      unionOrAreaId: '',
      search: ''
    });
    setUiState(prev => ({ ...prev, currentPage: 1 }));
  };

  const resetAllFilters = () => {
    resetStatusFilter();
    resetLocationFilters();
  };

  // Form location handlers
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
      await fetchDistrictsForForm(value);
    } else {
      setData(prev => ({
        ...prev,
        formDistricts: [],
        formThanas: [],
        formUnionOrAreas: []
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
      await fetchThanasForForm(value);
    } else {
      setData(prev => ({
        ...prev,
        formThanas: [],
        formUnionOrAreas: []
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
      await fetchUnionsForForm(value);
    } else {
      setData(prev => ({
        ...prev,
        formUnionOrAreas: []
      }));
    }
  };

  // Effects
  useEffect(() => {
    fetchInstitutions();
  }, [statusFilter, locationFilters, uiState.currentPage]);


// Status filter options - updated with dynamic counts
const statusOptions = [
  { 
    value: 'ALL', 
    label: 'All Institutions', 
    color: 'bg-gray-100 text-gray-800',
    count: data.statusStats?.total || 0 
  },
  { 
    value: 'APPROVED', 
    label: 'Approved', 
    color: 'bg-green-100 text-green-800',
    count: data.statusStats?.approved || 0 
  },
  { 
    value: 'PENDING', 
    label: 'Pending', 
    color: 'bg-blue-100 text-blue-800',
    count: data.statusStats?.pending || 0 
  },
  { 
    value: 'REJECTED', 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800',
    count: data.statusStats?.rejected || 0 
  },
  { 
    value: 'SUSPENDED', 
    label: 'Suspended', 
    color: 'bg-yellow-100 text-yellow-800',
    count: data.statusStats?.suspended || 0 
  }
];

// Get status badge - simplified version
const getStatusBadge = (institution) => {
  // Use the status from institution object
  const status = institution?.status;
  
  // Fallback: check boolean fields if status is not available
  if (!status) {
    if (institution?.suspended) {
      return {
        text: 'Suspended',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: <FaPause className="mr-1" />
      };
    }
    
    if (institution?.rejected) {
      return {
        text: 'Rejected',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: <FaBan className="mr-1" />
      };
    }
    
    if (institution?.isApproved) {
      return {
        text: 'Approved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: <FaCheck className="mr-1" />
      };
    }
    
    return {
      text: 'Pending',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: <FaClock className="mr-1" />
    };
  }
  
  // Use status enum
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
      return {
        text: 'Approved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: <FaCheck className="mr-1" />
      };
    
    case 'PENDING':
      return {
        text: 'Pending',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: <FaClock className="mr-1" />
      };
    
    case 'SUSPENDED':
      return {
        text: 'Suspended',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: <FaPause className="mr-1" />
      };
    
    case 'REJECTED':
      return {
        text: 'Rejected',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: <FaBan className="mr-1" />
      };
    
    case 'INACTIVE':
      return {
        text: 'Inactive',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: <FaBan className="mr-1" />
      };
    
    default:
      return {
        text: status,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: <FaQuestion className="mr-1" />
      };
  }
};


  // Get status badge
  // const getStatusBadge = (status, isApproved, isSuspended, isRejected) => {
  //   // Use the actual status enum from your backend
  //   switch (status) {
  //     case 'ACTIVE':
  //       return {
  //         text: 'Active',
  //         bgColor: 'bg-emerald-100',
  //         textColor: 'text-emerald-800',
  //         icon: <FaCheckCircle className="mr-1" />
  //       };
      
  //     case 'APPROVED':
  //       return {
  //         text: 'Approved',
  //         bgColor: 'bg-green-100',
  //         textColor: 'text-green-800',
  //         icon: <FaCheck className="mr-1" />
  //       };
      
  //     case 'PENDING':
  //       return {
  //         text: 'Pending',
  //         bgColor: 'bg-blue-100',
  //         textColor: 'text-blue-800',
  //         icon: <FaClock className="mr-1" />
  //       };
      
  //     case 'SUSPENDED':
  //       return {
  //         text: 'Suspended',
  //         bgColor: 'bg-yellow-100',
  //         textColor: 'text-yellow-800',
  //         icon: <FaPause className="mr-1" />
  //       };
      
  //     case 'REJECTED':
  //       return {
  //         text: 'Rejected',
  //         bgColor: 'bg-red-100',
  //         textColor: 'text-red-800',
  //         icon: <FaBan className="mr-1" />
  //       };
      
  //     case 'INACTIVE':
  //       return {
  //         text: 'Inactive',
  //         bgColor: 'bg-gray-100',
  //         textColor: 'text-gray-800',
  //         icon: <FaBan className="mr-1" />
  //       };
      
  //     default:
  //       // Fallback based on boolean flags
  //       if (isSuspended) {
  //         return {
  //           text: 'Suspended',
  //           bgColor: 'bg-yellow-100',
  //           textColor: 'text-yellow-800',
  //           icon: <FaPause className="mr-1" />
  //         };
  //       }
        
  //       if (isRejected) {
  //         return {
  //           text: 'Rejected',
  //           bgColor: 'bg-red-100',
  //           textColor: 'text-red-800',
  //           icon: <FaBan className="mr-1" />
  //         };
  //       }
        
  //       if (isApproved) {
  //         return {
  //           text: 'Approved',
  //           bgColor: 'bg-green-100',
  //           textColor: 'text-green-800',
  //           icon: <FaCheck className="mr-1" />
  //         };
  //       }
        
  //       return {
  //         text: 'Pending',
  //         bgColor: 'bg-blue-100',
  //         textColor: 'text-blue-800',
  //         icon: <FaClock className="mr-1" />
  //       };
  //   }
  // };
useEffect(() => {
  fetchStatusStatistics();
  
  // Refresh every 30 seconds
  const interval = setInterval(() => {
    fetchStatusStatistics();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
  // Get status actions
  const getStatusActions = (institution) => {
    const actions = [];
    
    if (!institution.approved && !institution.rejected) {
      actions.push({ label: 'Approve', action: 'approve', icon: <FaCheck />, color: 'text-green-600' });
      actions.push({ label: 'Reject', action: 'reject', icon: <FaTimesCircle />, color: 'text-red-600' });
    }
    
    if (institution.approved && !institution.suspended) {
      actions.push({ label: 'Suspend', action: 'suspend', icon: <FaPause />, color: 'text-yellow-600' });
    }
    
    if (institution.suspended) {
      actions.push({ label: 'Activate', action: 'activate', icon: <FaPlay />, color: 'text-blue-600' });
    }
    
    return actions;
  };

  // Status filter options with counts
  // const statusOptions = [
  //   { value: 'ALL', label: 'All Institutions', count: data.statusStats.total, color: 'bg-gray-100 text-gray-800' },
  //   { value: 'APPROVED', label: 'Approved', count: data.statusStats.approved, color: 'bg-green-100 text-green-800' },
  //   { value: 'PENDING', label: 'Pending', count: data.statusStats.pending, color: 'bg-blue-100 text-blue-800' },
  //   { value: 'REJECTED', label: 'Rejected', count: data.statusStats.rejected, color: 'bg-red-100 text-red-800' },
  //   { value: 'SUSPENDED', label: 'Suspended', count: data.statusStats.suspended, color: 'bg-yellow-100 text-yellow-800' }
  // ];

  return (
    <AdminDashboard>
      <div className="flex flex-col h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <FaSchool className="mr-2" /> Institution Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setUiState(prev => ({ ...prev, showBulkActions: !prev.showBulkActions }))}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center"
            >
              <FaCog className="mr-2" /> Bulk Actions
            </button>
            <button
              onClick={openInstitutionModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <span>+ Add Institution</span>
            </button>
          </div>
        </div>

        {/* Status Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" /> Filter by Status
            </h2>
            <button
              onClick={resetStatusFilter}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <FaTimes className="mr-1" /> Clear Status Filter
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setUiState(prev => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-4 py-2 rounded-lg flex items-center transition-all ${
                  statusFilter === option.value
                    ? `${option.color} ring-2 ring-offset-1 ring-current font-semibold`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{option.label}</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-50">
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Location & Search Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-500" /> Location & Search Filters
            </h2>
            <button
              onClick={resetLocationFilters}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <FaTimes className="mr-1" /> Clear Location Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Division Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
              <select
                name="divisionId"
                value={locationFilters.divisionId}
                onChange={handleLocationFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Divisions</option>
                {(data.filterDivisions || []).map(div => (
                  <option key={div.divisionId} value={div.divisionId}>
                    {div.divisionName}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
             <select
              name="districtId"
              value={locationFilters.districtId}
              onChange={handleLocationFilterChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={!locationFilters.divisionId}
            >
              <option value="">All Districts</option>
              {data.filterDistricts && data.filterDistricts.length > 0 ? (
                data.filterDistricts.map(dist => (
                  <option key={dist.districtId} value={dist.districtId}>
                    {dist.districtName}
                  </option>
                ))
              ) : locationFilters.divisionId ? (
                <option value="" disabled>Loading districts...</option>
              ) : (
                <option value="" disabled>Please select division first</option>
              )}
            </select>
            </div>

            {/* Thana Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thana</label>
              <select
                name="thanaId"
                value={locationFilters.thanaId}
                onChange={handleLocationFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!locationFilters.districtId}
              >
                <option value="">All Thanas</option>
                {(data.filterThanas || []).map(thana => (
                  <option key={thana.thanaId} value={thana.thanaId}>
                    {thana.thanaName}
                  </option>
                ))}
              </select>
            </div>

            {/* Union/Area Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Union/Area</label>
              <select
                name="unionOrAreaId"
                value={locationFilters.unionOrAreaId}
                onChange={handleLocationFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!locationFilters.thanaId}
              >
                <option value="">All Unions/Areas</option>
                {(data.filterUnionOrAreas || []).map(union => (
                  <option key={union.unionOrAreaId} value={union.unionOrAreaId}>
                    {union.unionOrAreaName}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={locationFilters.search}
                    onChange={handleLocationFilterChange}
                    placeholder="Search by name..."
                    className="w-full p-2 pl-8 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-2.5 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Clear All Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={resetAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <FaTimes className="mr-1" /> Clear All Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {uiState.showBulkActions && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-purple-800 flex items-center">
                  <FaCog className="mr-2" /> Bulk Actions
                </h3>
                <p className="text-sm text-purple-600">
                  {uiState.selectedInstitutions.length} institutions selected
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={selectAllOnPage}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm font-medium"
                >
                  Select All on Page
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Clear Selection
                </button>
                
                <select
                  value={uiState.selectedAction}
                  onChange={(e) => setUiState(prev => ({ ...prev, selectedAction: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Action</option>
                  <option value="approve">Approve Selected</option>
                  <option value="reject">Reject Selected</option>
                  <option value="suspend">Suspend Selected</option>
                  <option value="activate">Activate Selected</option>
                </select>
                
                {(uiState.selectedAction === 'reject' || uiState.selectedAction === 'suspend') && (
                  <input
                    type="text"
                    placeholder="Reason (required)"
                    value={uiState.reason}
                    onChange={(e) => setUiState(prev => ({ ...prev, reason: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                )}
                
                <button
                  onClick={handleBulkStatusChange}
                  disabled={uiState.selectedInstitutions.length === 0 || !uiState.selectedAction || 
                           ((uiState.selectedAction === 'reject' || uiState.selectedAction === 'suspend') && !uiState.reason)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                           disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Apply Action
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Institution Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table header showing active filters */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              
              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                  <button
                    onClick={resetStatusFilter}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              
              {locationFilters.divisionId && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Division: {data.divisions.find(d => d.divisionId === locationFilters.divisionId)?.divisionName}
                  <button
                    onClick={() => setLocationFilters(prev => ({ ...prev, divisionId: '' }))}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              
              {locationFilters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Search: "{locationFilters.search}"
                  <button
                    onClick={() => setLocationFilters(prev => ({ ...prev, search: '' }))}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              
              {(statusFilter !== 'ALL' || locationFilters.search || locationFilters.divisionId) && (
                <button
                  onClick={resetAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 ml-2"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

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
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
        <input
          type="checkbox"
          checked={uiState.selectedInstitutions.length === data.institutions.length && data.institutions.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              selectAllOnPage();
            } else {
              clearSelection();
            }
          }}
          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Name</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Email</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Phone</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Type</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Location</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Students</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Status</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Actions</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {data.institutions.length === 0 ? (
      <tr>
        <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
          No institutions found
        </td>
      </tr>
    ) : (
      data.institutions.map(inst => {
        // ✅ UPDATED: Pass only the institution object
        const statusBadge = getStatusBadge(inst);
        
        // ✅ Check if getStatusActions function exists, if not use this:
        const statusActions = getStatusActions ? getStatusActions(inst) : [];
        
        const isSelected = uiState.selectedInstitutions.includes(inst.institutionsId);
        
        return (
          <tr key={inst.institutionsId} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
            {/* Selection checkbox */}
            <td className="px-4 py-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleInstitutionSelection(inst.institutionsId)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </td>
            
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
            {/* Student count cell - Updated */}
            <td className="px-6 py-4 w-1/12 whitespace-nowrap">
              <button
                onClick={() => handleViewStudents(inst)}
                className="text-blue-600 hover:text-blue-900 flex items-center group"
                title={`Total: ${inst.studentCount || 0} students (Active: ${inst.activeStudentCount || 0})`}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <FaUsers className="mr-1" />
                    <span className="font-medium">{inst.studentCount || 0}</span>
                  </div>
                  {inst.activeStudentCount !== undefined && inst.activeStudentCount !== inst.studentCount && (
                    <div className="text-xs text-gray-500 mt-1">
                      ({inst.activeStudentCount} active)
                    </div>
                  )}
                </div>
              </button>
            </td>
            {/* <td className="px-6 py-4 w-1/12 whitespace-nowrap">
              <button
                onClick={() => handleViewStudents(inst)}
                className="text-blue-600 hover:text-blue-900 flex items-center"
              >
                <FaUsers className="mr-1" /> {inst.students?.length || 0}
              </button>
            </td> */}
            <td className="px-6 py-4 w-1/8 whitespace-nowrap">
              <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusBadge.bgColor} ${statusBadge.textColor}`}>
                {statusBadge.icon} {statusBadge.text}
              </span>
            </td>
            <td className="px-6 py-4 w-1/4 whitespace-nowrap text-sm font-medium">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(inst)}
                  className="text-indigo-600 hover:text-indigo-900 p-1"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(inst.institutionsId)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Delete"
                >
                  <FaTrash />
                </button>
                
                {/* Status Action Buttons */}
                {statusActions.length > 0 ? (
                  statusActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStatusChange(inst, action.action)}
                      className={`${action.color} hover:opacity-80 p-1`}
                      title={action.label}
                    >
                      {action.icon}
                    </button>
                  ))
                ) : (
                  // Fallback actions if getStatusActions is not defined
                  <>
                    {(!inst.approved && !inst.rejected && !inst.suspended) && (
                      <>
                        <button
                          onClick={() => handleStatusChange(inst, 'approve')}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleStatusChange(inst, 'reject')}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </>
                    )}
                    {(inst.approved && !inst.suspended) && (
                      <button
                        onClick={() => handleStatusChange(inst, 'suspend')}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        title="Suspend"
                      >
                        <FaPause />
                      </button>
                    )}
                    {inst.suspended && (
                      <button
                        onClick={() => handleStatusChange(inst, 'activate')}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Activate"
                      >
                        <FaPlay />
                      </button>
                    )}
                  </>
                )}
              </div>
            </td>
          </tr>
        );
      })
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
      </div>

      {/* Modal Components */}
      <InstitutionFormModal
        isOpen={uiState.isInstitutionModalOpen}
        onClose={closeInstitutionModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleDivisionChange={handleDivisionChange}
        handleDistrictChange={handleDistrictChange}
        handleThanaChange={handleThanaChange}
        handleSubmit={handleSubmit}
        data={data}
        uiState={uiState}
        editingId={uiState.editingId}
      />

      <StatusChangeModal
        isOpen={uiState.showStatusModal}
        onClose={closeStatusModal}
        statusModalData={statusModalData}
        uiState={uiState}
        setUiState={setUiState}
        confirmStatusChange={confirmStatusChange}
      />

      <StudentDetailsModal
        isOpen={uiState.isStudentModalOpen}
        onClose={closeStudentModal}
        currentInstitution={uiState.currentInstitution}
        currentStudents={data.currentStudents}
      />
    </AdminDashboard>
  );
};

export default InstitutionManager;