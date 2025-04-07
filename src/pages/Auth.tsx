import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Check, EyeOff, Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { mode = 'login' } = useParams<{ mode: 'login' | 'register' | string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Reset form state when mode changes
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'user'
    });
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
    setIsSubmitting(false);
  }, [mode]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else {
      newErrors.password = '';
    }

    if (mode === 'register') {
      // Validate fullName for registration
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
        isValid = false;
      } else {
        newErrors.fullName = '';
      }

      // Validate password confirmation for registration
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      } else {
        newErrors.confirmPassword = '';
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        if (mode === 'login') {
          await signIn(formData.email, formData.password);
        } else if (mode === 'register') {
          await signUp(formData.email, formData.password, formData.fullName);
        }
      } catch (error) {
        // Error handling is done in the auth context
        console.error('Auth error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleMode = () => {
    navigate(`/auth/${mode === 'login' ? 'register' : 'login'}`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Link to="/" className="inline-flex items-center mb-6 text-sm text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>
        
        <GlassMorphism 
          className="w-full p-8"
          intensity="medium"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gradient">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'login' 
                ? 'Sign in to access your account and resources' 
                : 'Join our community of students and educators'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`bg-white/20 border-white/10 focus:border-primary ${
                    errors.fullName ? 'border-destructive' : ''
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-white/20 border-white/10 focus:border-primary ${
                  errors.email ? 'border-destructive' : ''
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`bg-white/20 border-white/10 focus:border-primary pr-10 ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password}</p>
              )}
            </div>
            
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`bg-white/20 border-white/10 focus:border-primary ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {mode === 'login' 
                  ? "Don't have an account?" 
                  : "Already have an account?"}
                <Button 
                  variant="link" 
                  className="text-primary hover:text-primary/80 p-0 h-auto font-medium ml-1"
                  onClick={handleToggleMode}
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </Button>
              </p>
            </div>
            
            {mode === 'login' && (
              <div className="text-center mt-1">
                <Button 
                  variant="link" 
                  className="text-xs text-muted-foreground hover:text-primary p-0 h-auto"
                  onClick={() => toast({
                    title: 'Password Reset',
                    description: 'This feature is coming soon. Please contact support for assistance.',
                  })}
                >
                  Forgot your password?
                </Button>
              </div>
            )}
          </form>
        </GlassMorphism>
      </motion.div>
    </div>
  );
};

export default Auth;
