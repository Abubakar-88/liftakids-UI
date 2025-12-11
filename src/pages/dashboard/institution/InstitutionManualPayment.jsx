import React, { useState, useEffect } from 'react';
import { searchAllDonors, searchStudents, uploadReceiptFile, processManualPayment   } from '../../../api/institutionApi';
import SearchableDropdown from '../../../components/institutions/SearchableDropdown';
import { getStudentsByInstitution } from '../../../api/studentApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const InstitutionManualPayment = ({ preSelectedData = null, onSuccess = null }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [donors, setDonors] = useState(() => {
  if (preSelectedData && typeof preSelectedData === 'object') {
    const donorId = preSelectedData.donorId || preSelectedData.id;
    const donorName = preSelectedData.donorName;
    
    if (donorId && donorName) {
      return [{
        donorId: donorId,
        name: donorName
      }];
    }
  }
  return [];
});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerFor, setPickerFor] = useState('from');
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [selectedStudentSponsors, setSelectedStudentSponsors] = useState([]);
  const [paidMonths, setPaidMonths] = useState([]);
 
 const [formData, setFormData] = useState(() => {
  // Safe initialization with proper checks
  const initialData = {
    studentId: '',
    donorId: '',
    startDate: '',
    endDate: '',
    receivedDate: new Date().toISOString().split('T')[0],
    monthlyAmount: '',
    totalAmount: '',
    receiptNumber: '',
    receiptFile: null,
    notes: ''
  };

  // Only set if preSelectedData exists and has values
  if (preSelectedData && typeof preSelectedData === 'object') {
    const donorId = preSelectedData.donorId || preSelectedData.id;
    
    return {
      ...initialData,
      studentId: preSelectedData.studentId ? preSelectedData.studentId.toString() : '',
      donorId: donorId ? donorId.toString() : '',
      monthlyAmount: preSelectedData.monthlyAmount ? preSelectedData.monthlyAmount.toString() : '',
      startDate: preSelectedData.startDate ? preSelectedData.startDate.toString() : '',  
      endDate: preSelectedData.endDate ? preSelectedData.endDate.toString() : ''
    };
  }

  return initialData;
});

  const [selectedMonths, setSelectedMonths] = useState({
    from: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    to: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
  });

  const [calculatedMonths, setCalculatedMonths] = useState(0);
  const [institutionData, setInstitutionData] = useState(null);
  const [fileName, setFileName] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const data = localStorage.getItem('institutionData');
    if (data) {
      const institution = JSON.parse(data);
      setInstitutionData(institution);
      fetchStudents(institution.institutionsId);
    }
  }, []);

  // Pre-selected data from pending payments
