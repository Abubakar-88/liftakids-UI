import { React, useState, useEffect } from 'react';
import {   getDonorSponsorships,
  getStudentSponsorships, createSponsorship, processPayment } from '../../api/sponsorshipApi';
import DonorSearchDropdown from '../sponsorship/DonorSearchDropdown';
import StudentSearchDropdown from '../sponsorship/StudentSearchDropdown';
import AdminDashboard from '../../pages/dashboard/admin/AdminDashboard';
import AlertModal from '../Modal/AlertModal';
const SponsorshipForm = () => {
   const initialFormState = {
    donorId: '',
    studentId: '',
    monthlyAmount: '',
    startDate: '',
    endDate: '',
    paymentMethod: '',
    cardDetails: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardHolderName: '',
      email: ''
    }
  };
  // Form state
  const [formData, setFormData] = useState({
    donorId: '',
    studentId: '',
    monthlyAmount: '',
    startDate: '',
    endDate: '',
    paymentMethod: '',
    cardDetails: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardHolderName: '',
      email: ''
    }
  });
 const [existingSponsorships, setExistingSponsorships] = useState([]);
  const [overlappingPeriods, setOverlappingPeriods] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [totalMonths, setTotalMonths] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const showAlertModal = (title, message, type = 'info') => {
    setModalContent({ title, message, type });
    setShowModal(true);
  };

useEffect(() => {
  console.log('Current form state:', {
    donorId: formData.donorId,
    studentId: formData.studentId,
    monthlyAmount: formData.monthlyAmount,
    startDate: formData.startDate,
    endDate: formData.endDate,
    paymentMethod: formData.paymentMethod,
    isFormValid: !(!formData.donorId || !formData.studentId || !formData.monthlyAmount || 
                 !formData.startDate || !formData.endDate || !formData.paymentMethod)
  });
}, [formData]);
  // Calculate months and amount when dates or monthly amount changes
 useEffect(() => {
  if (formData.startDate && formData.endDate && formData.monthlyAmount) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    // Calculate months difference correctly
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                  (end.getMonth() - start.getMonth()) + 1;
    
    setTotalMonths(months);
    setTotalAmount(months * parseFloat(formData.monthlyAmount));
  } else {
    setTotalMonths(0);
    setTotalAmount(0);
  }
}, [formData.startDate, formData.endDate, formData.monthlyAmount]);

  const handleDonorSelect = async (donor) => {
    setSelectedDonor(donor);
    setFormData(prev => ({ ...prev, donorId: donor.donorId }));
    
    try {
      const response = await getDonorSponsorships(donor.donorId);
      setExistingSponsorships(response.data);
    } catch (error) {
      console.error('Error loading donor sponsorships:', error);
    }
  };

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setFormData(prev => ({ 
      ...prev, 
      studentId: student.studentId,
      monthlyAmount: student.requiredMonthlySupport?.toString() || ''
    }));

    if (selectedDonor) {
      checkExistingSponsorships(selectedDonor.donorId, student.studentId);
    }
  };

  const checkExistingSponsorships = async (donorId, studentId) => {
    try {
      const [donorSponsorships, studentSponsorships] = await Promise.all([
        getDonorSponsorships(donorId),
        getStudentSponsorships(studentId)
      ]);
      
      // Find the donor and studetn sponsorships
      const donorSponsorshipsData = donorSponsorships.data;
      const studentSponsorshipsData = studentSponsorships.data;
      
      const overlapping = donorSponsorshipsData.filter(ds => 
        studentSponsorshipsData.some(ss => ss.id === ds.id)
      );
      
      setOverlappingPeriods(overlapping);
      
      if (overlapping.length > 0) {
        const message = `এই ডোনার ইতিমধ্যেই এই স্টুডেন্টকে স্পন্সর করেছেন:\n${overlapping.map(s => 
          `${new Date(s.startDate).toLocaleDateString()} থেকে ${new Date(s.endDate).toLocaleDateString()} পর্যন্ত`
        ).join('\n')}`;
        
        showAlertModal(
          'বিদ্যমান স্পন্সরশিপ',
          message,
          'warning'
        );
      }
    } catch (error) {
      console.error('Error checking existing sponsorships:', error);
    }
  };
   const renderExistingSponsorships = () => {
    if (overlappingPeriods.length === 0) return null;
    
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠️ বিদ্যমান স্পন্সরশিপ
        </h3>
        {overlappingPeriods.map((sponsorship, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Period:</span> 
                <span className="ml-2">
                  {new Date(sponsorship.startDate).toLocaleDateString()} - {' '}
                  {new Date(sponsorship.endDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Month Require:</span>
                <span className="ml-2">{sponsorship.monthlyAmount} টাকা</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2 capitalize">{sponsorship.status.toLowerCase()}</span>
              </div>
              <div>
                <span className="font-medium">Last Payment:</span>
                <span className="ml-2">
                  {sponsorship.lastPaymentDate ? 
                    new Date(sponsorship.lastPaymentDate).toLocaleDateString() : 
                    'N/A'}
                </span>
              </div>
            </div>
            {index < overlappingPeriods.length - 1 && <hr className="my-2" />}
          </div>
        ))}
        <p className="text-xs text-yellow-600 mt-2">
          নতুন স্পন্সরশিপ তৈরি করার আগে বিদ্যমান স্পন্সরশিপের তারিখগুলোর সাথে কনফ্লিক্ট না হয় তা নিশ্চিত করুন।
        </p>
      </div>
    );
  };
//  const handleSubmit = async (e) => {
//   e.preventDefault();
  
//   try {
//     // Validate form data
//     if (!formData.donorId || !formData.studentId || !formData.monthlyAmount || 
//         !formData.startDate || !formData.endDate || !formData.paymentMethod) {
//       throw new Error('Please fill all required fields');
//     }

//     console.log('Submitting form:', formData);

//     // Create sponsorship
//     const sponsorshipResponse = await createSponsorship({
//       donorId: formData.donorId,
//       studentId: formData.studentId,
//       monthlyAmount: parseFloat(formData.monthlyAmount),
//       startDate: formData.startDate,
//       endDate: formData.endDate,
//       paymentMethod: formData.paymentMethod
//     });

//     console.log('Sponsorship created:', sponsorshipResponse);

//     // Process payment if not test payment
//     if (formData.paymentMethod !== 'TEST') {
//       const paymentResponse = await processPayment(sponsorshipResponse.data.id, {
//         startDate: formData.startDate,
//         endDate: formData.endDate,
//         amount: totalAmount,
//         paymentMethod: formData.paymentMethod,
//         cardDetails: formData.paymentMethod === 'CREDIT_CARD' ? formData.cardDetails : null
//       });
//       console.log('Payment processed:', paymentResponse);
//     }

//     alert('Sponsorship and payment processed successfully!');
//     // Optionally reset form here
//   } catch (error) {
//     console.error('Submission error:', error);
//     alert(`Error: ${error.message || 'Failed to process sponsorship'}`);
//   }
// };
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Validate all required fields
    if (!formData.donorId || !formData.studentId || !formData.monthlyAmount || 
        !formData.startDate || !formData.endDate || !formData.paymentMethod) {
      throw new Error('Please fill all required fields');
    }

    // Format dates to yyyy-MM format for backend
    const formatDateForBackend = (dateString) => {
      const date = new Date(dateString);
      // Ensure we're using UTC to avoid timezone issues
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    };
// Prepare the sponsorship data
    const sponsorshipData = {
      donorId: formData.donorId,
      studentId: formData.studentId,
      monthlyAmount: Number(formData.monthlyAmount),
      startDate: formatDateForBackend(formData.startDate),
      endDate: formatDateForBackend(formData.endDate),
      paymentMethod: formData.paymentMethod
    };


 console.log('Submitting sponsorship:', sponsorshipData);
    // Check for existing sponsorship first
    let sponsorshipId;
     let message;
    if (overlappingPeriods.length > 0) {
      // Use existing sponsorship
      sponsorshipId = overlappingPeriods[0].id;
       message = 'পেমেন্টটি বিদ্যমান স্পন্সরশিপে যোগ করা হয়েছে!';
    } else {
      // Create new sponsorship
      const sponsorshipResponse = await createSponsorship({
        donorId: formData.donorId,
        studentId: formData.studentId,
        monthlyAmount: Number(formData.monthlyAmount),
        startDate: formatDateForBackend(formData.startDate),
        endDate: formatDateForBackend(formData.endDate),
        paymentMethod: formData.paymentMethod
      });
      sponsorshipId = sponsorshipResponse.data.id;
      message = 'নতুন স্পন্সরশিপ তৈরি করা হয়েছে!';
    }

    // Process payment
    if (formData.paymentMethod !== 'TEST') {
      await processPayment(sponsorshipId, {
        startDate: formatDateForBackend(formData.startDate),
        endDate: formatDateForBackend(formData.endDate),
        amount: totalAmount,
        paymentMethod: formData.paymentMethod,
        cardDetails: formData.paymentMethod === 'CREDIT_CARD' ? formData.cardDetails : undefined
      });
    }

    // Show success modal
      showAlertModal(
        'সফল হয়েছে!',
        `${message}\nপরিমাণ: ${totalAmount.toFixed(2)} টাকা`,
        'success'
      );
    // Reset form
      setFormData(initialFormState);
      setSelectedDonor(null);
      setSelectedStudent(null);
      setTotalMonths(0);
      setTotalAmount(0);
      setOverlappingPeriods([]);
    // Optionally reset form or redirect
    // setFormData({...initialFormState});
    
  } catch (error) {
      showAlertModal(
        'ত্রুটি হয়েছে',
        error.message || 'পেমেন্ট প্রসেস করতে সমস্যা হয়েছে',
        'error'
      );
    }
};
  return (
    <AdminDashboard>
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Sponsorship</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Donor Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Donor</label>
          <DonorSearchDropdown onSelect={handleDonorSelect} />
          
          {selectedDonor && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedDonor.name}</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {selectedDonor.email}
                    </div>
                    {selectedDonor.phone && (
                      <div className="flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedDonor.phone}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDonor(null);
                    setFormData(prev => ({ ...prev, donorId: '' }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {selectedDonor.pastSponsorships && selectedDonor.pastSponsorships.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">PAST SPONSORSHIPS</p>
                  <div className="space-y-1">
                    {selectedDonor.pastSponsorships.slice(0, 2).map(sponsorship => (
                      <div key={sponsorship.id} className="text-xs text-gray-600">
                        {sponsorship.studentName} ({sponsorship.amount} Tk/month)
                      </div>
                    ))}
                    {selectedDonor.pastSponsorships.length > 2 && (
                      <p className="text-xs text-blue-500">+{selectedDonor.pastSponsorships.length - 2} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Student Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Student</label>
          <StudentSearchDropdown onSelect={handleStudentSelect} />
          {selectedStudent && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Selected Student:</span>
                <span className="font-medium">{selectedStudent.studentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Institution:</span>
                <span>{selectedStudent.institutionName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Support:</span>
                <span className={`font-medium ${
                  selectedStudent.requiredMonthlySupport 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {selectedStudent.requiredMonthlySupport 
                    ? `${selectedStudent.requiredMonthlySupport} Tk` 
                    : 'Not set'}
                </span>
              </div>
              {selectedStudent.guardianName && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Guardian:</span>
                  <span>{selectedStudent.guardianName}</span>
                </div>
              )}
            </div>   
          )}
        </div>
             {renderExistingSponsorships()}
        {/* Monthly Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Monthly Amount</label>
          <div className="relative">
            <input
              type="number"
              className={`w-full p-2 border rounded ${
                selectedStudent?.requiredMonthlySupport
                  ? 'bg-gray-50 cursor-not-allowed'
                  : 'bg-white'
              }`}
              value={formData.monthlyAmount}
              onChange={(e) => {
                setFormData(prev => ({ 
                  ...prev, 
                  monthlyAmount: e.target.value 
                }));
              }}
              readOnly={!!selectedStudent?.requiredMonthlySupport}
              placeholder={
                selectedStudent?.requiredMonthlySupport
                  ? "Auto-filled from student data"
                  : "Enter monthly amount"
              }
            />
            {selectedStudent?.requiredMonthlySupport && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-xs">Auto-filled</span>
              </div>
            )}
          </div>
          {selectedStudent && !selectedStudent.requiredMonthlySupport && (
            <p className="text-xs text-yellow-600 mt-1">
              Note: This student doesn't have a default monthly amount. Please enter manually.
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">From Month</label>
            <input
              type="month"
              className="w-full p-2 border rounded"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">To Month</label>
            <input
              type="month"
              className="w-full p-2 border rounded"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Calculated Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Total Months</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              value={totalMonths}
              readOnly
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Total Amount</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              value={totalAmount.toFixed(2)}
              readOnly
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Payment Method</label>
          <div className="flex gap-4">
            {['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL'].map(method => (
              <label key={method} className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  className="mr-2"
                  checked={formData.paymentMethod === method}
                  onChange={() => setFormData({ ...formData, paymentMethod: method })}
                  required
                />
                {method.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>

        {/* Card Details (conditionally shown) */}
        {formData.paymentMethod === 'CREDIT_CARD' && (
          <div className="mb-4 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Card Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.cardDetails.cardHolderName}
                  onChange={(e) => setFormData({
                    ...formData,
                    cardDetails: {
                      ...formData.cardDetails,
                      cardHolderName: e.target.value
                    }
                  })}
                  required={formData.paymentMethod === 'CREDIT_CARD'}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardDetails.cardNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    cardDetails: {
                      ...formData.cardDetails,
                      cardNumber: e.target.value
                    }
                  })}
                  required={formData.paymentMethod === 'CREDIT_CARD'}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Expiry (MM/YY)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="MM"
                    maxLength="2"
                    value={formData.cardDetails.expiryMonth}
                    onChange={(e) => setFormData({
                      ...formData,
                      cardDetails: {
                        ...formData.cardDetails,
                        expiryMonth: e.target.value
                      }
                    })}
                    required={formData.paymentMethod === 'CREDIT_CARD'}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="YY"
                    maxLength="2"
                    value={formData.cardDetails.expiryYear}
                    onChange={(e) => setFormData({
                      ...formData,
                      cardDetails: {
                        ...formData.cardDetails,
                        expiryYear: e.target.value
                      }
                    })}
                    required={formData.paymentMethod === 'CREDIT_CARD'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  maxLength="4"
                  value={formData.cardDetails.cvv}
                  onChange={(e) => setFormData({
                    ...formData,
                    cardDetails: {
                      ...formData.cardDetails,
                      cvv: e.target.value
                    }
                  })}
                  required={formData.paymentMethod === 'CREDIT_CARD'}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={formData.cardDetails.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    cardDetails: {
                      ...formData.cardDetails,
                      email: e.target.value
                    }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="mb-6 p-4 border rounded bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">Payment Summary</h3>
          <div className="flex justify-between mb-1">
            <span>Sponsor:</span>
            <span className="font-medium">{selectedDonor?.name || 'Not selected'}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Student:</span>
            <span className="font-medium">{selectedStudent?.studentName || 'Not selected'}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Monthly Amount:</span>
            <span className="font-medium">{formData.monthlyAmount ? `${formData.monthlyAmount} Tk` : 'Not set'}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Total Amount:</span>
            <span className="font-medium">{totalAmount.toFixed(2)} Tk</span>
          </div>
          <div className="flex justify-between">
            <span>Period:</span>
            <span className="font-medium">
            {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric',
              timeZone: 'UTC' // Add this to prevent timezone issues
            }) : ''} - 
            {formData.endDate ? new Date(formData.endDate).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric',
              timeZone: 'UTC' // Add this to prevent timezone issues
            }) : ''}
            ({totalMonths} months)
          </span>
          </div>
        </div>

        {/* Submit Button */}
      <button
          type="submit"
          className={`w-full text-white py-3 px-4 rounded-md transition-colors ${
            !formData.donorId || !formData.studentId || !formData.monthlyAmount || 
            !formData.startDate || !formData.endDate || !formData.paymentMethod
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={!formData.donorId || !formData.studentId || !formData.monthlyAmount || 
                    !formData.startDate || !formData.endDate || !formData.paymentMethod}
        >
          Pay Now
        </button>
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(e);
        }}></form>
      </form>
    </div>
     <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </AdminDashboard>
  );
};

export default SponsorshipForm;