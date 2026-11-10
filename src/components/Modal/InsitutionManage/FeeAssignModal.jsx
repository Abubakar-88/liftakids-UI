// components/Modal/InsitutionManage/FeeAssignModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaCheckCircle, FaMoneyBillWave, FaPercent, FaTag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { assignFeesToStudent, getStudentFeeStatus } from '../../../api/InstitutionManage/feeApi';

const FEE_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly Fee', icon: '📅' },
  { value: 'FOOD', label: 'Food Fee', icon: '🍽️' },
  { value: 'ADMISSION', label: 'Admission Fee', icon: '🎓' },
  { value: 'EXAM', label: 'Exam Fee', icon: '📝' },
  { value: 'OTHER', label: 'Other Fee', icon: '📌' }
];

const FeeAssignModal = ({ student, institutionId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 👇 Per-fee config: { MONTHLY: { selected, discountType, discountValue, customName }, ... }
  const [feeConfigs, setFeeConfigs] = useState({});
  const [feeStatus, setFeeStatus] = useState(null);

  useEffect(() => {
    if (student && institutionId) loadCurrentAssignments();
  }, [student, institutionId]);

  const loadCurrentAssignments = async () => {
    setFetching(true);
    try {
      const status = await getStudentFeeStatus(student.studentId, institutionId);
      setFeeStatus(status);

      // Build config from existing assignments
      const configs = {};
      FEE_TYPE_OPTIONS.forEach(opt => {
        const existing = status.feeStatuses?.find(fs => fs.feeType === opt.value);
        configs[opt.value] = {
          selected: !!existing,
          discountType: existing?.discountTypeStr || 'NONE',
          discountValue: existing?.discountValue || '',
          customName: existing?.customFeeName || '',
          structureFee: existing?.totalFee || 0
        };
      });
      setFeeConfigs(configs);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const updateConfig = (feeType, key, value) => {
    setFeeConfigs(prev => ({
      ...prev,
      [feeType]: { ...prev[feeType], [key]: value }
    }));
  };

  const toggleFee = (feeType) => {
    setFeeConfigs(prev => ({
      ...prev,
      [feeType]: { ...prev[feeType], selected: !prev[feeType].selected }
    }));
  };

  const handleSave = async () => {
    // Collect selected fees
    const selected = FEE_TYPE_OPTIONS.filter(opt => feeConfigs[opt.value]?.selected);

    if (selected.length === 0) {
      return toast.warning('Select at least one fee');
    }

    // Validate OTHER
    for (const opt of selected) {
      const cfg = feeConfigs[opt.value];
      if (opt.value === 'OTHER' && (!cfg.customName || !cfg.customName.trim())) {
        return toast.warning('Please enter custom name for Other Fee');
      }
    }

    const payload = selected.map(opt => {
      const cfg = feeConfigs[opt.value];
      return {
        feeType: opt.value,
        customFeeName: opt.value === 'OTHER' ? cfg.customName : null,
        discountTypeStr: cfg.discountType === 'NONE' ? null : cfg.discountType,
        discountValue: cfg.discountValue ? parseFloat(cfg.discountValue) : null
      };
    });

    setLoading(true);
    try {
      await assignFeesToStudent(student.studentId, payload, institutionId);
      toast.success('Fees assigned successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave />
            <h2 className="font-bold">Assign Fees & Discount</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1">
            <FaTimes />
          </button>
        </div>

        {/* Student Info */}
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600">Assigning fees for:</p>
          <p className="font-semibold text-gray-800 mt-1">{student.studentName}</p>
          <p className="text-xs text-gray-500">Guardian: {student.guardianName || 'N/A'}</p>
        </div>

        {/* Fee List */}
        <div className="p-4 space-y-3">
          {fetching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            FEE_TYPE_OPTIONS.map(opt => {
              const cfg = feeConfigs[opt.value] || {};
              const isSelected = cfg.selected;
              const structureFee = cfg.structureFee;

              return (
                <div
                  key={opt.value}
                  className={`border rounded-lg overflow-hidden transition ${
                    isSelected ? 'border-teal-300 bg-teal-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Header Row */}
                  <label className="flex items-center gap-3 p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFee(opt.value)}
                      className="h-4 w-4 text-teal-600"
                    />
                    <span className="text-xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{opt.label}</p>
                      {structureFee > 0 && (
                        <p className="text-xs text-gray-500">
                          Class Fee: ৳{parseFloat(structureFee).toFixed(2)}
                        </p>
                      )}
                    </div>
                    {isSelected && <FaCheckCircle className="text-teal-600" />}
                  </label>

                  {/* Expanded Config (if selected) */}
                  {isSelected && (
                    <div className="p-3 border-t border-teal-200 bg-white space-y-3">

                      {/* Custom name for OTHER */}
                      {opt.value === 'OTHER' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            <FaTag className="inline mr-1" /> Custom Fee Name *
                          </label>
                          <input
                            type="text"
                            value={cfg.customName || ''}
                            onChange={(e) => updateConfig(opt.value, 'customName', e.target.value)}
                            placeholder="e.g., Library Fee, Sports Fee"
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            required
                          />
                        </div>
                      )}

                      {/* Discount Section */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          🎁 Permanent Discount (Optional)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <select
                              value={cfg.discountType || 'NONE'}
                              onChange={(e) => {
                                updateConfig(opt.value, 'discountType', e.target.value);
                                updateConfig(opt.value, 'discountValue', '');
                              }}
                              className="w-full px-2 py-1.5 border rounded text-sm"
                            >
                              <option value="NONE">No Discount</option>
                              <option value="PERCENTAGE">Percentage (%)</option>
                              <option value="FIXED">Fixed (৳)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Value {cfg.discountType === 'PERCENTAGE' ? '(%)' : '(৳)'}
                            </label>
                            <input
                              type="number"
                              value={cfg.discountValue || ''}
                              onChange={(e) => updateConfig(opt.value, 'discountValue', e.target.value)}
                              disabled={!cfg.discountType || cfg.discountType === 'NONE'}
                              className="w-full px-2 py-1.5 border rounded text-sm disabled:bg-gray-100"
                              min="0"
                              placeholder={cfg.discountType === 'PERCENTAGE' ? '5' : '50'}
                            />
                          </div>
                        </div>

                        {/* Quick % */}
                        {cfg.discountType === 'PERCENTAGE' && (
                          <div className="flex gap-1 mt-2">
                            {[5, 10, 15, 20].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => updateConfig(opt.value, 'discountValue', pct)}
                                className={`flex-1 py-1 rounded text-xs font-medium ${
                                  parseInt(cfg.discountValue) === pct
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Live preview */}
                        {structureFee > 0 && cfg.discountValue > 0 && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                            {(() => {
                              const val = parseFloat(cfg.discountValue);
                              let disc = 0;
                              if (cfg.discountType === 'PERCENTAGE')
                                disc = (structureFee * val) / 100;
                              else disc = Math.min(val, structureFee);
                              const payable = Math.max(0, structureFee - disc);
                              return (
                                <div className="flex justify-between text-green-800">
                                  <span>Discount: -৳{disc.toFixed(2)}</span>
                                  <span className="font-bold">Effective: ৳{payable.toFixed(2)}</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeAssignModal;