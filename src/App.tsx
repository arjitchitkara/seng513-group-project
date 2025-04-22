import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "./lib/auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/Profile/ProfilePage";
import BookmarksPage from "./pages/BookmarksPage";

// New Pages
import SettingsPage from "./pages/SettingsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import PrivacySettingsPage from "./pages/PrivacySettingsPage";
import RecentActivityPage from "./pages/RecentActivityPage";
import UploadDocumentPage from "./pages/UploadDocumentPage";
import MyDocumentsPage from "./pages/MyDocumentsPage";
import ModeratorDashboard from '@/pages/ModeratorDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

import Courses from "./pages/Courses";
import Documents from "./pages/Documents";
import AcademicIntegrity from "./pages/AcademicIntegrity";
import About from "./pages/About";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" theme="light" />
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div
                  key="home"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <Index />
                </motion.div>
              } 
            />
            <Route 
              path="/auth/:mode?" 
              element={
                <motion.div
                  key="auth"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <Auth />
                </motion.div>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <motion.div
                  key="dashboard"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/moderator-dashboard" 
              element={
                <motion.div
                  key="moderator-dashboard"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute requiredRole="MODERATOR">
                    <ModeratorDashboard />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/moderator-dashboard/approved" 
              element={
                <motion.div
                  key="moderator-approved"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute requiredRole="MODERATOR">
                    <ModeratorDashboard />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/moderator-dashboard/rejected" 
              element={
                <motion.div
                  key="moderator-rejected"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute requiredRole="MODERATOR">
                    <ModeratorDashboard />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <motion.div
                  key="admin-dashboard"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <motion.div
                  key="settings"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/settings/account" 
              element={
                <motion.div
                  key="account-settings"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/settings/privacy" 
              element={
                <motion.div
                  key="privacy-settings"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <PrivacySettingsPage />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/bookmarks" 
              element={
                <motion.div
                  key="settings"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <BookmarksPage />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/activity" 
              element={
                <motion.div
                  key="activity"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <RecentActivityPage />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/upload-document" 
              element={
                <motion.div
                  key="upload"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <UploadDocumentPage />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route
              path="/profile/:userId"
              element={
                <motion.div
                  key="profile"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >   
                   <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>                
                </motion.div>
              }
            />
            <Route 
              path="/my-documents" 
              element={
                <motion.div
                  key="documents"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <MyDocumentsPage />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <motion.div
                  key="courses"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/browse-documents" 
              element={
                <motion.div
                  key="browse-documents"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/academic-integrity" 
              element={
                <motion.div
                  key="browse-documents"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <AcademicIntegrity />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            <Route 
              path="/about" 
              element={
                <motion.div
                  key="browse-documents"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                </motion.div>
              } 
            />
            
            <Route 
              path="*" 
              element={
                <motion.div
                  key="not-found"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  className="min-h-screen"
                >
                  <NotFound />
                </motion.div>
              } 
            />
          </Routes>
        </AnimatePresence>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
