
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import { FeaturedSection } from '@/components/ui/FeaturedSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Upload, ShieldCheck, Star, Users } from "lucide-react";
const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 text-foreground">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          Empower Your Learning Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mb-8"
        >
          Access and share top-quality study notes, verified by students and moderators. All free, all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link to="/auth/register">
            <Button size="lg" className="text-lg px-6">
              Join EduVault Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Featured Documents */}
      <section className="bg-secondary py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-xl p-6 shadow hover:shadow-lg transition-shadow border border-border"
              >
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium text-lg">Biochemistry Notes</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Deep dive into enzymes, amino acids, and metabolic pathways. 20 pages.
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>📚 Biology</span>
                  <span>⭐ 4.8</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            {[
              {
                icon: <Upload className="h-8 w-8 text-primary" />, title: "Upload Your Notes",
                desc: "Contribute to the community by uploading your class notes or guides."
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-green-500" />, title: "Moderation",
                desc: "Documents are reviewed by peers and moderators for accuracy."
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-emerald-500" />, title: "Access Instantly",
                desc: "Download notes the moment they’re shared, even before verification."
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-background rounded-xl p-6 shadow border border-border"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">What Students Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[{
              name: "Emily R.",
              text: "EduVault saved me during finals week. I found verified notes for all my courses!",
            }, {
              name: "James L.",
              text: "I love how fast it is to upload and share my notes with classmates. Super clean UI too!",
            }].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-background rounded-xl p-6 shadow border border-border"
              >
                <p className="text-muted-foreground italic mb-4">“{testimonial.text}”</p>
                <div className="font-semibold flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{testimonial.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Level Up Your Learning?</h2>
          <p className="mb-6">Join thousands of students already benefiting from EduVault’s document-sharing network.</p>
          <Link to="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;