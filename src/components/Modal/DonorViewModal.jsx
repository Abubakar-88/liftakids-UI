// src/components/DonorViewModal.jsx
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { fetchSponsoredStudents } from '../../api/donarApi';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const DonorViewModal = ({ donor, isOpen, onClose }) => {
  const [sponsoredStudents, setSponsoredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (donor && isOpen) {
      const loadSponsoredStudents = async () => {
        setIsLoading(true);
        try {
          const res = await fetchSponsoredStudents(donor.donorId);
          setSponsoredStudents(res.data);
        } catch (error) {
          toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      };
      loadSponsoredStudents();
    }
  }, [donor, isOpen]);

  if (!donor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Donor Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold">Basic Information</h3>
            <p><strong>Name:</strong> {donor.name}</p>
            <p><strong>Email:</strong> {donor.email}</p>
            <p><strong>Phone:</strong> {donor.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold">Additional Details</h3>
            <p><strong>Type:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                donor.type === 'ORGANIZATION' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {donor.type}
              </span>
            </p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                donor.status 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {donor.status ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p><strong>Address:</strong> {donor.address}</p>
          </div>
        </div>

      <h3 className="font-semibold text-lg mb-2">
          Sponsored Students ({donor.sponsoredStudentsCount || 0})
        </h3>

        {isLoading ? (
          <p>Loading sponsorships...</p>
        ) : (
          sponsoredStudents && sponsoredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Institution</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Since</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sponsoredStudents.map((student) => (
                    <tr key={student.sponsorshipId}>
                      <td className="px-4 py-2">{student.studentName}</td>
                      <td className="px-4 py-2">{student.institutionName}</td>
                      <td className="px-4 py-2">${student.monthlyAmount}</td>
                      <td className="px-4 py-2">
                        {new Date(student.startDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No sponsored students found</p>
          )
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DonorViewModal;