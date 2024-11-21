import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <div>
        <Link to="/" className="text-xl font-bold">
          AI Playground
        </Link>
      </div>
      <div>
        {user ? (
          <>
            <Link to="/dashboard" className="mr-4">
              Dashboard
            </Link>
            <Link to="/profile" className="mr-4">
              Profile
            </Link>
            {/* Add Sign Out button or User Menu here */}
          </>
        ) : (
          <>
            <Link to="/signin" className="mr-4">
              Sign In
            </Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
