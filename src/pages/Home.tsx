import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already logged in, redirect to appropriate dashboard
    if (user) {
      const role = user.user_metadata?.role || 'USER';
      
      if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (role === 'MODERATOR') {
        navigate('/moderator-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // ... rest of the existing component code ...
} 