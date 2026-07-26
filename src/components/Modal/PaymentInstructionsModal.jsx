import React from 'react';

const PaymentInstructionsModal = ({
  paymentMethod,
  paymentMethods,
  student,
  totalAmount,
  totalMonths,
  selectedMonths,
  monthlyAmount,
  formatMonthDisplay,
  handleBackFromInstructions,
  handleProceedToPayment,
   isExistingSponsor,
  onClose,
}) => {

  return (
     <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 z-50 overflow-y-auto">
    <div className="bg-white rounded-lg w-full max-w-md mx-auto overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-blue-50 p-4 border-b sticky top-0 z-10">
        <h2 className="text-lg font-bold text-gray-800 text-center">
          {paymentMethod 
            ? `Payment Instructions - ${paymentMethods[paymentMethod]?.name}`
            : 'Payment Confirmation'}
        </h2>
      </div>

      {/* Content - Dynamic height */}
      <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
        {/* Student Name - Simplified */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Student Name</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(student.studentName || student.name);
                  // Show temporary success
                  const btn = document.getElementById('copyBtn');
                  if (btn) {
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                      btn.textContent = 'Copy';
                    }, 2000);
                  }
                }}
                id="copyBtn"
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <p className="text-base font-bold text-blue-700 break-words">{student.studentName || student.name}</p>
            <p className="text-xs text-gray-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Include in payment reference
            </p>
          </div>
        </div>
          
            {/* Content - Conditional based on paymentMethod */}
            {paymentMethod && paymentMethods[paymentMethod] ? (
              // Payment method specific instructions
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-yellow-800 text-sm mb-1">Important Notice</h3>
                      <p className="text-yellow-700 text-sm">
                        {paymentMethods[paymentMethod]?.instructions || 'Please complete your payment'}
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
                    <li>• You will be redirected to {paymentMethods[paymentMethod]?.name || 'payment gateway'}</li>
                    <li>• Send exactly <strong>৳{totalAmount.toLocaleString()}</strong></li>
                    <li>• Include student name in payment reference</li>
                    <li>• Keep your transaction receipt</li>
                  </ul>
                </div>

                 <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">OR</span>
                  </div>
                </div>
                  {/* Institution Contact Message */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mt-2">
                  <div className="flex items-center mb-3">
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full mr-2">📞</span>
                    <span className="text-xs font-semibold text-purple-700">ACTION REQUIRED</span>
                  </div>
                  
                <p className="text-sm font-bold text-purple-800 mb-3 text-center">
                    {isExistingSponsor
                        ? `Please contact ${student.institutionName || 'the institution'} and complete the payment to continue your sponsorship`
                        : `Please contact ${student.institutionName || 'the institution'} and complete the payment to start your sponsorship`
                    }
                    </p>
                  
                  {/* Institution Contact Info */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-purple-100">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">🏫 {student.institutionName || 'Institution'} Contact:</h4>
                    
                    {/* Phone Number */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="bg-green-100 p-1 rounded-full mr-2">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </span>
                        <span className="text-xs text-gray-600">Phone:</span>
                      </div>
                      <a href={`tel:${student.institutionPhone || '+8801712345678'}`} className="text-sm font-medium text-purple-700 hover:text-purple-900">
                        {student.institutionPhone || '+880 1712-345678'}
                      </a>
                    </div>
                    
                    {/* WhatsApp Link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-green-100 p-1 rounded-full mr-2">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </span>
                        <span className="text-xs text-gray-600">WhatsApp:</span>
                      </div>
                      <a 
                        href={`https://wa.me/${student.institutionWhatsApp || '8801712345678'}?text=Hello%2C%20I%20want%20to%20complete%20my%20sponsorship%20payment%20for%20${student.studentName || 'a student'}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center"
                      >
                        <span>Chat on WhatsApp</span>
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${student.institutionPhone || '+8801712345678'}`}
                      className="bg-purple-600 text-white text-sm py-3 rounded-md hover:bg-purple-700 transition-colors font-medium text-center"
                    >
                      📞 Call {student.institutionName || 'Institution'}
                    </a>
                    <a
                      href={`https://wa.me/${student.institutionWhatsApp || '8801712345678'}?text=Hello%2C%20I%20want%20to%20complete%20my%20sponsorship%20payment%20for%20${student.studentName || 'a student'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white text-sm py-3 rounded-md hover:bg-green-700 transition-colors font-medium text-center"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Institution will guide you through the payment process
                  </p>
                </div>
                


              </>
            ) : (
              // Generic confirmation message (when no payment method selected)
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                    {isExistingSponsor
                        ? 'Payment Request Submitted Successfully!'
                        : 'Sponsorship Created Successfully!'}
                    </h3>
                <p className="text-green-700 mb-4">
                    {isExistingSponsor
                        ? 'Your payment request has been submitted successfully. Please complete the payment to continue your sponsorship.'
                        : 'Your sponsorship request has been created. You will be contacted shortly with payment instructions.'}
                    </p>
                <div className="bg-white rounded-lg p-4 mb-4 text-left">
                  <p className="text-gray-600 mb-2 font-medium">{isExistingSponsor ? 'Payment Details' : 'Sponsorship Details'}</p>
                  <p className="text-gray-800 mb-1">• Amount: ৳{totalAmount.toLocaleString()}</p>
                  <p className="text-gray-800 mb-1">• Period: {formatMonthDisplay(selectedMonths.from)} to {formatMonthDisplay(selectedMonths.to)}</p>
                  <p className="text-gray-800">• Monthly: ৳{monthlyAmount.toLocaleString()}</p>
                </div>
                
                {/* Institution Contact Message */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mt-2">
                  <div className="flex items-center mb-3">
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full mr-2">📞</span>
                    <span className="text-xs font-semibold text-purple-700">ACTION REQUIRED</span>
                  </div>
                  
                  <p className="text-sm font-bold text-purple-800 mb-3 text-center">
                    Please contact {student.institutionName || 'the institution'} and complete the payment to start your sponsorship
                  </p>
                  
                  {/* Institution Contact Info */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-purple-100">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">🏫 {student.institutionName || 'Institution'} Contact:</h4>
                    
                    {/* Phone Number */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="bg-green-100 p-1 rounded-full mr-2">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </span>
                        <span className="text-xs text-gray-600">Phone:</span>
                      </div>
                      <a href={`tel:${student.institutionPhone || '+8801712345678'}`} className="text-sm font-medium text-purple-700 hover:text-purple-900">
                        {student.institutionPhone || '+880 1712-345678'}
                      </a>
                    </div>
                    
                    {/* WhatsApp Link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="bg-green-100 p-1 rounded-full mr-2">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </span>
                        <span className="text-xs text-gray-600">WhatsApp:</span>
                      </div>
                      <a 
                        href={`https://wa.me/${student.institutionWhatsApp || '8801712345678'}?text=Hello%2C%20I%20want%20to%20complete%20my%20sponsorship%20payment%20for%20${student.studentName || 'a student'}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center"
                      >
                        <span>Chat on WhatsApp</span>
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${student.institutionPhone || '+8801712345678'}`}
                      className="bg-purple-600 text-white text-sm py-3 rounded-md hover:bg-purple-700 transition-colors font-medium text-center"
                    >
                      📞 Call {student.institutionName || 'Institution'}
                    </a>
                    <a
                      href={`https://wa.me/${student.institutionWhatsApp || '8801712345678'}?text=Hello%2C%20I%20want%20to%20complete%20my%20sponsorship%20payment%20for%20${student.studentName || 'a student'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white text-sm py-3 rounded-md hover:bg-green-700 transition-colors font-medium text-center"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Institution will guide you through the payment process
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-5 py-4 flex justify-between">
            <button
              onClick={handleBackFromInstructions}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            
            {paymentMethod && paymentMethods[paymentMethod] ? (
              <button
                onClick={handleProceedToPayment}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Proceed to {paymentMethods[paymentMethod]?.name}
              </button>
            ) : (
            <button
                    onClick={() => {
                        handleBackFromInstructions();
                        onClose();
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                    Close
                    </button>
            )}
          </div>
        </div>
      </div>
    );
};

export default PaymentInstructionsModal;