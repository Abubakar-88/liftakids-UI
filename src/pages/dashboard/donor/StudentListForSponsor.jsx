import React, { useState, useEffect } from 'react';
import { getInstitutionsByUnion, getAllInstitutionsList } from '../../../api/institutionApi';
import { getAllStudents, getStudentsByInstitution,searchStudentsPaginated, searchStudents, getStudentById } from '../../../api/studentApi';
import { getDivisions, getDistrictsByDivision, getThanasByDistrict, getUnionsByThanaId } from '../../../api/areaApi';
import { FaHandHoldingHeart } from 'react-icons/fa';
import ContactSponsorModal from '../donor/ContactSponsorModal';
import PaymentModalManual from '../donor/PaymentModalManual';
//import PaymentCheckoutPage from '../donor/PaymentCheckoutPage';
import { useNavigate } from 'react-router-dom';
import { checkStudentPendingStatus } from '../../../api/studentApi';
const StudentListForSponsor = () => {
  // State management
  const [contactModalOpen, setContactModalOpen] = useState(false);
  //const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalManualOpen, setPaymentModalManualOpen] = useState(false);
  //const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
 const navigate = useNavigate();
 const [searchTimeout, setSearchTimeout] = useState(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  // Filter states
  const [filters, setFilters] = useState({
    divisionId: '',
    districtId: '',
    thanaId: '',
    unionOrAreaId: '',
    institutionsId: '',
    search: ''
  });

  // Location data states
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [unions, setUnions] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0
  });
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [pendingStatusMap, setPendingStatusMap] = useState({});

  // Load initial data
  useEffect(() => {
    fetchDivisions();
    fetchStudents();
  }, []);

  // API functions
  const fetchDivisions = async () => {
    try {
      const res = await getDivisions();
      setDivisions(res.data || []);
    } catch (error) {
      console.error('Failed to load divisions:', error);
    }
  };

  const fetchDistricts = async (divisionId) => {
    try {
      const res = await getDistrictsByDivision(divisionId);
      setDistricts(res.data || []);
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const fetchThanas = async (districtId) => {
    try {
      const res = await getThanasByDistrict(districtId);
      setThanas(res.data || []);
    } catch (error) {
      console.error('Failed to load thanas:', error);
    }
  };

  const fetchUnions = async (thanaId) => {
    try {
      const res = await getUnionsByThanaId(thanaId);
      setUnions(res.data || []);
    } catch (error) {
      console.error('Failed to load unions/areas:', error);
    }
  };

  const fetchInstitutions = async (unionOrAreaId) => {
    try {
      const res = await getInstitutionsByUnion(unionOrAreaId);
      setInstitutions(res.data || []);
    } catch (error) {
      console.error('Failed to load institutions:', error);
    }
  };
const fetchStudents = async () => {
  try {
    setLoading(true);
    let studentsData = [];
    let totalPages = 1;
    let totalElements = 0;
    
    console.log('Fetching students with filters:', filters);
    console.log('Current page:', pagination.page, 'Size:', pagination.size);

    // Case 1: Filter by institution
    if (filters.institutionsId) {
      const response = await getStudentsByInstitutionWithPagination(filters.institutionsId, pagination.page, pagination.size);
      
      // Check if response is paginated or not
      if (response?.content) {
        // Paginated response
        studentsData = response.content;
        totalPages = response.totalPages || 1;
        totalElements = response.totalElements || studentsData.length;
      } else {
        // Non-paginated response
        studentsData = response?.data || response || [];
        totalPages = 1;
        totalElements = studentsData.length;
      }
    }
    // Case 2: Search with pagination
    else if (filters.search) {
      // Call search API with pagination parameters
      const response = await searchStudentsPaginated(
        filters.search,
        pagination.page,
        pagination.size
      );
      
      // Check if response is paginated
      if (response?.content) {
        studentsData = response.content;
        totalPages = response.totalPages || 1;
        totalElements = response.totalElements || 0;
        console.log('Search paginated response:', response);
      } else {
        // Fallback for non-paginated response
        studentsData = Array.isArray(response) ? response : [];
        totalPages = 1;
        totalElements = studentsData.length;
        console.log('Search non-paginated response:', studentsData);
      }
    }
    // Case 3: Get all with pagination
    else {
      const response = await getAllStudents(
        pagination.page, 
        pagination.size, 
        'studentName', 
        'asc'
      );
      
      studentsData = response?.content || [];
      totalPages = response?.totalPages || 1;
      totalElements = response?.totalElements || studentsData.length;
    }

    // Update pagination state
    setPagination(prev => ({
      ...prev,
      totalPages: totalPages,
      totalElements: totalElements
    }));

    // Check if studentsData is array
    if (!Array.isArray(studentsData)) {
      console.error('studentsData is not an array:', studentsData);
      setStudents([]);
      return;
    }

    // Process and set students
    const processedStudents = studentsData.map(student => ({
      ...student,
      sponsors: student.sponsors || [] // Ensure sponsors array exists
    }));
    
    setStudents(processedStudents);
    
    // Log pagination info
    const startItem = pagination.page * pagination.size + 1;
    const endItem = Math.min(startItem + processedStudents.length - 1, totalElements);
    console.log(`✅ Loaded ${processedStudents.length} students (Showing ${startItem} to ${endItem} of ${totalElements})`);

    // Now check pending status for EACH student
    const pendingStatuses = {};
    
    // Use Promise.all for better performance
    const pendingPromises = processedStudents.map(async (student) => {
      try {
        console.log(`\n=== Checking student ${student.studentId}: ${student.studentName} ===`);
        const pendingStatus = await checkPendingSponsorship(student.studentId);
        
        // Ensure pendingStatus is object
        if (pendingStatus && typeof pendingStatus === 'object') {
          if (pendingStatus.hasPending) {
            console.log(`🎉 Student ${student.studentId} HAS pending sponsorship!`);
          } else {
            console.log(`📭 Student ${student.studentId} has NO pending sponsorship`);
          }
          return { studentId: student.studentId, status: pendingStatus };
        } else {
          console.warn(`Invalid pending status for student ${student.studentId}`);
          return { studentId: student.studentId, status: { hasPending: false } };
        }
      } catch (err) {
        console.error(`Error checking pending status for student ${student.studentId}:`, err);
        return { studentId: student.studentId, status: { hasPending: false } };
      }
    });

    // Wait for all pending status checks
    const results = await Promise.all(pendingPromises);
    
    // Build pending status map
    results.forEach(result => {
      pendingStatuses[result.studentId] = result.status;
    });
    
    setPendingStatusMap(pendingStatuses);
    console.log('✅ Final pendingStatusMap:', pendingStatuses);

  } catch (error) {
    console.error('❌ Failed to load students:', error);
    setStudents([]);
    setPendingStatusMap({});
  } finally {
    setLoading(false);
  }
};


const checkPendingSponsorship = async (studentId) => {
  try {
    console.log(`🔍 Checking pending for student ${studentId}`);
    
    const pendingData = await checkStudentPendingStatus(studentId);
    console.log('API response data:', pendingData);
    
    if (pendingData && pendingData.length > 0) {
      const studentData = pendingData[0];
      console.log('Student data from API:', studentData);
      
      if (studentData.sponsors && studentData.sponsors.length > 0) {
        console.log('Sponsors found:', studentData.sponsors);
        
        const pendingSponsorship = studentData.sponsors.find(sponsor => {
          console.log(`Checking sponsor: ${sponsor.status} === 'PENDING_PAYMENT'?`, 
                     sponsor.status === 'PENDING_PAYMENT');
          return sponsor.status === 'PENDING_PAYMENT';
        });
        
        if (pendingSponsorship) {
          console.log(' Found PENDING_PAYMENT sponsorship:', pendingSponsorship);
          
          const pendingDate = pendingSponsorship.sponsorStartDate || 
                             pendingSponsorship.startDate || 
                             new Date();
          
          console.log('Pending date:', pendingDate);
          
          const pendingTime = new Date(pendingDate);
          const now = new Date();
          const timeDiff = now.getTime() - pendingTime.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);
          
          console.log(`Days difference: ${daysDiff}`);
          
          if (daysDiff < 3) {
            const daysLeft = Math.ceil(3 - daysDiff);
            console.log(`Will show processing for ${daysLeft} more days`);
            return {
              hasPending: true,
              daysLeft: daysLeft,
              sponsorship: pendingSponsorship
            };
          } else {
            console.log(`Pending is ${daysDiff} days old (> 3 days)`);
          }
        } else {
          console.log('❌ No PENDING_PAYMENT found in sponsors');
        }
      } else {
        console.log('❌ No sponsors array in response');
      }
    } else {
      console.log('❌ Empty response from API');
    }
    
    return { hasPending: false };
  } catch (error) {
    console.error(`💥 Error checking pending status for student ${studentId}:`, error);
    return { hasPending: false };
  }
};
const getSponsorButtonStatus = (student) => {
  if (!student || !student.studentId) {
    console.log("❌ No student or studentId");
    return { status: 'available' };
  }
  
  const studentId = student.studentId;
  
  
  // Check if student has COMPLETED sponsorship (not PENDING)
  const hasCompletedSponsorship = student.sponsors?.some(
    sponsor => sponsor.status === 'COMPLETED'
  );
  
  console.log("Has completed sponsorship:", hasCompletedSponsorship);
  
  if (hasCompletedSponsorship) {
    console.log("✅ Student has COMPLETED sponsorship, returning 'sponsored'");
    return { status: 'sponsored' };
  }
  
  // Now check for pending
  if (pendingStatusMap[studentId] && pendingStatusMap[studentId].hasPending) {
    console.log("🎯 Student has PENDING sponsorship, returning 'processing'");
    return {
      status: 'processing',
      daysLeft: pendingStatusMap[studentId].daysLeft || 1,
      sponsorship: pendingStatusMap[studentId].sponsorship
    };
  }
  
  console.log("✅ Student available for sponsorship");
  return { status: 'available' };
};

  // Determine sponsor button status
// const getSponsorButtonStatus = (student) => {
//   // if student-of sponsors list has any sponsorship with PENDING_PAYMENT status
//   if (student.sponsors && student.sponsors.length > 0) {
//     // PENDING_PAYMENT status-of sponsorship 
//     const pendingSponsorship = student.sponsors.find(sponsor => 
//       sponsor.status === 'PENDING_PAYMENT'
//     );
    
//     if (pendingSponsorship) {
//       // sponsorStartDate বা startDate use করুন, না থাকলে current date use করুন
//       const pendingDate = pendingSponsorship.sponsorStartDate || 
//                          pendingSponsorship.startDate || 
//                          new Date();
      
//       const pendingTime = new Date(pendingDate);
//       const now = new Date();
//       const timeDiff = now.getTime() - pendingTime.getTime();
//       const daysDiff = timeDiff / (1000 * 3600 * 24);
      
//       // যদি 3 দিনের কম হয়, Processing show করবে
//       if (daysDiff < 3) {
//         return {
//           status: 'processing',
//           daysLeft: Math.ceil(3 - daysDiff),
//           sponsorship: pendingSponsorship
//         };
//       }
//     }
//   }
  
//   return { status: 'available' };
// };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Reset dependent filters when parent filter changes
    if (name === 'divisionId') {
      setFilters(prev => ({
        ...prev,
        divisionId: value,
        districtId: '',
        thanaId: '',
        unionOrAreaId: '',
        institutionsId: ''
      }));
      if (value) fetchDistricts(value);
    } else if (name === 'districtId') {
      setFilters(prev => ({
        ...prev,
        districtId: value,
        thanaId: '',
        unionOrAreaId: '',
        institutionsId: ''
      }));
      if (value) fetchThanas(value);
    } else if (name === 'thanaId') {
      setFilters(prev => ({
        ...prev,
        thanaId: value,
        unionOrAreaId: '',
        institutionsId: ''
      }));
      if (value) fetchUnions(value);
    } else if (name === 'unionOrAreaId') {
      setFilters(prev => ({
        ...prev,
        unionOrAreaId: value,
        institutionsId: ''
      }));
      if (value) fetchInstitutions(value);
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
    
    setPagination(prev => ({ ...prev, page: 0 }));
  };

const handleSearchChange = (e) => {
  const searchValue = e.target.value;
  setFilters(prev => ({ ...prev, search: searchValue }));
  setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  
  // Debounce search to avoid too many API calls
  if (searchTimeout) clearTimeout(searchTimeout);
  setSearchTimeout(setTimeout(() => {
    fetchStudents();
  }, 500));
};
 

 const resetFilters = () => {
  setFilters({
    divisionId: '',
    districtId: '',
    thanaId: '',
    unionOrAreaId: '',
    institutionsId: '',
    search: ''
  });
  setPagination(prev => ({ ...prev, page: 0 }));
  fetchStudents(); // Fetch with reset filters
};

const handlePageChange = (newPage) => {
  if (newPage >= 0 && newPage < pagination.totalPages) {
    setPagination(prev => ({ ...prev, page: newPage }));
    // Fetch students for the new page
    fetchStudents();
  }
};

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
    setActiveTab('info');
  };

  const handleSponsor = (student) => {
    setSelectedStudent(student);
    console.log('Sponsor student:', student);
  };

  const getProgressPercentage = (student) => {
    const required = student.requiredMonthlySupport || 0;
    const sponsored = student.sponsoredAmount || 0;
    
    if (!required || required === 0) return 0;
    return Math.min((sponsored / required) * 100, 100);
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
 
  // Load districts when division changes
  useEffect(() => {
    if (filters.divisionId) {
      fetchDistricts(filters.divisionId);
    } else {
      setDistricts([]);
    }
  }, [filters.divisionId]);

  // Load thanas when district changes
  useEffect(() => {
    if (filters.districtId) {
      fetchThanas(filters.districtId);
    } else {
      setThanas([]);
    }
  }, [filters.districtId]);

  // Load unions when thana changes
  useEffect(() => {
    if (filters.thanaId) {
      fetchUnions(filters.thanaId);
    } else {
      setUnions([]);
    }
  }, [filters.thanaId]);

  // Load institutions when union changes
  useEffect(() => {
    if (filters.unionOrAreaId) {
      fetchInstitutions(filters.unionOrAreaId);
    } else {
      setInstitutions([]);
    }
  }, [filters.unionOrAreaId]);

  // Fetch students when filters or page changes
  useEffect(() => {
    fetchStudents();
  }, [filters, pagination.page]);

   // Check pending status when handling sponsor click
  const handleContactSponsor = async (student) => {
    // Check if student has pending sponsorship first
    const pendingStatus = await checkPendingSponsorship(student.studentId);
    
    if (pendingStatus.hasPending) {
      // Show message that sponsorship is processing
      alert(`This student already has a pending sponsorship. Please wait ${pendingStatus.daysLeft} more day(s).`);
      return;
    }
    
    setSelectedStudent(student);
    setContactModalOpen(true);
  };
  
  // Handle payment data from PaymentModalManual
  const handlePaymentSubmit = (paymentInfo) => {
    setPaymentData(paymentInfo);
    setPaymentModalManualOpen(false);
    setCheckoutModalOpen(true);
  };
  
  // Handle successful payment
  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    setCheckoutModalOpen(false);
    // Show success message or update UI
    alert('Payment successful! Thank you for your sponsorship.');
    
    // Optional: Refresh student data to show updated sponsorship status
    fetchStudents();
  };

  const handleSponsorConfirm = () => {
    // Handle the sponsorship confirmation
    console.log('Sponsoring student:', selectedStudent);
    setContactModalOpen(false);
    // sponsorship logic here
  };

  return (
    <div className="container mx-auto px-4 py-8">
     {/* Header Section */}
     <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 order-b-4 border-blue-600">
       {/* Title and Back button - Same line */}
       <div className="flex justify-between items-center mb-3">
         <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
           <FaHandHoldingHeart className="text-blue-600 mr-2 text-lg md:text-xl" /> 
           Donor Portal
         </h1>
         
         <button
           onClick={() => navigate(-1)}
           className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
           </svg>
           <span className="hidden md:inline">Back</span>
           <span className="md:hidden">←</span>
         </button>
       </div>
       
       {/* Subtitle */}
       <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-3">
         Search Student to Sponsor
       </h2>
       
       {/* Description */}
       <p className="text-sm md:text-base text-gray-600 mb-4">
         Search and sponsor students in need of financial support
       </p>
       
       {/* Info box */}
       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
         <div className="flex items-start">
           <svg className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
           </svg>
           <div className="text-xs md:text-sm">
             <span className="font-medium text-yellow-800">Please Enter All Fields:</span>
             <span className="text-yellow-700 ml-1">Division, District, Thana, Union/Area</span>
           </div>
         </div>
       </div>
     </div>
     <div className="w-full h-1 bg-black  mb-6"></div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        
        {/* Desktop View - 5 columns */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
            <select
              name="divisionId"
              value={filters.divisionId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Division</option>
              {divisions.map(div => (
                <option key={div.divisionId} value={div.divisionId}>
                  {div.divisionName}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="districtId"
              value={filters.districtId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.divisionId}
            >
              <option value="">All District</option>
              {districts.map(dist => (
                <option key={dist.districtId} value={dist.districtId}>
                  {dist.districtName}
                </option>
              ))}
            </select>
          </div>

          {/* Thana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thana</label>
            <select
              name="thanaId"
              value={filters.thanaId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.districtId}
            >
              <option value="">All Thana</option>
              {thanas.map(thana => (
                <option key={thana.thanaId} value={thana.thanaId}>
                  {thana.thanaName}
                </option>
              ))}
            </select>
          </div>

          {/* Union */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Union/Area</label>
            <select
              name="unionOrAreaId"
              value={filters.unionOrAreaId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.thanaId}
            >
              <option value="">All Union/Area</option>
              {unions.map(union => (
                <option key={union.unionOrAreaId} value={union.unionOrAreaId}>
                  {union.unionOrAreaName}
                </option>
              ))}
            </select>
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <select
              name="institutionsId"
              value={filters.institutionsId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.unionOrAreaId}
            >
              <option value="">All Institution</option>
              {institutions.map(inst => (
                <option key={inst.institutionsId} value={inst.institutionsId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Mobile View - 2 columns */}
        <div className="md:hidden grid grid-cols-2 gap-4 mb-4">
          {/* Row 1: Division + District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
            <select
              name="divisionId"
              value={filters.divisionId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Division</option>
              {divisions.map(div => (
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
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.divisionId}
            >
              <option value="">All District</option>
              {districts.map(dist => (
                <option key={dist.districtId} value={dist.districtId}>
                  {dist.districtName}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Thana + Union */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thana</label>
            <select
              name="thanaId"
              value={filters.thanaId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.districtId}
            >
              <option value="">All Thana</option>
              {thanas.map(thana => (
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
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.thanaId}
            >
              <option value="">All Union/Area</option>
              {unions.map(union => (
                <option key={union.unionOrAreaId} value={union.unionOrAreaId}>
                  {union.unionOrAreaName}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Institution - spans full width */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <select
              name="institutionsId"
              value={filters.institutionsId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.unionOrAreaId}
            >
              <option value="">All Institution</option>
              {institutions.map(inst => (
                <option key={inst.institutionsId} value={inst.institutionsId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
            {/* Mobile: Reset Icon + Search Row */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Reset Icon Button - Mobile */}
          <button
            onClick={resetFilters}
            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 flex-shrink-0"
            title="Reset Filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
              
              {/* Search Input - Mobile */}
              <div className="flex-1">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search by name or guardian..."
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              {/* Search Button - Mobile */}
              <button
                onClick={fetchStudents}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-shrink-0"
                title="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Desktop: Original Layout */}
            <div className="hidden md:flex md:flex-1 md:justify-between md:items-center">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search by student name or guardian..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Reset Filters
                </button>
                <button
                  onClick={fetchStudents}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Student List - Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No students found</p>
            <button 
              onClick={fetchStudents}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Class & Financial Rank</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Monthly Need</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Progress</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Institute</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(student => (



                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.studentName}
                      </div>
                      <div className={`text-xs px-2 inline-flex rounded-full ${
                        student.sponsored ? 'bg-green-100 text-green-800' : 'bg-red-500 text-white font-bold py-1'
                      }`}>
                        {student.sponsored ? 'Fully Sponsored' : 'Not Sponsored'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Class {student.grade || 'N/A'}
                      </div>
                      <div className={`text-xs px-2 inline-flex rounded-full ${
                        student.financial_rank === 'URGENT' ? 'bg-red-100 text-red-800' :
                        student.financial_rank === 'POOR' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.financial_rank || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ৳{(student.requiredMonthlySupport || 0)?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${getProgressPercentage(student)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ৳{(student.sponsoredAmount || 0)?.toLocaleString()} / ৳{(student.requiredMonthlySupport || 0)?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.institutionName || 'Not specified'}
                    </td>
                  <td className="px-6 py-4 text-right">
  <div className="flex justify-end space-x-2">
    <button
      onClick={() => handleViewDetails(student)}
      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
    >
      View Details
    </button>
    
    {!student.fullySponsored && (
      (() => {
        console.log(`🎯 Rendering button for student ${student.studentId}`);
        const buttonStatus = getSponsorButtonStatus(student);
        console.log(`Button status for ${student.studentId}:`, buttonStatus);
        
        if (buttonStatus.status === 'processing') {
          console.log(`🎨 Showing PROCESSING button for ${student.studentId}`);
          return (
            <button
              disabled
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm cursor-not-allowed flex items-center"
              title={`Payment Pending - Available in ${buttonStatus.daysLeft} day(s)`}
            >
              <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2m15.364-7.364l-2.828 2.828M7.464 17.536l-2.828 2.828m12.728 0l-2.828-2.828M7.464 6.464L4.636 3.636" />
              </svg>
              Processing ({buttonStatus.daysLeft}d)
            </button>
          );
        } else {
          console.log(`🎨 Showing SPONSOR button for ${student.studentId}`);
          return (
            <button
              onClick={() => handleContactSponsor(student)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Sponsor
            </button>
          );
        }
      })()
    )}
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">
                    {students.length === 0 ? 0 : pagination.page * pagination.size + 1}
                  </span> to{' '}
                  <span className="font-medium">
                    {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.totalElements}</span> students
                </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 0}
                      className={`px-3 py-1 rounded ${
                        pagination.page === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`px-3 py-1 rounded ${
                          pagination.page === index
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages - 1}
                      className={`px-3 py-1 rounded ${
                        pagination.page >= pagination.totalPages - 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>

    {/* Student List - Mobile Cards */}
<div className="md:hidden space-y-4">
  {loading ? (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading students...</p>
    </div>
  ) : students.length === 0 ? (
    <div className="p-8 text-center">
      <p className="text-gray-600">No students found</p>
    </div>
  ) : (
    students.map(student => (
      <div
        key={student.studentId}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
      >
        {/* Top section - Image + Name + Badges */}
        <div className="flex items-start mb-4">
          {/* Left - Image */}
          <div className="w-16 h-16 flex-shrink-0 mr-3">
            <img
              src={student.photoUrl || "/default-thumbnail.png"}
              alt={student.studentName}
              className="w-full h-full object-cover rounded-lg border"
            />
          </div>

          {/* Right - Name + Badges */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900 text-lg">{student.studentName}</h3>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                student.sponsored
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800 font-medium"
              }`}>
                {student.sponsored ? "Sponsored" : "Not Sponsored"}
              </span>
            </div>
            
            {/* Student Details */}
            <div className="mt-1">
              <p className="text-sm text-gray-600 text-justify">
                Class:{student.grade|| "N/A"}| Financial Rank:<span className='text-red-400 ml-2'>{student.financial_rank || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-600">
                Monthly Requirement: <span className="font-medium">৳{student.requiredMonthlySupport?.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className=" mb-4 text-sm">
          <div>
            <p className="text-gray-600 text-justify">Sponsored Amount: <span className="font-medium">৳{(student.sponsoredAmount || 0)?.toLocaleString()}</span> </p>
            <p className="text-gray-600 text-justify"> Institution Name: <span className="font-medium" >{student.institutionName || "Not specified"}</span></p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{getProgressPercentage(student).toFixed(1)}% Funded</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${getProgressPercentage(student)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(student)}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          {!student.sponsored && (
            <button
              onClick={() => handleContactSponsor(student)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Sponsor Now
            </button>
          )}
        </div> 
      </div>
    ))
  )}
  
  
  {/* Pagination */}
{pagination.totalPages > 0 && (
  <div className="px-4 py-3 bg-white border-t border-gray-200">
    <div className="flex flex-col items-center space-y-3">
      {/* Showing X to Y of Z students */}
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">
          {students.length === 0 ? 0 : pagination.page * pagination.size + 1}
        </span> to{' '}
        <span className="font-medium">
          {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
        </span> of{' '}
        <span className="font-medium">{pagination.totalElements}</span> students
      </div>
      
      {/* Simple page navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            pagination.page === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-700">
          Page <span className="font-medium">{pagination.page + 1}</span> of{' '}
          <span className="font-medium">{pagination.totalPages}</span>
        </span>
        
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages - 1}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            pagination.page >= pagination.totalPages - 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
)}
</div>
    
    {showDetails && selectedStudent && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 z-50">
        <div className="bg-white rounded-lg w-full max-w-[360px] max-h-[95vh] overflow-y-auto shadow-lg">

          {/* Header (sticky) - Corrected design */}
          <div className="relative border-b border-gray-200 p-4 sticky top-0 bg-white z-10">
            <div className="flex items-start gap-3">
              <img
                src={selectedStudent.photoUrl || selectedStudent.avatar || "/placeholder-avatar.png"}
                alt={selectedStudent.studentName || selectedStudent.name}
                className="w-14 h-14 rounded-md object-cover border"
              />
              <div className="flex-1 min-w-0 text-justify">
                <h3 className="text-[16px] font-semibold text-gray-900 truncate">
                  {selectedStudent.studentName || selectedStudent.name}
                </h3>
                <p className="text-[13px] text-gray-600 mt-1">
                  Class {selectedStudent.grade || "N/A"} | Financial Rank:{" "}
                  <span className="font-medium  ml-3 text-red-400">{selectedStudent.financial_rank || "N/A"}</span>
                </p>
              </div>
            </div>

            {/* Status pill - positioned correctly like in screenshot */}
            <div className="absolute top-3 right-3">
              <span
                className={[
                  "text-[11px] px-2.5 py-1 rounded-full font-medium",
                  selectedStudent.sponsored 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-red-100 text-red-800 border border-red-200"
                ].join(" ")}
              >
                {selectedStudent.sponsored ? "Sponsored" : "Not Sponsored"}
              </span>
            </div>
          </div>

          {/* Summary block */}
          <div className="p-4">
            {/* Row: Monthly Requirement */}
            <div className="flex items-center justify-between text-[13px] mb-2">
              <span className="text-gray-600">Monthly Requirement:</span>
              <span className="font-medium text-gray-900">
                ৳{(selectedStudent.requiredMonthlySupport || 0)?.toLocaleString()}
              </span>
            </div>

            {/* Progress bar with labels */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${getProgressPercentage(selectedStudent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[12px] text-gray-600">
                <span>{getProgressPercentage(selectedStudent).toFixed(0)}% Funded</span>
                <span>৳{(selectedStudent.sponsoredAmount || 0)?.toLocaleString()} / ৳{(selectedStudent.requiredMonthlySupport || 0)?.toLocaleString()}</span>
              </div>
            </div>

            {/* Tabs exactly two, underline style */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`py-2 px-4 mr-2 text-[14px] font-medium border-b-2 ${
                    activeTab === "info"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Student Info
                </button>
                <button
                  onClick={() => setActiveTab("academic")}
                  className={`py-2 px-4 text-[14px] font-medium border-b-2 ${
                    activeTab === "academic"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Academic Result
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "info" && (
              <div className="space-y-4 text-[14px] text-justify">
                {/* Institute */}
                <div>
                  {/* <h4 className="font-medium text-gray-700 mb-1">Institute Name</h4> */}
                  <p className="text-gray-900 text-justify">
                    <span className="font-medium text-gray-700 mb-1 text-justify">Institute Name:  </span>{selectedStudent.institutionName || "Not specified"}
                  </p>
                </div>

                {/* Divider label */}
                <div className="text-[13px] text-gray-500 font-medium pt-2 border-t border-gray-100 text-justify">Descriptions:</div>

                {/* Details list */}
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-600 w-32 flex-shrink-0">Student Name:</span>
                    <span className="text-gray-900">{selectedStudent.studentName || selectedStudent.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32 flex-shrink-0">Guardian Phone:</span>
                    <span className="text-gray-900">{selectedStudent.contactNumber || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32 flex-shrink-0">Address:</span>
                    <span className="text-gray-900">{selectedStudent.address || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32 flex-shrink-0">Guardian Name:</span>
                    <span className="text-gray-900">{selectedStudent.guardianName || "N/A"}</span>
                  </div>
                </div>

                {/* About This Student */}
                <div>
                  <div className="text-[13px] text-gray-500 font-medium mb-2">About This Student</div>
                  <div className="bg-gray-50 rounded-md p-3 text-gray-800 leading-relaxed">
                    {selectedStudent.bio ||
                      "Abdur Rahman is a diligent student in Class 2 at his local madrasa. He has consistently performed well in his studies, showing particular aptitude in Arabic and Mathematics. Despite financial challenges at home, he maintains a positive attitude and demonstrates strong commitment to his education. His teachers describe him as respectful, focused, and eager to learn."}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academic" && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 text-[15px]">Academic Results</h4>
                {selectedStudent.results?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-[13px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Subject</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedStudent.results.map((r, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3">{r.subject || "N/A"}</td>
                            <td className="px-4 py-3 font-medium">{r.score || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-[14px]">No academic results available.</p>
                )}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="border-t border-gray-200 p-4 flex items-center gap-3 sticky bottom-0 bg-white">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2.5 rounded-md bg-gray-200 text-gray-800 text-[14px] font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>

            {!selectedStudent.sponsored && (
              <button
                onClick={() => handleContactSponsor(selectedStudent)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Contact for Sponsor
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Modals */}
    {contactModalOpen && (
      <ContactSponsorModal
        student={selectedStudent}
        onClose={() => setContactModalOpen(false)}
        onSponsor={() => {
          setContactModalOpen(false);
          setPaymentModalManualOpen(true);
        }}
      />
    )}
    
    {paymentModalManualOpen && (
      <PaymentModalManual
        student={selectedStudent}
        onClose={() => setPaymentModalManualOpen(false)}
        onPayment={handlePaymentSubmit}
      />
    )}
   
    {/* {checkoutModalOpen && (
      <PaymentCheckoutPage
        sponsorshipData={paymentData}
        onBack={() => {
          setCheckoutModalOpen(false);
          setPaymentModalManualOpen(true);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    )}  */}

   <div className="mt-4 text-center">
        <button 
          onClick={() => navigate('/donor/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Donor Dashboard
        </button>
      </div>



  </div>
  );
};

export default StudentListForSponsor;