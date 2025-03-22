
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <GlassMorphism className="p-12 text-center" intensity="medium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of students who are already benefiting from our extensive document 
              library and collaborative learning environment.
            </p>
            <Link to="/auth/register">
              <AnimatedButton size="lg" ripple hoverScale>
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </AnimatedButton>
            </Link>
          </motion.div>
        </GlassMorphism>
      </div>
    </section>
  );
};

export default CTASection;
