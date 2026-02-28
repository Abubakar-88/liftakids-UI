import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { ToastContainer } from 'react-toastify';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
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
import UserNotificationsPage from './pages/UserNotificationsPage';
//import Settings from './pages/dashboard/admin/Settings';
import AdminListPage from './pages/dashboard/admin/AdminListPage';
import AdminProfilePage from './pages/dashboard/admin/AdminProfilePage';
import AdminNotificationsPage from './pages/dashboard/admin/AdminNotificationsPage';

// Import AuthProvider and ProtectedRoute
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  
   return (
    
      <AuthProvider>
        <div className="App">
          {/* Main Content */}
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/chose-option" element={<RoleSelection />} />
              <Route path="/login/:role" element={<Login />} />
              <Route path="/register/:role" element={<DynamicRegister />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<DynamicPage />}/>
              <Route path="/pages/:slug" element={<DynamicPage />} />
              <Route path="/about-us" element={<DynamicPage />} />
              <Route path="/benefit-for-sponsor" element={<DynamicPage />} />

              {/* Institution Protected Routes */}
              <Route path="/institution/dashboard" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/add-student" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <AddStudent />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/result-upload" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <StudentResultForm />
                </ProtectedRoute>
              } />
              
              <Route path="/results/confirmation" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <ResultConfirmation />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/student-list" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <StudentList />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/sponsored-students" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <SponsoredStudents />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/payment-confirmation" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <InstitutionPaymentConfirmation />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/manual-payment" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <InstitutionManualPayment />
                </ProtectedRoute>
              } />
              
              <Route path="/institution/notifications" element={
                <ProtectedRoute allowedRoles={['INSTITUTION']}>
                  <UserNotificationsPage userType="INSTITUTION" />
                </ProtectedRoute>
              } />

              {/* Donor Protected Routes */}
              <Route path="/donor/dashboard" element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DonarDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/donor/student-list-for-sponsor" element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <StudentListForSponsor />
                </ProtectedRoute>
              } />
              
              <Route path="/donar/sponsored-students" element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DonorSponsoredStudentList />
                </ProtectedRoute>
              } />
              
              <Route path="/donor/sponsored-students/:donorId/payments" element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DonorPaymentHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/donar/settings/:donorId" element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <DonorSettings />
                </ProtectedRoute>
              } />
              
              <Route path="/donor/password-change/:donorId" element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <PasswordChangeForm />
                </ProtectedRoute>
              } />
              
              <Route path="/donor/notifications" element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <UserNotificationsPage userType="DONOR" />
                </ProtectedRoute>
              } />

              {/* Admin Protected Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
                {/* Admin Management */}
                <Route path="/admin/admin-manage" element={<AdminListPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
                {/* <Route path="settings" element={<Settings />} /> */}
                <Route path="/admin/notifications" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminNotificationsPage />
                  </ProtectedRoute>
                } />

              <Route path="/admin/division-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DivisionManage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/district-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DistrictManage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/thana-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ThanaManage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/union-or-area-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UnionManage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/institution-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <InstitutionManage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/student-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StudentManage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/donar-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DonorManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sponsorships/new" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SponsorshipForm />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sponsor-manage" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SponsorshipManage />
                </ProtectedRoute>
              } />
              
              <Route path="/sponsorships/:id" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SponsorshipForm />
                </ProtectedRoute>
              }/>
              
              <Route path="/admin/pages" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageManage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/pages/edit/:slug" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <EditPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/pages/create" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CreatePage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/contact-management" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ContactPageManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/contact/messages" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ContactMessages />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/sent-emails" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <SentEmailsHistory />
                </ProtectedRoute>
              } />
              
              {/* <Route path="/admin/notifications" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <NotificationsPage userType="ADMIN" />
                </ProtectedRoute>
              } /> */}

              {/* Generic notifications (fallback) */}
              <Route path="/notifications" element={<UserNotificationsPage />} />

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
      </AuthProvider>
    
  );
}

export default App;