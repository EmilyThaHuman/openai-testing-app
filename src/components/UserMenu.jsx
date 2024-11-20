import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function UserMenu() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div>
      {/* Your User Menu UI */}
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

export default UserMenu; 