import { useState, useEffect } from 'react';
import React from 'react';
import { Table, Input, Select, Space, Button, DatePicker, Tag, Card, Row, Col,Tooltip  } from 'antd';
import { SearchOutlined, ReloadOutlined,ExclamationCircleOutlined  } from '@ant-design/icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import {getInstitutionsByUnion, getAllInstitutionsList} from '../../../api/institutionApi';
import AdminDashboard from "./AdminDashboard";
import{  getAllStudents,
  getStudentsByInstitution,
  searchStudents,
  deleteStudent,
  addStudent,
  updateStudent,
  getStudentById} from '../../../api/studentApi';

import {
  getDivisions,
  getDistrictsByDivision,
  getThanasByDistrict,
  getUnionsByThanaId
  } from '../../../api/areaApi';
import { FaUserGraduate } from 'react-icons/fa';

Modal.setAppElement('#root');

const StudentManager = () => {
  // Form states
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    gender: '',
    address: '',
    contactNumber: '',
    financial_rank: '',
    bio: '',
    photoUrl: '',
    sponsored: false,
    guardianName: '',
    institutionsId: null,
    requiredMonthlySupport: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    divisionId: '',
    districtId: '',
    thanaId: '',
    unionOrAreaId: '',
    institutionsId: '',
    search: ''
  });

  // Data states
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [unions, setUnions] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]); 
  const [filteredInstitutions, setFilteredInstitutions] = useState([]); 
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
const [institutionMap, setInstitutionMap] = useState({});
const [deletingId, setDeletingId] = useState(null);
const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  // Load initial data
  useEffect(() => {
    fetchDivisions();
    fetchStudents();
  }, []);
// 1. First, verify your API call is working
const fetchAllInstitutions = async () => {
  console.log("Attempting to fetch institutions..."); // Debug log
  try {
    const res = await getAllInstitutionsList();
    console.log("API response:", res.data); // Verify response structure
    return res.data;
  } catch (error) {
    console.error("API error:", error);
    toast.error('Failed to load institutions');
    return []; // Return empty array on error
  }
};

useEffect(() => {
  if (editingId) {
    console.log("Editing student ID:", editingId);
  }
}, [editingId]);

useEffect(() => {
  fetchStudents();
}, [filters.institutionsId, filters.search, currentPage]);
useEffect(() => {
  if (filters.institutionsId !== null || filters.search) {
    fetchStudents();
  }
}, [filters.institutionsId, filters.search]);

useEffect(() => {
  const loadData = async () => {
    await fetchAllInstitutions(); // Load institutions first
    await fetchStudents(); // Then load students
  };
  loadData();
}, []);

// 2. Modified useEffect with proper dependency tracking
useEffect(() => {
  let isMounted = true; // Prevent memory leaks
  
  const loadData = async () => {
    const institutions = await fetchAllInstitutions();
    if (isMounted) {
      setAllInstitutions(institutions);
      console.log("Institutions set:", institutions); // Verify state update
    }
  };

  loadData();

  return () => { isMounted = false }; // Cleanup
}, []); 

