import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader } from "lucide-react";

// Define Role type if not available elsewhere
type Role = 'USER' | 'MODERATOR' | 'ADMIN';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Helper function to check if user has sufficient permissions
  const hasRequiredRole = (userRole: string, requiredRole: Role): boolean => {
    if (userRole === requiredRole) return true;
    if (userRole === 'ADMIN') return true; // Admin can access everything
    if (userRole === 'MODERATOR' && requiredRole === 'USER') return true;
    return false;
  };

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
    
    if (!hasRequiredRole(userRole, requiredRole)) {
      // If user doesn't have the required role, redirect to dashboard with insufficient permissions
      return <Navigate to="/dashboard" state={{ insufficientPermissions: true }} replace />;
    }
  }

  // User is authenticated and has required role, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 