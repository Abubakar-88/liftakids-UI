
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaSearch, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getStudentsWithDue } from '../../../api/InstitutionManage/feeApi';

const FEE_TYPES = [
  { value: '', label: 'All Fees' },
  { value: 'MONTHLY', label: 'Monthly Fee' },
  { value: 'FOOD', label: 'Food Fee' },
  { value: 'ADMISSION', label: 'Admission Fee' },
  { value: 'EXAM', label: 'Exam Fee' }
];

const DueListModal = ({ classes, institutionId }) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [feeType, setFeeType] = useState('');
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedClassId) fetchDues();
    else setDues([]);
  }, [selectedClassId, feeType]);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const data = await getStudentsWithDue(selectedClassId, institutionId, feeType || null);
      setDues(data || []);
    } catch (err) {
      toast.error('Failed to load due list');
    } finally {
      setLoading(false);
    }
  };

  const filtered = dues.filter(s =>
    !searchTerm.trim() ||
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.guardianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {FEE_TYPES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {selectedClassId && !loading && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-3xl text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{filtered.length}</p>
              <p className="text-sm text-gray-600">Students with due payments</p>
            </div>
          </div>
        </div>
      )}

      {/* Due Table */}
      {selectedClassId && (
        loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            <p>No students with due payments</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Breakdown</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map(s => (
                    <tr key={s.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800">{s.studentName}</p>
                        <p className="text-xs text-gray-500">Guardian: {s.guardianName || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaPhone className="text-gray-400 text-xs" /> {s.contactNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {s.feeStatuses?.filter(f => f.dueAmount > 0).map((f, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-medium text-gray-700">{f.feeTypeDisplay}:</span>{' '}
                              <span className="text-red-600">৳{parseFloat(f.dueAmount).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-lg font-bold text-red-600">
                          ৳{parseFloat(s.totalDue).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DueListModal;