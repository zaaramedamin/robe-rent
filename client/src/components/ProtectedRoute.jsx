import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Wraps admin-only routes. Redirects to the login page when there is
// no admin token.
export default function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
