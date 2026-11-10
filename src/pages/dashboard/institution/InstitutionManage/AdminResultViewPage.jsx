import React, { useState, useEffect } from 'react';
import { FaSearch, FaChartPie, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getValidClasses, getValidSubjects } from '../../../../api/InstitutionManage/teacherApi';
import { getClassResults, getStudentReportCard } from '../../../../api/InstitutionManage/adminResultApi'; 
import StudentReportCardModal from '../../../../components/Modal/InsitutionManage/StudentReportCardModal';

const AdminResultViewPage = () => {
  const institutionData = JSON.parse(localStorage.getItem('institutionData'));
  const institutionId = institutionData?.institutionsId;

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examName, setExamName] = useState('Final Exam');
  
  // ডাইনামিক বছর
  const currentYear = new Date().getFullYear();
  const YEARS = [
    String(currentYear - 2), String(currentYear - 1), 
    String(currentYear), String(currentYear + 1), String(currentYear + 2)
  ];
  const [academicYear, setAcademicYear] = useState(String(currentYear));

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // রিপোর্ট কার্ড মোডাল স্টেট
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  const EXAMS = ['1st Term', 'Mid Term', 'Final Exam'];

  useEffect(() => {
    if (institutionId) loadDropdowns();
  }, [institutionId]);

  const loadDropdowns = async () => {
    try {
      const [cls, sub] = await Promise.all([
        getValidClasses(institutionId),
        getValidSubjects(institutionId)
      ]);
      setClasses(cls || []);
      setSubjects(sub || []);
      if (cls?.length > 0) setSelectedClass(cls[0]);
      if (sub?.length > 0) setSelectedSubject(sub[0]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load dropdown data');
    }
  };

  const handleSearch = async () => {
    if (!selectedClass || !selectedSubject) return toast.warning('Select class and subject');
    
    setLoading(true);
    try {
      // ✅ API ফাংশন কল
      const data = await getClassResults(institutionId, selectedClass, selectedSubject, examName, academicYear);
      setResultData(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentResult = async (studentId) => {
    try {
      // ✅ API ফাংশন কল
      const data = await getStudentReportCard(studentId, examName, academicYear);
      setReportData(data);
      setShowModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load student report card');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select value={examName} onChange={e => setExamName(e.target.value)} className="px-3 py-2 border rounded-lg">
            {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          
          <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="px-3 py-2 border rounded-lg">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          <button onClick={handleSearch} disabled={loading} className="bg-teal-600 text-white rounded-lg hover:bg-teal-700 px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-50">
            <FaSearch /> {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-10 w-10 border-b-2 border-teal-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading results...</p>
        </div>
      ) : resultData && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-600 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-blue-800">{resultData.totalStudents}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-600 text-sm">Passed</p>
              <p className="text-2xl font-bold text-green-800">{resultData.passedCount}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-800">{resultData.failedCount}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-purple-600 text-sm">Pass Rate</p>
              <p className="text-2xl font-bold text-purple-800">
                {resultData.totalStudents > 0 ? Math.round((resultData.passedCount / resultData.totalStudents) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaChartPie className="text-teal-600" /> Grade Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(resultData.gradeDistribution || {}).map(([grade, count]) => (
                <div key={grade} className="bg-gray-50 border rounded-lg px-4 py-2 flex items-center gap-3">
                  <span className={`font-bold text-lg ${grade === 'F' ? 'text-red-600' : 'text-teal-600'}`}>{grade}</span>
                  <span className="text-gray-500 text-sm">{count} students</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resultData.students.map((student, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                         {student.studentName?.charAt(0)}
                       </div>
                       <span className="font-medium text-gray-800">{student.studentName}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {student.marksObtained} / {resultData.totalMarks}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${student.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.grade !== 'F' ? (
                        <span className="text-green-600 flex items-center gap-1 text-sm font-medium"><FaCheckCircle /> Passed</span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1 text-sm font-medium"><FaTimesCircle /> Failed</span>
                      )}
                    </td>
                    {/* ✅ নতুন View Action বাটন */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleViewStudentResult(student.studentId)}
                        className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors flex items-center justify-center gap-1 w-full"
                      >
                        <FaEye /> View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ✅ Student Report Card Modal */}
      <StudentReportCardModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        reportData={reportData} 
      />
    </div>
  );
};

export default AdminResultViewPage;