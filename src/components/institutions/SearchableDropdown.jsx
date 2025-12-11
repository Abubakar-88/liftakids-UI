
import React, { useState, useEffect, useRef } from 'react';

const SearchableDropdown = ({
  options = [],
  value,
  onSelect,
  placeholder = "Search...",
  loading = false,
  onSearch,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const dropdownRef = useRef(null);

  // Initialize filteredOptions with options
  useEffect(() => {
    if (Array.isArray(options)) {
      setFilteredOptions(options);
    } else {
      setFilteredOptions([]);
    }
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (onSearch && value.length > 1) {
      // External search
      onSearch(value);
    } else {
      // Local filter - ensure options is an array
      if (Array.isArray(options)) {
        const filtered = options.filter(option =>
          option && option.name && option.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
      } else {
        setFilteredOptions([]);
      }
    }
    
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (option) => {
    if (option && onSelect) {
      onSelect(option);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (searchTerm.length > 0 || (Array.isArray(options) && options.length > 0)) {
      setIsOpen(true);
    }
  };

  const displayValue = value && value.name ? value.name : '';

  // Ensure filteredOptions is always an array
  const safeFilteredOptions = Array.isArray(filteredOptions) ? filteredOptions : [];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
        />
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg 
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-1 text-sm">Loading...</p>
            </div>
          ) : safeFilteredOptions.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              {searchTerm.length > 0 ? 'No results found' : 'No options available'}
            </div>
          ) : (
            safeFilteredOptions.map((option) => (
              <div
                key={option.donorId || option.studentId || option.id}
                onClick={() => handleSelect(option)}
                className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                  value && value.donorId === option.donorId ? 'bg-blue-100' : ''
                }`}
              >
                <div className="font-medium text-gray-800">
                  {option.name || 'Unnamed'}
                </div>
                {option.email && (
                  <div className="text-sm text-gray-600 mt-1">{option.email}</div>
                )}
                {option.phone && (
                  <div className="text-sm text-gray-600">{option.phone}</div>
                )}
                {option.className && (
                  <div className="text-sm text-gray-600">Class {option.className}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;