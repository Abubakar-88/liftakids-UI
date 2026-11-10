import React, { useState, useEffect } from 'react';
import {
  FaFileAlt, FaSave, FaUpload, FaExclamationTriangle,
  FaCheckCircle, FaSearch, FaUserGraduate
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTeacherAuth } from '../../contexts/TeacherAuthContext';
// ✅ ১. getTeacherAssignments ইম্পোর্ট করা হলো
import { getTeacherAssignments } from '../../api/InstitutionManage/teacherApi'; 
import { getResultSheet, saveResults } from '../../api/teacherPortal/teacherResultApi';

// ✅ ফাংশনের বাইরে বছর এবং এক্সাম লিস্ট ডিফাইন
const currentYear = new Date().getFullYear();
const YEARS = [
  String(currentYear - 2),
  String(currentYear - 1),
  String(currentYear),
  String(currentYear + 1),
  String(currentYear + 2)
];
const EXAMS = ['1st Term', 'Mid Term', 'Final Exam', 'Class Test'];

const TeacherResultUploadPage = () => {
  const { teacher } = useTeacherAuth();

  // Configuration States
  const [assignments, setAssignments] = useState([]); // টিচারের সব অ্যাসাইনমেন্ট
  const [classes, setClasses] = useState([]);         // ইউনিক ক্লাস লিস্ট
  const [subjects, setSubjects] = useState([]);       // সিলেক্টেড ক্লাসের সাবজেক্ট লিস্ট
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examName, setExamName] = useState(EXAMS[0]);
  const [totalMarks, setTotalMarks] = useState(100);
  const [academicYear, setAcademicYear] = useState(String(currentYear));

  // Data States
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState('NOT_STARTED'); 
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ================== Initial Load ==================
  useEffect(() => {
    if (teacher?.teacherId) {
      loadAssignments();
    }
  }, [teacher?.teacherId]);

  // ✅ ২. টিচারের অ্যাসাইন করা ক্লাস ও সাবজেক্ট লোড
  const loadAssignments = async () => {
    try {
      const data = await getTeacherAssignments(teacher.teacherId);
      setAssignments(data || []);

      // ইউনিক ক্লাস বের করুন
      const uniqueClasses = [...new Set(data.map(item => item.className))];
      setClasses(uniqueClasses);

      // ডিফল্টভাবে প্রথম ক্লাস এবং তার সাবজেক্ট সিলেক্ট হবে
      if (uniqueClasses.length > 0) {
        const firstClass = uniqueClasses[0];
        setSelectedClass(firstClass);
        
        const classSubjects = data
            .filter(item => item.className === firstClass)
            .map(item => item.subject);
        const uniqueSubjects = [...new Set(classSubjects)];
        
        setSubjects(uniqueSubjects);
        if (uniqueSubjects.length > 0) setSelectedSubject(uniqueSubjects[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your assigned classes/subjects');
    }
  };

  // ✅ ৩. ক্লাস পরিবর্তন হলে সাবজেক্ট আপডেট হবে
  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);

    // নতুন ক্লাসের সাবজেক্ট ফিল্টার করুন
    const classSubjects = assignments
        .filter(item => item.className === newClass)
        .map(item => item.subject);
    const uniqueSubjects = [...new Set(classSubjects)];
    
    setSubjects(uniqueSubjects);
    if (uniqueSubjects.length > 0) {
      setSelectedSubject(uniqueSubjects[0]);
    } else {
      setSelectedSubject('');
    }

    // ক্লাস চেঞ্জ হলে আগের লোড হওয়া ডেটা রিসেট হবে
    setIsLoaded(false);
    setStudents([]);
  };

  // ================== Load Result Sheet ==================
  const handleLoadSheet = async () => {
    if (!selectedClass || !selectedSubject || !examName) {
      return toast.warning('Please select class, subject, and exam');
    }
    if (!totalMarks || totalMarks <= 0) {
      return toast.warning('Total marks must be greater than 0');
    }

    setLoading(true);
    try {
      const data = await getResultSheet(selectedClass, selectedSubject, examName, academicYear, teacher.teacherId);
      setStudents(data.students || []);
      setStatus(data.status || 'NOT_STARTED');
      
      if (data.totalMarks) setTotalMarks(data.totalMarks);
      
      setIsLoaded(true);
      toast.success('Result sheet loaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load result sheet');
    } finally {
      setLoading(false);
    }
  };

  // ================== Handle Marks Change ==================
  const handleMarksChange = (studentId, value) => {
    if (value !== '' && (isNaN(value) || Number(value) < 0 || Number(value) > totalMarks)) {
      return;
    }

    const updated = students.map(s => {
      if (s.studentId === studentId) {
        return {
          ...s,
          marksObtained: value === '' ? null : Number(value),
          grade: calculateGrade(value, totalMarks)
        };
      }
      return s;
    });
    setStudents(updated);
  };

  // Auto-Grade Logic
  const calculateGrade = (marks, total) => {
    if (marks === null || marks === '' || total <= 0) return 'N/A';
    const percent = (marks / total) * 100;
    if (percent >= 80) return 'A+';
    if (percent >= 70) return 'A';
    if (percent >= 60) return 'A-';
    if (percent >= 50) return 'B';
    if (percent >= 40) return 'C';
    if (percent >= 33) return 'D';
    return 'F';
  };

  // ================== Save Actions ==================
  const handleSave = async (saveStatus) => {
    if (saving) return;

    const hasMarks = students.some(s => s.marksObtained !== null && s.marksObtained !== undefined);
    if (!hasMarks) {
      return toast.warning('Please enter marks for at least one student');
    }

    if (saveStatus === 'PUBLISHED') {
      if (!window.confirm('Are you sure you want to PUBLISH the results? Students will be able to see them.')) {
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        className: selectedClass,
        subject: selectedSubject,
        examName: examName,
        totalMarks: Number(totalMarks),
        academicYear: academicYear,
        status: saveStatus,
        records: students
            .filter(s => s.marksObtained !== null && s.marksObtained !== undefined)
            .map(s => ({
                studentId: s.studentId,
                marksObtained: Number(s.marksObtained)
            }))
      };

      const resp = await saveResults(payload, teacher.teacherId);
      setStatus(resp.status);
      toast.success(`Results ${saveStatus === 'DRAFT' ? 'saved as draft' : 'published'} successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const enteredCount = students.filter(s => s.marksObtained !== null && s.marksObtained !== undefined).length;

  // ================== UI Render ==================
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaFileAlt /> Result Upload
        </h1>
        <p className="text-teal-100 mt-1">Enter student marks and publish results</p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={handleClassChange} // 👈 নতুন হ্যান্ডলার
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {classes.length === 0 && <option value="">No classes assigned</option>}
              {classes.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {subjects.length === 0 && <option value="">No subjects assigned</option>}
              {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
            <select
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {EXAMS.map((e, i) => <option key={i} value={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {YEARS.map((y, i) => <option key={i} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              min="1"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleLoadSheet}
            disabled={loading || !selectedClass || !selectedSubject}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center gap-2 disabled:opacity-50"
          >
            <FaSearch /> {loading ? 'Loading...' : 'Load Students'}
          </button>
        </div>
      </div>

      {/* Result Entry List */}
      {isLoaded && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          
          {/* Status & Stats Bar */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {status}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                | Entered: <b>{enteredCount}</b> / {students.length}
              </span>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="flex-1 md:flex-none px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave /> Save as Draft
              </button>
              <button
                onClick={() => handleSave('PUBLISHED')}
                disabled={saving}
                className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaUpload /> Publish Result
              </button>
            </div>
          </div>

          {/* Student List */}
          {students.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FaUserGraduate className="text-5xl mx-auto mb-4 text-gray-300" />
              <p>No students found in this class</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Student Info</div>
                <div className="col-span-3">Marks Obtained</div>
                <div className="col-span-2 text-center">Auto Grade</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              {/* Student Rows */}
              {students.map((student) => {
                const hasMarks = student.marksObtained !== null && student.marksObtained !== undefined;
                return (
                  <div key={student.studentId} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                    
                    {/* Student Info */}
                    <div className="col-span-5 flex items-center gap-3">
                      {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.studentName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                          {student.studentName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{student.studentName}</p>
                        <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                      </div>
                    </div>

                    {/* Marks Input */}
                    <div className="col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          value={student.marksObtained === null ? '' : student.marksObtained}
                          onChange={(e) => handleMarksChange(student.studentId, e.target.value)}
                          placeholder="e.g. 85"
                          max={totalMarks}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                          / {totalMarks}
                        </span>
                      </div>
                    </div>

                    {/* Grade */}
                    <div className="col-span-2 flex md:justify-center">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        !hasMarks ? 'bg-gray-100 text-gray-400' :
                        student.grade === 'F' ? 'bg-red-100 text-red-600' :
                        student.grade === 'A+' ? 'bg-teal-100 text-teal-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {student.grade || 'N/A'}
                      </span>
                    </div>

                    {/* Entry Status */}
                    <div className="col-span-2 flex md:justify-center">
                      {hasMarks ? (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                          <FaCheckCircle /> Entered
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <FaExclamationTriangle /> Pending
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Note */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-500">
            💡 Only students with marks will be saved. You can leave it as Draft and finish later.
          </div>

        </div>
      )}
    </div>
  );
};

export default TeacherResultUploadPage;