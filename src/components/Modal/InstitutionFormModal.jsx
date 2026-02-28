import React from 'react';
import Modal from 'react-modal';
import { FaCheckCircle } from 'react-icons/fa';

Modal.setAppElement('#root');

const InstitutionFormModal = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleDivisionChange,
  handleDistrictChange,
  handleThanaChange,
  handleSubmit,
  data,
  uiState,
  editingId
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingId ? 'Edit Institution' : 'Add New Institution'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name*</label>
              <input
                type="text"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution Type*</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Type</option>
                <option value="NURANI MADARASHA">Nurani Madrasha</option>
                <option value="KAWMI">Kawmi Madrasha</option>
                <option value="SCHOOL">School</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Division*</label>
              <select
                name="divisionId"
                value={formData.divisionId}
                onChange={handleDivisionChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Division</option>
                {data.formDivisions.map(div => (
                  <option key={div.divisionId} value={div.divisionId}>
                    {div.divisionName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District*</label>
              <select
                name="districtId"
                value={formData.districtId}
                onChange={handleDistrictChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.divisionId}
                required
              >
                <option value="">Select District</option>
                {data.formDistricts.map(dist => (
                  <option key={dist.districtId} value={dist.districtId}>
                    {dist.districtName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thana*</label>
              <select
                name="thanaId"
                value={formData.thanaId}
                onChange={handleThanaChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.districtId}
                required
              >
                <option value="">Select Thana</option>
                {data.formThanas.map(thana => (
                  <option key={thana.thanaId} value={thana.thanaId}>
                    {thana.thanaName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Union/Area*</label>
              <select
                name="unionOrAreaId"
                value={formData.unionOrAreaId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.thanaId}
                required
              >
                <option value="">Select Union/Area</option>
                {data.formUnionOrAreas.map(union => (
                  <option key={union.unionOrAreaId} value={union.unionOrAreaId}>
                    {union.unionOrAreaName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher*</label>
              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Designation*</label>
              <input
                type="text"
                name="teacherDesignation"
                value={formData.teacherDesignation}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village/House No</label>
            <input
              type="text"
              name="villageOrHouse"
              value={formData.villageOrHouse}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}
  <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Institutions</label>
            <textarea
              name="aboutInstitution"
              value={formData.aboutInstitution}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              disabled={uiState.isLoading}
            >
              {uiState.isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default InstitutionFormModal;