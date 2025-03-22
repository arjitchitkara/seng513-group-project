
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { ArrowRight, BookOpen } from 'lucide-react';

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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your academic success starts here
            </motion.span>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              variants={fadeIn}
            >
              Transform Your <br />
              <span className="text-gradient">Learning Experience</span>
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground mb-8 max-w-lg"
              variants={fadeIn}
              transition={{ delay: 0.1 }}
            >
              Access and share academic resources with integrity. 
              Discover study materials, connect with peers, and excel in your courses.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              variants={fadeIn}
              transition={{ delay: 0.2 }}
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
            </motion.div>
            <motion.div
              className="mt-12 flex items-center gap-4"
              variants={fadeIn}
              transition={{ delay: 0.3 }}
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
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <GlassMorphism className="p-1 lg:p-2" intensity="light">
              <img
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Students studying"
                className="w-full h-auto rounded-lg shadow-lg"
              />
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
