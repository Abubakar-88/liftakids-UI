// components/Modal/InsitutionManage/ReceiptModal.jsx
import React, { useRef } from 'react';
import { FaTimes, FaPrint, FaCheckCircle } from 'react-icons/fa';

const ReceiptModal = ({ receipt, bulkReceipts = [], onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const original = document.body.innerHTML;
    document.body.innerHTML = content;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  const SingleReceipt = ({ data }) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
    <div className="text-center border-b pb-4 mb-4">
      <h2 className="text-xl font-bold text-gray-800">Lift A Kid</h2>
      <p className="text-xs text-gray-500">Fee Payment Receipt</p>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Receipt No:</span>
        <span className="font-mono font-semibold">{data.receiptNumber}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Date:</span>
        <span>{data.paymentDate}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Student:</span>
        <span className="font-medium">{data.studentName}</span>
      </div>
      {data.studentClass && (
        <div className="flex justify-between">
          <span className="text-gray-500">Class:</span>
          <span>{data.studentClass}</span>
        </div>
      )}
      {data.guardianName && (
        <div className="flex justify-between">
          <span className="text-gray-500">Guardian:</span>
          <span>{data.guardianName}</span>
        </div>
      )}

      <hr className="my-3" />

      <div className="flex justify-between">
        <span className="text-gray-500">Fee Type:</span>
        <span className="font-medium">{data.feeTypeDisplay || data.feeType}</span>
      </div>
      {data.feeMonth && (
        <div className="flex justify-between">
          <span className="text-gray-500">Period:</span>
          <span>
            {new Date(data.feeYear, data.feeMonth - 1).toLocaleString('default', { month: 'long' })} {data.feeYear}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-gray-500">Payment Method:</span>
        <span>{data.paymentMethod}</span>
      </div>

      {/* ===== Amount Breakdown ===== */}
      <div className="mt-4 pt-3 border-t-2 border-gray-300 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Original Amount:</span>
          <span className="font-medium">
            ৳{parseFloat(data.originalAmount || data.amount).toFixed(2)}
          </span>
        </div>

        {/* Discount */}
        {parseFloat(data.discountAmount || 0) > 0 && (
          <div className="flex justify-between text-sm text-orange-600 bg-orange-50 -mx-2 px-2 py-1 rounded">
            <span>
              🎁 Discount{' '}
              {data.discountType === 'PERCENTAGE'
                ? `(${data.discountValue}%)`
                : data.discountType === 'FIXED'
                ? '(Fixed)'
                : ''}
              :
            </span>
            <span className="font-semibold">
              - ৳{parseFloat(data.discountAmount).toFixed(2)}
            </span>
          </div>
        )}

        {/* Total Paid */}
        <div className="flex justify-between items-center pt-2 border-t border-dashed">
          <span className="text-gray-800 font-semibold">Total Paid:</span>
          <span className="text-2xl font-bold text-green-600">
            ৳{parseFloat(data.amount).toFixed(2)}
          </span>
        </div>
      </div>
    </div>

    <div className="mt-6 pt-4 border-t border-dashed text-center text-xs text-gray-400">
      <p>Thank you for your payment!</p>
      <p className="mt-1">Collected by: {data.collectedBy || 'System'}</p>
    </div>
  </div>
);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2 text-green-600">
            <FaCheckCircle /> Payment Successful
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          <div ref={printRef} className="space-y-4">
            {receipt && <SingleReceipt data={receipt} />}
            {bulkReceipts.map((r, i) => (
              <div key={i} className="page-break-after">
                <SingleReceipt data={r} />
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;