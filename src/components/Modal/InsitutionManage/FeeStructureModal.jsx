// components/Modal/InsitutionManage/FeeStructureModal.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  createFeeStructure,
  getFeeStructuresByClass,
  updateFeeStructure,
  deleteFeeStructure
} from '../../../api/InstitutionManage/feeApi';

const FEE_TYPES = [
  { value: 'MONTHLY', label: 'Monthly Fee' },
  { value: 'FOOD', label: 'Food Fee' },
  { value: 'ADMISSION', label: 'Admission Fee' },
  { value: 'EXAM', label: 'Exam Fee' },
  { value: 'OTHER', label: 'Other Fee' }
];

const FeeStructureModal = ({ classes, institutionId }) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    feeType: 'MONTHLY',
    amount: '',
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    description: ''
  });

  useEffect(() => {
    if (selectedClassId) fetchStructures();
    else setStructures([]);
  }, [selectedClassId]);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const data = await getFeeStructuresByClass(selectedClassId, institutionId);
      setStructures(data || []);
    } catch (err) {
      toast.error('Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.warning('Please select a class first');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }

    try {
      const payload = {
        classId: parseInt(selectedClassId),
        feeType: formData.feeType,
        amount: parseFloat(formData.amount),
        academicYear: formData.academicYear,
        description: formData.description
      };

      if (editing) {
        await updateFeeStructure(editing.id, payload, institutionId);
        toast.success('Fee structure updated');
      } else {
        await createFeeStructure(payload, institutionId);
        toast.success('Fee structure created');
      }

      setShowForm(false);
      setEditing(null);
      setFormData({ feeType: 'MONTHLY', amount: '', academicYear: formData.academicYear, description: '' });
      fetchStructures();
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.message || 'Failed to save fee structure');
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      feeType: item.feeType,
      amount: item.amount,
      academicYear: item.academicYear || '',
      description: item.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return;
    try {
      await deleteFeeStructure(id, institutionId);
      toast.success('Deleted');
      fetchStructures();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getFeeTypeLabel = (val) => FEE_TYPES.find(f => f.value === val)?.label || val;

  return (
    <div className="space-y-6">
      {/* Class Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose a class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.className} {c.section ? `(${c.section})` : ''}
                </option>
              ))}
            </select>
          </div>
          {selectedClassId && (
            <button
              onClick={() => {
                setEditing(null);
                setFormData({
                  feeType: 'MONTHLY',
                  amount: '',
                  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                  description: ''
                });
                setShowForm(true);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <FaPlus /> Add Fee Type
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-teal-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaCog className="text-teal-600" /> {editing ? 'Edit Fee Structure' : 'Add Fee Structure'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
              <select
                value={formData.feeType}
                onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                disabled={!!editing}
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="2025-2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Optional"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {!selectedClassId ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          <FaCog className="text-5xl mx-auto mb-4 text-gray-300" />
          <p>Select a class to view fee structures</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      ) : structures.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          <p>No fee structures defined for this class</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {structures.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{item.feeTypeDisplay || getFeeTypeLabel(item.feeType)}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">৳{parseFloat(item.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.academicYear || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.description || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeStructureModal;