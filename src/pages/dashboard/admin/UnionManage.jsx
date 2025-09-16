import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import { toast } from 'react-toastify';
import {
  getDistrictsByDivision,
  getDivisions,
  getThanasByDistrict,
  getUnionsByThana,
  getAllUnions,
  createUnion,
  getUnionsByDistrict,
  updateUnion,
  deleteUnion,
  getUnionById
} from "../../../api/areaApi";

export default function UnionManager() {
  // Form States
  const [formDivisionId, setFormDivisionId] = useState("");
  const [formDistricts, setFormDistricts] = useState([]);
  const [formDistrictId, setFormDistrictId] = useState("");
  const [formThanas, setFormThanas] = useState([]);
  const [formThanaId, setFormThanaId] = useState("");
  const [unionOrAreaName, setUnionOrAreaName] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Filter States
  const [filterDivisionId, setFilterDivisionId] = useState("");
  const [filterDistricts, setFilterDistricts] = useState([]);
  const [filterDistrictId, setFilterDistrictId] = useState("");
  const [filterThanas, setFilterThanas] = useState([]);
  const [filterThanaId, setFilterThanaId] = useState("");

  // Data States
  const [divisions, setDivisions] = useState([]);
  const [unions, setUnions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unionToDelete, setUnionToDelete] = useState(null);
  const [isEditingLoad, setIsEditingLoad] = useState(false);
  // Load initial data
  useEffect(() => {
    fetchDivisions();
    fetchAllUnions();
  }, []);

  // Load form districts when form division changes
  useEffect(() => {
    if (isEditingLoad) return; // Skip if editing is in progress
    if (formDivisionId) {
      fetchDistricts(formDivisionId, setFormDistricts);
    } else {
      setFormDistricts([]);
      setFormDistrictId("");
    }
  }, [formDivisionId]);

  // Load form thanas when form district changes
  useEffect(() => {
    if (formDistrictId) {
      fetchThanas(formDistrictId, setFormThanas);
    } else {
      setFormThanas([]);
      setFormThanaId("");
    }
  }, [formDistrictId]);

  // Load filter districts when filter division changes
  // useEffect(() => {
  //   if (filterDivisionId) {
  //     fetchDistricts(filterDivisionId, setFilterDistricts);
  //   } else {
  //     setFilterDistricts([]);
  //     setFilterDistrictId("");
  //   }
  // }, [filterDivisionId]);
useEffect(() => {
  if (filterDivisionId) {
    const loadDistricts = async () => {
      try {
        setIsLoading(true);
        const res = await getDistrictsByDivision(filterDivisionId);
        setFilterDistricts(res.data || []);
        setFilterDistrictId(""); // Reset district selection
        setFilterThanaId(""); // Reset thana selection
      } catch (err) {
        toast.error("Failed to load districts");
      } finally {
        setIsLoading(false);
      }
    };
    loadDistricts();
  } else {
    setFilterDistricts([]);
    setFilterDistrictId("");
    setFilterThanaId("");
  }
}, [filterDivisionId]);



  // Load filter thanas when filter district changes
  useEffect(() => {
    if (filterDistrictId) {
      fetchThanas(filterDistrictId, setFilterThanas);
    } else {
      setFilterThanas([]);
      setFilterThanaId("");
    }
  }, [filterDistrictId]);
  useEffect(() => {
    if (isEditingLoad) return; // Skip auto-fetching when editing
  
    if (formDivisionId) {
      fetchDistricts(formDivisionId, setFormDistricts);
    } else {
      setFormDistricts([]);
      setFormDistrictId("");
    }
  }, [formDivisionId]);
  // Load unions based on filters
  // useEffect(() => {
  //   if (filterThanaId) {
  //     fetchUnionsByThana(filterThanaId, currentPage - 1);
  //   } else if (filterDistrictId) {
  //     fetchUnionsByDistrict(filterDistrictId, currentPage - 1);
  //   } else {
  //     fetchAllUnions(currentPage - 1);
  //   }
  // }, [currentPage, filterDivisionId, filterDistrictId, filterThanaId]);


   useEffect(() => {
  if (filterThanaId) {
    console.log("Filter thana changed, fetching unions..."); // Debug
    fetchUnionsByThana(filterThanaId, currentPage - 1);
  } else if (filterDistrictId) {
    fetchUnionsByDistrict(filterDistrictId, currentPage - 1);
  } else {
    fetchAllUnions(currentPage - 1);
  }
}, [currentPage, filterThanaId]); 

  useEffect(() => {
    if (isEditingLoad) return;
  
    if (formDistrictId) {
      fetchThanas(formDistrictId, setFormThanas);
    } else {
      setFormThanas([]);
      setFormThanaId("");
    }
  }, [formDistrictId]);
  // API Functions
  const fetchDivisions = async () => {
    try {
      setIsLoading(true);
      const res = await getDivisions();
      setDivisions(res.data || []);
    } catch (err) {
      setError("Failed to load divisions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async (divisionId, setDistrictsFn) => {
    try {
      setIsLoading(true);
      const res = await getDistrictsByDivision(divisionId);
      setDistrictsFn(res.data || []);
    } catch (err) {
      setError("Failed to load districts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThanas = async (districtId, setThanasFn) => {
    try {
      setIsLoading(true);
      const res = await getThanasByDistrict(districtId);
      const thanas = (res.data || []).map(t => ({ ...t, districtId })); // Assign districtId
      setThanasFn(thanas);
    } catch (err) {
      setError("Failed to load thanas");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUnions = async (page = 0) => {
  try {
    setIsLoading(true);
    setError(null); // Clear previous errors
    
    const res = await getAllUnions(page, pageSize);
    
    if (res.data) {
      setUnions(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } else {
      throw new Error("Invalid response structure");
    }
    
  } catch (err) {
    console.error("Error fetching unions:", err);
    
    const errorMessage = err.response?.data?.message || 
                       err.message || 
                       "Failed to load unions";
    setError(errorMessage);
    
    // Optional: Show toast notification
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 5000,
    });
    
    // Reset pagination on error
    setUnions([]);
    setTotalPages(1);
    setTotalElements(0);
    
  } finally {
    setIsLoading(false);
  }
};

  // const fetchUnionsByThana = async (thanaId, page = 0) => {
  //   try {
  //     setIsLoading(true);
  //     const res = await getUnionsByThana(thanaId, page, pageSize);
  //     setUnions(res.data.content || []);
  //     setTotalPages(res.data.totalPages || 1);
  //     setTotalElements(res.data.totalElements || 0);
  //   } catch (err) {
  //     setError("Failed to load unions by thana");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
const fetchUnionsByThana = async (thanaId, page = 0) => {
  try {
    console.log("Fetching unions for thana ID:", thanaId); // Debug
    setIsLoading(true);
    const res = await getUnionsByThana(thanaId, page, pageSize);
    console.log("API Response:", res.data); // Debug
    
    setUnions(res.data.content || []);
    setTotalPages(res.data.totalPages || 1);
    setTotalElements(res.data.totalElements || 0);
  } catch (err) {
    console.error("Error fetching unions by thana:", err);
    toast.error("Failed to load unions for selected thana");
    setUnions([]);
  } finally {
    setIsLoading(false);
  }
};
  const fetchUnionsByDistrict = async (districtId, page = 0) => {
    try {
      setIsLoading(true);
      const res = await getUnionsByDistrict(districtId, page, pageSize);
      setUnions(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error("fetchUnionsByDistrict error:", err); 
      setError("Failed to load unions by district");
    } finally {
      setIsLoading(false);
    }
  };

  

// Form Handlers
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Clear previous messages
  setError(null);

  // Validation with toast
  if (!formThanaId) {
    toast.error("Please select a thana", {
      position: "top-right",
      autoClose: 3000,
    });
    return;
  }
  
  if (!unionOrAreaName.trim()) {
    toast.error("Union name cannot be empty", {
      position: "top-right",
      autoClose: 3000,
    });
    return;
  }

  try {
    setIsLoading(true);
    const payload = { unionOrAreaName, thanaId: formThanaId };
    
    if (editingId) {
      await updateUnion(editingId, payload);
      toast.success("Union updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      await createUnion(payload);
      toast.success("Union created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    resetForm();
    refreshTable();
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Failed to save union";
    toast.error(errorMsg, {
      position: "top-right",
      autoClose: 5000,
    });
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

const handleEdit = async (union) => {
  try {
    setIsEditingLoad(true);        
    setIsLoading(true);
    setError(null);

    // Show loading toast
    const toastId = toast.loading("Loading union details...", {
      position: "top-right",
    });

    const response = await getUnionById(union.id);
    const fullUnion = response.data;

    setUnionOrAreaName(fullUnion.unionOrAreaName);
    setEditingId(fullUnion.id);

    // Step 1: Set division
    const divisionId = fullUnion.divisionId;
    setFormDivisionId(divisionId);

    // Step 2: Manually fetch and set districts
    const districtsRes = await getDistrictsByDivision(divisionId);
    const districts = districtsRes.data || [];
    setFormDistricts(districts);

    // Step 3: Set district
    const districtId = fullUnion.districtId;
    setFormDistrictId(districtId);

    // Step 4: Manually fetch and set thanas
    const thanasRes = await getThanasByDistrict(districtId);
    const thanas = (thanasRes.data || []).map(t => ({ ...t, districtId }));
    setFormThanas(thanas);

    // Step 5: Set thana
    setFormThanaId(fullUnion.thanaId);

    // Update toast to success
    toast.update(toastId, {
      render: "Union loaded successfully!",
      type: "success",
      isLoading: false,
      autoClose: 2000,
    });

  } catch (err) {
    console.error("Edit error:", err);
    toast.error("Failed to load union details", {
      position: "top-right",
      autoClose: 5000,
    });
  } finally {
    setIsLoading(false);
    setIsEditingLoad(false);      
  }
};

  const refreshTable = () => {
    if (filterThanaId) {
      fetchUnionsByThana(filterThanaId, currentPage - 1);
    } else if (filterDistrictId) {
      fetchUnionsByDistrict(filterDistrictId, currentPage - 1);
    } else {
      fetchAllUnions(currentPage - 1);
    }
  };

  const resetForm = () => {
    setUnionOrAreaName("");
    setEditingId(null);
    setFormDivisionId("");
    setFormDistrictId("");
    setFormThanaId("");
    setError(null);
  };

  const resetFilters = () => {
    setFilterDivisionId("");
    setFilterDistrictId("");
    setFilterThanaId("");
    setCurrentPage(1);
  };

  return (
     <AdminDashboard>
    <div className="p-6 bg-gray-100 min-h-screen">
   
      <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Manage Unions Or Area</h2>
        {/* Add/Edit Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Union/Area" : "Add New Union/Area"}
          </h2>
          
          {error && (
            <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">×</button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Division Dropdown */}
            <div>
              <label className="block mb-2 font-medium">Division</label>
              <select
                value={formDivisionId}
                onChange={(e) => {
                  setFormDivisionId(e.target.value);
                  setFormDistrictId("");
                  setFormThanaId("");
                }}
                className="w-full border p-2 rounded"
                disabled={isLoading}
              >
                <option value="">Select Division</option>
                {divisions.map(d => (
                  <option key={d.divisionId} value={d.divisionId}>{d.divisionName}</option>
                ))}
              </select>
            </div>
            
            {/* District Dropdown */}
            <div>
              <label className="block mb-2 font-medium">District</label>
              <select
                value={formDistrictId}
                onChange={(e) => {
                  setFormDistrictId(e.target.value);
                  setFormThanaId("");
                }}
                className="w-full border p-2 rounded"
                disabled={!formDivisionId || isLoading}
              >
                <option value="">Select District</option>
                {formDistricts.map(d => (
                  <option key={d.districtId} value={d.districtId}>{d.districtName}</option>
                ))}
              </select>
            </div>
            
            {/* Thana Dropdown */}
            <div>
              <label className="block mb-2 font-medium">Thana</label>
              <select
                value={formThanaId}
                onChange={(e) => setFormThanaId(e.target.value)}
                className="w-full border p-2 rounded"
                disabled={!formDistrictId || isLoading}
              >
                <option value="">Select Thana</option>
                {formThanas
                .filter(t => !formDistrictId || t.districtId === formDistrictId)
                .map(t => (
                  <option key={t.thanaId} value={t.thanaId}>{t.thanaName}</option>
              ))}
              </select>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={unionOrAreaName}
              onChange={(e) => setUnionOrAreaName(e.target.value)}
              placeholder="Enter union/area name"
              className="flex-1 border p-2 rounded"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Union List Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold">Union/Area List</h2>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Division</label>
                <select
                    value={filterDivisionId}
                    onChange={(e) => {
                      setFilterDivisionId(e.target.value);
                      setFilterDistrictId(""); // Reset district
                      setFilterThanaId(""); // Reset thana
                      setCurrentPage(1);
                    }}
                    className="w-full border p-2 rounded"
                    disabled={isLoading}
                  >
                    <option value="">All Divisions</option>
                    {divisions.map(d => (
                      <option key={d.divisionId} value={d.divisionId}>
                        {d.divisionName}
                      </option>
                    ))}
                  </select>
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">District</label>
                {/* District Filter Dropdown */}
                <select
                  value={filterDistrictId}
                  onChange={(e) => {
                    setFilterDistrictId(e.target.value);
                    setFilterThanaId(""); // Reset thana
                    setCurrentPage(1);
                  }}
                  className="w-full border p-2 rounded"
                  disabled={!filterDivisionId || isLoading}
                >
                  <option value="">All Districts</option>
                  {filterDistricts.map(d => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Thana</label>
                <div className="flex gap-2">
                 <select
                      value={filterThanaId}
                      onChange={(e) => {
                        const selectedThanaId = e.target.value;
                        console.log("Selected thana ID:", selectedThanaId); // Debug
                        setFilterThanaId(selectedThanaId);
                        setCurrentPage(1); // Reset to first page
                      }}
                      className="w-full border p-2 rounded"
                      disabled={!filterDistrictId || isLoading}
                    >
                      <option value="">All Thanas</option>
                      {filterThanas.map(t => (
                        <option key={t.thanaId} value={t.thanaId}>
                          {t.thanaName}
                        </option>
                      ))}
                    </select>
                  <button
                    onClick={resetFilters}
                    className="bg-gray-200 hover:bg-gray-300 px-3 rounded whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-medium">#</th>
                  <th className="p-3 text-left font-medium">Union/Area Name</th>
                  <th className="p-3 text-left font-medium">Thana</th>
                  <th className="p-3 text-left font-medium">District</th>
                  <th className="p-3 text-left font-medium">Division</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unions.length > 0 ? (
                  unions.map((union, i) => (
                    <tr key={union.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{(currentPage - 1) * pageSize + i + 1}</td>
                      <td className="p-3">{union.unionOrAreaName}</td>
                      <td className="p-3">{union.thanaName || "N/A"}</td>
                      <td className="p-3">{union.districtName || "N/A"}</td>
                      <td className="p-3">{union.divisionName || "N/A"}</td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(union)}
                          className="text-blue-600 hover:underline"
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setUnionToDelete(union);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:underline"
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      {isLoading ? "Loading..." : "No unions/areas found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {unions.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalElements)} of {totalElements}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
              <p className="mb-6">Are you sure you want to delete "{unionToDelete?.unionOrAreaName}"?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      await deleteUnion(unionToDelete.unionOrAreaId);
                      refreshTable();
                      setShowDeleteModal(false);
                    } catch (err) {
                      setError("Failed to delete union/area");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminDashboard>
  );
}