// Load institutions by union when filter changes (for other use cases)
  useEffect(() => {
    if (filters.unionOrAreaId) {
      const fetchFilteredInstitutions = async () => {
        try {
          setLoadingInstitutions(true);
          const res = await getInstitutionsByUnion(filters.unionOrAreaId);
          setFilteredInstitutions(res.data);
        } catch (error) {
          toast.error('Failed to load institutions');
        } finally {
          setLoadingInstitutions(false);
        }
      };
      
      fetchFilteredInstitutions();
    } else {
      setFilteredInstitutions([]);
      setFilters(prev => ({ ...prev, institutionsId: '' }));
    }
  }, [filters.unionOrAreaId]);


  // Load districts when division changes
  useEffect(() => {
    if (filters.divisionId) {
      fetchDistricts(filters.divisionId);
    } else {
      setDistricts([]);
      setFilters(prev => ({ ...prev, districtId: '', thanaId: '', unionOrAreaId: '', institutionsId: '' }));
    }
  }, [filters.divisionId]);


  // Load thanas when district changes
  useEffect(() => {
    if (filters.districtId) {
      fetchThanas(filters.districtId);
    } else {
      setThanas([]);
      setFilters(prev => ({ ...prev, thanaId: '', unionOrAreaId: '', institutionsId: '' }));
    }
  }, [filters.districtId]);


  // Load unions when thana changes
  useEffect(() => {
    if (filters.thanaId) {
      fetchUnions(filters.thanaId);
    } else {
      setUnions([]);
      setFilters(prev => ({ ...prev, unionOrAreaId: '', institutionsId: '' }));
    }
  }, [filters.thanaId]);


  // Load institutions when union changes
  useEffect(() => {
    if (filters.unionOrAreaId) {
      fetchInstitutions(filters.unionOrAreaId);
    } else {
      setInstitutions([]);
      setFilters(prev => ({ ...prev, institutionsId: '' }));
    }
  }, [filters.unionOrAreaId]);


  // Fetch students when filters or page changes
  useEffect(() => {
    fetchStudents();
  }, [filters, currentPage]);

  // API functions
  const fetchDivisions = async () => {
    try {
      const res = await getDivisions();
      setDivisions(res.data);
    } catch (error) {
      toast.error('Failed to load divisions');
    }
  };

  const fetchDistricts = async (divisionId) => {
    try {
      const res = await getDistrictsByDivision(divisionId);
      setDistricts(res.data);
    } catch (error) {
      toast.error('Failed to load districts');
    }
  };

  const fetchThanas = async (districtId) => {
    try {
      const res = await getThanasByDistrict(districtId);
      setThanas(res.data);
    } catch (error) {
      toast.error('Failed to load thanas');
    }
  };

  const fetchUnions = async (thanaId) => {
    try {
      const res = await getUnionsByThanaId(thanaId);
      setUnions(res.data);
    } catch (error) {
      toast.error('Failed to load unions/areas');
    }
  };

  const fetchInstitutions = async (unionOrAreaId) => {
  try {
    const res = await getInstitutionsByUnion(unionOrAreaId);
    // Ensure institutions have both ID and name
    // const validInstitutions = res.data.map(inst => ({
    //   institutionsId: Number(inst.institutionsId),
    //   institutionName: inst.institutionName
    // }));
    setInstitutions(res.data);
  } catch (error) {
    toast.error('Failed to load institutions');
  }
};

const fetchStudents = async () => {
  try {
    setIsLoading(true);
    setStudents([]);
    
    let response;
    
    if (filters.institutionsId) {
      response = await getStudentsByInstitution(filters.institutionsId);
      console.log('Institution response:', response);
    } 
    else if (filters.search) {
      response = await searchStudents(filters.search);
      console.log('Search response:', response);
    }
    else {
      response = await getAllStudents(currentPage - 1, pageSize, 'studentName', 'asc');
      console.log('All students response:', response);
    }
    
    // Handle different response structures
    let studentsData = [];
    
    if (response) {
      // Case 1: Direct array response
      if (Array.isArray(response)) {
        studentsData = response;
      } 
      // Case 2: Response with content property (your main case)
      else if (response.content && Array.isArray(response.content)) {
        studentsData = response.content;
        // Also update pagination info
        setTotalPages(response.totalPages || 1);
      }
      // Case 3: Response with data property that contains content
      else if (response.data) {
        if (Array.isArray(response.data)) {
          studentsData = response.data;
        }
        else if (response.data.content && Array.isArray(response.data.content)) {
          studentsData = response.data.content;
          setTotalPages(response.data.totalPages || 1);
        }
      }
      // Case 4: Response with data property that is directly the array
      else if (response.data && Array.isArray(response.data)) {
        studentsData = response.data;
      }
    }
    
    setStudents(studentsData);
    console.log('Students data set:', studentsData);
    
  } catch (error) {
    console.error('Fetch error:', error);
    toast.error(error.response?.data?.message || 'Failed to load students');
    setStudents([]);
  } finally {
    setIsLoading(false);
  }
};

// Utility functions
const calculateAge = (dobString) => {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};


