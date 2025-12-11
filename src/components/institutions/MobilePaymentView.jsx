import React from 'react';
import SearchableDropdown from '../../components/institutions/SearchableDropdown';
const MobilePaymentView = ({
  pendingPayments,
  filteredPending,
  students,
  filteredCompleted,
  studentPaymentHistory,
  loadingStudentHistory,
  expandedStudents,
  activeTab,
  filters,
  selectedPayment,
  formData,
  loading,
  institutionData,
  
  // Functions
  setActiveTab,
  setFilters,
  setSelectedPayment,
  setFormData,
  fetchData,
  toggleStudent,
  expandAllStudents,
  collapseAllStudents,
  loadStudentPaymentHistory,
  handleConfirmPayment,
  handleStudentSearch,
  formatAmount,
  formatDate,
  calculateStudentTotals,
  getUniqueDonors,
  getPaymentMethods
}) => {


   const handleMobileConfirmPayment = async () => {
    if (!formData.receiptNumber || !formData.receivedAmount) {
      alert('Please fill required fields: Receipt Number and Received Amount');
      return;
    }

    try {
      const confirmationData = {
        paymentId: selectedPayment.id,
        receiptNumber: formData.receiptNumber,
        receiptDate: formData.receiptDate,
        receivedAmount: parseFloat(formData.receivedAmount),
        receivedDate: formData.receivedDate,
        transactionId: formData.transactionId,
        notes: formData.notes,
        confirmedBy: institutionData?.institutionName || 'Institution'
      };

      await handleConfirmPayment(confirmationData); // Main component এর function use করছে
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment: ' + (error.response?.data?.message || error.message));
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <h1 className="text-lg font-bold text-gray-800">Payment Management</h1>
              <p className="text-xs text-gray-600">Manage payments and view history</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Stats Cards - Mobile */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-xl font-bold text-gray-800">{pendingPayments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-xl font-bold text-gray-800">{students.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters Section - Mobile */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Students</h2>
          <div className="grid grid-cols-1 gap-4">
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

            <div>
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

        {/* Tab Navigation - Mobile */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 min-w-[140px] py-3 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>Pending</span>
                  <span className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredPending.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 min-w-[140px] py-3 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>History</span>
                  <span className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredCompleted.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {/* Pending Payments Tab - Mobile */}
            {activeTab === 'pending' && (
              <div>
                <div className="flex flex-col gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Pending Payments ({pendingPayments.length})
                  </h2>
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                {filteredPending.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {pendingPayments.length === 0 ? 'No pending payment sponsorships' : 'No sponsorships match your filters'}
                    </h3>
                    <p className="text-gray-500 text-sm px-4">
                      {pendingPayments.length === 0 
                        ? 'All sponsorships have received payments or no sponsorships are pending.' 
                        : 'Try adjusting your filters to see more results.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPending.map(sponsorship => (
                      <div key={sponsorship.id} className="bg-white border-l-4 border-orange-500 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                          <div>
                            <div className="font-semibold text-gray-700 mb-2 text-sm">Student Information</div>
                            <div className="text-gray-900 font-medium text-base">{sponsorship.studentName}</div>
                            <div className="text-gray-600 text-xs mt-1">ID: {sponsorship.studentId}</div>
                            <div className="text-gray-500 text-xs">Contact: {sponsorship.contactNumber}</div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="font-semibold text-gray-700 mb-2 text-sm">Donor Information</div>
                            <div className="text-gray-900 font-medium">{sponsorship.donorName}</div>
                            <div className="text-gray-600 text-xs capitalize mt-1">{sponsorship.paymentMethod?.toLowerCase()}</div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <div className="font-semibold text-gray-700 mb-2 text-sm">Payment Details</div>
                            <div className="text-orange-600 font-bold text-lg">
                              ৳{formatAmount(sponsorship.monthlyAmount)}/month
                            </div>
                            <div className="text-xs text-orange-600 font-medium mt-2 bg-orange-50 px-2 py-1 rounded inline-block">
                              {sponsorship.status}
                            </div>
                          </div>
                          
                          <div className="border-t pt-3 flex justify-center">
                            <button
                              onClick={() => setSelectedPayment(sponsorship)}
                              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Record Payment
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Payments Tab - Mobile */}
            {activeTab === 'completed' && (
              <div>
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Student Payment History
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">
                      {filteredCompleted.length} students found
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={expandAllStudents}
                      className="flex-1 min-w-[120px] px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllStudents}
                      className="flex-1 min-w-[120px] px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Collapse All
                    </button>
                    <button
                      onClick={fetchData}
                      className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>

                {filteredCompleted.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg">
                    <div className="text-gray-400 text-4xl mb-4">👨‍🎓</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      No Students Found
                    </h3>
                    <p className="text-gray-500 text-sm px-4">
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
                      
                      return (
                        <div key={student.studentId} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          {/* Student Header - Mobile */}
                          <div 
                            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
                            onClick={() => toggleStudent(student.studentId)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start mb-3">
                                  <span className={`transform transition-transform duration-300 mr-3 mt-1 ${
                                    expandedStudents.has(student.studentId) ? 'rotate-90' : ''
                                  }`}>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </span>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                                      {student.studentName}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="text-xs bg-white text-blue-800 px-2 py-1 rounded-full font-medium border border-blue-200">
                                        Class: {student.grade || student.className || 'N/A'}
                                      </span>
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        {totals.totalPayments} payments
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 ml-7">
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="truncate">ID: {student.studentId}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="truncate">{student.contactNumber || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right ml-2">
                                <div className="mb-1">
                                  <div className="text-lg font-bold text-green-600">
                                    ৳{formatAmount(totals.totalAmount)}
                                  </div>
                                  <div className="text-xs text-gray-600">Total</div>
                                </div>
                              </div>
                            </div>

                            {/* Summary Stats - Mobile */}
                            <div className="flex flex-wrap gap-2 mt-3 ml-7">
                              <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-xs">
                                <div className="text-xs text-gray-500">Payments</div>
                                <div className="text-sm font-bold text-blue-600">{totals.totalPayments}</div>
                              </div>
                              
                              <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-xs">
                                <div className="text-xs text-gray-500">Donors</div>
                                <div className="text-sm font-bold text-purple-600">{uniqueDonors.length}</div>
                              </div>
                            </div>
                          </div>

                          {/* Individual Payments List - Mobile */}
                          {expandedStudents.has(student.studentId) && (
                            <div className="border-t border-gray-200">
                              <div className="p-4">
                                <div className="flex flex-col gap-3 mb-4">
                                  <h4 className="text-base font-semibold text-gray-800">
                                    Payment History for {student.studentName}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      Student ID: {student.studentId}
                                    </span>
                                    <button
                                      onClick={() => loadStudentPaymentHistory(student.studentId, student.studentName)}
                                      disabled={loadingStudentHistory}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 flex items-center"
                                    >
                                      {loadingStudentHistory ? (
                                        <>
                                          <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-600 mr-1"></div>
                                          Loading...
                                        </>
                                      ) : (
                                        'Refresh'
                                      )}
                                    </button>
                                  </div>
                                </div>
                                
                                {!studentHistory ? (
                                  <div className="text-center py-6">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600 text-sm">Loading payment history...</p>
                                  </div>
                                ) : studentHistory.error ? (
                                  <div className="text-center py-6 text-red-500 bg-red-50 rounded-lg">
                                    <div className="text-red-400 text-2xl mb-2">❌</div>
                                    <h5 className="font-medium text-red-600 mb-1 text-sm">Error Loading History</h5>
                                    <button
                                      onClick={() => loadStudentPaymentHistory(student.studentId, student.studentName)}
                                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                    >
                                      Try Again
                                    </button>
                                  </div>
                                ) : payments.length === 0 ? (
                                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                    <div className="text-gray-400 text-2xl mb-2">📝</div>
                                    <h5 className="font-medium text-gray-600 mb-1 text-sm">No Payment History</h5>
                                    <p className="text-xs">No completed payments found</p>
                                    <button
                                      onClick={() => loadStudentPaymentHistory(student.studentId, student.studentName)}
                                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                    >
                                      Check Again
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {payments
                                      .sort((a, b) => new Date(b.receivedDate || b.paymentDate || 0) - new Date(a.receivedDate || a.paymentDate || 0))
                                      .map((payment, index) => (
                                      <div key={payment.id || index} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                                        <div className="space-y-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="text-xs font-medium text-gray-700 mb-1">Donor</div>
                                              <div className="text-gray-900 font-semibold text-sm">{payment.donorName || 'Unknown Donor'}</div>
                                              {payment.paymentMethod && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                  <span className="capitalize bg-gray-100 px-1 py-0.5 rounded">{payment.paymentMethod.toLowerCase()}</span>
                                                </div>
                                              )}
                                            </div>
                                            <div className="text-right">
                                              <div className="text-xs font-medium text-gray-700 mb-1">Amount</div>
                                              <div className="text-green-600 font-bold text-base">
                                                ৳{formatAmount(payment.amount || payment.receivedAmount || 0)}
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                              <div className="font-medium text-gray-700 mb-1">Receipt</div>
                                              <div className="text-gray-900 font-mono">{payment.receiptNumber || 'N/A'}</div>
                                              <div className="text-gray-600">
                                                {formatDate(payment.receivedDate || payment.paymentDate)}
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <div className="font-medium text-gray-700 mb-1">Transaction</div>
                                              {payment.transactionId ? (
                                                <div className="text-gray-900 font-mono bg-gray-100 px-1 py-0.5 rounded truncate">{payment.transactionId}</div>
                                              ) : (
                                                <div className="text-gray-400">No transaction ID</div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <div>
                                              <div className="text-xs font-medium text-gray-700 mb-1">Confirmed By</div>
                                              <div className="text-gray-900 font-medium text-xs">{payment.confirmedBy || 'System'}</div>
                                            </div>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                              CONFIRMED
                                            </span>
                                          </div>
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

        {/* Mobile Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-0 z-50">
            <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Confirm Payment
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">
                      Verify payment details
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 text-base">Payment Summary</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 font-medium">Student</div>
                      <div className="font-medium text-gray-900 text-base">{selectedPayment.studentName}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Donor</div>
                      <div className="font-medium text-gray-900 text-base">{selectedPayment.donorName}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Amount Due</div>
                      <div className="font-medium text-green-600 text-base">{formatAmount(selectedPayment.amount)} Taka</div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-base">Payment Receipt Details</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
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
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl sticky bottom-0">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleMobileConfirmPayment}
                    disabled={!formData.receiptNumber || !formData.receivedAmount}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirm Payment
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
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

export default MobilePaymentView;