// InstitutionManualPayment.jsx - useEffect-এ এই code টি replace করুন
useEffect(() => {
  if (preSelectedData) {
    console.log('Pre-selected data received in manual form:', preSelectedData);
    
    // Auto-fill student data
    if (preSelectedData.studentId) {
      setFormData(prev => ({
        ...prev,
        studentId: preSelectedData.studentId.toString()
      }));
    }
    
    // Auto-fill donor data - COMPREHENSIVE FIX
    if (preSelectedData.donorId && preSelectedData.donorName) {
      const preSelectedDonor = {
        donorId: preSelectedData.donorId,
        name: preSelectedData.donorName,
      };
      
      setDonors(prev => {
        const exists = prev.some(d => d.donorId == preSelectedData.donorId);
        if (!exists) {
          return [preSelectedDonor, ...prev];
        }
        return prev;
      });
      
      setFormData(prev => ({
        ...prev,
        donorId: preSelectedData.donorId.toString()
      }));
    }
    
    //  Auto-fill monthly amount
    if (preSelectedData.monthlyAmount) {
      setFormData(prev => ({
        ...prev,
        monthlyAmount: preSelectedData.monthlyAmount.toString()
      }));
    }
    
    // AUTO-FILL DATE RANGE FROM SPONSORSHIP
    if (preSelectedData.startDate) {
      const startDate = new Date(preSelectedData.startDate);
      const startMonth = startDate.getMonth() + 1;
      const startYear = startDate.getFullYear();
      
      // Calculate end date (default to current month or sponsorship end date)
      let endMonth, endYear;
      
      if (preSelectedData.endDate) {
        const endDate = new Date(preSelectedData.endDate);
        endMonth = endDate.getMonth() + 1;
        endYear = endDate.getFullYear();
      } else {
        // If no end date, default to current month
        const currentDate = new Date();
        endMonth = currentDate.getMonth() + 1;
        endYear = currentDate.getFullYear();
      }
      
      // Set selected months
      setSelectedMonths({
        from: { month: startMonth, year: startYear },
        to: { month: endMonth, year: endYear }
      });
      
      console.log('Auto-filled date range:', {
        from: { month: startMonth, year: startYear },
        to: { month: endMonth, year: endYear }
      });
    }
  }
}, [preSelectedData]);

  const fetchStudents = async (institutionId) => {
    try {
      const studentsData = await getStudentsByInstitution(institutionId);
      const studentsArray = Array.isArray(studentsData) ? studentsData : [];
      setStudents(studentsArray);
      setAllStudents(studentsArray);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setAllStudents([]);
    }
  };

  // Student select and sponsorship auto-select logic
  useEffect(() => {
    if (formData.studentId) {
      const selectedStudent = allStudents.find(s => s.studentId == formData.studentId);
      if (selectedStudent) {
        const sponsors = selectedStudent.sponsors || [];
        setSelectedStudentSponsors(sponsors);
        
        // Auto-select logic - for sponsored students
        if (sponsors.length > 0) {
          const firstSponsor = sponsors[0];
          setFormData(prev => ({
            ...prev,
            sponsorshipId: firstSponsor.id || firstSponsor.sponsorshipId
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            sponsorshipId: null
          }));
        }
        
        // Paid months calculation
        const paidMonthsSet = new Set();
          sponsors.forEach(sponsor => {
        if (sponsor.paidUpTo) {
          try {
            const paidUpTo = new Date(sponsor.paidUpTo);
            if (!isNaN(paidUpTo.getTime())) {
              // Mark all months up to paidUpTo as paid
              let current = new Date(paidUpTo.getFullYear(), 0, 1); // Start from Jan
              const end = new Date(paidUpTo.getFullYear(), paidUpTo.getMonth(), 1);
              
              while (current <= end) {
                const year = current.getFullYear();
                const month = current.getMonth() + 1;
                const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
                paidMonthsSet.add(monthKey);
                current.setMonth(current.getMonth() + 1);
              }
            }
          } catch (e) {
            console.error('Error processing paidUpTo date:', e);
          }
        }
      });
        setPaidMonths(Array.from(paidMonthsSet));
      }
    } else {
      setSelectedStudentSponsors([]);
      setPaidMonths([]);
      setFormData(prev => ({ ...prev, sponsorshipId: null }));
    }
  }, [formData.studentId, allStudents]);

  // Check if a month is already paid
  const isMonthPaid = (month, year) => {
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    return paidMonths.includes(monthKey);
  };

  const handleStudentSearch = (searchTerm) => {
    if (searchTerm.length > 0) {
      const filteredStudents = allStudents.filter(student => 
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.guardianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.contactNumber?.includes(searchTerm) ||
        student.className?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setStudents(filteredStudents);
    } else {
      setStudents(allStudents);
    }
  };

  const handleDonorSearch = async (searchTerm) => {
    if (searchTerm.length > 1) {
      try {
        const donorsData = await searchAllDonors(searchTerm);
        setDonors(Array.isArray(donorsData) ? donorsData : []);
      } catch (error) {
        console.error('Error searching donors:', error);
        setDonors([]);
      }
    }
  };

  const validateMonthRange = (from, to) => {
    const fromDate = new Date(from.year, from.month - 1);
    const toDate = new Date(to.year, to.month - 1);
    
    if (fromDate > toDate) {
      setDateError('End month must be after start month');
      return false;
    } else {
      setDateError('');
      return true;
    }
  };

  useEffect(() => {
    const fromDate = new Date(selectedMonths.from.year, selectedMonths.from.month - 1);
    const toDate = new Date(selectedMonths.to.year, selectedMonths.to.month - 1);
    
    if (validateMonthRange(selectedMonths.from, selectedMonths.to)) {
      const months = (selectedMonths.to.year - selectedMonths.from.year) * 12 + 
                    (selectedMonths.to.month - selectedMonths.from.month) + 1;
      setCalculatedMonths(months);
      
      const startDateStr = `${selectedMonths.from.year}-${String(selectedMonths.from.month).padStart(2, '0')}-01`;
      const endDateStr = `${selectedMonths.to.year}-${String(selectedMonths.to.month).padStart(2, '0')}-01`;
      
      setFormData(prev => ({ 
        ...prev, 
        startDate: startDateStr,
        endDate: endDateStr
      }));
      
      if (formData.monthlyAmount) {
        const total = parseFloat(formData.monthlyAmount) * months;
        setFormData(prev => ({ ...prev, totalAmount: total.toFixed(2) }));
      }
    } else {
      setCalculatedMonths(0);
      setFormData(prev => ({ ...prev, totalAmount: '' }));
    }
  }, [selectedMonths, formData.monthlyAmount]);

  useEffect(() => {
    if (formData.studentId) {
      const selectedStudent = allStudents.find(s => s.studentId == formData.studentId);
      if (selectedStudent && selectedStudent.requiredMonthlySupport) {
        setFormData(prev => ({ 
          ...prev, 
          monthlyAmount: selectedStudent.requiredMonthlySupport 
        }));
      }
    }
  }, [formData.studentId, allStudents]);

  // month selection validation
const handleMonthSelect = (month, year) => {
  // Don't allow selection of paid months
  if (isMonthPaid(month, year)) {
    alert(`This month (${monthNames[month-1]} ${year}) is already paid. Please select a different month.`);
    return;
  }

  if (pickerFor === 'from') {
    const newFromDate = new Date(year, month - 1);
    const currentToDate = new Date(selectedMonths.to.year, selectedMonths.to.month - 1);
    
    if (newFromDate > currentToDate) {
      // Auto-adjust to month if from > to
      setSelectedMonths({ 
        from: { month, year }, 
        to: { month, year } 
      });
    } else {
      setSelectedMonths({ 
        ...selectedMonths, 
        from: { month, year } 
      });
    }
  } else {
    const newToDate = new Date(year, month - 1);
    const currentFromDate = new Date(selectedMonths.from.year, selectedMonths.from.month - 1);
    
    if (newToDate < currentFromDate) {
      // Auto-adjust from month if to < from
      setSelectedMonths({ 
        from: { month, year }, 
        to: { month, year } 
      });
    } else {
      setSelectedMonths({ 
        ...selectedMonths, 
        to: { month, year } 
      });
    }
  }
  
  setDateError('');
  setShowMonthPicker(false);
};

  const openMonthPicker = (forField) => {
    setPickerFor(forField);
    setShowMonthPicker(true);
  };

  const formatMonthDisplay = (monthData) => {
    return `${monthNames[monthData.month - 1]} ${monthData.year}`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only JPG, PNG, or PDF files');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, receiptFile: file }));
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, receiptFile: null }));
    setFileName('');
  };

  const uploadReceiptToServer = async (file) => {
    try {
      console.log('Uploading file:', file.name);
      const result = await uploadReceiptFile(file);
      console.log('Upload successful:', result);
      return result.fileUrl;
    } catch (error) {
      console.error('Receipt upload error:', error);
      throw new Error('Failed to upload receipt: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate month range before submission
  if (!validateMonthRange(selectedMonths.from, selectedMonths.to)) {
    toast.error('Please fix the date range before submitting');
    return;
  }
  
  // Validate received date
  if (!formData.receivedDate) {
    toast.error('Please select received date');
    return;
  }
  
  // Check if selected months include any paid months
  const fromDate = new Date(selectedMonths.from.year, selectedMonths.from.month - 1);
  const toDate = new Date(selectedMonths.to.year, selectedMonths.to.month - 1);
  let hasPaidMonths = false;
  
  let current = new Date(fromDate);
  while (current <= toDate) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    if (isMonthPaid(month, year)) {
      hasPaidMonths = true;
      break;
    }
    current.setMonth(current.getMonth() + 1);
  }
  
  if (hasPaidMonths) {
    toast.warning('Selected period includes months that are already paid. Please select different months.');
    return;
  }
  
  if (!formData.studentId || !formData.donorId || !formData.startDate || 
      !formData.endDate || !formData.totalAmount || !formData.receiptNumber || !formData.receiptFile) {
    toast.error('Please fill all required fields including receipt file upload');
    return;
  }

  try {
    setLoading(true);
    setUploading(true);

    // Show uploading toast
    toast.info('Uploading receipt file...');

    // First upload the receipt file
    let receiptUrl = '';
    try {
      receiptUrl = await uploadReceiptToServer(formData.receiptFile);
      toast.success('Receipt uploaded successfully!');
    } catch (uploadError) {
      console.error('Receipt upload failed:', uploadError);
      toast.error('Receipt upload failed. Please try again.');
      return;
    } finally {
      setUploading(false);
    }

    const paymentData = {
      studentId: parseInt(formData.studentId),
      donorId: parseInt(formData.donorId),
      startDate: formData.startDate,
      endDate: formData.endDate,
      receivedDate: formData.receivedDate, 
      monthlyAmount: parseFloat(formData.monthlyAmount),
      receivedAmount: parseFloat(formData.totalAmount),
      amount: parseFloat(formData.totalAmount),
      paymentMethod: 'MANUAL',
      receiptNumber: formData.receiptNumber,
      receiptUrl: receiptUrl,
      notes: formData.notes
    };

    // Show processing toast
    toast.info('Processing payment...');

    // Use the API function from separate file
    const result = await processManualPayment(paymentData);
    
    toast.success('Payment processed successfully! Sponsorship has been activated.');
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess(result);
    }
    
    resetForm();
    
  } catch (error) {
    console.error('Error processing manual payment:', error);
    
    // Show detailed error message
    if (error.response?.data?.message) {
      toast.error(`Payment failed: ${error.response.data.message}`);
    } else {
      toast.error('Failed to process payment. Please try again.');
    }
  } finally {
    setLoading(false);
    setUploading(false);
  }
};

  const resetForm = () => {
    setFormData({
      studentId: '',
      donorId: '',
      startDate: '',
      endDate: '',
      receivedDate: new Date().toISOString().split('T')[0], 
      monthlyAmount: '',
      totalAmount: '',
      receiptNumber: '',
      receiptFile: null,
      notes: ''
    });
    setSelectedMonths({
      from: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      to: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
    });
    setCalculatedMonths(0);
    setFileName('');
    setDateError('');
    setSelectedStudentSponsors([]);
    setPaidMonths([]);
    setStudents(allStudents);
  };

  const formatStudentDisplay = (student) => {
    const isSponsored = student.sponsored;
    const sponsorCount = student.sponsors?.length || 0;
    
    return {
      ...student,
      name: `${student.studentName} - Class ${student.className || 'N/A'}${student.requiredMonthlySupport ? ` (৳${student.requiredMonthlySupport}/month)` : ''} ${isSponsored ? ` [${sponsorCount} sponsor(s)]` : ' [Not Sponsored]'}`
    };
  };

  const formattedStudents = students.map(formatStudentDisplay);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4 flex items-center justify-between">
   
          <span className="text-gray-600 text-justify">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 text-justify">
            Manual Payment Entry
          </h1>
            Process sponsorship payments received directly from donors
          </span>
          
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
     
           
    
          {/*  Pre-selected Data Info */}
          {preSelectedData && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <strong>Pre-filled from pending payment:</strong> Student and donor information has been auto-filled. Please complete the remaining fields.
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Student Selection */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student *
              </label>
              <SearchableDropdown
                options={formattedStudents}
                value={formData.studentId ? formattedStudents.find(s => s.studentId == formData.studentId) : null}
                onSelect={(student) => setFormData({...formData, studentId: student.studentId})}
                placeholder="Search student by name, guardian, or phone..."
                onSearch={handleStudentSearch}
                loading={studentSearchLoading}
                className="w-full"
              />
              {formData.studentId && (
                <div className="mt-2">
                  <span className="text-xs text-green-600 font-medium">
                    Selected: {formattedStudents.find(s => s.studentId == formData.studentId)?.studentName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, studentId: ''})}
                    className="ml-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Sponsorship History */}
            {selectedStudentSponsors.length > 0 && (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Sponsorship History
                </label>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {selectedStudentSponsors.map((sponsor, index) => (
                      <div key={index} className="border-b border-yellow-100 pb-2 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-sm">{sponsor.donorName}</span>
                            <span className="text-xs text-gray-600 ml-2">(৳{sponsor.monthlyAmount}/month)</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            sponsor.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sponsor.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Period: {sponsor.startDate} to {sponsor.endDate}
                        </div>
                        <div className="text-xs text-gray-600">
                          Paid up to: {sponsor.paidUpTo} • Months Paid: {sponsor.monthsPaid}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Donor Selection */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donor *
              </label>
              
              {/* Debugging Info - Temporary */}
              {preSelectedData?.donorId && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <span className="text-blue-700">
                    Pre-selected Donor: {preSelectedData.donorName} (ID: {preSelectedData.donorId})
                  </span>
                </div>
              )}
              
              <SearchableDropdown
                options={donors}
                value={formData.donorId ? donors.find(d => d.donorId == formData.donorId) : null}
                onSelect={(donor) => {
                  console.log('Donor selected:', donor);
                  setFormData({...formData, donorId: donor.donorId})
                }}
                placeholder="Search donor by name..."
                onSearch={handleDonorSearch}
                className="w-full"
              />
              
              {formData.donorId && (
                <div className="mt-2">
                  <span className="text-xs text-green-600 font-medium">
                    Selected: {
                      donors.find(d => d.donorId == formData.donorId)?.name || 
                      preSelectedData?.donorName || 
                      'Donor ID: ' + formData.donorId
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, donorId: ''})}
                    className="ml-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Sponsorship Information Message */}
            {formData.studentId && formData.donorId && (
              <div className="lg:col-span-2">
                {selectedStudentSponsors.some(s => s.donorId == formData.donorId) ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-700">
                        <strong>Existing Sponsorship Found:</strong> Payment will be added to existing sponsorship.
                        {selectedStudentSponsors.find(s => s.donorId == formData.donorId)?.paidUpTo && 
                          ` Currently paid up to: ${selectedStudentSponsors.find(s => s.donorId == formData.donorId)?.paidUpTo}`
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-green-700">
                        <strong>New Sponsorship:</strong> A new sponsorship will be created automatically.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Received Date Field - NEW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received Date *
              </label>
              <input
                type="date"
                value={formData.receivedDate}
                onChange={(e) => setFormData({...formData, receivedDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Monthly Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Amount *
              </label>
              <input
                type="number"
                value={formData.monthlyAmount}
                onChange={(e) => setFormData({...formData, monthlyAmount: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Monthly sponsorship amount"
                required
              />
            </div>

      
            {/* Month Selection - IMPROVED */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sponsorship Period *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">From Month:</label>
                  <div
                    className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer bg-white flex items-center justify-between hover:bg-gray-50"
                    onClick={() => openMonthPicker('from')}
                  >
                    <span className={
                      isMonthPaid(selectedMonths.from.month, selectedMonths.from.year) 
                        ? 'text-red-500 font-medium' 
                        : 'text-gray-800'
                    }>
                      {formatMonthDisplay(selectedMonths.from)}
                      {isMonthPaid(selectedMonths.from.month, selectedMonths.from.year) && ' (Paid)'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">To Month:</label>
                  <div
                    className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer bg-white flex items-center justify-between hover:bg-gray-50"
                    onClick={() => openMonthPicker('to')}
                  >
                    <span className={
                      isMonthPaid(selectedMonths.to.month, selectedMonths.to.year) 
                        ? 'text-red-500 font-medium' 
                        : 'text-gray-800'
                    }>
                      {formatMonthDisplay(selectedMonths.to)}
                      {isMonthPaid(selectedMonths.to.month, selectedMonths.to.year) && ' (Paid)'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Selected Period Summary */}
              {calculatedMonths > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Selected Period:</strong> {formatMonthDisplay(selectedMonths.from)} to {formatMonthDisplay(selectedMonths.to)} 
                    ({calculatedMonths} month{calculatedMonths > 1 ? 's' : ''})
                  </div>
                </div>
              )}
              
              {dateError && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {dateError}
                </div>
              )}

              {/* Paid Months Warning */}
              {paidMonths.length > 0 && (
                <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                  <strong>Note:</strong> {paidMonths.length} months are already paid for this student. Paid months are disabled in the month picker.
                </div>
              )}
            </div>

            {/* Calculated Fields */}
            <div className="grid grid-cols-2 gap-4 lg:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Months</div>
                <div className="text-lg font-semibold text-gray-800">
                  {calculatedMonths} months
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-lg font-semibold text-green-600">
                  ৳{formData.totalAmount || '0'}
                </div>
              </div>
            </div>

            {/* Receipt Information */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number *
              </label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({...formData, receiptNumber: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter receipt number"
                required
              />
            </div>

            {/* File Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt * (JPG, PNG, PDF - Max 5MB)
              </label>
              
              {!fileName ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG, PDF (MAX. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">{fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes about this payment..."
                rows="4"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={loading || uploading || !formData.receiptFile || dateError}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Uploading Receipt...' : loading ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>

        {/* Month Picker Modal */}
        {showMonthPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    const currentYear = pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year;
                    const newYear = currentYear - 1;
                    if (pickerFor === 'from') {
                      setSelectedMonths({ ...selectedMonths, from: { ...selectedMonths.from, year: newYear } });
                    } else {
                      setSelectedMonths({ ...selectedMonths, to: { ...selectedMonths.to, year: newYear } });
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  &lt;&lt;
                </button>
                <span className="font-bold text-lg">
                  {pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year}
                </span>
                <button
                  onClick={() => {
                    const currentYear = pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year;
                    const newYear = currentYear + 1;
                    if (pickerFor === 'from') {
                      setSelectedMonths({ ...selectedMonths, from: { ...selectedMonths.from, year: newYear } });
                    } else {
                      setSelectedMonths({ ...selectedMonths, to: { ...selectedMonths.to, year: newYear } });
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  &gt;&gt;
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {monthNames.map((month, index) => {
                  const monthNumber = index + 1;
                  const currentYear = pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year;
                  const isSelected = pickerFor === 'from' 
                    ? selectedMonths.from.month === monthNumber && selectedMonths.from.year === currentYear
                    : selectedMonths.to.month === monthNumber && selectedMonths.to.year === currentYear;

                  const isPaid = isMonthPaid(monthNumber, currentYear);

                  return (
                    <button
                      key={month}
                      onClick={() => !isPaid && handleMonthSelect(monthNumber, currentYear)}
                      disabled={isPaid}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isPaid
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={isPaid ? `Already paid for ${month} ${currentYear}` : ''}
                    >
                      {month.substring(0, 3)}
                      {isPaid && (
                        <span className="block text-xs mt-1">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-gray-600 text-center">
                ✓ indicates already paid months
              </div>

              <button
                onClick={() => setShowMonthPicker(false)}
                className="w-full mt-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionManualPayment;