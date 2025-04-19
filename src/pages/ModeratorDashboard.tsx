import { useAuth } from '@/lib/auth';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { motion } from 'framer-motion';

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || 'Moderator';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassMorphism className="p-8" intensity="medium">
            <h1 className="text-3xl font-bold mb-4">Moderator Dashboard</h1>
            <p className="text-xl">Hello, {userName}!</p>
            <p className="mt-4 text-muted-foreground">
              This is the moderator dashboard where you will be able to approve or reject document submissions.
            </p>
          </GlassMorphism>
        </motion.div>
      </div>
    </div>
  );
};

export default ModeratorDashboard; 