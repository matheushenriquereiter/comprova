import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthLayout } from './components/ui/AuthLayout';
import { Login } from './pages/auth/Login';
import { CandidateRegister } from './pages/auth/CandidateRegister';
import { CompanyRegister } from './pages/auth/CompanyRegister';
import { DashboardLayout } from './components/ui/DashboardLayout';
import { CompanyDashboard } from './pages/dashboard/CompanyDashboard';
import { JobPostingCandidates } from './pages/dashboard/JobPostingCandidates';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register/candidate" element={<CandidateRegister />} />
              <Route path="/register/company" element={<CompanyRegister />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ROLE_COMPANY']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/dashboard/postings/:id/candidates" element={<JobPostingCandidates />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
