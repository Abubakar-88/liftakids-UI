// components/Modal/InsitutionManage/PaymentHistoryTab.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaHistory, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { searchPayments } from '../../../api/InstitutionManage/feeApi';
import ReceiptModal from './ReceiptModal';

const FEE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'MONTHLY', label: 'Monthly Fee' },
  { value: 'FOOD', label: 'Food Fee' },
  { value: 'ADMISSION', label: 'Admission Fee' },
  { value: 'EXAM', label: 'Exam Fee' }
];

const PaymentHistoryTab = ({ classes, institutionId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    classId: '', feeType: '', fromDate: '', toDate: ''
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => { fetchPayments(); }, [currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await searchPayments(institutionId, {
        classId: filters.classId || null,
        feeType: filters.feeType || null,
        fromDate: filters.fromDate || null,
        toDate: filters.toDate || null,
        page: currentPage,
        size: 10
      });
      setPayments(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { setCurrentPage(0); fetchPayments(); };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={filters.classId}
              onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
            <select
              value={filters.feeType}
              onChange={(e) => setFilters({ ...filters, feeType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {FEE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date" value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date" value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2 text-sm"
            >
              <FaSearch /> Search
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-teal-600" /> Payment Records
          </h3>
          <span className="text-sm text-gray-500">{totalElements} total</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{p.receiptNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{p.studentName}</p>
                      <p className="text-xs text-gray-500">{p.studentClass}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.feeTypeDisplay || p.feeType}
                      {p.discountAmount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                          -৳{parseFloat(p.discountAmount).toFixed(0)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.paymentDate}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      ৳{parseFloat(p.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setReceiptData(p); setShowReceipt(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">Page {currentPage + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded border disabled:opacity-40"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded border disabled:opacity-40"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {showReceipt && receiptData && (
        <ReceiptModal
          receipt={receiptData}
          bulkReceipts={[]}
          onClose={() => { setShowReceipt(false); setReceiptData(null); }}
        />
      )}
    </div>
  );
};

export default PaymentHistoryTab;