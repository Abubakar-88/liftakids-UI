// components/Modal/InsitutionManage/FeeCollectionModal.jsx
import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaSearch, FaUserCheck, FaReceipt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { searchStudentsForAdmission } from '../../../api/InstitutionManage/studentAdmissionApi';
import { getStudentsFeeStatusByClass } from '../../../api/InstitutionManage/feeApi';
import { collectPayment, collectBulkPayment } from '../../../api/InstitutionManage/feeApi';
import ReceiptModal from './ReceiptModal';

const FEE_TYPES = [
  { value: 'MONTHLY', label: 'Monthly Fee' },
  { value: 'FOOD', label: 'Food Fee' },
  { value: 'ADMISSION', label: 'Admission Fee' },
  { value: 'EXAM', label: 'Exam Fee' },
  { value: 'OTHER', label: 'Other Fee' }
];

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const FeeCollectionModal = ({ classes, institutionId }) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    feeType: 'MONTHLY',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    feeMonth: new Date().getMonth() + 1,
    feeYear: new Date().getFullYear(),
    paymentMethod: 'CASH',
    transactionId: '',
    remarks: ''
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [bulkReceipts, setBulkReceipts] = useState([]);
 const [paymentMode, setPaymentMode] = useState('FULL'); // FULL | PARTIAL
  const [selectedStudentStatus, setSelectedStudentStatus] = useState(null);

  useEffect(() => {
    if (selectedClassId) fetchStudentsWithFeeStatus();
    else { setStudents([]); setFiltered([]); }
  }, [selectedClassId]);

 // ⬇️ When a single student is selected, auto-fill amount
  useEffect(() => {
    if (selectedStudents.length === 1) {
      const student = selectedStudents[0];
      const status = student.feeStatuses?.find(fs => fs.feeType === formData.feeType);
      setSelectedStudentStatus(status || null);

      if (status) {
        // Auto-fill: suggestedAmount = remaining due
        setFormData(prev => ({
          ...prev,
          amount: status.dueAmount > 0 ? status.dueAmount : '',
        }));
      }
    } else {
      setSelectedStudentStatus(null);
    }
  }, [selectedStudents, formData.feeType]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(students);
    } else {
      const t = searchTerm.toLowerCase();
      setFiltered(students.filter(s =>
        s.studentName?.toLowerCase().includes(t) ||
        s.guardianName?.toLowerCase().includes(t) ||
        s.contactNumber?.toLowerCase().includes(t)
      ));
    }
  }, [searchTerm, students]);

  const fetchStudentsWithFeeStatus = async () => {
    setLoading(true);
    try {
      const data = await getStudentsFeeStatusByClass(selectedClassId, institutionId);
      setStudents(data || []);
      setFiltered(data || []);
      setSelectedStudents([]);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (student) => {
    setSelectedStudents(prev => {
      const exists = prev.some(s => s.studentId === student.studentId);
      return exists
        ? prev.filter(s => s.studentId !== student.studentId)
        : [...prev, student];
    });
  };

  const toggleAll = () => {
    if (selectedStudents.length === filtered.length) setSelectedStudents([]);
    else setSelectedStudents(filtered);
  };

  // Auto-fill amount based on selected student's fee status
  useEffect(() => {
    if (selectedStudents.length === 1) {
      const status = selectedStudents[0].feeStatuses?.find(
        fs => fs.feeType === formData.feeType
      );
      if (status && status.amount) {
        setFormData(f => ({ ...f, amount: status.amount }));
      }
    }
  }, [selectedStudents, formData.feeType]);

  // ⬇️ Payment mode change
  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    if (!selectedStudentStatus) return;

    if (mode === 'FULL') {
      setFormData(prev => ({ ...prev, amount: selectedStudentStatus.dueAmount }));
    } else {
      setFormData(prev => ({ ...prev, amount: '' }));
    }
  };


  const handleCollect = async () => {
      if (selectedStudents.length === 0) {
      toast.warning('Select at least one student');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      toast.warning('Enter a valid amount');
      return;
    }

    // Partial payment check for single student
    if (selectedStudents.length === 1 && selectedStudentStatus) {
      if (amt > selectedStudentStatus.dueAmount) {
        toast.warning(`Amount cannot exceed due (৳${selectedStudentStatus.dueAmount})`);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (selectedStudents.length === 1) {
        const payload = {
          studentId: selectedStudents[0].studentId,
          feeType: formData.feeType,
          amount: parseFloat(formData.amount),
          paymentDate: formData.paymentDate,
          feeMonth: formData.feeType === 'MONTHLY' ? formData.feeMonth : null,
          feeYear: formData.feeType === 'MONTHLY' ? formData.feeYear : null,
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId,
          remarks: formData.remarks
        };
        const resp = await collectPayment(payload, institutionId);
        setReceiptData(resp);
        setBulkReceipts([]);
        setShowReceipt(true);
        toast.success('Payment collected!');
      } else {
        const payload = {
          studentIds: selectedStudents.map(s => s.studentId),
          feeType: formData.feeType,
          amountPerStudent: parseFloat(formData.amount),
          paymentDate: formData.paymentDate,
          feeMonth: formData.feeType === 'MONTHLY' ? formData.feeMonth : null,
          feeYear: formData.feeType === 'MONTHLY' ? formData.feeYear : null,
          paymentMethod: formData.paymentMethod,
          remarks: formData.remarks
        };
        const resp = await collectBulkPayment(payload, institutionId);
        setBulkReceipts(resp || []);
        setReceiptData(null);
        setShowReceipt(true);
        toast.success(`${resp.length} payments collected!`);
      }

      setSelectedStudents([]);
      fetchStudentsWithFeeStatus();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to collect payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Class & Fee Config */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class *</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.className} {c.section ? `(${c.section})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
            <select
              value={formData.feeType}
              onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {FEE_TYPES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳) *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., 500"
            />
          </div>

          {formData.feeType === 'MONTHLY' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={formData.feeMonth}
                  onChange={(e) => setFormData({ ...formData, feeMonth: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.feeYear}
                  onChange={(e) => setFormData({ ...formData, feeYear: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="CASH">Cash</option>
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="ROCKET">Rocket</option>
              <option value="BANK">Bank</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Optional note"
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      {selectedClassId && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Selected: <strong>{selectedStudents.length}</strong> / {filtered.length}
              </span>
              <button
                onClick={handleCollect}
                disabled={submitting || selectedStudents.length === 0}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaMoneyBillWave /> Collect ({selectedStudents.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No students found</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 text-teal-600"
                />
                <span className="text-sm font-medium text-gray-700">Select All</span>
              </label>

              {filtered.map(student => {
                const currentStatus = student.feeStatuses?.find(fs => fs.feeType === formData.feeType);
                const isSelected = selectedStudents.some(s => s.studentId === student.studentId);

                return (
                  <div
                    key={student.studentId}
                    onClick={() => toggleSelect(student)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                      isSelected ? 'bg-teal-50 border-teal-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(student)}
                      className="h-4 w-4 text-teal-600"
                    />
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm flex-shrink-0">
                      {student.studentName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{student.studentName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        Guardian: {student.guardianName || 'N/A'} • {student.contactNumber}
                      </p>
                    </div>
                    {currentStatus && (
                      <div className="text-right text-xs">
                        <div className={`px-2 py-0.5 rounded-full font-medium ${
                          currentStatus.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          currentStatus.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {currentStatus.status}
                        </div>
                        {currentStatus.dueAmount > 0 && (
                          <p className="text-red-600 mt-1">
                            Due: ৳{parseFloat(currentStatus.dueAmount).toFixed(0)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          receipt={receiptData}
          bulkReceipts={bulkReceipts}
          onClose={() => {
            setShowReceipt(false);
            setReceiptData(null);
            setBulkReceipts([]);
          }}
        />
      )}
    </div>
  );
};

export default FeeCollectionModal;