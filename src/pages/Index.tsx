import { useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import { FeaturedSection } from '@/components/ui/FeaturedSection';

// Lazy load the other sections to improve initial loading
const StatsSection = lazy(() => import('@/components/home/StatsSection'));
const FeaturesSection = lazy(() => import('@/components/home/FeaturesSection'));
const WhyChooseUsSection = lazy(() => import('@/components/home/WhyChooseUsSection'));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'));
const CTASection = lazy(() => import('@/components/home/CTASection'));

// Simple loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Simple error boundary fallback
const ErrorFallback = () => (
  <div className="p-8 text-center text-red-500">
    <p>Something went wrong loading this section.</p>
  </div>
);

const Index = () => {
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

  // Add error handling
  const handleError = (error: Error) => {
    console.error('Error rendering component:', error);
    return <ErrorFallback />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero section is not lazy loaded for faster initial render */}
      <HeroSection />
      
      {/* Lazy load other sections with error boundaries */}
      <Suspense fallback={<LoadingFallback />}>
        <StatsSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <FeaturesSection />
      </Suspense>
      
      {/* FeaturedSection is not lazy loaded since it's exported as named export */}
      <FeaturedSection />
      
      <Suspense fallback={<LoadingFallback />}>
        <WhyChooseUsSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <TestimonialsSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <CTASection />
      </Suspense>
      
      <Footer />
    </div>
  );
};

export default Index;
