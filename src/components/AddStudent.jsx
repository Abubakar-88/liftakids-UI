import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudent } from '../api/studentApi';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: '',
    guardianName: '',
    dob: '',
    gender: '',
    address: '',
    contactNumber: '',
    financial_rank: '',
    requiredMonthlySupport: '',
    institutionsId: '',
    institutionName: 'Loading...',
    bio: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState('');

  // Load current institution data from localStorage
  useEffect(() => {
    const loadCurrentInstitution = () => {
      try {
        const institutionData = localStorage.getItem('institutionData');
        if (institutionData) {
          const parsedData = JSON.parse(institutionData);
          setFormData(prev => ({
            ...prev,
            institutionsId: parsedData.institutionsId || parsedData.id,
            institutionName: parsedData.institutionName
          }));
        } else {
          setErrors('Institution data not found. Please login again.');
          // Redirect to login if no institution data
          setTimeout(() => {
            navigate('/login/institution');
          }, 2000);
        }
      } catch (err) {
        setErrors('Failed to load institution data');
        setFormData(prev => ({
          ...prev,
          institutionName: 'Unknown Institution'
        }));
      }
    };

    loadCurrentInstitution();
  }, [navigate]);

  // Get maximum date (4 years before today)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    if (value) {
      const selectedDate = new Date(value);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 4);
      
      if (selectedDate > minDate) {
        setErrors('Student must be at least 4 years old');
      } else {
        setErrors('');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData(prev => ({ ...prev, image: file })); // Store as 'image' not 'photoUrl'
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  }
};
  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setFormData(prev => ({ ...prev, image: file }));
      
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setPreviewImage(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setErrors('');

  //   // Validation
  //   if (!formData.institutionsId) {
  //     setErrors('Institution information is missing. Please login again.');
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const formDataToSend = new FormData();
      
  //     // Append all form data
  //     Object.keys(formData).forEach(key => {
  //       if (formData[key] !== null && formData[key] !== undefined) {
  //         formDataToSend.append(key, formData[key]);
  //       }
  //     });

  //     await addStudent(formDataToSend);
  //     navigate('/institution/student-list', { 
  //       state: { success: 'Student added successfully' } 
  //     });
  //   } catch (err) {
  //     setErrors(err.response?.data?.message || err.message || 'Failed to add student');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors('');

  // Validation
  if (!formData.institutionsId) {
    setErrors('Institution information is missing. Please login again.');
    setLoading(false);
    return;
  }

  // Add image validation
  if (!formData.image) {
    setErrors('Student image is required');
    setLoading(false);
    return;
  }

  try {
    const formDataToSend = new FormData();
    
    // Create studentData object without the image
    const studentData = {
      studentName: formData.studentName,
      guardianName: formData.guardianName,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      contactNumber: formData.contactNumber,
      financial_rank: formData.financial_rank,
      requiredMonthlySupport: formData.requiredMonthlySupport,
      institutionsId: formData.institutionsId,
      bio: formData.bio
    };

    // Append as two separate parts
    formDataToSend.append('studentData', new Blob([JSON.stringify(studentData)], {
      type: 'application/json'
    }));
    formDataToSend.append('image', formData.image);

    await addStudent(formDataToSend);
    navigate('/institution/student-list', { 
      state: { success: 'Student added successfully' } 
    });
  } catch (err) {
    setErrors(err.response?.data?.message || err.message || 'Failed to add student');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex items-center justify-between"> 
      <h1 className="text-2xl font-bold text-center text-black mb-4">Add Student</h1>
        <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 "
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
      {errors && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {errors}
        </div>
      )}
</div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Institution Information (Read-only) */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Institution Information</h3>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-gray-700 mb-1 text-justify">Institution Name</label>
              <input
                type="text"
                value={formData.institutionName}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-justify">Institution ID</label>
              <input
                type="text"
                value={formData.institutionsId}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 text-justify">Full Name*</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-justify">Guardian Name*</label>
            <input
              type="text"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 text-justify">Date of Birth*</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleDateChange}
              max={getMaxDate()}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-justify">Gender*</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label className="block text-gray-700 mb-1 text-justify">Address*</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 text-justify">Phone*</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 text-justify">Financial Rank*</label>
            <select
              name="financial_rank"
              value={formData.financial_rank}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Option</option>
              <option value="Poor">Poor</option>
              <option value="ORPHAN">Orphan</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-justify">Monthly Requirement*</label>
            <input
              type="number"
              name="requiredMonthlySupport"
              value={formData.requiredMonthlySupport}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-700 mb-1 text-justify">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 mb-1 text-justify">Student Image*</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="file"
                  name="image" // Changed from photoUrl to image
                  id="image-upload"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <label
                  htmlFor="image-upload" // Fixed the htmlFor to match id
                  className="inline-block px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  Choose Image
                </label>
              </div>
              {previewImage && (
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Image is required</p>
          </div>
        {/* Image Upload */}
        {/* <div>
          <label className="block text-gray-700 mb-1 text-justify">Student Image</label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                 name="photoUrl" // changed to photoUrl
                id="photoUrl-upload"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <label
                htmlFor="image-upload"
                className="inline-block px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                Choose Image
              </label>
            </div>
            {previewImage && (
              <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div> */}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white font-medium ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Adding Student...' : 'Add Student'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button 
          onClick={() => navigate('/institution/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Institution Dashboard
        </button>
      </div>
    </div>
  );
};

export default AddStudent;