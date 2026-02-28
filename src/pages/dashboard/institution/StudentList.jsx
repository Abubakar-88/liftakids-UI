import { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaPrint, FaTimes, FaUserGraduate, FaUser, FaSave, FaFileAlt, FaSearch } from 'react-icons/fa';

import { fetchStudentLists, fetchStudentResults, deleteStudent, updateStudent } from '../../../api/studentApi';
import { useNavigate } from 'react-router-dom';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [results, setResults] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

 const [editForm, setEditForm] = useState({
  studentName: '',
  contactNumber: '',
  dob: '',
  bio: '',
  financial_rank: '',
  requiredMonthlySupport: '',
  address: '',
  guardianName: '',
  image: null 
});
const [previewImage, setPreviewImage] = useState(null);
const [currentImage, setCurrentImage] = useState(null);
    const [institutionName, setInstitutionName] = useState('');

// useEffect এর মধ্যে institution data fetch করুন
useEffect(() => {
  const loadInstitutionData = () => {
    try {
      const institutionData = localStorage.getItem('institutionData');
      if (institutionData) {
        const parsedData = JSON.parse(institutionData);
        setInstitutionName(parsedData.institutionName || parsedData.name || 'Your Institution');
      }
    } catch (error) {
      console.error('Error loading institution data:', error);
    }
  };

  loadInstitutionData();
}, []);
 // Load students with pagination
useEffect(() => {
  const loadStudents = async () => {
    try {
      setLoading(true);

      // Correct way to get institutionId from localStorage
      const institutionData = localStorage.getItem('institutionData');
      
      if (!institutionData) {
        console.warn('No institution data found in localStorage. Please login again.');
        setLoading(false);
        // Optionally redirect to login page
        navigate('/login/institution');
        return;
      }

      const parsedInstitutionData = JSON.parse(institutionData);
      const institutionId = parsedInstitutionData.institutionsId || parsedInstitutionData.id;

      if (!institutionId) {
        console.warn('No institutionId found in institution data');
        setLoading(false);
        return;
      }

      // API call with the correct institutionId - FIXED HERE
      const response = await fetchStudentLists(institutionId, pagination.page, pagination.size);

      if (response && response.content) {
        setStudents(response.content);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  loadStudents();
}, [pagination.page, pagination.size, navigate]);
const handleSearch = async () => {
  try {
    setLoading(true);
    const institutionData = localStorage.getItem('institutionData');
    const parsedInstitutionData = JSON.parse(institutionData);
    const institutionId = parsedInstitutionData.institutionsId || parsedInstitutionData.id;
    
    // Pass institutionId to the search function
    const response = await fetchStudentLists(institutionId, pagination.page, pagination.size, searchTerm);
    
    if (response && response.content) {
      setStudents(response.content);
      setPagination(prev => ({
        ...prev,
        page: 0,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      }));
    }
  } catch (error) {
    console.error('Error searching students:', error);
  } finally {
    setLoading(false);
  }
};


  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  
  // Get student thumbnail - WITH ERROR HANDLING
const getStudentThumbnail = (student) => {
  if (student.photoUrl) {
    return (
      <div className="relative">
        <img 
          src={student.photoUrl} 
          alt={student.studentName}
          className="w-20 h-20 rounded-full object-cover border border-gray-200"
          onError={(e) => {
            // If image fails to load, show fallback
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback avatar - hidden by default */}
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gray-400 hidden`}
        >
          {(student.studentName?.charAt(0) || 'S').toUpperCase()}
        </div>
      </div>
    );
  }
  
  // No photoUrl - show colored avatar
  const name = student.studentName || "S";
  const initials = name.charAt(0).toUpperCase();
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 
    'bg-purple-500', 'bg-orange-500', 'bg-teal-500'
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${color}`}>
      {initials}
    </div>
  );
};
  // const getStudentThumbnail = (student) => {
  //   if (student.photoUrl) {
  //     return student.photoUrl;
  //   }
    
  //   const name = student.studentName || "S";
  //   const initials = name.charAt(0).toUpperCase();
  //   const colors = [
  //     'bg-blue-500', 'bg-green-500', 'bg-red-500', 
  //     'bg-purple-500', 'bg-orange-500', 'bg-teal-500'
  //   ];
  //   const color = colors[initials.charCodeAt(0) % colors.length];
    
  //   return (
  //     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${color}`}>
  //       {initials}
  //     </div>
  //   );
  // };

  // Handle view results
  const handleViewResults = async (student) => {
    setSelectedStudent(student);
    try {
      const resultData = await fetchStudentResults(student.studentId);
      setResults(resultData);
      setShowResultModal(true);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };
// Grade calculation functions
const calculateGrade = (averageMarks) => {
  if (averageMarks >= 80) return 'A+';
  if (averageMarks >= 70) return 'A';
  if (averageMarks >= 60) return 'A-';
  if (averageMarks >= 50) return 'B';
  if (averageMarks >= 40) return 'C';
  return 'F';
};

const calculateSubjectGrade = (marks) => {
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  if (marks >= 40) return 'E';
  return 'F';
};

const calculateRemarks = (averageMarks) => {
  if (averageMarks >= 80) return 'Excellent';
  if (averageMarks >= 70) return 'Very Good';
  if (averageMarks >= 60) return 'Good';
  if (averageMarks >= 50) return 'Average';
  if (averageMarks >= 40) return 'Pass';
  return 'Needs Improvement';
};
  // Handle view details
  // const handleViewDetails = (student) => {
  //   setSelectedStudent(student);
  //   setEditForm({
  //     studentName: student.studentName || '',
  //     contactNumber: student.contactNumber || '',
  //     dob: student.dob ? student.dob.split('T')[0] : '',
  //     bio: student.bio || '',
  //     financial_rank: student.financial_rank || student.financial_rank || 'POOR',
  //     requiredMonthlySupport: student.requiredMonthlySupport || 0,
  //     address: student.address || '',
  //     guardianName: student.guardianName || ''
  //   });
  //   setShowDetailsModal(true);
  // };

  const handleViewDetails = (student) => {
  setSelectedStudent(student);
  setEditForm({
    studentName: student.studentName || '',
    contactNumber: student.contactNumber || '',
    dob: student.dob ? student.dob.split('T')[0] : '',
    bio: student.bio || '',
    financial_rank: student.financial_rank || 'POOR',
    requiredMonthlySupport: student.requiredMonthlySupport || 0,
    address: student.address || '',
    guardianName: student.guardianName || '',
    image: null
  });
  setCurrentImage(student.photoUrl); // Set current image for display
  setPreviewImage(null); // Reset preview
  setShowDetailsModal(true);
};
const handlePrint = () => {
  const printContent = document.getElementById('printable-result');
  const originalContent = document.body.innerHTML;
  
  document.body.innerHTML = printContent.innerHTML;
  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload(); // Page refresh to restore original state
};
  // Handle edit
  // const handleEdit = (student) => {
  //   setEditingId(student.studentId);
  //   setEditForm({
  //     studentName: student.studentName,
  //     contactNumber: student.contactNumber,
  //     dob: student.dob.split('T')[0],
  //     bio: student.bio || ''
  //   });
  // };

  // Handle edit change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };


const handleSave = async (studentId) => {
  try {
    await updateStudent(studentId, editForm);
    
    // Refresh the student list with correct institution ID
    const institutionData = localStorage.getItem('institutionData');
    const parsedInstitutionData = JSON.parse(institutionData);
    const institutionId = parsedInstitutionData.institutionsId || parsedInstitutionData.id;
    
    const response = await fetchStudentLists(institutionId, pagination.page, pagination.size);
    if (response && response.content) {
      setStudents(response.content);
    }
    
    setEditingId(null);
  } catch (error) {
    console.error('Error updating student:', error);
  }
};

// haldle image change function
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setEditForm(prev => ({ ...prev, image: file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// Remove image selection
const handleRemoveImage = () => {
  setEditForm(prev => ({ ...prev, image: null }));
  setPreviewImage(null);
};

// haldle update details function
const handleUpdateDetails = async () => {
  if (!selectedStudent) return;
  
  setUpdating(true); // Start loading
  try {
    const formDataToSend = new FormData();
    
    // Create studentData object
    const studentData = {
      studentName: editForm.studentName,
      contactNumber: editForm.contactNumber,
      dob: editForm.dob,
      bio: editForm.bio,
      financial_rank: editForm.financial_rank,
      requiredMonthlySupport: Number(editForm.requiredMonthlySupport),
      address: editForm.address,
      guardianName: editForm.guardianName
    };

    // Append student data as JSON
    formDataToSend.append('studentData', new Blob([JSON.stringify(studentData)], {
      type: 'application/json'
    }));

    // Append image if selected
    if (editForm.image) {
      formDataToSend.append('image', editForm.image);
    }

    await updateStudent(selectedStudent.studentId, formDataToSend);
    
    // Refresh the student list
    const institutionData = localStorage.getItem('institutionData');
    const parsedInstitutionData = JSON.parse(institutionData);
    const institutionId = parsedInstitutionData.institutionsId || parsedInstitutionData.id;
    
    const response = await fetchStudentLists(institutionId, pagination.page, pagination.size);
    if (response && response.content) {
      setStudents(response.content);
    }
    
    setEditingId(null);
    setShowDetailsModal(false);
    setPreviewImage(null);
  } catch (error) {
    console.error('Error updating student details:', error);
  } finally {
    setUpdating(false); // Stop loading
  }
};

// Handle update details
// const handleUpdateDetails = async () => {
//   if (!selectedStudent) return;
  
//   try {
//     const updatedData = {
//       studentName: editForm.studentName,
//       contactNumber: editForm.contactNumber,
//       dob: editForm.dob,
//       bio: editForm.bio,
//       financial_rank: editForm.financial_rank,
//       requiredMonthlySupport: Number(editForm.requiredMonthlySupport),
//       address: editForm.address,
//       guardianName: editForm.guardianName
//     };

//     await updateStudent(selectedStudent.studentId, updatedData);
    
//     // Refresh the student list with correct institution ID
//     const institutionData = localStorage.getItem('institutionData');
//     const parsedInstitutionData = JSON.parse(institutionData);
//     const institutionId = parsedInstitutionData.institutionsId || parsedInstitutionData.id;
    
//     const response = await fetchStudentLists(institutionId, pagination.page, pagination.size);
//     if (response && response.content) {
//       setStudents(response.content);
//     }
    
//     setEditingId(null);
//     setShowDetailsModal(false);
//   } catch (error) {
//     console.error('Error updating student details:', error);
//   }
// };
  // Handle delete
  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(studentId);
        
        // Refresh the student list
        const response = await fetchStudentLists(pagination.page, pagination.size);
        if (response && response.content) {
          setStudents(response.content);
          setPagination(prev => ({
            ...prev,
            totalElements: response.totalElements
          }));
        }
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
  setEditingId(null);
  setPreviewImage(null);
  // Reset form to original values
  if (selectedStudent) {
    setEditForm({
      studentName: selectedStudent.studentName || '',
      contactNumber: selectedStudent.contactNumber || '',
      dob: selectedStudent.dob ? selectedStudent.dob.split('T')[0] : '',
      bio: selectedStudent.bio || '',
      financial_rank: selectedStudent.financial_rank || 'POOR',
      requiredMonthlySupport: selectedStudent.requiredMonthlySupport || 0,
      address: selectedStudent.address || '',
      guardianName: selectedStudent.guardianName || '',
      image: null
    });
  }
};
  // const handleCancelEdit = () => {
  //   setEditingId(null);
  // };
const handleCloseModal = () => {
  setShowDetailsModal(false);
  setEditingId(null);
  setPreviewImage(null);
  setUpdating(false); 
};
  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.guardianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.contactNumber?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const institutionData = localStorage.getItem('institutionData');
    const parsedInstitutionData = JSON.parse(institutionData);
  return (
   
    <div className="container mx-auto px-4 py-8">
    {/* Option 3: Gradient Background */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                        <FaUserGraduate className="mr-2" /> Institution Portal
                      </h1>
      <div className="flex items-center justify-between">
      
        <div>
          <h1 className="text-3xl font-bold text-gray-600 mb-2">Student Management</h1>
          <p className="text-gray-600">
            Manage and monitor all students of <span className="font-semibold text-blue-700">{parsedInstitutionData.institutionName}</span>
          </p>
        </div>
    
        {/* <div className="bg-white p-3 rounded-lg shadow-xs border border-gray-200">
          
          <div className="text-sm text-gray-500">Institution</div>
          <div className="font-semibold text-gray-800">{parsedInstitutionData.institutionName}</div>
        </div> */}
          <div className="mt-4 text-right flex items-center justify-between"> 
           <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 "
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            </div>
    </div>
      </div>
      

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search students by name, guardian or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID/Photo/Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guardian/Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Financial Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Need</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sponsorship Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map(student => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                {/* Student ID/Photo/Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStudentThumbnail(student)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">#{student.studentId}</div>
                      <div className="text-sm font-semibold text-gray-800">
                        {editingId === student.studentId ? (
                          <input
                            type="text"
                            name="studentName"
                            value={editForm.studentName}
                            onChange={handleEditChange}
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          student.studentName
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Gender */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.gender || 'N/A'}
                </td>

                {/* Guardian/Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.guardianName}</div>
                  <div className="text-sm text-gray-500">
                    {editingId === student.studentId ? (
                      <input
                        type="text"
                        name="contactNumber"
                        value={editForm.contactNumber}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      student.contactNumber
                    )}
                  </div>
                </td>

                {/* Address */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                  {student.address || 'N/A'}
                </td>

                {/* Institution */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.institutionName || 'N/A'}
                </td>

                {/* Financial Rank */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.financial_rank === 'URGENT' ? 'bg-red-100 text-red-800' :
                    student.financial_rank === 'POOR' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {student.financial_rank || 'N/A'}
                  </span>
                </td>

                {/* Monthly Requirement */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.requiredMonthlySupport ? 
                    `৳${student.requiredMonthlySupport.toLocaleString()}` : 'N/A'}
                </td>

                {/* Sponsorship Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.sponsored ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.sponsored ? 'Sponsored' : 'Not Sponsored'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === student.studentId ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleSave(student.studentId)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Save"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewResults(student)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Results"
                      >
                        <FaFileAlt />
                      </button>
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDelete(student.studentId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {pagination.totalElements} students
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    pagination.page === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
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

      {/* Mobile View */}
      <div className="md:hidden">
        {filteredStudents.map(student => (
          <div key={student.studentId} className="border-b border-gray-200 p-4 mb-4 bg-white rounded-lg shadow">
            <div className="flex items-start space-x-3">
              {getStudentThumbnail(student)}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 text-left">#{student.studentId} - {student.studentName}</h3>
                <p className="text-sm text-gray-500 text-justify">{student.guardianName}(Guardian)</p>
                <p className="text-sm text-gray-500 text-justify">{student.contactNumber}</p>
                <p className="text-sm text-gray-500 text-justify">
                  {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                </p>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-justify">Institution</p>
                    <p className='text-justify'>{student.institutionName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-justify">Monthly Need</p>
                    <p>{student.requiredMonthlySupport ? 
                      `৳${student.requiredMonthlySupport.toLocaleString()}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-justify">Financial Rank</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-justify ${
                      student.financial_rank === 'URGENT' ? 'bg-red-100 text-red-800 text-justify' :
                      student.financial_rank === 'POOR' ? 'bg-yellow-100 text-yellow-800 text-justify' :
                      'bg-gray-100 text-gray-800 text-justify'
                    }`}>
                      {student.financial_rank || 'N/A'}
                    </span>
                  </div>
                    <div>
                    <p className="text-gray-500 text-justify">Sponsorship</p>
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.sponsored ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.sponsored ? 'Sponsored' : 'Not Sponsored'}
                  </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleViewResults(student)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="View Results"
                >
                  <FaFileAlt />
                </button>
                <button
                  onClick={() => handleViewDetails(student)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="View Details"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => handleDelete(student.studentId)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Result Modal */}
{showResultModal && selectedStudent && results.length > 0 && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 bg-white z-10">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedStudent.studentName} - {results[0].studentClass}
          </h3>
          <p className="text-sm text-gray-500">
            Student ID: #{selectedStudent.studentId}
          </p>
          <p className="text-sm text-gray-500">
            Class Name: {results[0].studentClass}
          </p>
        </div>
        <button 
          onClick={() => setShowResultModal(false)}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
          <FaTimes />
        </button>
      </div>

      <div className="p-6">
        {/* Main Result Card */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Exam Information */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Exam Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Exam:</span>
                  <span className="font-medium">{results[0].examName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Term:</span>
                  <span className="font-medium">{results[0].term}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(results[0].examDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Performance Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{results[0].subjectMarks.length * 100}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Obtained:</span>
                  <span className="font-medium">
                    {results[0].subjectMarks.reduce((total, subject) => total + subject.obtainedMark, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Percentage:</span>
                  <span className="font-medium">
                    {((results[0].subjectMarks.reduce((total, subject) => total + subject.obtainedMark, 0) / 
                      (results[0].subjectMarks.length * 100)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Grade Information */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Grade Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Grade:</span>
                  <span className="font-medium text-green-600">
                    {calculateGrade(
                      results[0].subjectMarks.reduce((total, subject) => total + subject.obtainedMark, 0) / 
                      results[0].subjectMarks.length
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remarks:</span>
                  <span className="font-medium text-blue-600">
                    {calculateRemarks(
                      results[0].subjectMarks.reduce((total, subject) => total + subject.obtainedMark, 0) / 
                      results[0].subjectMarks.length
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
{/* Subjects Table - Mobile Responsive */}
<div className="bg-white rounded-lg shadow-sm overflow-hidden">
  {/* Desktop View */}
  <div className="hidden md:block">
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left p-3 font-semibold text-gray-700">SUBJECT</th>
          <th className="text-center p-3 font-semibold text-gray-700">FULL MARKS</th>
          <th className="text-center p-3 font-semibold text-gray-700">PASS MARKS</th>
          <th className="text-center p-3 font-semibold text-gray-700">OBTAINED</th>
          <th className="text-center p-3 font-semibold text-gray-700">GRADE</th>
        </tr>
      </thead>
      <tbody>
        {results[0].subjectMarks.map((subject, index) => (
          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="p-3 font-medium text-gray-800">{subject.subjectName}</td>
            <td className="p-3 text-center text-gray-600">100</td>
            <td className="p-3 text-center text-gray-600">40</td>
            <td className="p-3 text-center font-semibold text-gray-800">{subject.obtainedMark}</td>
            <td className="p-3 text-center font-semibold">
              <span className={`px-2 py-1 rounded-full text-xs ${
                subject.obtainedMark >= 80 ? 'bg-green-100 text-green-800' :
                subject.obtainedMark >= 60 ? 'bg-blue-100 text-blue-800' :
                subject.obtainedMark >= 40 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {calculateSubjectGrade(subject.obtainedMark)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Mobile View */}
  <div className="md:hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3 font-semibold text-gray-700 whitespace-nowrap">SUBJECT</th>
            <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">FULL MARKS</th>
            <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">PASS MARKS</th>
            <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">OBTAINED</th>
            <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">GRADE</th>
          </tr>
        </thead>
        <tbody>
          {results[0].subjectMarks.map((subject, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-3 font-medium text-gray-800 whitespace-nowrap">{subject.subjectName}</td>
              <td className="p-3 text-center text-gray-600 whitespace-nowrap">100</td>
              <td className="p-3 text-center text-gray-600 whitespace-nowrap">40</td>
              <td className="p-3 text-center font-semibold text-gray-800 whitespace-nowrap">{subject.obtainedMark}</td>
              <td className="p-3 text-center font-semibold whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  subject.obtainedMark >= 80 ? 'bg-green-100 text-green-800' :
                  subject.obtainedMark >= 60 ? 'bg-blue-100 text-blue-800' :
                  subject.obtainedMark >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {calculateSubjectGrade(subject.obtainedMark)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
          onClick={handlePrint} 
           className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
            <FaPrint className="text-sm" />
            <span>Print Results</span>
          </button>
          <button 
            onClick={() => setShowResultModal(false)}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            <FaTimes className="text-sm" />
            <span>Close</span>
          </button>
          <button className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
            <FaUser className="text-sm" />
            <span>View Full Profile</span>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">
                Student Details: {selectedStudent.studentName}
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="md:col-span-1">
              {/* Image Upload Section in Details Modal */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Student Image</h4>
                </div>
                
                <div className="flex items-center justify-center space-x-6">
                  {/* Current Image Display */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Current Image</p>
                    {currentImage ? (
                      <img 
                        src={currentImage} 
                        alt="Current" 
                        className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 mx-auto"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 mx-auto">
                        <FaUser className="text-gray-400 text-2xl" />
                      </div>
                    )}
                  </div>

                  {/* New Image Preview */}
                  {previewImage && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">New Image</p>
                      <div className="relative">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="h-24 w-24 rounded-full object-cover border-2 border-blue-200 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Input - Only show when editing */}
                  {editingId === selectedStudent?.studentId && (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Change Image</p>
                      <div className="relative">
                        <input
                          type="file"
                          id="image-upload-details"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label
                          htmlFor="image-upload-details"
                          className="inline-block px-3 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 text-sm"
                        >
                          {currentImage ? 'Change Image' : 'Upload Image'}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                {editingId === selectedStudent?.studentId && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {previewImage 
                      ? 'New image will replace current one' 
                      : currentImage 
                        ? 'Upload new image to replace current one'
                        : 'Upload student profile image'
                    }
                  </p>
                )}
              </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Student ID</p>
                    <p className="font-medium text-justify">#{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Date of Birth</p>
                    {editingId === selectedStudent.studentId ? (
                      <input
                        type="date"
                        name="dob"
                        value={editForm.dob}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <p className="font-medium text-justify">
                        {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A'}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Institution</p>
                    <p className="font-medium text-justify">{selectedStudent.institutionName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Contact</p>
                    {editingId === selectedStudent.studentId ? (
                      <input
                        type="text"
                        name="contactNumber"
                        value={editForm.contactNumber}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full text-justify"
                      />
                    ) : (
                      <p className="font-medium text-justify">{selectedStudent.contactNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Name</p>
                    {editingId === selectedStudent.studentId ? (
                      <input
                        type="text"
                        name="studentName"
                        value={editForm.studentName}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <p className="font-medium text-justify">{selectedStudent.studentName}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Gender</p>
                    <p className="font-medium text-justify">{selectedStudent.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Guardian</p>
                    {editingId === selectedStudent.studentId ? (
                      <input
                        type="text"
                        name="guardianName"
                        value={editForm.guardianName}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <p className="font-medium text-justify">{selectedStudent.guardianName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Financial Status</p>
                    {editingId === selectedStudent.studentId ? (
                      <select
                        name="financialRank"
                        value={editForm.financial_rank}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full"
                      >
                        <option value="URGENT">URGENT</option>
                        <option value="POOR">POOR</option>
                        <option value="STABLE">Orphan</option>
                      </select>
                    ) : (
                      <p className="font-medium text-justify">{selectedStudent.financial_rank || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 text-justify">Monthly Requirement</p>
                    {editingId === selectedStudent.studentId ? (
                      <input
                        type="number"
                        name="requiredMonthlySupport"
                        value={editForm.requiredMonthlySupport}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <p className="font-medium text-justify">
                        {selectedStudent.requiredMonthlySupport ? 
                          `৳${selectedStudent.requiredMonthlySupport.toLocaleString()}` : 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 text-justify">Address</p>
                    {editingId === selectedStudent.studentId ? (
                      <input
                        type="text"
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      <p className="font-medium text-justify">{selectedStudent.address || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Bio Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Biography</h4>
                    <button 
                      onClick={() => setEditingId(editingId ? null : selectedStudent.studentId)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      {editingId === selectedStudent.studentId ? (
                        <>
                          <FaTimes className="mr-1" /> Cancel
                        </>
                      ) : (
                        <>
                          <FaEdit className="mr-1" /> Edit Profile
                        </>
                      )}
                    </button>
                  </div>

                  {editingId === selectedStudent.studentId ? (
                    <div className="space-y-2">
                      <textarea
                        name="bio"
                        value={editForm.bio}
                        onChange={handleEditChange}
                        className="w-full border rounded p-2 text-sm h-32"
                        placeholder="Enter student biography..."
                      />
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedStudent.bio || 'No biography available'}
                    </p>
                  )}
                </div>
              </div>
            </div>

           <div className="border-t border-gray-200 p-4 flex justify-end sticky bottom-0 bg-white">
            {editingId === selectedStudent.studentId ? (
              <>
                <button
                  onClick={() => setEditingId(null)}
                  disabled={updating}
                  className={`px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2 ${
                    updating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDetails}
                  disabled={updating}
                  className={`px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center min-w-24 ${
                    updating 
                      ? 'opacity-50 cursor-not-allowed bg-blue-400' 
                      : 'hover:bg-blue-700'
                  }`}
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
                <button
                  onClick={() => setEditingId(selectedStudent.studentId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <button 
          onClick={() => navigate('/institution/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Institution Dashboard
        </button>
      </div>
    </div>
  );
};

export default StudentList;