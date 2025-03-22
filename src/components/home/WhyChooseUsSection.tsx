
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ArrowRight, Check } from 'lucide-react';

const WhyChooseUsSection = () => {
  const benefits = [
    'Access to thousands of academic resources',
    'Moderated content for academic integrity',
    'Personalized recommendations',
    'Collaborative study environment',
    'Seamless document sharing',
    'Enhanced learning experience',
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <GlassMorphism className="p-1 lg:p-2" intensity="light">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Students collaborating"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </GlassMorphism>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
              Why Choose eduVAULT?
            </h2>
            <p className="text-muted-foreground mb-8">
              We're committed to providing a platform that supports academic success while
              maintaining the highest standards of integrity. Our mission is to empower
              students with the resources they need to excel.
            </p>

            <motion.ul
              className="space-y-4"
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  variants={fadeIn}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="mr-3 mt-1">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link to="/auth/register">
                <AnimatedButton ripple hoverScale>
                  Join Now <ArrowRight className="ml-2 h-4 w-4" />
                </AnimatedButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
