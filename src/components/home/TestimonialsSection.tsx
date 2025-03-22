
import { motion } from 'framer-motion';
import { GlassMorphism } from '@/components/ui/GlassMorphism';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "eduVAULT has been a game-changer for my studies. The quality of resources and the moderation system ensure I'm always accessing reliable material.",
      name: 'Alex Johnson',
      role: 'Computer Science Student',
      avatar: 'AJ',
    },
    {
      quote:
        "As a professor, I appreciate how eduVAULT maintains academic integrity. It's a platform I can confidently recommend to my students for supplementary resources.",
      name: 'Dr. Sarah Williams',
      role: 'Biology Professor',
      avatar: 'SW',
    },
    {
      quote:
        "The document library is extensive and well-organized. I've found study materials for even my most obscure courses, which has been incredibly helpful.",
      name: 'Michael Chen',
      role: 'Engineering Student',
      avatar: 'MC',
    },
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how eduVAULT has helped students and educators enhance their
            academic experience and achieve their goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassMorphism className="h-full p-6" intensity="light">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-500">★</span>
                    ))}
                  </div>
                  <p className="text-foreground italic mb-6 flex-1">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </GlassMorphism>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
