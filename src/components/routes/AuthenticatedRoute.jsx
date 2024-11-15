import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AuthenticatedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/auth/login" replace />;
  }

  return children;
} 