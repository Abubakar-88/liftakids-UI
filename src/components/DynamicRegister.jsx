import { useParams } from 'react-router-dom';
import DonarRegister from './DonorRegister';
import InstitutionRegister from './InstitutionRegister';

const DynamicRegister = () => {
  const { role } = useParams();

  return (
    <>
      {role === 'donar' && <DonarRegister />}
      {role === 'institution' && <InstitutionRegister />}
      {!['donar', 'institution'].includes(role) && <div>Invalid role</div>}
    </>
  );
};

export default DynamicRegister;