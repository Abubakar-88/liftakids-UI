import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import {
  getDivisions,
  getDistrictsByDivision,
  getAllDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "../../../api/areaApi";
import { toast } from 'react-toastify';
export default function DistrictManager() {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtName, setDistrictName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedDivisionForForm, setSelectedDivisionForForm] = useState("");
  const [selectedDivisionForFilter, setSelectedDivisionForFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalDistricts, setTotalDistricts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchDivisions();
    fetchDistricts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchDistricts();
  }, [selectedDivisionForFilter]);

  const fetchDivisions = async () => {
    try {
      setIsLoading(true);
      const res = await getDivisions();
      setDivisions(res.data.content || res.data);
    } catch (err) {
      setError("Failed to load divisions");
      console.error("Error fetching divisions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let res;
      
      if (selectedDivisionForFilter) {
        res = await getDistrictsByDivision(selectedDivisionForFilter);
        setDistricts(res.data || []);
        setTotalDistricts(res.data?.length || 0);
      } else {
        res = await getAllDistricts();
        setDistricts(res.data.content || res.data || []);
        setTotalDistricts(res.data?.totalElements || res.data?.length || 0);
      }
    } catch (err) {
      setError("Failed to load districts");
      console.error("Error fetching districts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Clear previous errors
  setError(null);

  // Validation
  if (!selectedDivisionForForm) {
    toast.error("Please select a division");
    return;
  }
  if (!districtName?.trim()) {
    toast.error("District name cannot be empty");
    return;
  }

  try {
    setIsLoading(true);
    
    const payload = {
      districtName: districtName.trim(),
      divisionId: Number(selectedDivisionForForm)
    };

    const response = editingId 
      ? await updateDistrict(editingId, payload)
      : await createDistrict(payload);

    // Success toast
    toast.success(
      editingId 
        ? 'District updated successfully!' 
        : 'District created successfully!',
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      }
    );

    // Reset form
    setDistrictName("");
    setEditingId(null);
    setSelectedDivisionForForm("");
    
    // Refresh data
    await fetchDistricts();
    
  } catch (err) {
    console.error("Error:", err);
    toast.error(
      err.response?.data?.message || "Failed to save district",
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      }
    );
  } finally {
    setIsLoading(false);
  }
};

  const handleEdit = (d) => {
    setDistrictName(d.districtName);
    setEditingId(d.districtId); // Changed from divisionId to districtId
    setSelectedDivisionForForm(d.divisionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setDistrictName("");
    setEditingId(null);
    setSelectedDivisionForForm("");
  };

  const confirmDelete = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteDistrict(selectedId);
      await fetchDistricts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete district");
      console.error("Error deleting district:", err);
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setSelectedId(null);
    }
  };

  // Calculate paginated districts
  const filteredDistricts = selectedDivisionForFilter
    ? districts
    : districts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

  const totalPages = Math.ceil(totalDistricts / pageSize);

  return (
    <AdminDashboard>
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Manage Districts</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-xl">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              {editingId ? "Edit District" : "Add New District"}
            </label>
            <select
              value={selectedDivisionForForm}
              onChange={(e) => {
                console.log("Selected value:", e.target.value);
                setSelectedDivisionForForm(e.target.value);
              }}
              className="w-full border border-gray-300 px-4 py-2 rounded text-gray-800 bg-white"
              required
              disabled={isLoading}
            >
              <option value="">-- Select Division --</option>
              {divisions.map((div) => (
                <option 
                  key={div.divisionId} 
                  value={div.divisionId}
                >
                  {div.divisionName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <input
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              placeholder="District name"
              className="flex-1 border px-4 py-2 rounded border-gray-300 text-gray-800"
              required
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-4 max-w-xl">
          <label className="block mb-1 font-medium text-gray-700">Filter Districts by Division</label>
          <div className="flex gap-2">
            <select
              value={selectedDivisionForFilter}
              onChange={(e) => setSelectedDivisionForFilter(e.target.value)}
              className="flex-1 border border-gray-300 px-4 py-2 rounded text-gray-800 bg-white"
              disabled={isLoading}
            >
              <option value="">-- Show All Divisions --</option>
              {divisions.map((div) => (
                <option key={div.divisionId} value={div.divisionId}>
                  {div.divisionName}
                </option>
              ))}
            </select>
            {selectedDivisionForFilter && (
              <button
                onClick={() => setSelectedDivisionForFilter("")}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading districts...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border border-gray-200">
                <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">District</th>
                  <th className="px-4 py-2 border">Division</th>
                  <th className="px-4 py-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map((d, i) => (
                    <tr key={d.districtId} className="hover:bg-gray-50 border-t">
                      <td className="px-4 py-2 border">
                        {selectedDivisionForFilter 
                          ? i + 1 
                          : (currentPage - 1) * pageSize + i + 1}
                      </td>
                      <td className="px-4 py-2 border">{d.districtName}</td>
                      <td className="px-4 py-2 border">
                        {d.divisionName || 
                         divisions.find(div => div.divisionId === d.divisionId)?.divisionName || 
                         'N/A'}
                      </td>
                      <td className="px-4 py-2 border text-center space-x-2">
                        <button 
                          onClick={() => handleEdit(d)} 
                          className="text-blue-600 hover:underline"
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(d.districtId)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      {selectedDivisionForFilter 
                        ? "No districts found for the selected division" 
                        : "No districts available. Please add a district."}
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>

            {!selectedDivisionForFilter && totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalDistricts)} of {totalDistricts} districts
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-1">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages || isLoading}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6">Are you sure you want to delete this District?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
}