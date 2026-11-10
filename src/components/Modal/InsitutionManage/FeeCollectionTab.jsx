// components/Modal/InsitutionManage/FeeCollectionTab.jsx
import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  getStudentsFeeStatusByClass,
  collectPayment,
  collectBulkPayment
} from '../../../api/InstitutionManage/feeApi';
import ReceiptModal from './ReceiptModal';

const FEE_TYPES = [
  { value: 'MONTHLY', label: 'Monthly Fee' },
  { value: 'FOOD', label: 'Food Fee' },
  { value: 'ADMISSION', label: 'Admission Fee' },
  { value: 'EXAM', label: 'Exam Fee' },
  { value: 'OTHER', label: 'Other Fee' }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FeeCollectionTab = ({ classes, institutionId }) => {
  // ================== State ==================
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extraDiscountType, setExtraDiscountType] = useState('NONE'); // NONE | PERCENTAGE | FIXED
const [extraDiscountValue, setExtraDiscountValue] = useState('');
const [selectedMonths, setSelectedMonths] = useState([]); // [{month, year}, ...]
const [multiMonthMode, setMultiMonthMode] = useState(false); // Single vs Multi
  const [formData, setFormData] = useState({
    feeType: 'MONTHLY',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    feeMonth: new Date().getMonth() + 1,
    feeYear: new Date().getFullYear(),
    paymentMethod: 'CASH',
    remarks: ''
  });

  const [paymentMode, setPaymentMode] = useState('FULL');
  const [selectedStudentStatus, setSelectedStudentStatus] = useState(null);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [bulkReceipts, setBulkReceipts] = useState([]);
const MONTH_BASED_TYPES = ['MONTHLY', 'FOOD', 'OTHER'];

const isMonthBased = MONTH_BASED_TYPES.includes(formData.feeType);

  const remainingDue = selectedStudentStatus
    ? parseFloat(selectedStudentStatus.dueAmount || 0)
    : parseFloat(formData.amount || 0);

// ═══════════ Selected Months Total ═══════════
const selectedMonthsTotal = selectedMonths.reduce(
  (sum, sm) => sum + (sm.amount || 0), 0
);
  // Permanent discount (from assignment)
const permanentDiscount = parseFloat(selectedStudentStatus?.discountAmount || 0);

// Extra discount (manual at collection time)
const computedExtraDiscount = (() => {
  const val = parseFloat(extraDiscountValue || 0);
  if (!val || val <= 0 || extraDiscountType === 'NONE') return 0;
  const base = remainingDue; // Due after permanent discount
  if (extraDiscountType === 'PERCENTAGE') return Math.min((base * val) / 100, base);
  if (extraDiscountType === 'FIXED') return Math.min(val, base);
  return 0;
})();

const totalDiscount = permanentDiscount + computedExtraDiscount;
const payableAfterAllDiscounts = Math.max(0, remainingDue - computedExtraDiscount);


  // ═══════════ Get Fee Amount for a Month (with permanent discount) ═══════════
const getMonthlyFeeAmount = (student, feeType) => {
  if (!student) return 0;

  const status = student.feeStatuses?.find(fs => fs.feeType === feeType);
  if (!status) return 0;

  // ✅ Effective fee first
  const effective = parseFloat(status.effectiveFee ?? 0);
  if (effective > 0) return effective;

  // Fallback: totalFee - discount
  const total = parseFloat(status.totalFee ?? 0);
  const disc = parseFloat(status.discountAmount ?? 0);
  return Math.max(0, total - disc);
};

// ═══════════ Check if a specific month is paid ═══════════
const isMonthFullyPaidForStudent = (student, feeType, month, year) => {
  if (!student) return false;

  const status = student.feeStatuses?.find(fs => fs.feeType === feeType);
  if (!status) return false;

  // ✅ Use effective fee — fallback to totalFee
  const effectiveFee = parseFloat(
    status.effectiveFee ?? status.totalFee ?? 0
  );

  // ✅ If no paid months array, definitely not paid
  if (!Array.isArray(status.paidMonths) || status.paidMonths.length === 0) {
    return false;
  }

  const monthPaid = status.paidMonths.find(
    pm => Number(pm.month) === Number(month) && Number(pm.year) === Number(year)
  );

  if (!monthPaid) return false;

  const paidAmt = parseFloat(monthPaid.paidAmount || 0);
  // ✅ Tolerance to avoid floating point issues
  return paidAmt >= effectiveFee - 0.01;
};


// Get months that are payable (not fully paid)
const getPayableMonths = () => {
  if (selectedStudents.length !== 1) return [];
  const list = [];
  const currentYear = formData.feeYear;
  for (let m = 1; m <= 12; m++) {
    const isPaid = isMonthFullyPaidForStudent(
      selectedStudents[0], formData.feeType, m, currentYear
    );
    if (!isPaid) {
      list.push({ month: m, year: currentYear, paid: false });
    } else {
      list.push({ month: m, year: currentYear, paid: true });
    }
  }
  return list;
};


  // ================== Effects ==================

 useEffect(() => {
  setExtraDiscountType('NONE');
  setExtraDiscountValue('');
}, [selectedStudents.length, formData.feeType]);

// Amount auto-fill when extra discount applied
useEffect(() => {
  if (computedExtraDiscount > 0) {
    setFormData(prev => ({ ...prev, amount: payableAfterAllDiscounts.toFixed(2) }));
  }
}, [computedExtraDiscount]);


  useEffect(() => {
    if (selectedClassId) fetchStudents();
    else { setStudents([]); setFiltered([]); }
  }, [selectedClassId]);

  useEffect(() => {
    if (!searchTerm.trim()) setFiltered(students);
    else {
      const t = searchTerm.toLowerCase();
      setFiltered(students.filter(s =>
        s.studentName?.toLowerCase().includes(t) ||
        s.guardianName?.toLowerCase().includes(t) ||
        s.contactNumber?.toLowerCase().includes(t)
      ));
    }
  }, [searchTerm, students]);

  // Single student selected → auto-set status + amount
  useEffect(() => {
    if (selectedStudents.length === 1) {
      const student = selectedStudents[0];
      const status = student.feeStatuses?.find(fs => fs.feeType === formData.feeType);
      setSelectedStudentStatus(status || null);

      if (status) {
        setFormData(prev => ({
          ...prev,
          amount: status.dueAmount > 0 ? status.dueAmount : ''
        }));
      }
    } else {
      setSelectedStudentStatus(null);
    }
  }, [selectedStudents, formData.feeType]);

  // Reset payment mode on student/fee change
  useEffect(() => {
    setPaymentMode('FULL');
  }, [selectedStudents.length, formData.feeType]);

  // ================== Helpers ==================

  


  // Check if month is fully paid (respecting permanent discount)
 const isMonthFullyPaid = (student, feeType, month, year) => {
  const status = student.feeStatuses?.find(fs => fs.feeType === feeType);
  if (!status || !status.paidMonths) return false;

  const effectiveFee = parseFloat(status.effectiveFee || status.totalFee || 0);
  const monthPaid = status.paidMonths.find(pm => pm.month === month && pm.year === year);
  if (!monthPaid) return false;

  return parseFloat(monthPaid.paidAmount) >= effectiveFee;
};

const currentMonthPaid =
  selectedStudents.length === 1 &&
  isMonthBased &&
  isMonthFullyPaid(selectedStudents[0], formData.feeType, formData.feeMonth, formData.feeYear);



  // ================== Fetch ==================
  const fetchStudents = async () => {
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

  // ================== Selection ==================
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

  // ================== Payment Mode ==================
  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    if (mode === 'FULL' && remainingDue > 0) {
      setFormData(prev => ({ ...prev, amount: remainingDue.toFixed(2) }));
    }
    if (mode === 'PARTIAL') {
      setFormData(prev => ({ ...prev, amount: '' }));
    }
  };

  // ================== Submit ==================
const handleCollect = async () => {
  // ═══════════════════════════════════════════
  // COMMON VALIDATIONS
  // ═══════════════════════════════════════════
  if (selectedStudents.length === 0)
    return toast.warning('Select at least one student');

  // ═══════════════════════════════════════════
  // MODE 1: MULTI-MONTH (Single Student only)
  // ═══════════════════════════════════════════
  if (selectedStudents.length === 1 && multiMonthMode && isMonthBased) {
    if (selectedMonths.length === 0)
      return toast.warning('Select at least one month');

    if (selectedMonths.some(sm => !sm.amount || sm.amount <= 0))
      return toast.warning('Invalid month amount');

    setSubmitting(true);
    try {
      const payload = {
        studentId: selectedStudents[0].studentId,
        feeType: formData.feeType,
        months: selectedMonths.map(sm => ({
          month: sm.month,
          year: sm.year,
          amount: sm.amount
        })),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        remarks: formData.remarks
      };

      const resp = await collectMultiMonthPayment(payload, institutionId);
      setBulkReceipts(resp || []);
      setReceiptData(null);
      setShowReceipt(true);
      toast.success(`${resp.length} month(s) paid successfully!`);

      // Reset
      setSelectedMonths([]);
      setMultiMonthMode(false);
      setSelectedStudents([]);
      setPaymentMode('FULL');
      setExtraDiscountType('NONE');
      setExtraDiscountValue('');
      setFormData(prev => ({ ...prev, amount: '' }));
      fetchStudents();
    } catch (err) {
      console.error('Multi-month collect error:', err);
      toast.error(err.response?.data?.message || 'Failed to collect payments');
    } finally {
      setSubmitting(false);
    }
    return;
  }

  // ═══════════════════════════════════════════
  // MODE 2: SINGLE MONTH / SINGLE STUDENT
  // ═══════════════════════════════════════════

  // Duplicate month check (for month-based fees)
  if (currentMonthPaid)
    return toast.error('This month is already fully paid!');

  const amt = parseFloat(formData.amount || 0);

  // Full discount edge case (100% discount → amount may be 0)
  const isFullDiscount = computedExtraDiscount > 0 && payableAfterAllDiscounts === 0;

  if (!isFullDiscount && (!amt || amt <= 0)) {
    return toast.warning('Enter valid amount');
  }

  // Validate partial amount does not exceed remaining due
  if (selectedStudents.length === 1 && selectedStudentStatus) {
    const maxAllowed = remainingDue + 0.01; // tolerance
    if (amt > maxAllowed) {
      return toast.warning(
        `Amount exceeds remaining due (৳${remainingDue.toFixed(2)})`
      );
    }
  }

  setSubmitting(true);
  try {
    // ═══════════ SINGLE STUDENT PAYMENT ═══════════
    if (selectedStudents.length === 1) {
      const payload = {
        studentId: selectedStudents[0].studentId,
        feeType: formData.feeType,
        amount: amt,
        originalAmount: remainingDue,
        // Extra discount (manual override at collection time)
        discountType: extraDiscountType === 'NONE' ? null : extraDiscountType,
        discountValue: extraDiscountValue ? parseFloat(extraDiscountValue) : null,
        paymentDate: formData.paymentDate,
        feeMonth: isMonthBased ? formData.feeMonth : null,
        feeYear: isMonthBased ? formData.feeYear : null,
        paymentMethod: formData.paymentMethod,
        remarks: formData.remarks
      };

      const resp = await collectPayment(payload, institutionId);
      setReceiptData(resp);
      setBulkReceipts([]);
      setShowReceipt(true);
      toast.success('Payment collected successfully!');
    }
    // ═══════════ BULK PAYMENT (Multiple Students) ═══════════
    else {
      const payload = {
        studentIds: selectedStudents.map(s => s.studentId),
        feeType: formData.feeType,
        amountPerStudent: amt,
        paymentDate: formData.paymentDate,
        feeMonth: isMonthBased ? formData.feeMonth : null,
        feeYear: isMonthBased ? formData.feeYear : null,
        paymentMethod: formData.paymentMethod,
        remarks: formData.remarks
      };

      const resp = await collectBulkPayment(payload, institutionId);
      setBulkReceipts(resp || []);
      setReceiptData(null);
      setShowReceipt(true);
      toast.success(`${resp.length} payments collected!`);
    }

    // ═══════════ RESET ALL STATES ═══════════
    setSelectedStudents([]);
    setPaymentMode('FULL');
    setExtraDiscountType('NONE');
    setExtraDiscountValue('');
    setFormData(prev => ({ ...prev, amount: '' }));
    setSelectedMonths([]);
    setMultiMonthMode(false);
    fetchStudents();
  } catch (err) {
    console.error('Collect error:', err);
    toast.error(err.response?.data?.message || 'Failed to collect payment');
  } finally {
    setSubmitting(false);
  }
};

  // ================== Render ==================
  return (
    <div className="space-y-6">
      {/* ========== TOP FORM ========== */}
<div className="bg-white rounded-xl shadow-sm p-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Class */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Class *</label>
      <select
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="">-- Choose class --</option>
        {classes.map(c => (
          <option key={c.id} value={c.id}>
            {c.className} {c.section ? `(${c.section})` : ''}
          </option>
        ))}
      </select>
    </div>

    {/* Fee Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
      <select
        value={formData.feeType}
        onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
      >
        {FEE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
    </div>

    {/* ═══════ Month + Year (Hide in Multi-Month Mode) ═══════ */}
    {isMonthBased && !multiMonthMode && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month * <span className="text-xs text-gray-500">(Which month's fee?)</span>
          </label>
          <select
            value={formData.feeMonth}
            onChange={(e) => setFormData({ ...formData, feeMonth: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {MONTHS.map((m, i) => {
              const monthNum = i + 1;
              const isPaid = selectedStudents.length === 1 &&
                isMonthFullyPaidForStudent(
                  selectedStudents[0], formData.feeType, monthNum, formData.feeYear
                );
              return (
                <option key={i} value={monthNum} disabled={isPaid}>
                  {m} {isPaid ? '✓ (Paid)' : ''}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <input
            type="number"
            value={formData.feeYear}
            onChange={(e) => setFormData({ ...formData, feeYear: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </>
    )}

    {/* Year always show in multi-month mode */}
    {isMonthBased && multiMonthMode && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
        <input
          type="number"
          value={formData.feeYear}
          onChange={(e) => setFormData({ ...formData, feeYear: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    )}

    {/* Payment Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Payment Date <span className="text-xs text-gray-500">(When paid)</span>
      </label>
      <input
        type="date"
        value={formData.paymentDate}
        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>

    {/* Payment Method */}
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

    {/* ═══════ Amount (Hide in Multi-Month Mode) ═══════ */}
    {!multiMonthMode && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (৳) *
          {selectedStudentStatus && paymentMode === 'PARTIAL' && (
            <span className="text-xs text-yellow-600 ml-2">
              (Max: ৳{remainingDue.toFixed(2)})
            </span>
          )}
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter amount"
          min="0"
        />
      </div>
    )}

    {/* Remarks */}
    <div className={multiMonthMode ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
      <input
        type="text"
        value={formData.remarks}
        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
        placeholder="Optional"
      />
    </div>
  </div>

       {currentMonthPaid && (
        <div className="mt-4 bg-red-50 border-2 border-red-400 rounded-lg p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 text-2xl mt-0.5 flex-shrink-0" />
            <div>
            <p className="text-base font-bold text-red-700">
                ⚠️ This month's payment is already done!
            </p>
            <p className="text-sm text-red-600 mt-2">
                <strong>{MONTHS[formData.feeMonth - 1]} {formData.feeYear}</strong> মাসের{' '}
                <strong>
                {FEE_TYPES.find(f => f.value === formData.feeType)?.label}
                </strong>{' '}
                এর জন্য <strong>{selectedStudents[0]?.studentName}</strong> ইতিমধ্যে সম্পূর্ণ পরিশোধ করেছেন।
            </p>
            <p className="text-sm text-red-700 font-semibold mt-2">
                👉 অনুগ্রহ করে <u>অন্য মাস select করুন</u>
            </p>
            </div>
        </div>
        )}

        {/* ========== SINGLE STUDENT: FEE DETAILS + PAYMENT MODE ========== */}
       {selectedStudents.length === 1 && (
  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm font-medium text-blue-800 mb-3">
      💡 Payment for <strong>{selectedStudents[0].studentName}</strong>
    </p>

    {selectedStudentStatus ? (
      <>
        {/* ═══════════ FEE BREAKDOWN ═══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {/* Total Fee */}
          <div className="bg-white rounded-lg p-2 border">
            <span className="text-xs text-gray-500">Total Fee</span>
            <p className="font-bold text-gray-800">
              ৳{parseFloat(selectedStudentStatus.totalFee || 0).toFixed(2)}
            </p>
          </div>

          {/* Permanent Discount */}
          {permanentDiscount > 0 && (
            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
              <span className="text-xs text-orange-600">🎁 Permanent Discount</span>
              <p className="font-bold text-orange-600">
                - ৳{permanentDiscount.toFixed(2)}
                {selectedStudentStatus.discountTypeStr === 'PERCENTAGE' && (
                  <span className="text-xs"> ({selectedStudentStatus.discountValue}%)</span>
                )}
              </p>
            </div>
          )}

          {/* Effective Fee */}
          <div className="bg-white rounded-lg p-2 border">
            <span className="text-xs text-gray-500">Effective Fee</span>
            <p className="font-bold text-gray-800">
              ৳{parseFloat(selectedStudentStatus.effectiveFee || selectedStudentStatus.totalFee || 0).toFixed(2)}
            </p>
          </div>

          {/* Paid */}
          <div className="bg-white rounded-lg p-2 border">
            <span className="text-xs text-gray-500">Paid</span>
            <p className="font-bold text-green-600">
              ৳{parseFloat(selectedStudentStatus.paidAmount || 0).toFixed(2)}
            </p>
          </div>

          {/* Due */}
          <div className="bg-red-50 rounded-lg p-2 border border-red-200">
            <span className="text-xs text-red-600">Due</span>
            <p className="font-bold text-red-600">
              ৳{remainingDue.toFixed(2)}
            </p>
          </div>
        </div>

       {/* Payment Mode Toggle — Hide in Multi-Month Mode */}
{!multiMonthMode && (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => handlePaymentModeChange('FULL')}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
        paymentMode === 'FULL' ? 'bg-green-600 text-white' : 'bg-white border'
      }`}
    >
      💰 Pay Full {selectedStudentStatus &&
        `(৳${parseFloat(selectedStudentStatus.dueAmount || 0).toFixed(0)})`}
    </button>
    <button
      type="button"
      onClick={() => handlePaymentModeChange('PARTIAL')}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
        paymentMode === 'PARTIAL' ? 'bg-yellow-500 text-white' : 'bg-white border'
      }`}
    >
      ✂️ Pay Partial
    </button>
  </div>
)}

{/* Multi-Month Info */}
{multiMonthMode && (
  <div className="text-xs text-teal-700 text-center py-2 bg-teal-50 rounded-lg">
    💡 Multi-Month Mode: Select months from above grid
  </div>
)}

        {/* ═══════════ EXTRA DISCOUNT (Optional Override) ═══════════ */}
        <div className="bg-white border border-orange-200 rounded-lg p-3 mb-3">
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            🎁 Additional Discount (Optional)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
              <select
                value={extraDiscountType}
                onChange={(e) => {
                  setExtraDiscountType(e.target.value);
                  setExtraDiscountValue('');
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="NONE">No Extra Discount</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (৳)</option>
              </select>
            </div>

            {extraDiscountType !== 'NONE' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Value {extraDiscountType === 'PERCENTAGE' ? '(%)' : '(৳)'}
                </label>
                <input
                  type="number"
                  value={extraDiscountValue}
                  onChange={(e) => setExtraDiscountValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  min="0"
                  max={extraDiscountType === 'PERCENTAGE' ? 100 : undefined}
                  placeholder={extraDiscountType === 'PERCENTAGE' ? 'e.g., 5' : 'e.g., 50'}
                />
              </div>
            )}

            {extraDiscountType === 'PERCENTAGE' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quick Select</label>
                <div className="flex gap-1">
                  {[5, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setExtraDiscountValue(pct)}
                      className={`flex-1 py-2 rounded text-xs font-medium transition ${
                        parseInt(extraDiscountValue) === pct
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extra Discount Summary */}
          {computedExtraDiscount > 0 && (
            <div className="mt-3 pt-3 border-t border-orange-200 grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Extra Discount:</span>
                <p className="font-bold text-orange-600">
                  - ৳{computedExtraDiscount.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Total Discount:</span>
                <p className="font-bold text-orange-600">
                  ৳{totalDiscount.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Payable:</span>
                <p className="font-bold text-teal-600 text-lg">
                  ৳{payableAfterAllDiscounts.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ NOW PAYING ═══════════ */}
        <div className="bg-teal-50 rounded-lg p-2 border border-teal-200 mb-3 flex justify-between items-center">
          <span className="text-xs text-teal-700 font-medium">💵 Now Paying:</span>
          <span className="text-xl font-bold text-teal-700">
            ৳{parseFloat(formData.amount || 0).toFixed(2)}
          </span>
        </div>

        {/* ═══════════ AFTER PAYMENT ═══════════ */}
        <div className="bg-white rounded-lg p-2 border text-sm">
          {(() => {
            const remain = Math.max(0, remainingDue - parseFloat(formData.amount || 0));
            return (
              <div className="flex justify-between">
                <span className="text-gray-600">After This Payment:</span>
                {remain === 0 ? (
                  <span className="font-bold text-green-600">✅ FULLY PAID</span>
                ) : (
                  <span className="font-bold text-yellow-600">
                    ⏳ Remaining: ৳{remain.toFixed(2)}
                  </span>
                )}
              </div>
            );
          })()}
        </div>

{/* ═══════════ MULTI-MONTH SELECTOR (Monthly/Food/Other only) ═══════════ */}
{isMonthBased && selectedStudentStatus && (
  <div className="bg-white border border-teal-200 rounded-lg p-3 mb-3">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-semibold text-gray-700">
        📅 Pay for Multiple Months
      </p>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={multiMonthMode}
          onChange={(e) => {
            setMultiMonthMode(e.target.checked);
            setSelectedMonths([]);
            if (e.target.checked) {
              // Clear single-month amount when switching
              setFormData(prev => ({ ...prev, amount: '' }));
            }
          }}
          className="h-3 w-3"
        />
        <span className="text-gray-600">Enable</span>
      </label>
    </div>

    {multiMonthMode && (
      <>
        {/* ⬇️ Auto-calculated monthly fee info */}
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-2 mb-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Fee:</span>
            <span className="font-bold text-teal-700">
              ৳{getMonthlyFeeAmount(selectedStudents[0], formData.feeType).toFixed(2)}
            </span>
          </div>
          {parseFloat(selectedStudentStatus.discountAmount || 0) > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-500 text-[11px]">
                (Incl. {selectedStudentStatus.discountTypeStr === 'PERCENTAGE'
                  ? `${selectedStudentStatus.discountValue}% discount`
                  : 'fixed discount'})
              </span>
              <span className="text-orange-600 text-[11px]">
                -৳{parseFloat(selectedStudentStatus.discountAmount).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
          {MONTHS.map((m, i) => {
            const monthNum = i + 1;
            const isPaid = isMonthFullyPaidForStudent(
              selectedStudents[0], formData.feeType, monthNum, formData.feeYear
            );
            // ✅ Auto-fill from effective fee (with permanent discount)
            const monthAmt = getMonthlyFeeAmount(selectedStudents[0], formData.feeType);
            const isSelected = selectedMonths.some(
              sm => sm.month === monthNum && sm.year === formData.feeYear
            );

            return (
              <button
                key={i}
                type="button"
                disabled={isPaid}
                onClick={() => {
                  if (isPaid) return;
                  setSelectedMonths(prev => {
                    const exists = prev.some(
                      sm => sm.month === monthNum && sm.year === formData.feeYear
                    );
                    return exists
                      ? prev.filter(sm => !(sm.month === monthNum && sm.year === formData.feeYear))
                      : [...prev, {
                          month: monthNum,
                          year: formData.feeYear,
                          amount: monthAmt  // ✅ auto-filled
                        }];
                  });
                }}
                className={`py-2 px-1 rounded text-xs font-medium transition relative ${
                  isPaid
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                    : isSelected
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {m.substring(0, 3)}
                <div className="text-[10px] opacity-80 mt-0.5">
                  ৳{monthAmt.toFixed(0)}
                </div>
                {isPaid && (
                  <span className="absolute -top-1 -right-1 text-green-600 text-xs font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Months Summary */}
        {selectedMonths.length > 0 && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-2 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Selected Months:</span>
              <span className="font-semibold text-teal-700">
                {selectedMonths.length} month(s)
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {selectedMonths.map(sm => MONTHS[sm.month - 1].substring(0, 3)).join(', ')}
            </div>
            <div className="flex justify-between items-center font-bold">
              <span className="text-gray-700">Total:</span>
              <span className="text-teal-700 text-lg">
                ৳{selectedMonthsTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          💡 Paid মাস গুলো <span className="text-green-600 font-bold">✓</span> দিয়ে marked এবং disabled
        </p>
      </>
    )}
  </div>
)}


      </>
    ) : (
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          ⚠️ এই student এর{' '}
          <strong>{FEE_TYPES.find(f => f.value === formData.feeType)?.label}</strong>{' '}
          assign করা হয়নি।
          <br />
          Class Management → Students → <strong>Assign Fee</strong> থেকে assign করুন।
        </p>
      </div>
    )}
  </div>
)}
      </div>

      {/* ========== STUDENT LIST ========== */}
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
                disabled={submitting || selectedStudents.length === 0 || currentMonthPaid}
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
              {/* Select All */}
              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4 text-teal-600"
                />
                <span className="text-sm font-medium text-gray-700">Select All</span>
              </label>

              {/* Student Rows */}
              {filtered.map(student => {
  const currentStatus = student.feeStatuses?.find(fs => fs.feeType === formData.feeType);
  const isSelected = selectedStudents.some(s => s.studentId === student.studentId);

  // Check if current selected month already paid for this student
  const isCurrentMonthPaid = isMonthBased && currentStatus
    ? isMonthFullyPaid(student, formData.feeType, formData.feeMonth, formData.feeYear)
    : false;

  return (
    <div
      key={student.studentId}
      className={`flex items-center gap-3 p-3 rounded-lg border transition ${
        isSelected
          ? 'bg-teal-50 border-teal-300'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
    >
      {/* Checkbox — Independent */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelect(student)}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 text-teal-600 cursor-pointer flex-shrink-0"
      />

      {/* Row Body — Clickable */}
      <div
        onClick={() => toggleSelect(student)}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm flex-shrink-0">
          {student.studentName?.charAt(0).toUpperCase()}
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 truncate">
            {student.studentName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {student.guardianName} • {student.contactNumber}
          </p>
        </div>

        {/* Status Section */}
        {currentStatus && (
          <div className="text-right text-xs flex-shrink-0">
            {/* Month-paid indicator (only for month-based fee types) */}
            {isMonthBased && isCurrentMonthPaid && (
              <div className="px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 mb-1">
                ✅ {MONTHS[formData.feeMonth - 1]} Paid
              </div>
            )}

            {/* General status (only if month not paid) */}
            {!isCurrentMonthPaid && currentStatus.status && (
              <div
                className={`px-2 py-1 rounded-full font-medium ${
                  currentStatus.status === 'FULLY_PAID'
                    ? 'bg-green-100 text-green-700'
                    : currentStatus.status === 'PARTIAL'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {currentStatus.status === 'FULLY_PAID'
                  ? '✅ Full Paid'
                  : currentStatus.status === 'PARTIAL'
                  ? '⏳ Partial'
                  : '❌ Due'}
              </div>
            )}

            {/* Paid amount */}
            {currentStatus.paidAmount > 0 && (
              <p className="text-green-600 mt-1">
                Paid: ৳{parseFloat(currentStatus.paidAmount).toFixed(0)}
              </p>
            )}

            {/* Due amount */}
            {currentStatus.dueAmount > 0 && (
              <p className="text-red-600">
                Due: ৳{parseFloat(currentStatus.dueAmount).toFixed(0)}
              </p>
            )}
          </div>
        )}

        {/* If fee not assigned */}
        {!currentStatus && (
          <div className="text-right text-xs flex-shrink-0">
            <div className="px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
              Not Assigned
            </div>
          </div>
        )}
      </div>
    </div>
  );
})}
            </div>
          )}
        </div>
      )}

      {/* ========== RECEIPT MODAL ========== */}
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

export default FeeCollectionTab;