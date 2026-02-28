import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const StatusChangeModal = ({
  isOpen,
  onClose,
  statusModalData,
  uiState,
  setUiState,
  confirmStatusChange
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{statusModalData.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">{statusModalData.message}</p>
          {statusModalData.institution && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{statusModalData.institution.institutionName}</p>
              <p className="text-sm text-gray-500">{statusModalData.institution.email}</p>
              <p className="text-sm text-gray-500">{statusModalData.institution.phone}</p>
            </div>
          )}
        </div>

        {statusModalData.requiresReason && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for {statusModalData.action} *
            </label>
            <textarea
              value={uiState.reason}
              onChange={(e) => setUiState(prev => ({ ...prev, reason: e.target.value }))}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Please provide a reason for ${statusModalData.action}...`}
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={confirmStatusChange}
            disabled={uiState.isLoading || (statusModalData.requiresReason && !uiState.reason)}
            className={`${statusModalData.confirmButtonColor} text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {uiState.isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              statusModalData.confirmButtonText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StatusChangeModal;