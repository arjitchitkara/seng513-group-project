import axios from 'axios';
import { supabase } from './supabase-client';

// Create an axios instance with default config
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(async (config) => {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // If we have a session, add the access token as a Bearer token
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
}); 