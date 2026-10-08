import { Routes, Route, Navigate, BrowserRouter, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/ui/AuthLayout';
import { Login } from './pages/auth/Login';
import { CandidateRegister } from './pages/auth/CandidateRegister';
import { CompanyRegister } from './pages/auth/CompanyRegister';
import { DashboardLayout } from './components/ui/DashboardLayout';
import { CompanyDashboard } from './pages/dashboard/CompanyDashboard';
import { JobPostingCandidates } from './pages/dashboard/JobPostingCandidates';
import { CandidateDashboard } from './pages/dashboard/CandidateDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { AnonymousRoute } from './components/routes/AnonymousRoute';
import { CompanyRoute } from './components/routes/CompanyRoute';
import { CandidateRoute } from './components/routes/CandidateRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route element={<AnonymousRoute><Outlet /></AnonymousRoute>}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/candidate/register" element={<CandidateRegister />} />
              <Route path="/company/register" element={<CompanyRegister />} />
            </Route>
          </Route>

          <Route element={<CompanyRoute><Outlet /></CompanyRoute>}>
            <Route element={<DashboardLayout />}>
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/dashboard/postings/:id/candidates" element={<JobPostingCandidates />} />
            </Route>
          </Route>

          <Route element={<CandidateRoute><Outlet /></CandidateRoute>}>
            <Route element={<DashboardLayout />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
