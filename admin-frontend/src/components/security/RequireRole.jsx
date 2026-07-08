import { useAuth } from '../../core/AuthContext';

export const RequireRole = ({ children, allowedRoles, fallback = null }) => {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return fallback;
  }

  return children;
};
