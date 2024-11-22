import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    // Redirect authenticated users to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
} 