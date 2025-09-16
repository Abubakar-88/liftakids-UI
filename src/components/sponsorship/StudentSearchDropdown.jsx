import React, { useState, useEffect, useRef } from 'react';
import { searchStudents } from '../../api/sponsorshipApi';

const StudentSearchDropdown = ({ onSelect }) => {
  const [filters, setFilters] = useState({
    studentName: '',
    guardianName: '',
    gender: '',
    contactNumber: ''
  });
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        searchStudents(searchTerm)
          .then(response => {
            // Filter results to match either name or contact number
            const filtered = response.data.filter(student => 
              student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.contactNumber.includes(searchTerm)
            );
            setResults(filtered);
          })
          .catch(console.error);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
        <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Search by student name or contact number..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {results.map(student => (
            <div
              key={student.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(student);
                setSearchTerm(student.studentName);
                setIsOpen(false);
              }}
            >
              <p className="font-medium">{student.studentName}</p>
              <p className="text-sm text-gray-600">
                {student.contactNumber} • {student.institution?.institutionName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSearchDropdown;