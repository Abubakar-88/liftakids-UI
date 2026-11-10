import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getMyClassesSubjects,
  listAssignments,
  deleteAssignment,
  publishAssignment,
} from '../../api/teacherPortal/teacherAssignmentApi';
import AssignmentFormModal from '../../components/teacher/AssignmentFormModal';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext'; // ✅ নতুন ইম্পোর্ট

const StatusBadge = ({ status }) => {
  const map = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-200 text-gray-700',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${map[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

const TeacherAssignments = () => { // 👈 props রিসিভ করা বন্ধ করা হলো
  const { teacher, loading: authLoading } = useTeacherAuth(); // ✅ কনটেক্সট থেকে ডেটা নেওয়া হলো
  const teacherId = teacher?.teacherId;

  const [assignments, setAssignments] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

   const fetchAll = async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
      // ✅ এখন cs এবং list সরাসরি অ্যারে হিসেবে আসবে
      const [csData, listData] = await Promise.all([
        getMyClassesSubjects(teacherId),
        listAssignments(teacherId, filterClass || null, filterSubject || null),
      ]);
      
      setClassSubjects(csData || []);
      setAssignments(listData || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ Auth লোড হওয়া শেষ হলে এবং teacherId থাকলে তবেই ডেটা ফেচ হবে
    if (!authLoading && teacherId) {
      fetchAll();
    }
  }, [filterClass, filterSubject, teacherId, authLoading]);

  // Auth লোড হওয়ার আগে বা teacherId না থাকলে লোডিং দেখাবে
  if (authLoading || (!teacherId && !authLoading)) {
    return (
      <div className="p-10 text-center text-gray-500">
        {authLoading ? 'Loading teacher info...' : 'Teacher not found. Please login again.'}
      </div>
    );
  }

  const uniqueClasses = Array.from(
    new Map(classSubjects.map((cs) => [cs.classId, cs])).values()
  );
  const subjectsForClass = classSubjects.filter(
    (cs) => !filterClass || String(cs.classId) === String(filterClass)
  );
  const handleDelete = async (a) => {
    if (!window.confirm(`Delete assignment "${a.title}"?`)) return;
    
    try {
      // ✅ API কল সফল হলে সরাসরি নিচের লাইনে চলে যাবে
      await deleteAssignment(teacherId, a.id);
      
      toast.success('🗑 Assignment deleted successfully!');
      await fetchAll(); // ✅ লিস্ট রিফ্রেশ করুন
      
    } catch (err) {
      // ✅ কোনো এরর হলে (যেমন: স্টুডেন্ট সাবমিট করে ফেলেছে) এখানে ধরা পড়বে
      toast.error(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const handlePublish = async (a) => {
    if (!window.confirm(`Publish "${a.title}"? Students will see it.`)) return;
    
    try {
      await publishAssignment(teacherId, a.id);
      toast.success('Published successfully!');
      fetchAll(); // ✅ পাবলিশ হলে লিস্ট রিফ্রেশ হবে
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    }
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (a) => { setEditing(a); setShowForm(true); };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">📚 My Assignments</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
        >
          + New Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filterClass}
          onChange={(e) => { setFilterClass(e.target.value); setFilterSubject(''); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Classes</option>
          {uniqueClasses.map((c) => (
            <option key={c.classId} value={c.classId}>{c.className}</option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
          disabled={!filterClass}
        >
          <option value="">All Subjects</option>
          {subjectsForClass.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-10 bg-white border rounded-xl">
          <div className="text-5xl mb-2">📭</div>
          <p className="text-gray-500">No assignments yet</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white border rounded-xl p-4 hover:shadow-md transition">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800">{a.title}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                    <span>🏫 {a.className} • {a.subjectName}</span>
                    <span>📅 Due: {a.dueDate}</span>
                    {a.totalMarks && <span>🎯 Marks: {a.totalMarks}</span>}
                    <span>📤 Submissions: {a.submissionCount}</span>
                  </div>
                  {a.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{a.description}</p>
                  )}
                  {a.attachmentUrl && (
                    <a
                      href={a.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      📎 Attachment
                    </a>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {a.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => openEdit(a)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handlePublish(a)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                      >
                        📤 Publish
                      </button>
                    </>
                  )}
                  {a.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleDelete(a)}
                      className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssignmentFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        teacherId={teacherId} // ✅ এখানে কনটেক্সট থেকে নেওয়া ID পাস হচ্ছে
        editing={editing}
        classSubjects={classSubjects}
        onSaved={fetchAll}
      />
    </div>
  );
};

export default TeacherAssignments;