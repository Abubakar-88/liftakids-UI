import React, { useState, useEffect, useRef } from 'react';
import { searchDonors } from '../../api/sponsorshipApi';

const DonorSearchDropdown = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        searchDonors(searchTerm)
          .then(response => {
            // Filter results to match either name or email
            const filtered = response.data.filter(donor => 
              donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              donor.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        placeholder="Search donors..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {results.map(donor => (
            <div
              key={donor.id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => {
                onSelect(donor);
                setSearchTerm(donor.name);
                setIsOpen(false);
              }}
            >
              <div>
                <p className="font-medium">{donor.name}</p>
                <p className="text-sm text-gray-600">{donor.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorSearchDropdown;