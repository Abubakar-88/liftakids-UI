import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaHeart, FaSearch, FaInfoCircle, FaSync, FaMoneyBillWave, FaCalendarAlt, FaUniversity } from 'react-icons/fa';
import { getSponsorshipsByDonorId, getDonorById } from '../../../api/donarApi';
import { getTopUnsponsoredUrgentStudents } from '../../../api/studentApi';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart } from 'react-icons/fa';
import ContactSponsorModal from '../donor/ContactSponsorModal';
import PaymentModal from '../donor/PaymentModal';
import PaymentCheckoutPage from '../donor/PaymentCheckoutPage';

const DonorSponsoredStudentList = () => {
  const [sponsoredStudents, setSponsoredStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [donorInfo, setDonorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('sponsored');
  const [refreshing, setRefreshing] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState('info');
  const navigate = useNavigate();
  const [donorData, setDonorData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('donorData');
    if (data) {
      setDonorData(JSON.parse(data));
    }
  }, []);

 const fetchData = async () => {
  if (!donorData || !donorData.donorId) {
    setError('Donor information not found. Please log in again.');
    setLoading(false);
    return;
  }

  try {
    setError(null);
    setRefreshing(true);

    const [sponsoredData, availableData, donorInfoData] = await Promise.all([
      getSponsorshipsByDonorId(donorData.donorId), 
      getTopUnsponsoredUrgentStudents(), 
      getDonorById(donorData.donorId)
    ]);

 
    console.log("Sponsored data:", sponsoredData);
    
    
    if (sponsoredData && sponsoredData.length > 0) {
      sponsoredData.forEach((sponsorship, index) => {
        console.log(`Sponsorship ${index + 1} ID:`, sponsorship.id);
        console.log(`Student: ${sponsorship.studentName} (ID: ${sponsorship.studentId})`);
      });
    } else {
      console.log("No sponsorships found");
    }

    setSponsoredStudents(sponsoredData);
    setAvailableStudents(availableData);
    setDonorInfo(donorInfoData);
  } catch (err) {
    setError('Failed to fetch data. Please try again.');
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  useEffect(() => {
    if (donorData) {
      fetchData();
    }
  }, [donorData]);

  const handleViewDetails = (student) => {
    // Normalize the student data to ensure consistent structure
    const normalizedStudent = {
      ...student,
      studentId: student.studentId || student.id,
      studentName: student.studentName || student.name,
      institutionName: student.institutionName || student.instituteName,
      grade: student.grade || student.class,
      requiredMonthlySupport: student.requiredMonthlySupport || student.monthlyAmount,
      sponsoredAmount: student.sponsoredAmount || student.totalPaidAmount,
      financial_rank: student.financial_rank || student.financialRank,
      photoUrl: student.photoUrl || student.avatar,
      sponsored: student.sponsored !== undefined ? student.sponsored : (student.status === 'ACTIVE' || student.status === 'COMPLETED'),
      contactNumber: student.contactNumber || student.guardianPhone,
      address: student.address,
      guardianName: student.guardianName,
      bio: student.bio || student.description
    };
    
    setSelectedStudent(normalizedStudent);
    setShowDetails(true);
    setActiveDetailsTab('info');
  };

  const handleContactSponsor = (student) => {
    setSelectedStudent(student);
    setContactModalOpen(true);
  };

  const handlePaymentSubmit = (paymentInfo) => {
    setPaymentData(paymentInfo);
    setPaymentModalOpen(false);
    setCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = (response) => {
    setCheckoutModalOpen(false);
    setPaymentData(null);
    fetchData(); // Refresh data after successful payment
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading sponsorship data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-gray-800 font-medium mb-2">Error Loading Data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaUserGraduate className="mr-2 text-blue-600" />
                My Sponsorships
              </h1>
              {donorInfo && (
                <p className="text-gray-600">
                  Welcome back, {donorInfo.name}
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile: Show stats first */}
        <div className="block lg:hidden mb-6">
          <DashboardStats
            sponsoredStudents={sponsoredStudents}
            availableStudents={availableStudents}
          />
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-4 font-medium text-sm text-blue-600 border-b-2 border-blue-600"
            >
              My Sponsored Students ({sponsoredStudents.length})
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('available-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-4 font-medium text-sm text-gray-500 hover:text-gray-700"
            >
              Available for Sponsorship ({availableStudents.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            {/* Sponsored Students Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">My Sponsored Students</h2>
              {sponsoredStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <FaHeart className="mx-auto text-gray-300 text-4xl mb-3" />
                  <p className="text-gray-600">You haven't sponsored any students yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sponsoredStudents.map((sponsorship) => (
                    <SponsorshipCard
                      key={sponsorship.id}
                      sponsorship={sponsorship}
                      onViewDetails={handleViewDetails}
                      onSponsorAgain={handleContactSponsor}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Available Students Section - Mobile: Always shown at bottom */}
            <div id="available-section" className="lg:mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Available for Sponsorship</h2>
              {availableStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <FaSearch className="mx-auto text-gray-300 text-4xl mb-3" />
                  <p className="text-gray-600">No students currently need sponsorship.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableStudents.map((student) => (
                    <StudentCard
                      key={student.studentId}
                      student={student}
                      onViewDetails={handleViewDetails}
                      onSponsor={handleContactSponsor}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statistics Panel - Desktop */}
          <div className="hidden lg:block w-1/3">
            <DashboardStats
              sponsoredStudents={sponsoredStudents}
              availableStudents={availableStudents}
            />
          </div>
        </div>
      </div>

        {/* Student Details Modal */}
      {showDetails && selectedStudent && (
        <StudentDetailsModal
            selectedStudent={selectedStudent}
            activeTab={activeDetailsTab}
            onTabChange={setActiveDetailsTab}
            onClose={() => setShowDetails(false)}
            onSponsor={() => handleContactSponsor(selectedStudent)}
        />
        )}

      {/* Modals */}
      {contactModalOpen && (
        <ContactSponsorModal
          student={selectedStudent}
          onClose={() => setContactModalOpen(false)}
          onSponsor={() => {
            setContactModalOpen(false);
            setPaymentModalOpen(true);
          }}
        />
      )}
      
      {paymentModalOpen && (
        <PaymentModal
          student={selectedStudent}
          paidMonths={selectedStudent?.paidMonths} 
          onClose={() => setPaymentModalOpen(false)}
          onPayment={handlePaymentSubmit}
        />
      )}
      
      {checkoutModalOpen && (
        <PaymentCheckoutPage
          sponsoredData={paymentData}
          onBack={() => {
            setCheckoutModalOpen(false);
            setPaymentModalOpen(true);
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
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

// Component for sponsorship card
const SponsorshipCard = ({ sponsorship, onViewDetails, onSponsorAgain }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDateStatus = (dateString) => {
    if (!dateString) return 'text-gray-600';
    
    const date = new Date(dateString);
    const today = new Date();
    
    if (date < today) {
      return 'text-red-600';
    } else {
      return 'text-green-600';
    }
  };

  // Extract student data from sponsorship object
  const student = sponsorship.student || sponsorship;
  const studentName = student.studentName || student.name;
  const institutionName = student.institutionName || sponsorship.institutionName;
  const grade = student.grade || sponsorship.grade;
  const financialRank = student.financial_rank || sponsorship.financial_rank;
  const monthlyAmount = student.requiredMonthlySupport || sponsorship.monthlyAmount;
  const totalPaidAmount = sponsorship.totalPaidAmount || student.sponsoredAmount;
  const photoUrl = student.photoUrl || sponsorship.photoUrl;
  const sponsored = student.sponsored !== undefined ? student.sponsored : sponsorship.sponsored;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      {/* Student Header */}
      <div className="flex items-start mb-4">
        {/* Left - Image */}
        <div className="w-16 h-16 flex-shrink-0 mr-3">
          <img
            src={photoUrl || "/default-thumbnail.png"}
            alt={studentName}
            className="w-full h-full object-cover rounded-lg border"
          />
        </div>

        {/* Middle - Student Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-800 text-lg">{studentName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(sponsorship.status)}`}>
              {sponsorship.studentStatus?.fullySponsored ? 'Sponsored' : sponsorship.status}
            </span>
          </div>
          
          <div className="mt-1">
            <p className="text-sm text-gray-600">
              Class {grade || "N/A"} | Financial Rank: {financialRank || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              Monthly Requirement: ৳{monthlyAmount?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Sponsored:</span>
          <span className="font-medium">৳{totalPaidAmount?.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-green-600" 
            style={{ width: sponsorship.status === 'COMPLETED' ? '100%' : '50%' }}
          ></div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="flex items-center">
          <FaMoneyBillWave className="text-gray-400 mr-2" />
          <span className="text-gray-600">Last Paid Amount:</span>
          <span className="ml-auto font-medium">৳{sponsorship.totalAmount?.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <span className="text-gray-600">Payment Interval:</span>
          <span className="ml-auto font-medium">Monthly</span>
        </div>
        
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <span className="text-gray-600">Paid Up To:</span>
          <span className={`ml-auto font-medium ${getDateStatus(sponsorship.paidUpTo)}`}>
            {sponsorship.paidUpTo ? new Date(sponsorship.paidUpTo).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center">
          <FaUniversity className="text-gray-400 mr-2" />
          <span className="text-gray-600">Institute Name:</span>
          <span className="ml-auto font-medium">{institutionName}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => onViewDetails(sponsorship)}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onSponsorAgain(sponsorship)}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

// Component for student card
const StudentCard = ({ student, onViewDetails, onSponsor }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
  {/* Student Header */}
  <div className="flex items-start mb-4">
    {/* Left - Image */}
    <div className="w-16 h-16 flex-shrink-0 mr-3">
      <img
        src={student.photoUrl || "/default-thumbnail.png"}
        alt={student.studentName}
        className="w-full h-full object-cover rounded-lg border"
      />
    </div>

    {/* Middle - Student Info */}
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800 text-lg">{student.studentName}</h3>
        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
          student.sponsored
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800 font-medium"
        }`}>
          {student.sponsored ? "Sponsored" : "Not Sponsored"}
        </span>
      </div>
      
      <div className="mt-1">
        <p className="text-sm text-gray-600">
          Class 3 | Financial Rank: <span className='text-red-500'>{student.financial_rank || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-600">
          Monthly Requirement: ৳{student.requiredMonthlySupport?.toLocaleString()}
        </p>
      </div>
    </div>
  </div>

  {/* Progress Bar */}
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">Sponsored: 0%</span>
      <span className="font-medium">৳0</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="h-2 rounded-full bg-blue-600" style={{ width: '0%' }}></div>
    </div>
  </div>

  {/* Details */}
  <div className="mb-4">
    <div className="flex items-center">
      <FaUniversity className="text-gray-400 mr-2 text-sm" />
      <span className="text-gray-600 text-sm">Institute Name:</span>
      <span className="ml-auto font-medium text-sm">{student.institutionName}</span>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex space-x-2">
    <button
      onClick={() => onViewDetails(student)}
      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
    >
      View Details
    </button>
    <button
      onClick={() => onSponsor(student)}
      className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
    >
      Sponsor Now
    </button>
  </div>
  
</div>
);

// Component for dashboard statistics
const DashboardStats = ({ sponsoredStudents, availableStudents }) => {
  const totalAmount = sponsoredStudents.reduce((total, s) => total + (s.totalPaidAmount || 0), 0);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Sponsorship Summary</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Total Sponsored</p>
            <p className="text-2xl font-bold text-blue-700">{sponsoredStudents.length}</p>
          </div>
          <FaUserGraduate className="text-blue-600 text-2xl" />
        </div>

        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-green-700">
              ৳{totalAmount.toLocaleString()}
            </p>
          </div>
          <FaHeart className="text-green-600 text-2xl" />
        </div>

        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Available to Sponsor</p>
            <p className="text-2xl font-bold text-orange-700">{availableStudents.length}</p>
          </div>
          <FaSearch className="text-orange-600 text-2xl" />
        </div>
      </div>
   
    </div>
  );
};

// Component for student details modal
const StudentDetailsModal = ({ selectedStudent, activeTab, onTabChange, onClose, onSponsor }) => {
  // Check if selectedStudent exists
  if (!selectedStudent) return null;

  const getProgressPercentage = (student) => {
    if (!student.requiredMonthlySupport) return 0;
    return Math.min(100, (student.sponsoredAmount / student.requiredMonthlySupport) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-lg w-full max-w-[360px] max-h-[95vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="relative border-b border-gray-200 p-4 sticky top-0 bg-white z-10">
          <div className="flex items-start gap-3">
            <img
              src={selectedStudent.photoUrl || "/placeholder-avatar.png"}
              alt={selectedStudent.studentName}
              className="w-14 h-14 rounded-md object-cover border"
            />
            <div className="flex-1 min-w-0 text-justify">
              <h3 className="text-[16px] font-semibold text-gray-900 truncate">
                {selectedStudent.studentName}
              </h3>
              <p className="text-[13px] text-gray-600 mt-1">
                Class {selectedStudent.grade || "N/A"} | Financial Rank:{" "}
                <span className="font-medium ml-3 text-red-400">{selectedStudent.financial_rank || "N/A"}</span>
              </p>
            </div>
          </div>

          {/* Status pill */}
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

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px">
              <button
                onClick={() => onTabChange("info")}
                className={`py-2 px-4 mr-2 text-[14px] font-medium border-b-2 ${
                  activeTab === "info"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Student Info
              </button>
              <button
                onClick={() => onTabChange("academic")}
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
                  <span className="text-gray-900">{selectedStudent.studentName}</span>
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
            onClick={onClose}
            className="px-4 py-2.5 rounded-md bg-gray-200 text-gray-800 text-[14px] font-medium hover:bg-gray-300 transition-colors"
          >
            Back
          </button>

          {!selectedStudent.sponsored && (
            <button
              onClick={onSponsor}
              className="flex-1 px-4 py-2.5 rounded-md bg-green-600 text-white text-[14px] font-medium hover:bg-green-700 transition-colors"
            >
             Contact for Sponsorship
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorSponsoredStudentList;