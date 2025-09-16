import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import { toast } from 'react-toastify';
import {
  getDistrictsByDivision,
  getDivisions,
  getThanasByDistrict,
  getAllThanas,
  createThana,
  updateThana,
  deleteThana,
  getDistricts
} from "../../../api/areaApi";


export default function ThanaManager() {
  // State declarations (keep your existing state declarations)
  const [addFormDivision, setAddFormDivision] = useState("");
  const [addFormDistricts, setAddFormDistricts] = useState([]);
  const [addFormDistrict, setAddFormDistrict] = useState("");
  const [tableFilterDivision, setTableFilterDivision] = useState("");
  const [tableFilterDistricts, setTableFilterDistricts] = useState([]);
  const [tableFilterDistrict, setTableFilterDistrict] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [thanaName, setThanaName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [thanaToDelete, setThanaToDelete] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [allDistricts, setAllDistricts] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [divisionsRes, districtsRes] = await Promise.all([
          getDivisions(),
          getDistricts()
        ]);
        setDivisions(divisionsRes.data || []);
        setAllDistricts(districtsRes.data || []);
        await fetchAllThanas(0);
      } catch (err) {
        setError("Failed to load initial data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Load districts for Add Form
  useEffect(() => {
    if (addFormDivision) {
      fetchDistricts(addFormDivision, setAddFormDistricts);
    } else {
      setAddFormDistricts([]);
      setAddFormDistrict("");
    }
  }, [addFormDivision]);

  // Load districts for Table Filter
  useEffect(() => {
    if (tableFilterDivision) {
      fetchDistricts(tableFilterDivision, setTableFilterDistricts);
    } else {
      setTableFilterDistricts([]);
      setTableFilterDistrict("");
    }
  }, [tableFilterDivision]);

  // Load thanas based on table filter
  useEffect(() => {
    if (tableFilterDistrict) {
      fetchThanasByDistrict(tableFilterDistrict);
    } else {
      fetchAllThanas(currentPage - 1);
    }
  }, [currentPage, tableFilterDistrict]);

const fetchDistricts = async (divisionId, setDistrictsFn) => {
  try {
    setIsLoading(true);
    const res = await getDistrictsByDivision(divisionId);
    console.log("Districts loaded:", res.data); // Debugging log
    setDistrictsFn(res.data || []);
  } catch (err) {
    console.error("Error fetching districts:", err);
    setError("Failed to load districts");
  } finally {
    setIsLoading(false);
  }
};
useEffect(() => {
  console.log("Divisions array:", divisions);
}, [divisions]);

  // const fetchDistricts = async (divisionId, setDistrictsFn) => {
  //   try {
  //     setIsLoading(true);
  //     const res = await getDistrictsByDivision(divisionId);
  //     setDistrictsFn(res.data || []);
  //   } catch (err) {
  //     setError("Failed to load districts");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };




  const fetchAllThanas = async (page = 0, size = pageSize) => {
    try {
      setIsLoading(true);
      const res = await getAllThanas(page, size);
      const data = res.data;
      
      setThanas(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError("Failed to load thanas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThanasByDistrict = async (districtId) => {
    try {
      setIsLoading(true);
      const res = await getThanasByDistrict(districtId);
      setThanas(res.data || []);
      setTotalPages(1);
      setTotalElements(res.data?.length || 0);
    } catch (err) {
      setError("Failed to load thanas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Clear previous errors
  setError(null);

  // Validation with toast
  if (!addFormDistrict) {
    toast.error("Please select a district");
    return;
  }
  
  if (!thanaName.trim()) {
    toast.error("Thana name cannot be empty");
    return;
  }

  try {
    setIsLoading(true);
    const payload = { 
      thanaName: thanaName.trim(), 
      districtId: addFormDistrict 
    };
    
    if (editingId) {
      await updateThana(editingId, payload);
      toast.success("Thana updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } else {
      await createThana(payload);
      toast.success("Thana created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
    
    resetForm();
    if (tableFilterDistrict) {
      await fetchThanasByDistrict(tableFilterDistrict);
    } else {
      await fetchAllThanas(currentPage - 1);
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Failed to save thana";
    toast.error(errorMsg, {
      position: "top-right",
      autoClose: 5000,
    });
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

 const handleEdit = (thana) => {
  thanaName(thana.thanaName);
  setEditingId(thana.thanaId);
  
  const district = allDistricts.find(d => d.districtId === thana.districtId);
  if (district) {
    setAddFormDivision(district.divisionId);
    setAddFormDistrict(thana.districtId);
    fetchDistricts(district.divisionId, setAddFormDistricts);
    toast.info(`Editing ${thana.thanaName}`, {
      position: "top-right",
      autoClose: 2000,
    });
  } else {
    const errorMsg = "District information not available";
    toast.error(errorMsg);
    setError(errorMsg);
  }
};

  const confirmDelete = (thana) => {
    setThanaToDelete(thana);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
  try {
    setIsLoading(true);
    await deleteThana(thanaToDelete.id);
    
    toast.success("Thana deleted successfully", {
      position: "top-right",
      autoClose: 3000,
    });
    
    if (tableFilterDistrict) {
      await fetchThanasByDistrict(tableFilterDistrict);
    } else {
      await fetchAllThanas(currentPage - 1);
    }
  } catch (err) {
    toast.error("Failed to delete thana");
    console.error(err);
  } finally {
    setIsLoading(false);
    setShowDeleteModal(false);
    setThanaToDelete(null);
  }
};

  const resetForm = () => {
    setThanaName("");
    setEditingId(null);
    setAddFormDivision("");
    setAddFormDistrict("");
    setAddFormDistricts([]);
    setError(null);
  };

  const resetTableFilters = () => {
    setTableFilterDivision("");
    setTableFilterDistrict("");
    setCurrentPage(1);
    fetchAllThanas(0);
  };

  return (
    <AdminDashboard>
     
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Manage Thanas</h2>
          
          {/* Add/Edit Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Thana" : "Add New Thana"}
            </h2>
            
            {error && (
              <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
                {error}
                <button 
                  onClick={() => setError(null)} 
                  className="float-right font-bold"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium">Division</label>
             <select
                      value={addFormDivision}
                      onChange={(e) => {
                        const selectedDivisionId = e.target.value; // This should be the ID
                        console.log("Selected division ID:", selectedDivisionId);
                        setAddFormDivision(selectedDivisionId);
                        setAddFormDistrict("");
                        if (selectedDivisionId) {
                          fetchDistricts(selectedDivisionId, setAddFormDistricts);
                        } else {
                          setAddFormDistricts([]);
                        }
                      }}
                      className="w-full border p-2 rounded"
                      disabled={isLoading}
                    >
                      <option value="">Select Division</option>
                      {divisions.map(div => (
                        <option key={div.divisionId} value={div.divisionId}> 
                          {div.divisionName}
                        </option>
                      ))}
                    </select>
              </div>
              <div>
                <label className="block mb-2 font-medium">District</label>
                <select
                  value={addFormDistrict}
                  onChange={(e) => setAddFormDistrict(e.target.value)}
                  className="w-full border p-2 rounded"
                  disabled={!addFormDivision || isLoading}
                >
                  <option value="">Select District</option>
                  {addFormDistricts.map(d => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                value={thanaName}
                onChange={(e) => setThanaName(e.target.value)}
                placeholder="Enter thana name"
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

          {/* Thana List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h2 className="text-xl font-bold">Thana List</h2>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Division</label>
                  <select
                    value={tableFilterDivision}
                    onChange={(e) => setTableFilterDivision(e.target.value)}
                    className="w-full border p-2 rounded"
                    disabled={isLoading}
                  >
                    <option value="">All Divisions</option>
                    {divisions.map(div => (
                      <option key={div.divisionId} value={div.divisionId}>
                        {div.divisionName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">District</label>
                  <div className="flex gap-2">
                    <select
                      value={tableFilterDistrict}
                      onChange={(e) => setTableFilterDistrict(e.target.value)}
                      className="w-full border p-2 rounded"
                      disabled={!tableFilterDivision || isLoading}
                    >
                      <option value="">All Districts</option>
                      {tableFilterDistricts.map(d => (
                        <option key={d.districtId} value={d.districtId}>
                          {d.districtName}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={resetTableFilters}
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
                    <th className="p-3 text-left font-medium">Thana Name</th>
                    <th className="p-3 text-left font-medium">District</th>
                    <th className="p-3 text-left font-medium">Division</th>
                    <th className="p-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : thanas.length > 0 ? (
                    thanas.map((t, i) => (
                      <tr key={t.thanaId} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          {tableFilterDistrict
                            ? i + 1
                            : (currentPage - 1) * pageSize + i + 1}
                        </td>
                        <td className="p-3">{t.thanaName || t.thanaName}</td>
                        <td className="p-3">
                          {allDistricts.find(d => d.districtId === t.districtId)?.districtName || "N/A"}
                        </td>
                        <td className="p-3">
                          {divisions.find(div => div.divisionId === 
                            allDistricts.find(div => div.districtId === t.districtId)?.divisionId
                          )?.divisionName || "N/A"}
                        </td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(t)}
                            className="text-blue-600 hover:underline"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(t)}
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
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        No thanas found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!tableFilterDistrict && totalPages > 1 && (
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="mb-6">Are you sure you want to delete "{thanaToDelete?.name}"?</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border rounded"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
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