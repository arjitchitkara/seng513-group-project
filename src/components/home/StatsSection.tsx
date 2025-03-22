
import { motion } from 'framer-motion';

const StatsSection = () => {
  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12">
          {[
            { number: '15K+', label: 'Documents' },
            { number: '500+', label: 'Universities' },
            { number: '25K+', label: 'Students' },
            { number: '98%', label: 'Satisfaction' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.number}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
