import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/ui/AuthLayout';
import { Login } from './pages/auth/Login';
import { CandidateRegister } from './pages/auth/CandidateRegister';
import { CompanyRegister } from './pages/auth/CompanyRegister';
import { DashboardLayout } from './components/ui/DashboardLayout';
import { CompanyDashboard } from './pages/dashboard/CompanyDashboard';
import { JobPostingCandidates } from './pages/dashboard/JobPostingCandidates';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register/candidate" element={<CandidateRegister />} />
        <Route path="/register/company" element={<CompanyRegister />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/dashboard/postings/:id/candidates" element={<JobPostingCandidates />} />
      </Route>
    </Routes>
  );
}

export default App;
