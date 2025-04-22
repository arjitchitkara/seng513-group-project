import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { ArrowRight, BookOpen, FileText, ArrowUpRight } from 'lucide-react';

// Sample study resources for preview
const sampleResources = [
  {
    id: '1',
    title: 'Introduction to Data Structures',
    subject: 'Computer Science',
    pages: 24,
    type: 'Lecture Notes',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Calculus II: Integration Techniques',
    subject: 'Mathematics',
    pages: 18,
    type: 'Study Guide',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Principles of Microeconomics',
    subject: 'Economics',
    pages: 32,
    type: 'Summary',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=300&auto=format&fit=crop'
  }
];

const HeroSection = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span
              className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              Your academic success starts here
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Transform Your <br />
              <span className="text-gradient">Learning Experience</span>
            </h1>
            <p
              className="text-lg text-muted-foreground mb-8 max-w-lg"
            >
              Access and share academic resources with integrity. 
              Discover study materials, connect with peers, and excel in your courses.
            </p>
            <div
              className="flex flex-wrap gap-4"
            >
              <Link to="/auth/register">
                <AnimatedButton
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  hoverScale
                  ripple
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </AnimatedButton>
              </Link>
              <Link to="/courses">
                <AnimatedButton
                  size="lg"
                  variant="outline"
                  className="border-primary/20 text-foreground"
                  hoverScale
                >
                  Explore Courses
                </AnimatedButton>
              </Link>
            </div>
            <div
              className="mt-12 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium text-primary"
                  >
                    {['JD', 'ML', 'AK'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-primary font-medium">10,000+</span> students
                already joined
              </div>
            </div>
          </div>

          <div
            className="relative"
          >
            <GlassMorphism className="p-5 lg:p-6" intensity="light">
              <div className="w-full rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-foreground">Study Resources Preview</h3>
                  <Link to="/browse-documents" className="text-primary text-sm flex items-center hover:underline">
                    View all <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {sampleResources.map((resource) => (
                    <div key={resource.id} className="rounded-lg bg-background/80 hover:bg-background transition-colors duration-200 cursor-pointer overflow-hidden">
                      <div className="flex">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 overflow-hidden">
                          <img 
                            src={resource.image} 
                            alt={resource.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-3">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-medium text-foreground line-clamp-1">{resource.title}</h4>
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {resource.type}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">{resource.subject}</span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <FileText className="h-3 w-3 mr-1" />
                              {resource.pages} pages
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassMorphism>
            <div className="absolute -bottom-5 -right-5 lg:-bottom-8 lg:-right-8 p-4 lg:p-6 rounded-lg shadow-lg bg-background">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">15,000+ Documents</p>
                  <p className="text-xs text-muted-foreground">Verified academic resources</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
