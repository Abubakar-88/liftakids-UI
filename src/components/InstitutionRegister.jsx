import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerInstitution,} from '../api/institutionApi';
import { getDivisions,getDistrictsByDivision, getThanasByDistrict, getUnionsByThanaId } from '../api/areaApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InstitutionRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institutionName: '',
    email: '',
    password: '',
    phone: '',
    teacherName: '',
    designation: '',
    divisionId: '',
    districtId: '',
    thanaId: '',
    unionOrAreaId: '',
    villageOrHouse: '',
    type: '',
    about: ''
  });

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch divisions on mount
   useEffect(() => {
    const loadDivisions = async () => {
      try {
        const res = await getDivisions();
        setDivisions(res.data);
      } catch (error) {
        console.error("Failed to fetch divisions", error);
        toast.error("Failed to load divisions");
      }
    };
    loadDivisions();
  }, []);


  // useEffect(() => {
  //   const fetchDivisions = async () => {
  //     try {
  //       const res = await getDivisions();
  //       setDivisions(res.data);
  //     } catch (error) {
  //       console.error("Failed to fetch divisions", error);
  //       message.error("Failed to load divisions");
  //     }
  //   };
  
  //   fetchDivisions();
  // }, []);

//  useEffect(() => {
//     if (filters.division) {
//       loadDistricts(filters.division).then(res => setDistricts(res.data));
//     } else {
//       setDistricts([]);
//     }
//     setFilters(prev => ({ ...prev, district: null, thana: null, union: null }));
//   }, [filters.division]);





 // Fetch districts when division changes
  useEffect(() => {
    if (formData.divisionId) {
      const loadDistricts = async () => {
        try {
          const res = await getDistrictsByDivision(formData.divisionId);
          setDistricts(res.data);
          setFormData(prev => ({ 
            ...prev, 
            districtId: '', 
            thanaId: '', 
            unionOrAreaId: '' 
          }));
        } catch (err) {
          toast.error('Failed to load districts');
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
  }, [formData.divisionId]);


  // Fetch thanas when district changes
   useEffect(() => {
    if (formData.districtId) {
      const loadThanas = async () => {
        try {
          const res = await getThanasByDistrict(formData.districtId);
          setThanas(res.data);
          setFormData(prev => ({ 
            ...prev, 
            thanaId: '', 
            unionOrAreaId: '' 
          }));
        } catch (err) {
          toast.error('Failed to load thanas');
        }
      };
      loadThanas();
    } else {
      setThanas([]);
    }
  }, [formData.districtId]);

  // Fetch unions when thana changes
  useEffect(() => {
    if (formData.thanaId) {
      const loadUnions = async () => {
        try {
          const res = await getUnionsByThanaId(formData.thanaId);
          setUnions(res.data);
          setFormData(prev => ({ 
            ...prev, 
            unionOrAreaId: '' 
          }));
        } catch (err) {
          toast.error('Failed to load unions/areas');
        }
      };
      loadUnions();
    } else {
      setUnions([]);
    }
  }, [formData.thanaId]);

     const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.divisionId || !formData.districtId || 
        !formData.thanaId || !formData.unionOrAreaId) {
      toast.error('Please select all location fields');
      setLoading(false);
      return;
    }

    try {
      const toastId = toast.loading('Registering your institution...', {
        position: "top-center",
        autoClose: false,
      });

      await registerInstitution({
        institutionName: formData.institutionName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        teacherName: formData.teacherName,
        designation: formData.designation,
        divisionId: parseInt(formData.divisionId), 
        districtId: parseInt(formData.districtId), 
        thanaId: parseInt(formData.thanaId), 
        unionOrAreaId: parseInt(formData.unionOrAreaId), 
        villageOrHouse: formData.villageOrHouse,
        type: formData.type,
        about: formData.about
      });

      toast.update(toastId, {
        render: 'Registration successful! Redirecting to login...',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      // Reset form
      setFormData({
        institutionName: '',
        email: '',
        password: '',
        phone: '',
        teacherName: '',
        designation: '',
        divisionId: '',
        districtId: '',
        thanaId: '',
        unionOrAreaId: '',
        villageOrHouse: '',
        type: '',
        about: ''
      });

      setTimeout(() => {
        navigate('/login/institution', { state: { registrationSuccess: true } });
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Institution Registration</h1>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2 font-medium text-justify">Division*</label>
            <select
              name="divisionId"
              value={formData.divisionId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Division</option>
              {divisions.map(div => (
                <option key={div.divisionId} value={div.divisionId}>{div.divisionName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-justify" >District*</label>
            <select
              name="districtId"
              value={formData.districtId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={!formData.divisionId}
            >
              <option value="">Select District</option>
              {districts.map(dist => (
                <option key={dist.districtId} value={dist.districtId}>{dist.districtName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-justify">Thana*</label>
            <select
              name="thanaId"
              value={formData.thanaId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={!formData.districtId}
            >
              <option value="">Select Thana</option>
              {thanas.map(thana => (
                <option key={thana.thanaId} value={thana.thanaId}>{thana.thanaName}</option>
              ))}
            </select>
          </div>

         <div>
            <label className="block mb-2 font-medium text-justify">Union/Area*</label>
            <select
              name="unionOrAreaId"
              value={formData.unionOrAreaId || ''} // Ensure proper fallback
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={!formData.thanaId || unions.length === 0} // Only disable if no options
            >
              <option value="">Select Union/Area</option>
              {unions.map(union => (
                <option 
                  key={union.unionOrAreaId} 
                  value={union.unionOrAreaId} // Ensure this matches your data structure
                >
                  {union.unionOrAreaName}
                </option>
              ))}
            </select>
          </div>
          </div>

        {/* Institution Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-justify">Institution Name*</label>
            <input
              type="text"
              name="institutionName"
              value={formData.institutionName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-justify">Village/House No*</label>
            <input
              type="text"
              name="villageOrHouse"
              value={formData.villageOrHouse}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-justify">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-justify">Phone*</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
           <div>
            <label className="block mb-2 font-medium text-justify">Teacher Name*</label>
            <input
              type="text"
              name="teacherName"
              value={formData.teacherName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
             <div>
            <label className="block mb-2 font-medium text-justify">Designation*</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-justify">Password*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-justify">Type*</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Type</option>
              <option value="KAWMI">Kawmi</option>
              <option value="MADRASA">Nurani & Hafs</option>
              <option value="SCHED">School</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium text-justify">About Institution</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white font-medium ${
            loading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {loading ? 'Registering...' : 'Register Institution'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        Already registered?{' '}
        <button 
          onClick={() => navigate('/login/institution')}
          className="text-blue-600 hover:underline font-medium"
        >
          Login here
        </button>
      </div>
      <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/chose-option')}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to role selection
          </button>
        </div>
    </div>
  );
};

export default InstitutionRegister;