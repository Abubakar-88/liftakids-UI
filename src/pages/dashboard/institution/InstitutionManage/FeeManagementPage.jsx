// pages/dashboard/institution/FeeManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaMoneyBillWave, FaHistory, 
  FaExclamationTriangle, FaCog
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getActiveClasses } from '../../../../api/InstitutionManage/instituteClassApi';
import FeeStructureTab from '../../../../components/Modal/InsitutionManage/FeeStructureTab';
import FeeCollectionTab from '../../../../components/Modal/InsitutionManage/FeeCollectionTab';
import DueListTab from '../../../../components/Modal/InsitutionManage/DueListTab';
import PaymentHistoryTab from '../../../../components/Modal/InsitutionManage/PaymentHistoryTab';

const FeeManagementPage = () => {
  const navigate = useNavigate();
  const institutionData = JSON.parse(localStorage.getItem('institutionData'));
  const institutionId = institutionData?.institutionsId;

  const [activeTab, setActiveTab] = useState('collect');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institutionId) fetchClasses();
  }, [institutionId]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getActiveClasses(institutionId);
      setClasses(data || []);
    } catch (err) {
      console.error('Error loading classes:', err);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'collect', label: 'Collect Fee', icon: <FaMoneyBillWave /> },
    { key: 'structure', label: 'Fee Structure', icon: <FaCog /> },
    { key: 'due', label: 'Due List', icon: <FaExclamationTriangle /> },
    { key: 'history', label: 'Payment History', icon: <FaHistory /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/institution/manage')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaMoneyBillWave className="text-teal-600" /> Fee Management
          </h1>
          <p className="text-gray-500 text-sm">
            {institutionData?.institutionName || 'Manage student fees'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'collect' && <FeeCollectionTab classes={classes} institutionId={institutionId} />}
          {activeTab === 'structure' && <FeeStructureTab classes={classes} institutionId={institutionId} />}
          {activeTab === 'due' && <DueListTab classes={classes} institutionId={institutionId} />}
          {activeTab === 'history' && <PaymentHistoryTab classes={classes} institutionId={institutionId} />}
        </>
      )}
    </div>
  );
};

export default FeeManagementPage;