const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const fetchStudentDetails = async (studentId) => {
    try {
      const res = await getStudentById(studentId);
      setCurrentStudent(res.data);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };
// const handleInputChange = (e) => {
//   const { name, value, type, checked } = e.target;
  
//   setFormData(prev => ({ 
//     ...prev, 
//     [name]: type === 'checkbox' ? checked : 
//             (name === 'institutionsId' ? Number(value) : value)
//   }));
// };
 //Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
   const handleInstituitionChange = (e) => {
    const { name, value, type } = e.target;
  
  setFormData(prev => ({ 
    ...prev, 
    [name]: type === 'checkbox' ? e.target.checked : 
            (name === 'institutionsId' || name === 'requiredMonthlySupport') 
              ? Number(value) 
              : value
  }));
  };

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
  } else if (name === 'districtId') {
    setFilters(prev => ({
      ...prev,
      districtId: value,
      thanaId: '',
      unionOrAreaId: '',
      institutionsId: ''
    }));
  } else if (name === 'thanaId') {
    setFilters(prev => ({
      ...prev,
      thanaId: value,
      unionOrAreaId: '',
      institutionsId: ''
    }));
  } else if (name === 'unionOrAreaId') {
    setFilters(prev => ({
      ...prev,
      unionOrAreaId: value,
      institutionsId: ''
    }));
  } else {
    setFilters(prev => ({ ...prev, [name]: value }));
  }
  
  setCurrentPage(1);
};


  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setIsLoading(true);
    
    // Debug: Log form data before submission
    console.log("Form data before submission:", formData);
    
    // Transform data before sending
    const payload = {
      ...formData,
      institutionsId: Number(formData.institutionsId), // Ensure this is a number
      dob: new Date(formData.dob).toISOString(),
      requiredMonthlySupport: Number(formData.requiredMonthlySupport) || 0,
      financial_rank: formData.financial_rank // Ensure this matches backend enum
    };

    // Debug: Log payload before API call
   // Debug payload
    console.log("Submitting payload:", payload);

    if (editingId) {
      await updateStudent(editingId, payload);
      toast.success('Student updated successfully');
    } else {
      await addStudent(payload);
      toast.success('Student created successfully');
    }
    
    resetForm();
    fetchStudents();
    setIsModalOpen(false);
  } catch (error) {
    console.error('Submission error:', {
      error: error.response?.data,
      status: error.response?.status
    });
    toast.error(
      error.response?.data?.message || 
      error.response?.data?.errors?.join(', ') || 
      'Failed to save student'
    );
  } finally {
    setIsLoading(false);
  }
};

// Helper function to map frontend values to backend enum
const convertToBackendFinancialRank = (frontendValue) => {
  const mapping = {
    'POOR': 'Poor', 
    'VERY_POOR': 'VeryPoor',
    'URGENT': 'Urgent'
   
  };

  return mapping[frontendValue.toUpperCase()] || frontendValue;
};

  const handleEdit = async (student) =>  {
    try {
    // Fetch fresh student data to ensure you have the latest
    const res = await getStudentById(student.studentId);
    const studentData = res.data;
    console.log('Student data from API:', studentData);
    setFormData({
      studentName: student.studentName,
      dob: student.dob.split('T')[0],
      gender: student.gender,
      address: student.address,
      contactNumber: student.contactNumber,
      financial_rank: student.financial_rank,
      bio: student.bio,
      photoUrl: student.photoUrl,
      sponsored: student.sponsored,
      guardianName: student.guardianName,
      institutionsId: student.institutionsId ? Number(student.institutionsId) : '',
      requiredMonthlySupport: student.requiredMonthlySupport
    });
    setEditingId(student.studentId);
    setIsModalOpen(true);
     } catch (error) {
    toast.error('Failed to load student data');
  }
  };

