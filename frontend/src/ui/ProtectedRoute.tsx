import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // If user navigates to a protected route without a token, clear any stale state
    if (!token) {
      localStorage.clear();
    }
  }, [token]);

  if (!token) {
    // Redirect to login, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Loader function for react-router to check auth before rendering
export function requireAuthLoader() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return null;
}
