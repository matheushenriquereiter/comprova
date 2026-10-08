import { Outlet } from 'react-router-dom';
export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => { 
  if (allowedRoles) { /* do nothing */ }
  return <Outlet />; 
};
export const PublicRoute = () => <Outlet />;
