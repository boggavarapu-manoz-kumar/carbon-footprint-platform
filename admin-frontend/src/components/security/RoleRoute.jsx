import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/AuthContext';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
