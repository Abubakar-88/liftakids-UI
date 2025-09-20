import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDonorPayments } from '../../../api/sponsorshipApi';

const DonorPaymentHistory = () => {
  const { donorId } = useParams();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [groupedPayments, setGroupedPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState({});

  useEffect(() => {
    if (donorId) {
      fetchPayments();
    }
  }, [donorId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getDonorPayments(donorId);
      setPayments(data);
      
      // Group payments by student
      const grouped = data.reduce((acc, payment) => {
        if (!acc[payment.studentName]) {
          acc[payment.studentName] = [];
        }
        acc[payment.studentName].push(payment);
        return acc;
      }, {});
      
      setGroupedPayments(grouped);
      setError(null);
    } catch (err) {
      setError('Failed to fetch payment history');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentExpansion = (studentName) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentName]: !prev[studentName]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate total for a student
  const calculateStudentTotal = (payments) => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <div className="text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
              <p className="text-gray-600">Donor ID: {donorId}</p>
            </div>
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
          <div className="w-20 h-1 bg-blue-600 mt-4"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sponsored Students</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedPayments).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student-wise Payment Groups */}
        <div className="space-y-6">
          {Object.keys(groupedPayments).length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500">No payment history found</p>
            </div>
          ) : (
            Object.entries(groupedPayments).map(([studentName, studentPayments]) => (
              <div key={studentName} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Student Header */}
                <div 
                  className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleStudentExpansion(studentName)}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{studentName}</h3>
                      <p className="text-sm text-gray-500">{studentPayments[0].institutionName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <p className="text-sm text-gray-500">Total Paid</p>
                      <p className="font-bold text-gray-900">{formatCurrency(calculateStudentTotal(studentPayments))}</p>
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedStudents[studentName] ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Student Payments (Collapsible) */}
                {expandedStudents[studentName] && (
                  <div className="divide-y divide-gray-200">
                    {studentPayments.map((payment) => (
                      <div key={payment.id} className="px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(payment.paymentDate)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500 text-justify">
                              <div>
                                <span className="font-medium text-justify">Period:</span> {payment.paidPeriod}
                              </div>
                              <div>
                                <span className="font-medium text-justify">Method:</span> {payment.paymentMethod.replace('_', ' ')}
                              </div>
                              {payment.transactionId && (
                                <div className="sm:col-span-2">
                                  <span className="font-medium">Transaction ID:</span> 
                                  <span className="font-mono ml-1 bg-gray-100 px-2 py-1 rounded text-xs">
                                    {payment.transactionId}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payment.totalMonths} month{payment.totalMonths !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorPaymentHistory;