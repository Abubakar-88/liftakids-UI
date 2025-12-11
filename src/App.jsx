import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import Search from './pages/Search';
import RoleSelection from './pages/RoleSelection';
import About from './pages/About';
import Benefits from './pages/Benefits';
import Login from './pages/Login';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import InstitutionDashboard from './pages/dashboard/institution/InstitutionDashboard';
import DonarDashboard from './pages/dashboard/donor/DonarDashboard'
import DynamicRegister from './components/DynamicRegister';
import './App.css'
import './index.css';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import AddStudent from './components/AddStudent';
import StudentResultForm from './pages/dashboard/institution/StudentResultForm';
import ResultConfirmation from './pages/dashboard/institution/ResultConfirmation';
import StudentList from './pages/dashboard/institution/StudentList';
import DivisionManage from './pages/dashboard/admin/DivisionManage';
import DistrictManage from './pages/dashboard/admin/DistrictManage';
import ThanaManage from './pages/dashboard/admin/ThanaManage';
import UnionManage from './pages/dashboard/admin/UnionManage';
import InstitutionManage from './pages/dashboard/admin/InstitutionManage';
import StudentManage from './pages/dashboard/admin/StudentManage';
import DonorManagement from './pages/dashboard/admin/DonorManagement';
import SponsorshipForm from './components/sponsorship/SponsorshipForm';
import SponsorshipManage from './pages/dashboard/admin/SponsorshipManage';
import SponsoredStudents from './pages/dashboard/institution/SponsoredStudents';
import StudentListForSponsor from './pages/dashboard/donor/StudentListForSponsor';
import DonorSponsoredStudentList from './pages/dashboard/donor/DonorSponsoredStudentList';
import DonorPaymentHistory from './pages/dashboard/donor/DonorPaymentHistory';
import DonorSettings from './pages/dashboard/donor/DonorSettings';
import PasswordChangeForm from './components/PasswordChangeForm';
import InstallPrompt from './components/InstallPrompt'; 
import PageManage from './pages/dashboard/admin/PageManage';
import EditPage from './pages/dashboard/admin/EditPage';
import CreatePage from './pages/dashboard/admin/CreatePage';
import ContactPageManagement from './pages/dashboard/admin/ContactPageManagement';
import DynamicPage from './pages/DynamicPage';
import BlogPage from './pages/Blog';
import ContactMessages from './pages/dashboard/admin/ContactMessages';
import SentEmailsHistory from './components/SentEmailsHistory';
import InstitutionPaymentConfirmation from './components/institutions/InstitutionPaymentConfirmation';
import InstitutionManualPayment from './pages/dashboard/institution/InstitutionManualPayment';


function App() {
  
   return (
    <>
      <div className="App">
        {/* Navbar - conditional based on route if needed */}
        {/* <Navbar /> */}
        
        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
          <Route path="/about-us" element={<DynamicPage />} /> {/* Dynamic about page */}
          <Route path="/benefit-for-sponsor" element={<DynamicPage />} /> {/* Dynamic benefits page */}
          <Route path="/blog" element={<BlogPage />} />
           <Route path="/contact" element={<DynamicPage />}/>
              {/* Catch-all route for dynamic pages */}
          <Route path="/pages/:slug" element={<DynamicPage />} />

            <Route path="/login/:role" element={<Login />} />
            <Route path="/register/:role" element={<DynamicRegister />} />
            <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
            <Route path="/institution/add-student" element={<AddStudent />} />
            <Route path="/institution/result-upload" element={<StudentResultForm />} />
            <Route path="/results/confirmation" element={<ResultConfirmation />} />
            <Route path="/institution/student-list" element={<StudentList />} />
           
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/division-manage" element={<DivisionManage />} />
            <Route path="/admin/district-manage" element={<DistrictManage />} />
            <Route path="/admin/thana-manage" element={<ThanaManage />} />
            <Route path="/admin/union-or-area-manage" element={<UnionManage />} />
            <Route path="/admin/institution-manage" element={<InstitutionManage />} />
            <Route path="/admin/student-manage" element={<StudentManage />} />
            <Route path="/admin/donar-manage" element={<DonorManagement />} />
            <Route path="/admin/sponsorships/new" element={<SponsorshipForm />} />
            <Route path="/admin/sponsor-manage" element={<SponsorshipManage />} />
            <Route path="/sponsorships/:id" element={<SponsorshipForm />}/>
            <Route path="/blog" element={<Blog />} />
            <Route path="/chose-option" element={<RoleSelection />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Institution dashboard */}
            <Route path="/institution/sponsored-students" element={<SponsoredStudents />} />
            <Route path="/institution/payment-confirmation" element={<InstitutionPaymentConfirmation />} />
            <Route path="/institution/manual-payment" element={<InstitutionManualPayment />} />
            {/* Donor Dashboard */}
            <Route path="/donor/dashboard" element={<DonarDashboard />} />
            <Route path="/donor/student-list-for-sponsor" element={<StudentListForSponsor />} />
            <Route path="/donar/sponsored-students" element={<DonorSponsoredStudentList />} />
            <Route path="/donor/sponsored-students/:donorId/payments" element={<DonorPaymentHistory />} />
            <Route path="/donar/settings/:donorId" element={<DonorSettings />} />
            <Route path="/donor/password-change/:donorId" element={<PasswordChangeForm/>} />



            {/* PageManage */}
                 <Route path="/admin/pages" element={<PageManage />} />
                <Route path="/admin/pages/edit/:slug" element={<EditPage />} />
                <Route path="/admin/pages/create" element={<CreatePage />} />
                 <Route path="/admin/contact-management" element={<ContactPageManagement />} />
                 <Route path="/admin/contact/messages" element={<ContactMessages />} />
                 <Route path="/admin/sent-emails" element={<SentEmailsHistory />} />
          </Routes>
        </main>

        {/* PWA Install Prompt */}
        <InstallPrompt />

        {/* Toast Notifications */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </>
  );
}

export default App