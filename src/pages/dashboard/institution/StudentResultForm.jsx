import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { fetchStudents, submitResults } from '../../../api/studentApi';

const StudentResultForm = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState({
    firstTerminalFile: null,
    secondTerminalFile: null,
  });
  const [fileNames, setFileNames] = useState({
    firstTerminal: '',
    secondTerminal: ''
  });
  const [loading, setLoading] = useState({ students: true, submission: false });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchStudents();
        setStudents(data);
      } catch {
        setError('Failed to load students');
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
    };
    loadStudents();
  }, []);

  const handleFileChange = (e, terminal) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [`${terminal}File`]: file,
      }));
      setFileNames(prev => ({
        ...prev,
        [terminal]: file.name
      }));
    }
  };

  const removeFile = (terminal) => {
    setFormData(prev => ({
      ...prev,
      [`${terminal}File`]: null
    }));
    setFileNames(prev => ({
      ...prev,
      [terminal]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(prev => ({ ...prev, submission: true }));
    setError('');

    try {
      await submitResults(selectedStudent, formData);
      navigate('/results/confirmation');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 pt-6 pb-10 bg-white min-h-screen">
      {/* Page Titles */}
      <h1 className="text-xl font-semibold text-center mb-1">Institution Dashboard</h1>
      <h2 className="text-md font-bold text-center mb-6">Student Upload Result</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdown */}
        <div>
          <label className="block text-sm text-gray-700 mb-1 text-justify">Select Student *</label>
          {loading.students ? (
            <div className="p-2 bg-gray-100 text-sm text-center rounded">Loading...</div>
          ) : (
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Student --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Upload Card: First Terminal */}
        <div className="rounded-lg shadow-md border border-gray-200">
          <div className="border-t-4 border-blue-600 rounded-t-lg px-4 py-3">
            <h3 className="text-sm font-bold text-blue-900 text-justify">First Terminal</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="firstUpload"
                className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 text-sm rounded cursor-pointer"
              >
                <FaUpload className="text-white text-xs" />
                <span>Click to Upload</span>
                <input
                  id="firstUpload"
                  type="file"
                  onChange={(e) => handleFileChange(e, 'firstTerminal')}
                  accept=".pdf,.jpg,.png"
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                disabled={!formData.firstTerminalFile || loading.submission}
                className={`text-blue-600 text-sm font-semibold cursor-pointer px-3 py-1 rounded ${
                  !formData.firstTerminalFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
                }`}
              >
                {loading.submission ? 'Publishing...' : 'PUBLISH'}
              </button>
            </div>
            {fileNames.firstTerminal && (
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                <span className="truncate">{fileNames.firstTerminal}</span>
                <button 
                  type="button" 
                  onClick={() => removeFile('firstTerminal')}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Card: Second Terminal */}
        <div className="rounded-lg shadow-md border border-gray-200">
          <div className="border-t-4 border-blue-600 rounded-t-lg px-4 py-3">
            <h3 className="text-sm font-bold text-blue-900 text-justify">Second Terminal</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="secondUpload"
                className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 text-sm rounded cursor-pointer"
              >
                <FaUpload className="text-white text-xs" />
                <span>Click to Upload</span>
                <input
                  id="secondUpload"
                  type="file"
                  onChange={(e) => handleFileChange(e, 'secondTerminal')}
                  accept=".pdf,.jpg,.png"
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                disabled={!formData.secondTerminalFile || loading.submission}
                className={`text-blue-600 text-sm font-semibold cursor-pointer px-3 py-1 rounded ${
                  !formData.secondTerminalFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
                }`}
              >
                {loading.submission ? 'Publishing...' : 'PUBLISH'}
              </button>
            </div>
            {fileNames.secondTerminal && (
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                <span className="truncate">{fileNames.secondTerminal}</span>
                <button 
                  type="button" 
                  onClick={() => removeFile('secondTerminal')}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentResultForm;