import { useAuth } from '@/lib/auth';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassMorphism className="p-8" intensity="medium">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-xl">Hello, {userName}!</p>
            <p className="mt-4 text-muted-foreground">
              This is the admin dashboard where you can manage the entire application.
            </p>
          </GlassMorphism>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 