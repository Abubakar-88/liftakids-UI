import { useParams } from 'react-router-dom';
import DonorRegister from './DonorRegister';
import InstitutionRegister from './InstitutionRegister';

const DynamicRegister = () => {
  const { role } = useParams();

  return (
    <>
      {role === 'donor' && <DonorRegister />}
      {role === 'institution' && <InstitutionRegister />}
      {!['donor', 'institution'].includes(role) && <div>Invalid role</div>}
    </>
  );
};

export default DynamicRegister;