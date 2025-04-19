import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase-client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { fullName?: string; avatar?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set initial session and user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      // Create profile after successful signup - using the new user's ID from the response
      if (data.user) {
        // Create Supabase profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ user_id: data.user.id }]);

        if (profileError) console.error('Error creating profile:', profileError);
        
        // Create user in Prisma database
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.user.id,
              email: email,
              fullName: fullName,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating user in Prisma database:', errorData);
          }
        } catch (dbError) {
          console.error('Failed to create user in Prisma database:', dbError);
        }
      }

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to confirm your account.',
      });
      
      navigate('/auth/login');
    } catch (error: unknown) {
      toast({
        title: 'Error creating account',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, role: string = 'USER') => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update user metadata with the selected role
      if (data?.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role }
        });
        
        if (updateError) {
          console.error('Error updating user role:', updateError);
        }
      }

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      
      // Redirect based on role
      if (role === 'MODERATOR') {
        navigate('/moderator-dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: 'Error signing in',
        description: authError.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/');
    } catch (error: unknown) {
      toast({
        title: 'Error signing out',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for a password reset link.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error resetting password',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { fullName?: string; avatar?: string }) => {
    try {
      setLoading(true);
      
      if (!user) throw new Error('User not authenticated');
      
      // Update auth metadata if fullName provided
      if (data.fullName) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: data.fullName }
        });
        
        if (updateError) throw updateError;
      }
      
      // Update profile
      const updates = {
        ...(data.fullName && { full_name: data.fullName }),
        ...(data.avatar && { avatar: data.avatar }),
        updated_at: new Date().toISOString(),
      };
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 