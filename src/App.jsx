import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import AdminDashboardHome from './pages/dashboard/admin/AdminDashboardHome'; // 👈 নতুন create করুন
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
import AdminListPage from './pages/dashboard/admin/AdminListPage';
import AdminProfilePage from './pages/dashboard/admin/AdminProfilePage';
import AdminNotificationsPage from './pages/dashboard/admin/AdminNotificationsPage';
import BlogList from './pages/dashboard/admin/BlogList';
import CreateBlog from './pages/dashboard/admin/CreateBlog';
import { NotificationProvider } from './contexts/NotificationContext'; 
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import EditBlog from './pages/dashboard/admin/EditBlog';
import BlogDetails from './pages/BlogDetails';
import BlogGrid from './pages/BlogGrid';
function App() {
  
  return (
    <AuthProvider>
      <NotificationProvider> 
        <div className="App">
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/chose-option" element={<RoleSelection />} />
              <Route path="/login/:role" element={<Login />} />
              <Route path="/register/:role" element={<DynamicRegister />} />
              {/* <Route path="/blog" element={<BlogPage />} /> */}
              <Route path="/contact" element={<DynamicPage />}/>
              <Route path="/pages/:slug" element={<DynamicPage />} />
              <Route path="/about-us" element={<DynamicPage />} />
              <Route path="/benefit-for-sponsor" element={<DynamicPage />} />
                  <Route path="/blog/:slug" element={<BlogDetails />} />
                  <Route path="/blog" element={<BlogGrid />} />
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
                  <UserNotificationsPage />
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
                  <UserNotificationsPage />
                </ProtectedRoute>
              } />

              {/* ========== ADMIN PROTECTED ROUTES WITH LAYOUT ========== */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                {/* Index route - redirects to dashboard */}
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* Dashboard Home */}
                <Route path="dashboard" element={<AdminDashboardHome />} />
                
                {/* Admin Management */}
                <Route path="admin-manage" element={<AdminListPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="notifications" element={<AdminNotificationsPage />} />
                
                {/* Location Management */}
                <Route path="division-manage" element={<DivisionManage />} />
                <Route path="district-manage" element={<DistrictManage />} />
                <Route path="thana-manage" element={<ThanaManage />} />
                <Route path="union-or-area-manage" element={<UnionManage />} />
                
                {/* User Management */}
                <Route path="institution-manage" element={<InstitutionManage />} />
                <Route path="student-manage" element={<StudentManage />} />
                <Route path="donar-manage" element={<DonorManagement />} />
                <Route path="sponsor-manage" element={<SponsorshipManage />} />
                
                {/* Sponsorship */}
                <Route path="sponsorships/new" element={<SponsorshipForm />} />
                <Route path="sponsorships/:id" element={<SponsorshipForm />} />
                
                {/* Content Management */}
                <Route path="pages" element={<PageManage />} />
                <Route path="pages/create" element={<CreatePage />} />
                <Route path="pages/edit/:slug" element={<EditPage />} />
                <Route path="contact-management" element={<ContactPageManagement />} />
                <Route path="contact/messages" element={<ContactMessages />} />
                <Route path="sent-emails" element={<SentEmailsHistory />} />
                <Route path="articles" element={<BlogList/>} />
                <Route path="articles/create" element={<CreateBlog/>} />
                  <Route path="articles/edit/:id" element={<EditBlog />} />
                 
              </Route>

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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;