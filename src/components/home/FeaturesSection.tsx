
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { ChevronRight, FileText, Search, Shield, Upload } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Document Library',
      description:
        'Access thousands of course documents, study guides, and notes across various subjects and disciplines.',
      icon: FileText,
    },
    {
      title: 'Academic Integrity',
      description:
        'Our moderation system ensures all content adheres to academic integrity policies and ethical guidelines.',
      icon: Shield,
    },
    {
      title: 'Easy Uploads',
      description:
        'Share your study materials with others. Upload documents securely and contribute to our growing knowledge base.',
      icon: Upload,
    },
    {
      title: 'Advanced Search',
      description:
        'Find exactly what you need with our powerful search functionality. Filter by course, subject, document type, and more.',
      icon: Search,
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Elevate Your Academic Journey
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover a comprehensive suite of features designed to enhance your learning
            experience and help you succeed in your academic pursuits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassMorphism 
                className="h-full p-6 flex flex-col" 
                intensity="light"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm flex-1">{feature.description}</p>
                <Link
                  to={`/features/${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center mt-4 text-sm text-primary hover:text-primary/80 transition-all"
                >
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </GlassMorphism>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
