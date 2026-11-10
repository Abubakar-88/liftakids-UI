
import React from 'react';
import { FaTimes, FaPrint, FaGraduationCap } from 'react-icons/fa';

const StudentReportCardModal = ({ isOpen, onClose, reportData }) => {
  if (!isOpen || !reportData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 flex justify-between items-center text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FaGraduationCap className="text-2xl" />
            <h2 className="text-xl font-bold">Student Report Card</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full">
            <FaTimes />
          </button>
        </div>

        {/* Report Body */}
        <div className="p-6">
          {/* Student Info */}
          <div className="text-center mb-6 border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-800">{reportData.studentName}</h3>
            <p className="text-gray-600">Class: {reportData.className}</p>
            <p className="text-sm font-medium text-teal-600 mt-1">
              {reportData.examName} - {reportData.academicYear}
            </p>
          </div>

          {/* Subject Table */}
          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="bg-gray-50 border-y">
                <th className="py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Marks</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reportData.subjectResults.map((sub, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{sub.subject}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold">{sub.marksObtained}</span>
                    <span className="text-gray-400 text-sm"> / {sub.totalMarks}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      sub.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {sub.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 mb-1">Total Marks</p>
              <p className="text-xl font-bold text-blue-800">
                {reportData.obtainedMarks} / {reportData.totalMarks}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-600 mb-1">Percentage</p>
              <p className="text-xl font-bold text-purple-800">{reportData.percentage}%</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${
              reportData.overallGrade === 'F' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Overall Grade</p>
              <p className={`text-2xl font-black ${
                reportData.overallGrade === 'F' ? 'text-red-600' : 'text-green-600'
              }`}>{reportData.overallGrade}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-2">
            <FaPrint /> Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentReportCardModal;