import { useState, useEffect } from "react";
import { getSponsoredStudents } from "../../../api/institutionApi";
import { SearchOutlined, ReloadOutlined,ExclamationCircleOutlined  } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const SponsoredStudents = () => {
    const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 20,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    fetchSponsoredStudents(0);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const fetchSponsoredStudents = async (page) => {
    try {
      setLoading(true);
      setError("");
      const response = await getSponsoredStudents(page);
      
      if (response && Array.isArray(response.content)) {
        setStudents(response.content);
        setPagination({
          pageNumber: response.pageable?.pageNumber || page,
          pageSize: response.size || response.pageable?.pageSize || 20,
          totalPages: response.totalPages || 1,
          totalElements: response.totalElements || 0,
          first: response.first || true,
          last: response.last || true
        });
      } else {
        console.error("Unexpected API response format:", response);
        setError("Failed to load students data");
        setStudents([]);
      }
    } catch (error) {
      console.error("Failed to fetch sponsored students:", error);
      setError("Failed to load sponsored students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchSponsoredStudents(newPage);
    }
  };

  // Function to check if paidUpTo date is expired
  const isPaymentExpired = (paidUpToDate) => {
    if (!paidUpToDate) return true; // If no date, consider expired
    
    const paidUpTo = new Date(paidUpToDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
    
    return paidUpTo < today;
  };

  // Function to get student thumbnail
    // Get student thumbnail - WITH ERROR HANDLING
const getStudentThumbnail = (student) => {
  if (student.photoUrl) {
    return (
      <div className="relative">
        <img 
          src={student.photoUrl} 
          alt={student.studentName}
          className="w-20 h-35 rounded-full object-cover border border-gray-200"
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

  // Format date with red color if expired
  const formatDateWithExpiry = (dateString) => {
    if (!dateString) return <span className="text-red-600">N/A</span>;
    
    const isExpired = isPaymentExpired(dateString);
    const formattedDate = new Date(dateString).toLocaleDateString('en-BD');
    
    return (
      <span className={isExpired ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
        {formattedDate}
        {isExpired && " ⚠️ Payment is Due"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => fetchSponsoredStudents(0)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-blue-600 text-white flex items-center justify-between px-4 py-3 rounded-t-lg">
        <h1 className="font-semibold text-sm md:text-base">Institution Portal | Sponsored Students</h1>
        <button className="text-xs md:text-sm bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100">
          Logout
        </button>
      </div>

      <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow-sm rounded-lg p-4 text-center border">
          <div className="text-xl font-bold text-gray-800">
            {pagination?.totalElements || 24}
          </div>
          <div className="text-sm text-gray-600">Total Sponsored</div>
        </div>
          <div className="bg-white shadow-sm rounded-lg p-4 text-center border">
          <div className="text-xl font-bold text-gray-800">
             ৳ 25,250
          </div>
          <div className="text-sm text-gray-600">Monthly Received</div>
          <div className="text-sm font-semibold text-green-600 mt-1">
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 text-center border">
          <div className="text-xl font-bold text-gray-800">
            ৳ 39,250
          </div>
          <div className="text-sm text-gray-600">Total Received</div>
          <div className="text-sm font-semibold text-green-600 mt-1">
            
          </div>
        </div>
      </div>

      {/* Search + Filters */}
        <div className="bg-white shadow-sm rounded-lg p-4 border">
        {/* Search bar */}
        <input
            type="text"
            placeholder="Search students..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />

        {/* Filters */}
        <div className="flex gap-3">
            <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
            <option value="all">All Classes</option>
            <option value="class-2">Class 2</option>
            <option value="class-3">Class 3</option>
            <option value="class-4">Class 4</option>
            </select>

            <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            </select>
        </div>
        </div>


    </div>

      {/* Mobile View - Card Layout */}
      {isMobile && (
        <div className="mt-4 space-y-3">
          {students.map((student) => (
            <div key={student.studentId} className="bg-white shadow-sm rounded-lg p-4">
              {/* Student Header */}
              <div className="flex items-center gap-3 mb-3">
                {typeof getStudentThumbnail(student) === 'string' ? (
                  <img
                    src={getStudentThumbnail(student)}
                    alt={student.studentName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  getStudentThumbnail(student)
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {student.studentName}
                  </h3>
                  <p className="text-xs text-gray-600">{student.contactNumber}</p>
                  <p className="text-xs text-gray-600">Guardian: {student.guardianName}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.fullySponsored 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {student.fullySponsored ? "Fully Sponsored" : "Partial"}
                </span>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="font-medium">Class:</span> {student.class || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Financial Rank:</span> {student.financial_rank}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {student.gender}
                </div>
                <div>
                  <span className="font-medium">DOB:</span> {new Date(student.dob).toLocaleDateString('en-BD')}
                </div>
              </div>

          {/* Financial Info */}
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium">Monthly Need: ৳{student.requiredMonthlySupport}</span>
                  <span className="text-xs font-medium text-green-600">Received: ৳{student.sponsoredAmount}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded mb-1">
                  <div
                    className="bg-blue-600 h-2 rounded transition-all duration-300"
                    style={{ 
                      width: `${Math.min((student.sponsoredAmount / student.requiredMonthlySupport) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {Math.min((student.sponsoredAmount / student.requiredMonthlySupport) * 100, 100).toFixed(1)}% Funded
                  </span>
                  {student.sponsoredAmount >= student.requiredMonthlySupport && (
                    <span className="text-xs font-bold text-green-600">✓ Fully Funded</span>
                  )}
                </div>
              </div>

             {/* Sponsor Info */}
                {student.sponsors && student.sponsors.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-lg mb-2 text-justify">Sponsor Information:</h4>
                    {student.sponsors.map((sponsor, index) => {
                    const isExpired = isPaymentExpired(sponsor.paidUpTo);
                    
                    return (
                        <div key={index} className="text-xs space-y-1 text-justify border-b border-blue-100 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                        <p><span className="font-medium text-justify">Name:</span> {sponsor.donorName}</p>
                        <p><span className="font-medium">Last Payment Date:</span> {sponsor.lastPaymentDate}</p>
                        <p><span className="font-medium">Last Payment Total Months:</span> {sponsor.totalMonths}</p>
                        <p><span className="font-medium">Total Paid:</span> {sponsor.monthsPaid}/months</p>
                        <p><span className="font-medium">Status:</span> {sponsor.status}</p>
                        <p>
                            <span className="font-medium">Paid Upto:</span>{" "}
                            {formatDateWithExpiry(sponsor.paidUpTo)} 
                        </p>
                        {sponsor.nextPaymentDueDate && (
                            <p>
                            <span className="font-medium">Next due:</span>{" "}
                            {formatDateWithExpiry(sponsor.nextPaymentDueDate)} 
                            </p>
                        )}
                        
                        {isExpired && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                            <ExclamationCircleOutlined className="text-yellow-600 mr-2 mt-0.5" />
                            <div>
                                <p className="text-yellow-700 font-medium">Donor hasn't made payment yet</p>
                                <p className="text-yellow-600 text-xs mt-1">Status will update automatically when payment is received</p>
                            </div>
                            </div>
                        )}
                        </div>
                    );
                    })}
                </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Desktop View - Table Layout */}
      {!isMobile && (
        <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Financial Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsorship Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sponsor Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    {/* Student Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStudentThumbnail(student)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.contactNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.guardianName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Information Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.gender}</div>
                      <div className="text-sm text-gray-500">
                        DOB: {new Date(student.dob).toLocaleDateString('en-BD')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.address}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.institutionName}
                      </div>
                    </td>

                    {/* Financial Details Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ৳ {student.requiredMonthlySupport}/Monthly
                      </div>
                      <div className="text-sm text-gray-500">
                        Financial Rank: {student.financial_rank}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Received: ৳ {student.sponsoredAmount}
                      </div>
                    </td>

                    {/* Sponsorship Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.fullySponsored 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {student.fullySponsored ? "Fully Sponsored" : "Not Sponsored"}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        {student.sponsored ? "Active" : ""}
                      </div>
                    </td>

                    {/* Sponsor Details Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.sponsors && student.sponsors.length > 0 ? (
                        student.sponsors.map((sponsor, index) => {
                          const isExpired = isPaymentExpired(sponsor.paidUpTo);
                          
                          return (
                            <div key={index} className="mb-2 last:mb-0 text-justify text-lg">
                              <div className="text-sm  text-gray-900">
                                {sponsor.donorName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ৳ {sponsor.monthlyAmount}/month
                              </div>
                               <div className="text-sm text-gray-500 ">
                                Last Payment Date: {sponsor.lastPaymentDate}
                              </div>
                               <div className="text-sm text-gray-500">
                                Last Payment Total Month: {sponsor.totalMonths}
                              </div>
                              <div className="text-sm text-gray-500">
                                 Total Paid: {sponsor.monthsPaid}/months
                              </div>
                              <div className="text-sm text-gray-500">
                                Status: {sponsor.status}
                              </div>
                              <div className={`text-sm ${isExpired ? "text-red-600 font-medium" : "text-gray-500"}`}>
                                Paid Upto: {formatDateWithExpiry(sponsor.paidUpTo)}
                                {isExpired && " "}
                              </div>
                              {sponsor.nextPaymentDueDate && (
                                <div className="text-sm text-blue-600">
                                  Next due: {formatDateWithExpiry(sponsor.nextPaymentDueDate)}
                                </div>
                              )}
                              {isExpired && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                            <ExclamationCircleOutlined className="text-yellow-600 mr-2 mt-0.5" />
                            <div>
                                <p className="text-yellow-700 font-medium">Donor hasn't made payment yet</p>
                                <p className="text-yellow-600 text-xs mt-1">Status will update automatically when payment is received</p>
                            </div>
                            </div>
                        )}
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-sm text-gray-500">No active sponsor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.pageNumber * pagination.pageSize) + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}
                  </span> of{" "}
                  <span className="font-medium">{pagination.totalElements}</span> students
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.first}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pagination.first
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={pagination.last}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pagination.last
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
      )}

      {/* Empty state */}
      {students.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-4">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-600">
            No sponsored students found
          </h3>
          <p className="text-gray-500">Try adjusting your filters</p>
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

export default SponsoredStudents;