import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingPaymentSponsorships, 
  getSponsorshipStats,
  getPaymentHistoryByStudent,
  getStudentsByInstitution, 
  confirmPayment, 
  searchStudents, 
  searchAllDonors,
  getCompletedPaymentsByInstitution 
} from '../../api/institutionApi';
import MobilePaymentView from '../../components/institutions/MobilePaymentView';
import SearchableDropdown from '../../components/institutions/SearchableDropdown';
import InstitutionManualPayment  from '../../pages/dashboard/institution/InstitutionManualPayment';

const InstitutionPaymentConfirmation = () => {
   const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPending, setFilteredPending] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [allDonors, setAllDonors] = useState([]);
  const [filteredCompleted, setFilteredCompleted] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [donorSearchLoading, setDonorSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [studentPaymentHistory, setStudentPaymentHistory] = useState({});
  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false);
const [showManualPayment, setShowManualPayment] = useState(false);
const [selectedSponsorship, setSelectedSponsorship] = useState(null);


  const [filters, setFilters] = useState({
    student: null,
    donor: null,
    searchTerm: ''
  });

  const [formData, setFormData] = useState({
    receiptNumber: '',
    receiptDate: '',
    receivedAmount: '',
    receivedDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    notes: ''
  });

  const [institutionData, setInstitutionData] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState(new Set());
const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Load institution data from localStorage
  useEffect(() => {
    const data = localStorage.getItem('institutionData');
    if (data) {
      setInstitutionData(JSON.parse(data));
    }
  }, []);

  // Fetch data when institution data is loaded
  useEffect(() => {
    if (institutionData?.institutionsId) {
      fetchData();
    }
  }, [institutionData]);

  const fetchData = async () => {
    if (!institutionData?.institutionsId) {
      toast.error('Institution data not found. Please login again.');
      return;
    }
    
    try {
      setLoading(true);
      const institutionId = institutionData.institutionsId;

      console.log('🔍 === FETCHING ALL DATA ===');
      
      let pendingData = [];
      let studentsData = [];

      try {
        pendingData = await getPendingPaymentSponsorships(institutionId);
        console.log('✅ Pending Data Loaded:', pendingData.length, 'items');
      } catch (pendingError) {
        console.error('❌ Pending Data Error:', pendingError);
      }

      try {
        studentsData = await getStudentsByInstitution(institutionId);
        console.log('✅ Students Data Loaded:', studentsData.length, 'items');
      } catch (studentsError) {
        console.error('❌ Students Data Error:', studentsError);
      }
      
      // Set states - completed payments will be loaded individually per student
      setPendingPayments(pendingData);
      setFilteredPending(pendingData);
      setStudents(studentsData);
      
      console.log('🎯 FINAL STATE:');
      console.log(' - Pending:', pendingData.length);
      console.log(' - Students:', studentsData.length);
      
      toast.success(`Loaded ${pendingData.length} pending payments and ${studentsData.length} students`);
      
    } catch (error) {
      console.error('❌ Overall fetch error:', error);
      toast.error(`Failed to load data: ${error.message}`);
      
      setPendingPayments([]);
      setFilteredPending([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
// Record Payment button-এর function
// InstitutionPaymentConfirmation.jsx - handleCreateFirstPayment function
const handleCreateFirstPayment = (sponsorship) => {
  console.log('Opening manual payment form for:', sponsorship);
  
  // COMPLETE data pass 
  const preSelectedData = {
    // Student Information
    studentId: sponsorship.studentId,
    studentName: sponsorship.studentName,
    
    // Donor Information - ALL possible fields check 
    donorId: sponsorship.donorId || sponsorship.sponsorDetails?.donorId || sponsorship.id,
    donorName: sponsorship.donorName || sponsorship.sponsorDetails?.donorName,
    
    // Payment Information
    monthlyAmount: sponsorship.monthlyAmount || sponsorship.amount,
    
    // ✅ IMPORTANT: Date information properly pass 
    startDate: sponsorship.startDate,
    endDate: sponsorship.endDate,
    paidUpTo: sponsorship.paidUpTo,
    
    // Sponsorship Information
    sponsorshipId: sponsorship.id || sponsorship.sponsorshipId,
    status: sponsorship.status,
    
    // Additional context
    contactNumber: sponsorship.contactNumber,
    className: sponsorship.className,
    guardianName: sponsorship.guardianName
  };
  
  console.log('Pre-selected data for manual payment:', preSelectedData);
  setSelectedSponsorship(preSelectedData);
  setShowManualPayment(true);
};
// Manual payment success handler
const handleManualPaymentSuccess = (result) => {
  console.log('Manual payment successful:', result);
  setShowManualPayment(false);
  setSelectedSponsorship(null);
  
  // Refresh data
  fetchData();
  
  toast.success('Payment processed successfully!');
};

  // Load payment history for a specific student
  const loadStudentPaymentHistory = async (studentId, studentName) => {
    if (!institutionData?.institutionsId) {
      toast.error('Institution data not found');
      return;
    }

    try {
      setLoadingStudentHistory(true);
      const institutionId = institutionData.institutionsId;
      
      console.log('📥 Loading payment history for student:', studentId, studentName);
      
      const history = await getPaymentHistoryByStudent(studentId, institutionId);
      
      console.log('✅ Loaded payment history:', history.length, 'payments for student', studentName);
      
      setStudentPaymentHistory(prev => ({
        ...prev,
        [studentId]: {
          payments: history,
          studentName: studentName,
          loaded: true
        }
      }));
      
    } catch (error) {
      console.error('❌ Error loading student payment history:', error);
      toast.error(`Failed to load payment history for ${studentName}`);
      setStudentPaymentHistory(prev => ({
        ...prev,
        [studentId]: {
          payments: [],
          studentName: studentName,
          loaded: true,
          error: true
        }
      }));
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  // Load history when student section is expanded
  useEffect(() => {
    expandedStudents.forEach(studentId => {
      const studentData = students.find(s => s.studentId === parseInt(studentId));
      if (studentData && !studentPaymentHistory[studentId]?.loaded) {
        console.log('🔄 Auto-loading payment history for student:', studentId, studentData.studentName);
        loadStudentPaymentHistory(studentId, studentData.studentName);
      }
    });
  }, [expandedStudents, students]);

  // Toggle student expansion
  const toggleStudent = (studentId) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
        
        // Load payment history if not already loaded
        const studentData = students.find(s => s.studentId === parseInt(studentId));
        if (studentData && !studentPaymentHistory[studentId]?.loaded) {
          loadStudentPaymentHistory(studentId, studentData.studentName);
        }
      }
      return newSet;
    });
  };

  // Expand/Collapse All functions
  const expandAllStudents = () => {
    const allStudentIds = students.map(student => student.studentId);
    setExpandedStudents(new Set(allStudentIds));
    
    // Load payment history for all students
    allStudentIds.forEach(studentId => {
      const studentData = students.find(s => s.studentId === studentId);
      if (studentData && !studentPaymentHistory[studentId]?.loaded) {
        loadStudentPaymentHistory(studentId, studentData.studentName);
      }
    });
  };

  const collapseAllStudents = () => {
    setExpandedStudents(new Set());
  };

  // Calculate totals for display
  const calculateStudentTotals = (payments) => {
    if (!Array.isArray(payments)) return { totalAmount: 0, totalPayments: 0 };
    
    return payments.reduce((totals, payment) => {
      totals.totalAmount += parseFloat(payment.amount || payment.receivedAmount || 0);
      totals.totalPayments += 1;
      return totals;
    }, { totalAmount: 0, totalPayments: 0 });
  };

  // Get unique donors from payments
  const getUniqueDonors = (payments) => {
    if (!Array.isArray(payments)) return [];
    return [...new Set(payments.map(p => p.donorName).filter(Boolean))];
  };

  // Get payment methods from payments
  const getPaymentMethods = (payments) => {
    if (!Array.isArray(payments)) return [];
    return [...new Set(payments.map(p => p.paymentMethod).filter(Boolean))];
  };

  // Search all donors using the API service
  const handleDonorSearch = async (searchTerm) => {
    if (searchTerm.length > 1) {
      try {
        setDonorSearchLoading(true);
        const donors = await searchAllDonors(searchTerm);
        setAllDonors(Array.isArray(donors) ? donors : []);
      } catch (error) {
        console.error('Error searching donors:', error);
        setAllDonors([]);
      } finally {
        setDonorSearchLoading(false);
      }
    } else {
      setAllDonors([]);
    }
  };

  // Filter students based on selected filters
  useEffect(() => {
    let filteredStudents = Array.isArray(students) ? students : [];
    
    if (filters.student && filters.student.studentId) {
      filteredStudents = filteredStudents.filter(student => 
        student.studentId === filters.student.studentId
      );
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredStudents = filteredStudents.filter(student =>
        (student.studentName && student.studentName.toLowerCase().includes(term)) ||
        (student.contactNumber && student.contactNumber.includes(term)) ||
        (student.guardianName && student.guardianName.toLowerCase().includes(term))
      );
    }
    
    setFilteredCompleted(filteredStudents);
  }, [filters, students]);

  const handleStudentSearch = async (searchTerm) => {
    if (searchTerm.length > 2 && institutionData?.institutionsId) {
      try {
        const results = await searchStudents(institutionData.institutionsId, searchTerm);
        setStudents(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Error searching students:', error);
        setStudents([]);
      }
    }
  };

 

  // Format amount display
  const formatAmount = (amount) => {
    if (!amount) return '0';
    return parseFloat(amount).toLocaleString();
  };

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

const handleConfirmPayment = async (confirmationData) => {
  try {
    await confirmPayment(confirmationData);
    
    // Refresh data
    fetchData();
    setSelectedPayment(null);
    resetForm();
    
    toast.success('Payment confirmed successfully!');
  } catch (error) {
    console.error('Error confirming payment:', error);
    toast.error('Failed to confirm payment: ' + (error.response?.data?.message || error.message));
    throw error; 
  }
};
const calculatePayableAmountAdvanced = (monthlyAmount, startDate, endDate) => {
  if (!monthlyAmount || !startDate) {
    return { 
      total: 0, 
      months: 0,
      perDay: 0,
      days: 0
    };
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  // Calculate total days
  const timeDiff = end.getTime() - start.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Calculate months and remaining days
  const totalMonths = Math.floor(days / 30);
  const remainingDays = days % 30;
  
  // Calculate per day rate (assuming 30 days month)
  const perDayRate = monthlyAmount / 30;
  
  // Calculate total amount
  const monthlyTotal = monthlyAmount * totalMonths;
  const dailyTotal = perDayRate * remainingDays;
  const total = monthlyTotal + dailyTotal;
  
  return {
    total: Math.round(total),
    months: totalMonths,
    days: remainingDays,
    perDay: perDayRate,
    totalDays: days
  };
};


// Render mobile view if on mobile device
  if (isMobile) {
    return (
      <MobilePaymentView
        pendingPayments={pendingPayments}
        filteredPending={filteredPending}
        students={students}
        filteredCompleted={filteredCompleted}
        studentPaymentHistory={studentPaymentHistory}
        loadingStudentHistory={loadingStudentHistory}
        expandedStudents={expandedStudents}
        activeTab={activeTab}
        filters={filters}
        selectedPayment={selectedPayment}
        formData={formData}
        loading={loading}
        institutionData={institutionData}
        
        // Functions
        setActiveTab={setActiveTab}
        setFilters={setFilters}
        setSelectedPayment={setSelectedPayment}
        setFormData={setFormData}
        fetchData={fetchData}
        toggleStudent={toggleStudent}
        expandAllStudents={expandAllStudents}
        collapseAllStudents={collapseAllStudents}
        loadStudentPaymentHistory={loadStudentPaymentHistory}
        handleConfirmPayment={handleConfirmPayment}
        handleStudentSearch={handleStudentSearch}
        formatAmount={formatAmount}
        formatDate={formatDate}
        calculateStudentTotals={calculateStudentTotals}
        getUniqueDonors={getUniqueDonors}
        getPaymentMethods={getPaymentMethods}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
         
          <span className="text-gray-600 mt-1">
             <h1 className="text-2xl font-bold text-gray-800 text-justify">Payment Management</h1>
            Manage pending payments and view completed payment history
          </span>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-800">{pendingPayments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-800">{filteredCompleted.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Students</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Student Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <SearchableDropdown
                options={students}
                value={filters.student}
                onSelect={(student) => setFilters({...filters, student})}
                placeholder="Search student by name..."
                onSearch={handleStudentSearch}
                className="w-full"
              />
            </div>

            {/* Search Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by student name, contact, or guardian..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear All Filters */}
          {(filters.student || filters.searchTerm) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({ student: null, donor: null, searchTerm: '' })}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Payments ({filteredPending.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Student Payment History ({filteredCompleted.length})
              </button>
            </nav>
          </div>

    {/* Tab Content */}
<div className="p-6">
  {/* Pending Payments Tab */}
  {activeTab === 'pending' && (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Pending Payment Sponsorships ({filteredPending.length})
        </h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {filteredPending.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {pendingPayments.length === 0 ? 'No pending payment sponsorships' : 'No sponsorships match your filters'}
          </h3>
          <p className="text-gray-500 text-sm">
            {pendingPayments.length === 0 
              ? 'All sponsorships have received payments or no sponsorships are pending.' 
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPending.map(sponsorship => {
            // Calculate total payable amount - CORRECTED
            const payableAmount = calculatePayableAmountAdvanced(
              sponsorship.monthlyAmount,
              sponsorship.startDate,
              sponsorship.endDate
            );
            
            return (
              <div key={sponsorship.id} className="bg-white border-l-4 border-orange-500 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Student Information */}
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Student Information</div>
                    <div className="text-gray-900 font-medium text-lg">{sponsorship.studentName}</div>
                    <div className="text-gray-600 text-sm">ID: {sponsorship.studentId}</div>
                    <div className="text-gray-500 text-xs mt-1">Contact: {sponsorship.contactNumber || 'N/A'}</div>
                  </div>
                  
                  {/* Donor Information */}
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Donor Information</div>
                    <div className="text-gray-900 font-medium">{sponsorship.donorName}</div>
                    <div className="text-gray-600 text-sm capitalize">
                      {sponsorship.paymentMethod ? sponsorship.paymentMethod.toLowerCase() : 'N/A'}
                    </div>
                    {sponsorship.donorContact && (
                      <div className="text-gray-500 text-xs mt-1">Contact: {sponsorship.donorContact}</div>
                    )}
                  </div>
                  
                  {/* Payment Details - CORRECTED */}
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Payment Details</div>
                    <div className="text-orange-600 font-bold text-lg">
                      ৳{formatAmount(sponsorship.monthlyAmount)}/month
                    </div>
                    
                    {/* Date Range */}
                    <div className="text-xs text-orange-600 font-medium mt-2 bg-orange-50 px-2 py-1 rounded">
                      {sponsorship.startDate
                        ? `Since ${formatDate(sponsorship.startDate)}`
                        : 'Start date not set'} 
                      {sponsorship.endDate
                        ? ` - End ${formatDate(sponsorship.endDate)}`
                        : ' (Ongoing)'}
                    </div>
                    
                    {/* Payable Amount */}
                    <div className="text-xs text-green-600 font-medium mt-2 bg-green-50 px-2 py-1 rounded">
                      Total Payable: ৳{formatAmount(payableAmount.total)}
                    </div>
                    
                    {/* Calculation Breakdown */}
                    <div className="text-xs text-gray-600 mt-1">
                      {payableAmount.months} month{payableAmount.months !== 1 ? 's' : ''} × ৳{formatAmount(sponsorship.monthlyAmount)}
                    </div>
                    
                    {/* Duration Info */}
                    {payableAmount.days > 0 && (
                      <div className="text-xs text-gray-500">
                        + {payableAmount.days} day{payableAmount.days !== 1 ? 's' : ''} (৳{formatAmount(payableAmount.perDay * payableAmount.days)})
                      </div>
                    )}
                    
                    {/* Status */}
                    <div className={`text-xs font-medium mt-2 px-2 py-1 rounded capitalize ${
                      sponsorship.status === 'active' ? 'bg-green-100 text-green-800' :
                      sponsorship.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      sponsorship.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sponsorship.status || 'unknown'}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 justify-center">
                  <div className="flex items-center justify-end">
                            {/* // Pending Payments section-এ record button-এ click handler*/}
                            <button
                              onClick={() => handleCreateFirstPayment(sponsorship)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Record Payment
                            </button>
                          </div>
                    <button 
                      onClick={() => handleViewDetails(sponsorship)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    <button 
                      onClick={() => handleContactDonor(sponsorship)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Donor
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}


            {/* Completed Payments Tab - Individual Student History */}
            {activeTab === 'completed' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Student Payment History
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {filteredCompleted.length} students found
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={expandAllStudents}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllStudents}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Collapse All
                    </button>
                    <button
                      onClick={fetchData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>

                {filteredCompleted.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <div className="text-gray-400 text-6xl mb-4">👨‍🎓</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Students Found
                    </h3>
                    <p className="text-gray-500">
                      {students.length === 0 ? 'No students registered yet.' : 'No students match your filters.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCompleted.map(student => {
                      const studentHistory = studentPaymentHistory[student.studentId];
                      const payments = studentHistory?.payments || [];
                      const totals = calculateStudentTotals(payments);
                      const uniqueDonors = getUniqueDonors(payments);
                      const paymentMethods = getPaymentMethods(payments);
                      
                      return (
                        <div key={student.studentId} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          {/* Student Header */}
                          <div 
                            className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
                            onClick={() => toggleStudent(student.studentId)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-3">
                                  <div className="flex items-center">
                                    <span className={`transform transition-transform duration-300 mr-3 ${
                                      expandedStudents.has(student.studentId) ? 'rotate-90' : ''
                                    }`}>
                                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-800 mr-4">
                                      {student.studentName}
                                    </h3>
                                  </div>
                                  <span className="text-sm bg-white text-blue-800 px-3 py-1 rounded-full font-medium border border-blue-200">
                    Class: {student.grade || student.className || 'N/A'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>ID: {student.studentId}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{student.contactNumber || 'N/A'}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Guardian: {student.guardianName || 'N/A'}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>{uniqueDonors.length} donor(s)</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="mb-2">
                                  <div className="text-2xl font-bold text-green-600">
                                    ৳{formatAmount(totals.totalAmount)}
                                  </div>
                                  <div className="text-sm text-gray-600">Total Received</div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {totals.totalPayments} payment{totals.totalPayments !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="flex flex-wrap gap-3 mt-4">
                              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                                <div className="text-xs text-gray-500">Total Payments</div>
                                <div className="text-lg font-bold text-blue-600">{totals.totalPayments}</div>
                              </div>
                              
                              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                                <div className="text-xs text-gray-500">Unique Donors</div>
                                <div className="text-lg font-bold text-purple-600">{uniqueDonors.length}</div>
                              </div>
                              
                              <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                                <div className="text-xs text-gray-500">Payment Methods</div>
                                <div className="text-lg font-bold text-green-600">{paymentMethods.length}</div>
                              </div>
                              
                              {/* Donor Names */}
                              {uniqueDonors.length > 0 && (
                                <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-xs">
                                  <div className="text-xs text-gray-500 mb-1">Donors</div>
                                  <div className="flex flex-wrap gap-1">
                                    {uniqueDonors.slice(0, 3).map((donor, index) => (
                                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {donor}
                                      </span>
                                    ))}
                                    {uniqueDonors.length > 3 && (
                                      <span className="text-xs text-gray-500">+{uniqueDonors.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Individual Payments List */}
                          {expandedStudents.has(student.studentId) && (
                            <div className="border-t border-gray-200">
                              <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-lg font-semibold text-gray-800">
                                    Payment History for {student.studentName}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      Student ID: {student.studentId}
                                    </span>
                                    <button
                                      onClick={() => loadStudentPaymentHistory(student.studentId, student.studentName)}
                                      disabled={loadingStudentHistory}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 flex items-center"
                                    >
                                      {loadingStudentHistory ? (
                                        <>
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                          Loading...
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                          </svg>
                                          Refresh
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                
                                {!studentHistory ? (
                                  <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading payment history for {student.studentName}...</p>
                                  </div>
                                ) : studentHistory.error ? (
                                  <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
                                    <div className="text-red-400 text-4xl mb-2">❌</div>
                                    <h5 className="font-medium text-red-600 mb-1">Error Loading History</h5>
                                    <p className="text-sm">Failed to load payment history for {student.studentName}</p>
                                    <button
                                      onClick={() => loadStudentPaymentHistory(student.studentId, student.studentName)}
                                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                    >
                                      Try Again
                                    </button>
                                  </div>
                                ) : payments.length === 0 ? (
                                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                    <div className="text-gray-400 text-4xl mb-2">📝</div>
                                    <h5 className="font-medium text-gray-600 mb-1">No Payment History</h5>
                                    <p className="text-sm">No completed payments found for {student.studentName}</p>
                                    <button
                                      onClick={() => loadStudentPaymentHistory(student.studentId, student.studentName)}
                                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                      Check Again
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {payments
                                      .sort((a, b) => new Date(b.receivedDate || b.paymentDate || 0) - new Date(a.receivedDate || a.paymentDate || 0))
                                      .map((payment, index) => (
                                      <div key={payment.id || index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4">
                                          <div>
                                            <div className="text-sm font-medium text-gray-700 mb-1">Donor</div>
                                            <div className="text-gray-900 font-semibold">{payment.donorName || 'Unknown Donor'}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {payment.paymentMethod && (
                                                <span className="capitalize bg-gray-100 px-2 py-1 rounded">{payment.paymentMethod.toLowerCase()}</span>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <div className="text-sm font-medium text-gray-700 mb-1">Amount</div>
                                            <div className="text-green-600 font-bold text-lg">
                                              ৳{formatAmount(payment.amount || payment.receivedAmount || 0)}
                                            </div>
                                            <div className="text-sm text-gray-600">{payment.paidPeriod || 'N/A'}</div>
                                          </div>
                                          
                                          <div>
                                            <div className="text-sm font-medium text-gray-700 mb-1">Receipt Info</div>
                                            <div className="text-gray-900 font-mono text-sm">{payment.receiptNumber || 'N/A'}</div>
                                            <div className="text-sm text-gray-600">
                                              {formatDate(payment.receivedDate || payment.paymentDate)}
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <div className="text-sm font-medium text-gray-700 mb-1">Transaction</div>
                                            {payment.transactionId ? (
                                              <div className="text-gray-900 text-sm font-mono bg-gray-100 px-2 py-1 rounded">{payment.transactionId}</div>
                                            ) : (
                                              <div className="text-gray-400 text-sm">No transaction ID</div>
                                            )}
                                          </div>
                                          
                                          <div>
                                            <div className="text-sm font-medium text-gray-700 mb-1">Confirmed By</div>
                                            <div className="text-gray-900 font-medium">{payment.confirmedBy || 'System'}</div>
                                            <div className="text-xs text-gray-500">
                                              {formatDate(payment.confirmedDate)}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="ml-4">
                                          <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            CONFIRMED
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Confirm Payment Received
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Verify and confirm the payment details below
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Payment Summary */}
                <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4 text-lg">Payment Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 font-medium">Student</div>
                      <div className="font-medium text-gray-900 text-lg">{selectedPayment.studentName}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Donor</div>
                      <div className="font-medium text-gray-900 text-lg">{selectedPayment.donorName}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Amount Due</div>
                      <div className="font-medium text-green-600 text-lg">{formatAmount(selectedPayment.amount)} Taka</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Payment Method</div>
                      <div className="font-medium text-gray-900 capitalize">{selectedPayment.paymentMethod?.toLowerCase()}</div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Form */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-800 text-lg">Payment Receipt Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt Date
                      </label>
                      <input
                        type="date"
                        value={formData.receiptDate}
                        onChange={(e) => setFormData({...formData, receiptDate: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Received Amount *
                      </label>
                      <input
                        type="number"
                        value={formData.receivedAmount}
                        onChange={(e) => setFormData({...formData, receivedAmount: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Amount received in Taka"
                        required
                      />
                    </div>

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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bank/Mobile banking transaction ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional notes or comments..."
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={!formData.receiptNumber || !formData.receivedAmount}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}


{showManualPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <InstitutionManualPayment 
                preSelectedData={selectedSponsorship}
                onSuccess={handleManualPaymentSuccess}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowManualPayment(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
  
        
      </div>
      
    </div>
    
  );
};

export default InstitutionPaymentConfirmation;