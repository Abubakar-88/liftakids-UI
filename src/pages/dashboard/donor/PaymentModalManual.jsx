import React, { useState, useEffect } from 'react';
import PaymentCheckoutPage from './PaymentCheckoutPage';
import { createSponsorship } from '../../../api/sponsorshipApi';

const PaymentModalManual = ({ student, onClose, onPayment, isExistingSponsor = false, sponsorshipId = null }) => {
    const [showCheckout, setShowCheckout] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [paidMonthsList, setPaidMonthsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedMonths, setSelectedMonths] = useState({
    from: { month: currentMonth, year: currentYear },
    to: { month: currentMonth, year: currentYear },
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerFor, setPickerFor] = useState('from');

  // Payment methods configuration
  const paymentMethods = {
    remitly: {
      name: 'Remitly',
      website: 'https://www.remitly.com',
      instructions: 'Please send the exact recommended amount to avoid processing delays.'
    },
    taptap: {
      name: 'TapTap Send',
      website: 'https://www.taptapsend.com',
      instructions: 'Ensure you send the recommended amount for proper sponsorship allocation.'
    },
    payment_link: {
      name: 'Payment Link',
      website: '#',
      instructions: 'You will receive a payment link via email. Please complete the payment with the recommended amount.'
    }
  };

  // Calculate paid months based on paidUpTo date
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (student && (isExistingSponsor || sponsorshipId)) {
        setLoading(true);
        
        try {
          let url = '';
          
          if (isExistingSponsor && sponsorshipId) {
            url = `https://liftakids.onrender.com/LiftAKids/api/sponsorships/${sponsorshipId}/payments`;
          } else if (student.id) {
            url = `https://liftakids.onrender.com/LiftAKids/api/sponsorships/student/${student.studentId}/payments`;
          }
          
          if (url) {
            const response = await fetch(url);
            if (response.ok) {
              const payments = await response.json();
              calculatePaidMonths(payments);
            }
          }
        } catch (error) {
          console.error('Error fetching payment history:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPaymentHistory();
  }, [student, isExistingSponsor, sponsorshipId]);
  
const calculatePaidMonths = (payments) => {
    const paidMonths = new Set();
    
    payments.forEach(payment => {
      try {
        const startDate = new Date(payment.startDate);
        const endDate = new Date(payment.endDate);
        
        let current = new Date(startDate);
        while (current <= endDate) {
          const year = current.getFullYear();
          const month = current.getMonth() + 1;
          paidMonths.add(`${year}-${String(month).padStart(2, '0')}`);
          
          // Move to next month
          current.setMonth(current.getMonth() + 1);
        }
      } catch (e) {
        console.error('Error processing payment date range:', e);
      }
    });
    
    setPaidMonthsList(Array.from(paidMonths));
  };

  if (!student) return null;

  const fromDate = new Date(selectedMonths.from.year, selectedMonths.from.month - 1);
  const toDate = new Date(selectedMonths.to.year, selectedMonths.to.month - 1);

  // ---- Paid month helpers ----
  const isMonthPaid = (month, year) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    return paidMonthsList.includes(key);
  };

  const getUnpaidMonthsCount = () => {
    if (fromDate > toDate) return 0;
    let count = 0;
    let cursor = new Date(fromDate);
    while (cursor <= toDate) {
      const month = cursor.getMonth() + 1;
      const year = cursor.getFullYear();
      if (!isMonthPaid(month, year)) count++;
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return count;
  };

  const totalMonths = getUnpaidMonthsCount();
  const monthlyAmount = student.requiredMonthlySupport || student.monthlyAmount || 0;
  const totalAmount = monthlyAmount * totalMonths;

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleMonthSelect = (month, year) => {
    // Don't allow selection of paid months
    if (isMonthPaid(month, year)) return;
    
    if (pickerFor === 'from') {
      setSelectedMonths({ ...selectedMonths, from: { month, year } });
    } else {
      setSelectedMonths({ ...selectedMonths, to: { month, year } });
    }
    setShowMonthPicker(false);
    if (validationError) setValidationError('');
  };

  const openMonthPicker = (forField) => {
    setPickerFor(forField);
    setShowMonthPicker(true);
  };

  const formatMonthDisplay = (monthData) =>
    `${monthNames[monthData.month - 1]} ${monthData.year}`;

  const validateForm = () => {
    setValidationError('');

    if (!paymentMethod) {
      setValidationError('Please select a payment method');
      return false;
    }
    if (fromDate > toDate) {
      setValidationError('End date must be after start date');
      return false;
    }
    if (totalMonths === 0) {
      if (fromDate <= toDate) {
        setValidationError('All selected months are already paid. Please select a different range.');
      } else {
        setValidationError('Please select at least one month');
      }
      return false;
    }
    return true;
  };
const getCurrentDonorId = () => {
  const donorData = localStorage.getItem('donorData');
  if (donorData) {
    try {
      const parsedData = JSON.parse(donorData);
      return parsedData.donorId || parsedData.id || 1;
    } catch (error) {
      console.error('Error parsing donor data:', error);
      return 1;
    }
  }
  return 1; // Fallback for testing
};
// PaymentModalManual.jsx - complete handlePayNow function
const handlePayNow = async () => {
  if (!validateForm()) return;

  try {
    setLoading(true);

    // ✅ Step 1: Create sponsorship if new sponsor
    let currentSponsorshipId = sponsorshipId;
    
    if (!isExistingSponsor) {
      const sponsorshipData = {
        studentId: student.studentId,
        donorId: getCurrentDonorId(),
        startDate: `${selectedMonths.from.year}-${String(selectedMonths.from.month).padStart(2, '0')}`,
        endDate: `${selectedMonths.to.year}-${String(selectedMonths.to.month).padStart(2, '0')}`,
        monthlyAmount: monthlyAmount,
        paymentMethod: 'MANUAL',
        status: 'PENDING'
      };

      const response = await createSponsorship(sponsorshipData);
      currentSponsorshipId = response.data.id; // Assuming API returns sponsorship ID
      console.log('New sponsorship created:', currentSponsorshipId);
    }

    // ✅ Step 2: Show payment instructions
    setShowPaymentInstructions(true);
    
  } catch (error) {
    console.error('Error in payment process:', error);
    alert('Failed to process sponsorship. Please try again.');
  } finally {
    setLoading(false);
  }
};

//   const handlePayNow = () => {
//     if (!validateForm()) return;

//     // Show payment instructions instead of immediate redirect
//     setShowPaymentInstructions(true);
//   };

  const handleProceedToPayment = () => {
    const paymentInfo = {
      student,
      months: totalMonths,
      amount: totalAmount,
      paymentMethod,
      period: { from: selectedMonths.from, to: selectedMonths.to },
      // Include sponsorshipId for existing sponsors
      sponsorshipId: isExistingSponsor ? sponsorshipId : null
    };

    setPaymentData(paymentInfo);
    
    // Redirect to payment website based on selected method
    if (paymentMethod === 'remitly') {
      window.open('https://www.remitly.com', '_blank');
    } else if (paymentMethod === 'taptap') {
      window.open('https://www.taptapsend.com', '_blank');
    } else if (paymentMethod === 'payment_link') {
      // For payment link, you might want to show a different message
      // or handle it differently since it's not an immediate redirect
      console.log('Payment link would be sent via email');
    }
    
    //setShowCheckout(true);
    setShowPaymentInstructions(false);
  };

  const handlePaymentSuccess = (response) => {
    setShowCheckout(false);
    setPaymentData(null);
    if (onPayment) onPayment(response);
    onClose();
  };

  const handleClose = () => {
    setShowCheckout(false);
    setShowPaymentInstructions(false);
    setPaymentData(null);
    setValidationError('');
    onClose();
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
    setPaymentData(null);
  };

  const handleBackFromInstructions = () => {
    setShowPaymentInstructions(false);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (validationError) setValidationError('');
  };

  // Payment Instructions Modal
  if (showPaymentInstructions) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-auto overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-blue-50 p-5 border-b">
            <h2 className="text-xl font-bold text-gray-800 text-center">
              Payment Instructions - {paymentMethods[paymentMethod]?.name}
            </h2>
            {/* <p className="text-sm text-gray-600 text-center mt-1">
            For: <span className="font-semibold text-blue-700">{student.studentName || student.name}</span>
          </p> */}
          </div>

        <div className="p-5">
          {/* Student Name - Copyable */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-1">Student Name</h3>
                <p className="text-lg font-bold text-blue-700">{student.studentName || student.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Include this name in payment reference/notes
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(student.studentName || student.name);
                  // Optional: Show a success message
                  const copyBtn = document.getElementById('copyStudentNameBtn');
                  if (copyBtn) {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copied!';
                    setTimeout(() => {
                      copyBtn.innerHTML = originalText;
                    }, 2000);
                  }
                }}
                id="copyStudentNameBtn"
                className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>
          </div>
          {/* Content */}
          <div className="p-5">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-yellow-800 text-sm mb-1">Important Notice</h3>
                  <p className="text-yellow-700 text-sm">
                    {paymentMethods[paymentMethod]?.instructions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-800 text-sm mb-2">Recommended Amount</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ৳{totalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">
                  For {totalMonths} month{totalMonths > 1 ? 's' : ''} ({formatMonthDisplay(selectedMonths.from)} to {formatMonthDisplay(selectedMonths.to)})
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Monthly: ৳{monthlyAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 text-sm mb-2">Next Steps</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You will be redirected to {paymentMethods[paymentMethod]?.name}</li>
                <li>• Send exactly <strong>৳{totalAmount.toLocaleString()}</strong></li>
                <li>• Include student name in payment reference</li>
                <li>• Keep your transaction receipt</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-5 py-4 flex justify-between">
            <button
              onClick={handleBackFromInstructions}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleProceedToPayment}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Proceed to {paymentMethods[paymentMethod]?.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

return (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
    {showCheckout && paymentData ? (
      <PaymentCheckoutPage
        sponsoredData={paymentData}
        onBack={handleBackFromCheckout}
        onPaymentSuccess={handlePaymentSuccess}
        isExistingSponsor={isExistingSponsor}
      />
    ) : (
      <div className="bg-white rounded-lg w-full max-w-md mx-auto overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-blue-50 p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800 text-center">
            {isExistingSponsor ? 'Continue Sponsoring' : 'Sponsor'} {student.studentName || student.name}
          </h2>
          {isExistingSponsor && (
            <p className="text-sm text-green-600 text-center mt-1">
              Existing sponsorship • Adding payment
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* loading state */}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading payment data...</p>
            </div>
          )}

          {/* Monthly Requirement */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Requirement:</span>
              <span className="font-bold text-lg text-blue-700">
                {(student.requiredMonthlySupport || student.monthlyAmount || 0)?.toLocaleString()} Taka
              </span>
            </div>
          </div>

          {/* Current Date */}
          <div className="mb-6 text-sm text-gray-500 text-center">
            Current Date: <span className='text-blue-500 font-bold'>{formattedDate}</span>
          </div>

          {/* Paid Up To Date - Only show for existing sponsors */}
          {isExistingSponsor && (
            <div className="mb-6 text-sm text-center text-gray-500">
              Paid Up To:{' '}
              <span className='text-red-500 font-bold'>
                {student.paidUpTo || 'N/A'}
              </span>
            </div>
          )}

          {/* Month Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Select Sponsorship Period</h3>

            {/* From Month */}
            <div className="flex items-center mb-4">
              <label className="block text-sm text-gray-600 w-24">From Month:</label>
              <div
                className="flex-1 p-2 border border-gray-300 rounded-md cursor-pointer bg-white flex items-center justify-between"
                onClick={() => openMonthPicker('from')}
              >
                <span className={
                  isMonthPaid(selectedMonths.from.month, selectedMonths.from.year) 
                    ? 'text-red-500' 
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

            {/* To Month */}
            <div className="flex items-center mb-4">
              <label className="block text-sm text-gray-600 w-24">To Month:</label>
              <div
                className="flex-1 p-2 border border-gray-300 rounded-md cursor-pointer bg-white flex items-center justify-between"
                onClick={() => openMonthPicker('to')}
              >
                <span className={
                  isMonthPaid(selectedMonths.to.month, selectedMonths.to.year) 
                    ? 'text-red-500' 
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

            {/* Total Months & Amount */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Months:</span>
                <span className="flex-1 font-medium p-2 border border-gray-300 rounded-md flex items-center ml-2">{totalMonths}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-blue-700 flex-1 font-medium p-2 border border-gray-300 rounded-md flex items-center ml-2">
                  ৳{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Info message based on sponsor type */}
            {isExistingSponsor ? (
              <div className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                Only unpaid months will be charged
              </div>
            ) : (
              <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                This will create a new sponsorship and process the first payment
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Select Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="remitly"
                  checked={paymentMethod === 'remitly'}
                  onChange={() => handlePaymentMethodChange('remitly')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Remitly</span>
                  <p className="text-xs text-gray-500 mt-1">Send money through Remitly platform</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="taptap"
                  checked={paymentMethod === 'taptap'}
                  onChange={() => handlePaymentMethodChange('taptap')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">TapTap Send</span>
                  <p className="text-xs text-gray-500 mt-1">Transfer via TapTap Send service</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="payment_link"
                  checked={paymentMethod === 'payment_link'}
                  onChange={() => handlePaymentMethodChange('payment_link')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Payment Link</span>
                  <p className="text-xs text-gray-500 mt-1">Receive payment link via email</p>
                </div>
              </label>
            </div>
          </div>

          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{validationError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-4 flex justify-between">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayNow}
            disabled={!paymentMethod || totalMonths === 0 || loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled: cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Pay Now'}
          </button>
        </div>

        {/* Month Picker */}
        {showMonthPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-5 w-64">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    const yr = pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year;
                    const newYear = yr - 1;
                    if (pickerFor === 'from') {
                      setSelectedMonths({ ...selectedMonths, from: { ...selectedMonths.from, year: newYear } });
                    } else {
                      setSelectedMonths({ ...selectedMonths, to: { ...selectedMonths.to, year: newYear } });
                    }
                  }}
                  className="p-2"
                >
                  &lt;&lt;
                </button>
                <span className="font-bold">
                  {pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year}
                </span>
                <button
                  onClick={() => {
                    const yr = pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year;
                    const newYear = yr + 1;
                    if (pickerFor === 'from') {
                      setSelectedMonths({ ...selectedMonths, from: { ...selectedMonths.from, year: newYear } });
                    } else {
                      setSelectedMonths({ ...selectedMonths, to: { ...selectedMonths.to, year: newYear } });
                    }
                  }}
                  className="p-2"
                >
                  &gt;&gt;
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((m, i) => {
                  const num = i + 1;
                  const yr = pickerFor === 'from' ? selectedMonths.from.year : selectedMonths.to.year;
                  const selected =
                    pickerFor === 'from'
                      ? selectedMonths.from.month === num && selectedMonths.from.year === yr
                      : selectedMonths.to.month === num && selectedMonths.to.year === yr;
                  const paid = isMonthPaid(num, yr);

                  return (
                    <button
                      key={m}
                      onClick={() => handleMonthSelect(num, yr)}
                      className={`p-2 rounded-md text-sm ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : paid
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      disabled={paid}
                      title={paid ? 'Already paid' : `Select ${m} ${yr}`}
                    >
                      {m}
                      {paid && <span className="ml-1 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowMonthPicker(false)}
                className="mt-4 w-full py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
};

export default PaymentModalManual;