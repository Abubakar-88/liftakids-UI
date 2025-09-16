import React, { useState, useEffect } from 'react';
import { processPayment, createSponsorship } from '../../../api/sponsorshipApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
const PaymentCheckoutPage = ({ sponsoredData, onBack, onPaymentSuccess, isExistingSponsor = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [donorData, setDonorData] = useState(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem('donorData');
      if (data) setDonorData(JSON.parse(data));
    } catch (e) {
      console.error('Failed to parse donorData', e);
    }
  }, []);

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    if (!formData.expiryDate.trim() || !formData.expiryDate.includes('/')) {
      newErrors.expiryDate = 'Valid expiry date is required';
    }
    if (!formData.cvc.trim() || formData.cvc.length !== 3) {
      newErrors.cvc = 'Valid CVC is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      let sponsorshipId = sponsoredData.student.id || null;
      let isNewSponsorship = false;
      console.log("sponsorshipId at start:", sponsorshipId);
      // If not existing sponsor, create a new sponsorship first
      if (!isExistingSponsor && !sponsorshipId) {
        try {
          // Get the correct student ID
          const studentId = sponsoredData.student.studentId || sponsoredData.student.id;
          if (!studentId) {
            throw new Error('Student ID not found in sponsorship data');
          }
          
          const sponsorshipPayload = {
            donorId: donorData?.donorId || null,
            studentId: studentId,
            startDate: `${sponsoredData.period.from.year}-${String(sponsoredData.period.from.month).padStart(2, '0')}-01`,
            endDate: `${sponsoredData.period.to.year}-${String(sponsoredData.period.to.month).padStart(2, '0')}-01`,
            paymentMethod: sponsoredData.paymentMethod.toUpperCase(),
            monthlyAmount: sponsoredData.student.requiredMonthlySupport || sponsoredData.student.monthlyAmount
          };

          console.log('Creating sponsorship with payload:', JSON.stringify(sponsorshipPayload, null, 2));
          
          const sponsorshipResponse = await createSponsorship(sponsorshipPayload);
          console.log('Sponsorship creation response:', sponsorshipResponse);
          
          // Check if this is a new sponsorship or existing one
          if (sponsorshipResponse.message && sponsorshipResponse.message.includes('already exists')) {
            // Use existing sponsorship
            sponsorshipId = sponsorshipResponse.id;
            console.log('Using existing sponsorship ID:', sponsorshipId);
          } else {
            // This is a new sponsorship
            sponsorshipId = sponsorshipResponse.id;
            isNewSponsorship = true;
            console.log('New sponsorship created with ID:', sponsorshipId);
          }
        } catch (createError) {
          console.error('Sponsorship creation failed:', createError);
          console.error('Error details:', createError.response?.data);
          
          // If it's an "already exists" error, try to extract the ID
          if (createError.response?.data?.message?.includes('already exists') && createError.response.data.id) {
            sponsorshipId = createError.response.data.id;
            console.log('Using existing sponsorship ID from error:', sponsorshipId);
          } else {
            throw createError;
          }
        }
      }

      // Process payment for both new and existing sponsorships
      const paymentPayload = {
        sponsorshipId: sponsorshipId || null,
        startDate: `${sponsoredData.period.from.year}-${String(sponsoredData.period.from.month).padStart(2, '0')}`,
        endDate: `${sponsoredData.period.to.year}-${String(sponsoredData.period.to.month).padStart(2, '0')}`,
        amount: sponsoredData.amount,
        paymentMethod: sponsoredData.paymentMethod.toUpperCase(),
        cardDetails: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryMonth: formData.expiryDate.split('/')[0],
          expiryYear: `20${formData.expiryDate.split('/')[1]}`,
          cvv: formData.cvc,
          cardHolderName: `${formData.firstName} ${formData.lastName}`
        }
      };

      console.log('Processing payment with payload:', JSON.stringify(paymentPayload, null, 2));
      
      try {
        const paymentResponse = await processPayment(paymentPayload.sponsorshipId, paymentPayload);
        // const paymentResponse = await processPayment(paymentPayload);
        console.log('Payment processing response:', paymentResponse);
        
        onPaymentSuccess({
          ...paymentResponse,
          sponsorshipId: sponsorshipId || null,
          isNewSponsorship: isNewSponsorship
        });
        
        toast.success(`Payment successful! ${isNewSponsorship ? 'Thank you for sponsoring.' : 'Sponsorship updated.'}`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        
      } catch (paymentError) {
        console.error('Payment processing failed:', paymentError);
        console.error('Payment error details:', paymentError.response?.data);
        
        // If payment fails and we created a new sponsorship, we might want to handle it
        if (isNewSponsorship) {
          console.warn('Payment failed after creating new sponsorship. Sponsorship ID:', sponsorshipId);
        }
        
        throw paymentError;
      }
      
    } catch (error) {
      console.error('Overall payment process failed:', error);
      
      let errorMessage = 'Payment processing failed. Please try again.';
      let errorDetails = '';
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        errorDetails = error.response.data ? JSON.stringify(error.response.data) : '';
        
        if (error.response.status === 400) {
          errorMessage = 'Bad request. Please check your information.';
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.status === 404) {
          if (error.response.data && error.response.data.includes('Student not found')) {
            errorMessage = 'Student not found. Please refresh the page and try again.';
          } else if (error.response.data && error.response.data.includes('Sponsorship not found')) {
            errorMessage = 'Sponsorship not found. Please try creating the sponsorship again.';
          }
        } else if (error.response.status === 409) {
          errorMessage = 'Sponsorship already exists for this period.';
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setErrors({ 
        submit: errorMessage,
        details: errorDetails 
      });
      
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format period display
  const formatPeriod = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const fromMonth = monthNames[sponsoredData.period.from.month - 1];
    const toMonth = monthNames[sponsoredData.period.to.month - 1];
    
    return `${fromMonth} ${sponsoredData.period.from.year} to ${toMonth} ${sponsoredData.period.to.year}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-blue-50 p-5 border-b">
          <h1 className="text-xl font-bold text-gray-800 text-center">
            {isExistingSponsor ? 'Continue Sponsoring' : 'Sponsor'} {sponsoredData.student.studentName || sponsoredData.student.name}
          </h1>
          {isExistingSponsor ? (
            <p className="text-sm text-green-600 text-center mt-1">
              Existing sponsorship • Updating payment
            </p>
          ) : (
            <p className="text-sm text-blue-600 text-center mt-1">
              New sponsorship • Initial payment
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Payment Summary */}
          <div className="mb-6 text-center">
            <div className="text-sm text-gray-600 mb-1">Pay Amount</div>
            <div className="text-2xl font-bold text-blue-700">
              {sponsoredData.amount.toLocaleString()} Taka
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Period: {formatPeriod()}
            </div>
            <div className="text-sm text-gray-500">
              {sponsoredData.months} Month{sponsoredData.months !== 1 ? 's' : ''}
            </div>
            {isExistingSponsor ? (
              <div className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-md">
                Only unpaid months will be charged
              </div>
            ) : (
              <div className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded-md">
                This will create a new sponsorship
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* Credit Card Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Credit Card Details</h2>
            
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="First Name"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Last Name"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">E-mail (optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="email@example.com"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setFormData(prev => ({ ...prev, cardNumber: formatted }));
                }}
                maxLength={19}
                className={`w-full p-2 border rounded-md ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="1234 1234 1234 1234"
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">MM/YY</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setFormData(prev => ({ ...prev, expiryDate: formatted }));
                  }}
                  maxLength={5}
                  className={`w-full p-2 border rounded-md ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="MM/YY"
                />
                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">CVC</label>
                <input
                  type="text"
                  name="cvc"
                  value={formData.cvc}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, cvc: digits.slice(0, 3) }));
                  }}
                  maxLength={3}
                  className={`w-full p-2 border rounded-md ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="CVC"
                />
                {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
                {errors.details && (
                  <p className="text-red-500 text-xs mt-1">{errors.details}</p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-5 py-4 flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            disabled={isProcessing}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            type='submit'
            disabled={isProcessing}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : (isExistingSponsor ? 'Submit Payment' : 'Create & Pay')}
          </button>
        </div>
        
        <ToastContainer 
          position="bottom-center"  
          autoClose={5000}         
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;