
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { CourseCard } from './CourseCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample course data
const featuredCourses = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    subject: 'Computer Science',
    description: 'Comprehensive introduction to computer science principles and programming fundamentals.',
    documentCount: 124,
    rating: 4.8,
    userCount: 2340,
    imageSrc: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  },
  {
    id: '2',
    title: 'Organic Chemistry I',
    subject: 'Chemistry',
    description: 'Explore the structures, properties, and reactions of organic compounds.',
    documentCount: 89,
    rating: 4.6,
    userCount: 1870,
    imageSrc: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
  },
  {
    id: '3',
    title: 'Calculus and Analytical Geometry',
    subject: 'Mathematics',
    description: 'Advanced mathematical concepts with applications in science and engineering.',
    documentCount: 156,
    rating: 4.7,
    userCount: 3120,
    imageSrc: 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
  },
  {
    id: '4',
    title: 'Principles of Microeconomics',
    subject: 'Economics',
    description: 'Study of individual consumer and firm behavior in different market structures.',
    documentCount: 78,
    rating: 4.5,
    userCount: 1550,
    imageSrc: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
  },
  {
    id: '5',
    title: 'World History: Modern Era',
    subject: 'History',
    description: 'Comprehensive overview of major historical events and movements since 1750.',
    documentCount: 112,
    rating: 4.3,
    userCount: 980,
    imageSrc: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e',
  },
  {
    id: '6',
    title: 'Introduction to Psychology',
    subject: 'Psychology',
    description: 'Foundational concepts in the scientific study of behavior and mental processes.',
    documentCount: 95,
    rating: 4.9,
    userCount: 2680,
    imageSrc: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
  },
];

export const FeaturedSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check for mobile view
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);
  
  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(featuredCourses.length / itemsPerPage);
  
  const handleNext = () => {
    setActive((prev) => (prev + 1) % totalPages);
  };
  
  const handlePrev = () => {
    setActive((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const visibleCourses = featuredCourses.slice(
    active * itemsPerPage,
    (active + 1) * itemsPerPage
  );
  
  return (
    <section ref={ref} className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Featured Courses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular courses with comprehensive study materials, guides, 
            and resources to help you excel in your academic journey.
          </p>
        </motion.div>
        
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {visibleCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </motion.div>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-10 space-x-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handlePrev}
                className="rounded-full"
                disabled={active === 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      active === index
                        ? 'bg-primary w-5'
                        : 'bg-primary/30'
                    }`}
                  />
                ))}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleNext}
                className="rounded-full"
                disabled={active === totalPages - 1}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
