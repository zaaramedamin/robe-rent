import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Wraps admin-only routes. Redirects to the login page when there is no
// valid admin token (missing or expired).
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}