const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this student?')) {
    setDeletingId(id);
    try {
      await deleteStudent(id);
      toast.success('Student deleted successfully');
      // Optimistically update UI
      setStudents(prev => prev.filter(student => student.studentId !== id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  }
};

  const resetForm = () => {
    setFormData({
      studentName: '',
      dob: '',
      gender: '',
      address: '',
      contactNumber: '',
      financial_rank: '',
      bio: '',
      photoUrl: '',
      sponsored: false,
      guardianName: '',
      institutionsId: '',
      requiredMonthlySupport: 0
    });
    setEditingId(null);
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
    setCurrentPage(1);
  };

const ExpandedStudentRow = ({ student }) => {
  const hasSponsorships = student.sponsored && student.sponsors && student.sponsors.length > 0;

  return (
    <div className="bg-gray-50 p-4 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Student Details */}
        <div>
          <h4 className="font-semibold mb-2">Student Details</h4>
          <p><strong>Date of Birth:</strong> {new Date(student.dob).toLocaleDateString()}</p>
          <p><strong>Age:</strong> {calculateAge(student.dob)} years</p>
          <p><strong>Gender:</strong> {student.gender}</p>
          <p><strong>Contact:</strong> {student.contactNumber}</p>
          <p><strong>Address:</strong> {student.address}</p>
        </div>

        {/* Financial Information */}
        <div>
          <h4 className="font-semibold mb-2">Financial Information</h4>
          <p><strong>Required Support:</strong> ৳{student.requiredMonthlySupport?.toFixed(2)}/month</p>
          <p><strong>Sponsored Amount:</strong> ৳{student.sponsoredAmount?.toFixed(2)}</p>
          <p>
            <strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              student.fullySponsored 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {student.fullySponsored ? 'Fully Sponsored' : 'Needs Sponsorship'}
            </span>
          </p>
          <p><strong>Financial Rank:</strong> {student.financial_rank}</p>
        </div>
      </div>

    {/* //  Bio
      {student.bio && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Bio</h4>
          <p className="text-gray-700">{student.bio}</p>
        </div>
      )} */}

      {/* Sponsors Section */}
      {hasSponsorships && (
        <div>
          <h4 className="font-semibold mb-3">Sponsors</h4>
          <div className="space-y-3">
            {student.sponsors.map((sponsor, index) => (
              <SponsorCard key={index} sponsor={sponsor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SponsorCard = ({ sponsor }) => {
  const isPaidUpToPast = sponsor.paidUpTo && new Date(sponsor.paidUpTo) < new Date();
  const isOverdue = isPaidUpToPast && sponsor.paidUpTo && 
                   new Date(sponsor.paidUpTo) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    
     const isPaymentDue = sponsor.paymentDue || isPaidUpToPast;

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
             <p><strong>Sponsor:   </strong> {sponsor.donorName}</p>
          <p><strong>Start Date:</strong> {moment(sponsor.startDate).format('LL')}</p>
            <p><strong>End Date:  </strong> {moment(sponsor.endDate).format('LL')}</p>
   <p><strong>Total Paid Months:</strong> {sponsor.monthsPaid}</p>
      <p><strong>Monthly Amount:</strong> ৳{sponsor.monthlyAmount?.toFixed(2)}</p>
              <p><strong>Status:</strong> {sponsor.status}</p>
          <p>
            <strong>Payment Status:</strong> 
            {isPaymentDue ? (
              <Tag color="red" className="ml-2">Payment Due</Tag>
            ) : (
              <Tag color="green" className="ml-2">Up to Date</Tag>
            )}
            {isOverdue && <Tag color="red" className="ml-2">Overdue</Tag>}
          </p>
        </div>
        <div>
              <p><strong>Period:</strong> {new Date(sponsor.startDate).toLocaleDateString()} - {new Date(sponsor.endDate).toLocaleDateString()}</p>
          <p><strong>Total Paid:</strong> ৳{sponsor.totalAmount?.toFixed(2) || '0.00'}</p>
        <p>
                    <strong>Paid Up To: </strong> 
                    {sponsor.paidUpTo ? (
                      <span style={{ color: isPaidUpToPast ? 'red' : 'inherit' }}>
                        {moment(sponsor.paidUpTo).format('LL')}
                        {isPaidUpToPast && (
                          <Tooltip title="Payment is overdue! Paid up to date is in the past">
                            <ExclamationCircleOutlined style={{ color: 'red', marginLeft: 8 }} />
                          </Tooltip>
                        )}
                      </span>
                    ) : 'N/A'}
                  </p>
        </div>
      </div>
    </div>
  );
};
const handleExpand = (studentId) => {
  setExpandedRowKeys(prev => 
    prev.includes(studentId) 
      ? prev.filter(id => id !== studentId)
      : [...prev, studentId]
  );
};

// const calculateAge = (dobString) => {
//   const dob = new Date(dobString);
//   const today = new Date();
//   let age = today.getFullYear() - dob.getFullYear();
//   const monthDiff = today.getMonth() - dob.getMonth();
  
//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
//     age--;
//   }
//   return age;
// };

  return (
    <AdminDashboard>
    <div className="container mx-auto p-4">
       {/* Header Section */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center">
                  <FaUserGraduate className="mr-2" /> Student Management
                </h1>
                  <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Student
          </button>
        </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block mb-1">Division</label>
            <select
              name="divisionId"
              value={filters.divisionId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Divisions</option>
              {divisions.map(div => (
                <option key={div.divisionId} value={div.divisionId}>
                  {div.divisionName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">District</label>
            <select
              name="districtId"
              value={filters.districtId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              disabled={!filters.divisionId}
            >
              <option value="">All Districts</option>
              {districts.map(dist => (
                <option key={dist.districtId} value={dist.districtId}>
                  {dist.districtName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Thana</label>
            <select
              name="thanaId"
              value={filters.thanaId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              disabled={!filters.districtId}
            >
              <option value="">All Thanas</option>
              {thanas.map(thana => (
                <option key={thana.thanaId} value={thana.thanaId}>
                  {thana.thanaName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Union/Area</label>
            <select
              name="unionOrAreaId"
              value={filters.unionOrAreaId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              disabled={!filters.thanaId}
            >
              <option value="">All Unions/Areas</option>
              {unions.map(union => (
                <option key={union.unionOrAreaId} value={union.unionOrAreaId}>
                  {union.unionOrAreaName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Institution</label>

           <select
                  name="institutionsId"
                  value={filters.institutionsId || ""} // Ensure value is never undefined
                  onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!filters.unionOrAreaId}
                 
                >
                  <option value="">All Institutions</option>
                  {institutions.map(inst => (
                    <option key={inst.institutionsId} value={inst.institutionsId}>
                    {inst.institutionName}
                  </option>
                  ))}
                </select>

          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex-1 mr-4">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by name or guardian..."
              className="w-full p-2 border rounded"
            />
          </div>
        
        </div>
      </div>
      
  {/* Student List */}
     
  <div className="bg-white rounded shadow overflow-hidden">
   <table className="min-w-full">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-3 text-left"></th> {/* Expand column */}
        <th className="p-3 text-left">Name</th>
        <th className="p-3 text-left">Age</th>
        <th className="p-3 text-left">Gender</th>
        <th className="p-3 text-left">Institution</th>
        <th className="p-3 text-left">Guardian</th>
        <th className="p-3 text-left">Contact</th>
        <th className="p-3 text-left">Financial Rank</th>
        <th className="p-3 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {students.map(student => {
        const formattedDob = formatDate(student.dob);
        const age = calculateAge(student.dob);
        
        return (
          <React.Fragment key={student.studentId}>
            {/* Main Row */}
            <tr className="border-t hover:bg-gray-50">
<td className="p-3">
  <button
    onClick={() => {
      const wasExpanded = expandedRowKeys.includes(student.studentId);
      handleExpand(student.studentId);
      
      setTimeout(() => {
  const rowElement = document.getElementById(`student-row-${student.studentId}`);
  if (rowElement) {
    rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}, wasExpanded ? 0 : 500);
    }}
    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
      expandedRowKeys.includes(student.studentId)
        ? 'border-blue-500 text-blue-500'
        : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-400'
    }`}
  >
    <span className="text-md font-bold">
      {expandedRowKeys.includes(student.studentId) ? '−' : '+'}
    </span>
  </button>
</td>
              <td className="p-3">{student.studentName}</td>
              <td className="p-3">
                <div>{formattedDob}</div>
                <div className="text-sm text-gray-500">Age: {age}</div>
              </td>
              <td className="p-3">{student.gender}</td>
              <td className="p-3">{student.institutionName || 'Not specified'}</td>
              <td className="p-3">{student.guardianName}</td>
              <td className="p-3">{student.contactNumber}</td>
              <td className="p-3">{student.financial_rank}</td>
               <td className="p-3 space-x-2">
            <button 
              onClick={() => fetchStudentDetails(student.studentId)}
              className="p-2 text-blue-500 hover:text-blue-700"
              title="View Details"
            >
              {/* Eye icon for View */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(student);
              }}
              className="p-2 text-green-500 hover:text-green-700"
              title="Edit Student"
            >
              {/* Edit icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(student.studentId);
              }}
              className={`p-2 ${deletingId === student.studentId ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
              title="Delete Student"
              disabled={deletingId === student.studentId}
            >
              {deletingId === student.studentId ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </td>
            </tr>

            {/* Expanded Row */}
            {expandedRowKeys.includes(student.studentId) && (
              <tr>
                <td colSpan={9} className="p-0">
                  <ExpandedStudentRow student={student} />
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>
  
  {/* Loading and empty states */}
  {isLoading && (
    <div className="p-4 text-center">Loading...</div>
  )}
  
  {!isLoading && students.length === 0 && (
    <div className="p-4 text-center text-gray-500">No students found</div>
  )}
</div>
      
      {/* Pagination */}
      {!filters.institutionsId && !filters.search && (
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
 {/* Add this debug component here
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 mb-4 bg-gray-100 rounded-lg mt-6">
          <h3 className="font-bold mb-2">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Current Filters:</h4>
              <pre className="text-xs">{JSON.stringify(filters, null, 2)}</pre>
            </div>
            <div>
              <h4 className="font-semibold">Institutions:</h4>
              <pre className="text-xs">{JSON.stringify(institutions.slice(0, 3), null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
 */}


      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Student' : 'Add New Student'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Full Name*</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Date of Birth*</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Gender*</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">Contact Number*</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1">Address*</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Guardian Name*</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Financial Rank*</label>
                <select
                  name="financial_rank"
                  value={formData.financial_rank}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Rank</option>
                  <option value="Poor">Poor</option>
                  <option value="Orphan">Orphan</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Monthly Support Needed</label>
                <input
                  type="number"
                  name="requiredMonthlySupport"
                  value={formData.requiredMonthlySupport}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sponsored"
                  checked={formData.sponsored}
                  onChange={(e) => setFormData(prev => ({ ...prev, sponsored: e.target.checked }))}
                  className="mr-2"
                />
                <label>Sponsored</label>
              </div>
            </div>
            
           <div>
            <label className="block mb-1">Institution*</label>
            {allInstitutions.length === 0 ? (
                <div className="text-red-500">
                {loadingInstitutions ? 'Loading...' : 'No institutions available'}
                </div>
            ) : (
              <select
                  name="institutionsId"
                  value={formData.institutionsId || ''}
                  onChange={handleInstituitionChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Institution</option>
                  {allInstitutions.map(inst => (
                    <option key={inst.institutionsId} value={Number(inst.institutionsId)}>
                      {inst.institutionName}
                    </option>
                  ))}
                </select>
            )}
            </div>
            
            <div>
              <label className="block mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border rounded"
                maxLength="1000"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      
      {/* View Student Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">
            Student Details
          </h2>
          
          {currentStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Name:</label>
                  <p>{currentStudent.studentName}</p>
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Date of Birth*</label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={(e) => {
                        setFormData({...formData, dob: e.target.value});
                        // Optional: Show age preview
                        if (e.target.value) {
                            const age = calculateAge(e.target.value);
                            setAgePreview(age);
                        }
                        }}
                        className="w-full p-2 border rounded"
                        required
                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                    {formData.dob && (
                        <div className="text-sm text-gray-500 mt-1">
                        Age will be: {calculateAge(formData.dob)} years
                        </div>
                    )}
                    </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Gender:</label>
                  <p>{currentStudent.gender}</p>
                </div>
                <div>
                  <label className="font-semibold">Contact:</label>
                  <p>{currentStudent.contactNumber}</p>
                </div>
              </div>
              
              <div>
                <label className="font-semibold">Address:</label>
                <p>{currentStudent.address}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Guardian:</label>
                  <p>{currentStudent.guardianName}</p>
                </div>
                <div>
                  <label className="font-semibold">Financial Rank:</label>
                  <p>{currentStudent.financial_rank}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Monthly Support:</label>
                  <p>${currentStudent.requiredMonthlySupport}</p>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <p className={`inline-block px-2 py-1 rounded-full text-xs ${
                    currentStudent.sponsored ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentStudent.sponsored ? 'Sponsored' : 'Not Sponsored'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="font-semibold">Institution:</label>
                <p>{currentStudent.institutionName}</p>
              </div>
              
              <div>
                <label className="font-semibold">Bio:</label>
                <p className="whitespace-pre-line">{currentStudent.bio}</p>
              </div>
              
              {/* Add result section here if needed */}
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
    </AdminDashboard>
  );
};

export default StudentManager;