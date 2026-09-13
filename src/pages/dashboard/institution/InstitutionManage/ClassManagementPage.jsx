
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassManagementModal from '../../../../components/Modal/InsitutionManage/ClassManagementModal';

const ClassManagementPage = () => {
  const navigate = useNavigate();
  const [institutionId, setInstitutionId] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('institutionData'));
    setInstitutionId(data?.institutionsId);
  }, []);

  return (
    <ClassManagementModal
      isOpen={true}
      onClose={() => navigate('/institution/manage')} // 👈 পেজে back
      institutionId={institutionId}
    />
  );
};

export default ClassManagementPage;