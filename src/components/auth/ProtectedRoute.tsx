import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If authentication state is still loading, show loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check the user's role
  if (requiredRole) {
    const userRole = user.user_metadata?.role || 'USER';
    
    if (userRole !== requiredRole && 
        !(userRole === 'ADMIN' && requiredRole === 'MODERATOR') && 
        !(userRole === 'ADMIN' && requiredRole === 'USER') &&
        !(userRole === 'MODERATOR' && requiredRole === 'USER')) {
      // If user doesn't have the required role, redirect to dashboard with insufficient permissions
      return <Navigate to="/dashboard" state={{ insufficientPermissions: true }} replace />;
    }
  }

  // User is authenticated and has required role, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 