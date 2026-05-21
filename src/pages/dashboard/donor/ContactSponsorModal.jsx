import React, { useState, useEffect } from "react";
import { createSponsorship } from "../../../api/sponsorshipApi";
import PaymentModalManual from "../donor/PaymentModalManual";

const ContactSponsorModal = ({ student, onClose, onSponsor }) => {
  const [paymentModalManualOpen, setPaymentModalManualOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [isExistingSponsor, setIsExistingSponsor] = useState(false);
  const [existingSponsorshipId, setExistingSponsorshipId] = useState(null); // ✅ NEW STATE

  useEffect(() => {
    if (student) {
      // Check if this is an existing sponsorship
      const existingSponsor = student.sponsored || student.sponsorshipStatus === 'COMPLETED' || false;
      setIsExistingSponsor(existingSponsor);
      
      // ✅ Fetch existing sponsorship ID if it's an existing sponsor
      if (existingSponsor && student.studentId) {
        fetchExistingSponsorshipId(student.studentId);
      }
      
      if (existingSponsor) {
        // Calculate payment status...
        const now = new Date();
        const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const paidUpTo = student.paidUpTo 
          ? new Date(student.paidUpTo) 
          : new Date(2025, 2, 31);
        const paidMonth = new Date(paidUpTo.getFullYear(), paidUpTo.getMonth(), 1);
        const monthDiff = (currentDate.getFullYear() - paidMonth.getFullYear()) * 12 + 
                         (currentDate.getMonth() - paidMonth.getMonth());
        
        let statusText = "Awaiting Payment";
        let unpaidText = "";
        
        if (monthDiff > 0) {
          unpaidText = `${monthDiff} month(s) unpaid including current month`;
          statusText = "Payment Due";
        } else {
          statusText = "Payment Completed";
          unpaidText = "All payments up to date";
        }
        
        setPaymentStatus({
          paidUpTo: paidUpTo.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          currentDate: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          status: statusText,
          unpaidMonths: unpaidText,
          amount: student.requiredMonthlySupport || 5000
        });
      }
    }
  }, [student]);

  // ✅ NEW FUNCTION: Fetch existing sponsorship ID
  const fetchExistingSponsorshipId = async (studentId) => {
    try {
      const donorData = localStorage.getItem('donorData');
      let donorId = null;
      if (donorData) {
        const parsedData = JSON.parse(donorData);
        donorId = parsedData.donorId || parsedData.id;
      }
      
      if (donorId) {
        const response = await fetch(
            `https://server.skyschooling.com/api/sponsorships/existwith?donorId=${donorId}&studentId=${studentId}`
          );
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            console.log('✅ Found existing sponsorship ID:', data.id);
            setExistingSponsorshipId(data.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching sponsorship ID:', error);
    }
  };

  const getCurrentDonorId = () => {
    const donorData = localStorage.getItem('donorData');
    if (donorData) {
      const parsedData = JSON.parse(donorData);
      return parsedData.donorId || parsedData.id;
    }
    return 1;
  };

 const handleSponsorClick = async () => {
  let sponsorshipId = student.sponsorshipId;// ✅ Use existing sponsorship ID if available

  if (isExistingSponsor && !sponsorshipId) {
    sponsorshipId = student.sponsorshipId;
    console.log('Existing sponsor detected. Using sponsorship ID:', sponsorshipId);
  }

  if (isExistingSponsor && !sponsorshipId) {
    alert('Sponsorship ID not found');
    return;
  }

  setSelectedStudent(student);
  setPaymentModalManualOpen(true);
};

  if (!student) return null;

  // Rest of your existing code...
  const sponsoredAmount = Number(student.sponsoredAmount || student.totalPaidAmount || 0);
  const required = Number(student.requiredMonthlySupport || student.monthlyAmount || 5000);
  const financialRank = student.financial_rank || student.financialRank || "Poor";
  const institutionName = student.institutionName || "Jamalul Madha";
  const teacherName = student.institutions?.teacherName || student.institutionTeacherName || "Abdul Karim";

  const getProgressPercentage = () => {
    if (!required) return 0;
    return Math.min(100, (sponsoredAmount / required) * 100);
  };

  const formatCurrency = (val) =>
    `${(val || 0).toLocaleString()} Taka`;

  const normalizeForTel = (num) => {
    if (!num) return "#";
    const cleaned = num.replace(/[^+\d]/g, "");
    return `tel:${cleaned}`;
  };

  const normalizeForWhatsApp = (num) => {
    if (!num) return "#";
    let digits = num.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  };

  const adminContact = "+1 (917) 257-4204";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-[360px] max-h-[95vh] overflow-y-auto shadow-lg border border-gray-200">
          {/* Header */}
          <div className="relative p-3 border-b border-gray-200 sticky top-0 bg-white z-20">
            <div className="flex items-start gap-3">
              <img
                src={student.photoUrl || student.avatar || "/placeholder-avatar.png"}
                alt={student.studentName || student.name || "Student"}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="text-sm font-semibold leading-5">
                  {student.studentName || student.name}
                </h3>
                <p className="text-[12px] text-gray-600 mt-0.5">
                  Class {student.grade || "N/A"} | Financial Rank:{" "}
                  <span className="font-medium text-red-700">{financialRank}</span>
                </p>
              </div>
            </div>

            {isExistingSponsor ? (
              <span className="absolute right-3 top-3 text-[11px] px-2 py-0.5 rounded-full shadow-sm bg-green-600 text-white">
                Sponsored
              </span>
            ) : (
              <span className="absolute right-3 top-3 text-[11px] px-2 py-0.5 rounded-full shadow-sm bg-red-400 text-white">
                Not Sponsored
              </span>
            )}
          </div>

          {/* Body - Your existing body content */}
          <div className="p-3">
            {/* Monthly requirement / progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[13px]">
                <div className="text-gray-600">Monthly Requirement:</div>
                <div className="font-medium">{formatCurrency(required)}</div>
              </div>

              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-600"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-gray-600">
                  <div>Sponsored Amount:</div>
                  <div className="font-medium">{formatCurrency(sponsoredAmount)}</div>
                </div>
                <div className="mt-1 text-[11px] text-gray-600 text-right">
                  {getProgressPercentage().toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Payment Status - Only show for existing sponsors */}
            {isExistingSponsor && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                <div className="flex items-start mb-2">
                  <div className="text-amber-800 text-sm w-full">
                    <div className="font-medium mb-1">Payment Status</div>
                    <div className="text-xs mb-2">{paymentStatus.unpaidMonths || "Current month pending"}</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className="text-amber-700 font-medium">Paid Upto:</span>
                      </div>
                      <div className="text-green-600 font-medium">
                        {paymentStatus.paidUpTo || "Not paid yet"}
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-amber-700 font-medium">Current Date:</span>
                      </div>
                      <div className="text-amber-800">
                        {new Date().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information block - Your existing content */}
            <div className="pt-2 pb-1 border-t border-gray-100">
              <h4 className="text-[13px] font-medium mb-2 text-justify">Contact Information</h4>

              <div className="mb-3 text-justify">
                <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded text-justify">
                  <span className="text-[12px] text-gray-600">Institute Name: </span>
                  {institutionName}
                </div>
              </div>

              <div className="mb-3 text-sm text-justify">
                <div className="flex">
                  <div className="w-32 text-gray-600">Contact Person</div>
                  <div className="flex-1">{teacherName}</div>
                </div>
                <div className="flex mt-2">
                  <div className="w-32 text-gray-600">Designation</div>
                  <div className="flex-1">{student.institutionTeacherDesignation || "Teacher"}</div>
                </div>
                <div className="flex mt-2 items-center">
                  <div className="w-32 text-gray-600">Contact Phone</div>
                  <div className="flex-1 flex items-center gap-1">
                    <a href={normalizeForTel(student.institutionPhone || student.contactNumber)} className="text-blue-600 text-sm">
                      {student.institutionPhone || student.contactNumber}
                    </a>
                    <a href={normalizeForWhatsApp(student.institutionPhone || student.contactNumber)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                        <path d="M20.52 3.48A11.89 11.89 0 0012 0C5.373 0 0 5.373 0 12a11.9 11.9 0 001.64 6.03L0 24l5.11-1.61A11.9 11.9 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5c-1.41 0-2.79-.37-4.01-1.07l-.29-.17-3.04.96.97-2.96-.18-.31A9.47 9.47 0 012.5 12c0-5.25 4.25-9.5 9.5-9.5S21.5 6.75 21.5 12 17.25 21.5 12 21.5z" />
                        <path d="M17.1 14.04c-.29-.14-1.72-.85-1.99-.95-.27-.11-.47-.14-.67.14-.2.28-.77.95-.94 1.15-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.33-1.44-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.59.13-.12.29-.34.44-.51.15-.17.2-.29.3-.48.1-.19.05-.35-.02-.49-.07-.14-.67-1.61-.92-2.2-.24-.58-.49-.50-.67-.51-.17-.01-.37-.01-.57-.01-.19 0-.50.07-.76.35-.26.28-.98.96-.98 2.34 0 1.38 1.01 2.72 1.15 2.91.14.19 1.98 3.03 4.80 4.24 1.25.52 2.23.83 3.01 1.06 1.27.37 2.43.32 3.34.19.99-.14 3.07-1.25 3.50-2.46.44-1.22.44-2.26.31-2.46-.13-.20-.47-.32-.99-.46-.52-.13-2.03-.74-2.34-.82z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 text-sm">
                <div className="text-gray-600 mb-2">For any query:</div>
                <div className="flex items-center gap-5">
                  <div className="text-gray-600">Contact Admin:</div>
                  <div className="flex gap-1 items-center">
                    <a href={normalizeForTel(adminContact)} className="text-blue-600 font-medium">
                      {adminContact}
                    </a>
                    <a href={normalizeForWhatsApp(adminContact)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                        <path d="M20.52 3.48A11.89 11.89 0 0012 0C5.373 0 0 5.373 0 12a11.9 11.9 0 001.64 6.03L0 24l5.11-1.61A11.9 11.9 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5c-1.41 0-2.79-.37-4.01-1.07l-.29-.17-3.04.96.97-2.96-.18-.31A9.47 9.47 0 012.5 12c0-5.25 4.25-9.5 9.5-9.5S21.5 6.75 21.5 12 17.25 21.5 12 21.5z" />
                        <path d="M17.1 14.04c-.29-.14-1.72-.85-1.99-.95-.27-.11-.47-.14-.67.14-.2.28-.77.95-.94 1.15-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.33-1.44-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.59.13-.12.29-.34.44-.51.15-.17.2-.29.3-.48.1-.19.05-.35-.02-.49-.07-.14-.67-1.61-.92-2.2-.24-.58-.49-.50-.67-.51-.17-.01-.37-.01-.57-.01-.19 0-.50.07-.76.35-.26.28-.98.96-.98 2.34 0 1.38 1.01 2.72 1.15 2.91.14.19 1.98 3.03 4.80 4.24 1.25.52 2.23.83 3.01 1.06 1.27.37 2.43.32 3.34.19.99-.14 3.07-1.25 3.50-2.46.44-1.22.44-2.26.31-2.46-.13-.20-.47-.32-.99-.46-.52-.13-2.03-.74-2.34-.82z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex items-center gap-3 sticky bottom-0 bg-white z-30">
            <button
              onClick={onClose}
              className="w-28 px-4 py-2 rounded-md bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>

            <button
              onClick={handleSponsorClick}
              className="flex-1 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {isExistingSponsor ? "Pay This Student" : "Sponsor This Student"}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Payment Modal with sponsorshipId */}
      {paymentModalManualOpen && (
        <PaymentModalManual
          student={selectedStudent}
          isExistingSponsor={isExistingSponsor}
         sponsorshipId={selectedStudent?.sponsorshipId}
         paymentId={selectedStudent?.paymentId}
          onClose={() => setPaymentModalManualOpen(false)}
          onPayment={onSponsor}
        />
      )}
    </>
  );
};

export default ContactSponsorModal;