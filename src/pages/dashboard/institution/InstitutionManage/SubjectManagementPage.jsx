
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubjectManagementModal from '../../../../components/Modal/InsitutionManage/SubjectManagementModal';

const SubjectManagementPage = () => {
  const navigate = useNavigate();
  const [institutionId, setInstitutionId] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('institutionData'));
    setInstitutionId(data?.institutionsId);
  }, []);

  return (
    <SubjectManagementModal
      isOpen={true}
      onClose={() => navigate('/institution/manage')}
      institutionId={institutionId}
    />
  );
};

export default SubjectManagementPage;