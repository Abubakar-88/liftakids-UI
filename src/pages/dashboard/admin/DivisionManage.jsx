import { useEffect, useState } from "react";
import { getDivisions, createDivision, updateDivision, deleteDivision } from "../../../api/areaApi";
import AdminDashboard from "./AdminDashboard";

export default function DivisionManager() {
  const [divisions, setDivisions] = useState([]);
  const [divisionName, setdivisionName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
    const [flashMessage, setFlashMessage] = useState({
      show: false,
      message: '',
      type: 'success' 
    });
  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    const res = await getDivisions();
    setDivisions(res.data);
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!divisionName.trim()) {
      setFlashMessage({
        show: true,
        message: 'Division name cannot be empty',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingId) {
        await updateDivision(editingId, { divisionName: divisionName.trim() });
        setFlashMessage({
          show: true,
          message: 'Division updated successfully',
          type: 'success'
        });
      } else {
        await createDivision({ divisionName: divisionName.trim() });
        setFlashMessage({
          show: true,
          message: 'Division created successfully',
          type: 'success'
        });
      }
      
      resetForm();
      await loadDivisions();
      
    } catch (error) {
      console.error("Operation failed:", error);
      setFlashMessage({
        show: true,
        message: error.response?.data?.message || "Operation failed",
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (d) => {
    setdivisionName(d.divisionName);
    setEditingId(d.divisionId);
  };
// const handleEdit = (division) => {
//   console.log("Division object received:", division);
  
//   // Make sure we're using the exact property names from your API
//   setdivisionName(division.divisionName);
//   setEditingId(division.divisionId); // or division.divisionId depending on your actual data
  
//   // Scroll to form for better UX
//   document.getElementById('division-form')?.scrollIntoView({ behavior: 'smooth' });
// };

  const confirmDelete = (divisionId) => {
    setSelectedId(divisionId);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteDivision(selectedId);
      loadDivisions();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setShowModal(false);
      setSelectedId(null);
      setIsLoading(false);
    }
  };

  return (
    <AdminDashboard>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Manage Divisions</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            {/* Form Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {editingId ? "Update Division" : "Add New Division"}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="divisionName" className="block text-sm font-medium text-gray-700 mb-1">
                Division Name
              </label>
              <input
                id="divisionName"
                value={divisionName}
                onChange={(e) => setdivisionName(e.target.value)}
                placeholder="Enter division name"
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {editingId ? "Update" : "Add"}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md transition duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
            </div>

            {/* Divisions List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Division List</h2>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Division Name
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                   {divisions.map((d, i) => (
                          <tr key={d.divisionId} className="hover:bg-gray-50"> 
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {i + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {d.divisionName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              <div className="flex justify-center space-x-2">
                                <button
                      onClick={() => handleEdit(d)}
                      className="text-sm text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded transition"
                    >
                      Edit
                    </button>
                                <button
                                  onClick={() => confirmDelete(d.divisionId)} 
                                  className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs transition">
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    {divisions.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                          No divisions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this division? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
}