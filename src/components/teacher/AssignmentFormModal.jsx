import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createAssignment, updateAssignment } from '../../api/teacherPortal/teacherAssignmentApi';

const emptyForm = {
  classId: '',
  subjectId: '',
  title: '',
  description: '',
  dueDate: '',
  totalMarks: '',
  attachmentUrl: '',
};

const AssignmentFormModal = ({ open, onClose, teacherId, editing, classSubjects, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        classId: editing.classId || '',
        subjectId: editing.subjectId || '',
        title: editing.title || '',
        description: editing.description || '',
        dueDate: editing.dueDate || '',
        totalMarks: editing.totalMarks || '',
        attachmentUrl: editing.attachmentUrl || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing, open]);

  if (!open) return null;

  // Unique class list from classSubjects
  const uniqueClasses = Array.from(
    new Map(classSubjects.map((cs) => [cs.classId, cs])).values()
  );
  const subjectsForClass = classSubjects.filter(
    (cs) => String(cs.classId) === String(form.classId)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'classId') {
      setForm((f) => ({ ...f, classId: value, subjectId: '' }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.classId || !form.subjectId || !form.title || !form.dueDate) {
      return toast.error('Please fill all required fields');
    }
    
    const payload = {
      classId: Number(form.classId),
      subjectId: Number(form.subjectId),
      title: form.title.trim(),
      description: form.description,
      dueDate: form.dueDate,
      totalMarks: form.totalMarks ? Number(form.totalMarks) : null,
      attachmentUrl: form.attachmentUrl || null,
    };

    setLoading(true); // ✅ লোডিং শুরু
    try {
      if (editing) {
        await updateAssignment(teacherId, editing.id, payload);
        toast.success('Assignment updated successfully!');
      } else {
        await createAssignment(teacherId, payload);
        toast.success('Assignment created successfully!');
      }
      
      if (onSaved) onSaved(); // ✅ পেছনের লিস্ট রিফ্রেশ
      
      // ✅ ১ সেকেন্ড পর Modal বন্ধ হবে যাতে সাকসেস মেসেজ দেখা যায়
      setTimeout(() => {
        onClose();
        setLoading(false);
      }, 1000);

    } catch (err) {
      // ✅ এরর আসলে এখানে ধরা পড়বে
      toast.error(err.response?.data?.message || 'Something went wrong');
      setLoading(false); // ✅ গুরুত্বপূর্ণ: এরর হলে লোডিং বন্ধ হবে
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-800">
            {editing ? 'Edit Assignment' : 'Create Assignment'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select
                name="classId"
                value={form.classId}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select class</option>
                {uniqueClasses.map((c) => (
                  <option key={c.classId} value={c.classId}>{c.className}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                disabled={!form.classId}
                required
              >
                <option value="">Select subject</option>
                {subjectsForClass.map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Chapter 5 — Algebra Homework"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Write instructions..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              maxLength={3000}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                min={1}
                placeholder="e.g. 20"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment URL (optional)</label>
            <input
              type="url"
              name="attachmentUrl"
              value={form.attachmentUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentFormModal;