import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

function UserMenu() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <div>
      {/* Your User Menu UI */}
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

export default UserMenu; 