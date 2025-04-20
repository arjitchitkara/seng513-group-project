import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Upload,
  User,
  X,
  Bell,
  CheckCircle,
  BookOpen,
  BarChart,
  MessageSquare,
  Users,
  Lightbulb,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

/* ----------------------------------
   Sample document & stats data
-----------------------------------*/
const recentDocuments = [
  {
    id: '1',
    title: 'Advanced Calculus: Integration Techniques',
    course: 'Calculus II',
    date: '2 days ago',
    status: 'approved', // approved, pending, rejected
    type: 'notes',
    pages: 12,
  },
  {
    id: '2',
    title: 'Organic Chemistry Lab Report: Synthesis of Aspirin',
    course: 'Organic Chemistry',
    date: '5 days ago',
    status: 'pending',
    type: 'lab_report',
    pages: 8,
  },
  {
    id: '3',
    title: 'Literary Analysis: Symbolism in The Great Gatsby',
    course: 'American Literature',
    date: '1 week ago',
    status: 'approved',
    type: 'essay',
    pages: 6,
  },
  {
    id: '4',
    title: 'Principles of Macroeconomics: Study Guide',
    course: 'Economics 101',
    date: '2 weeks ago',
    status: 'approved',
    type: 'study_guide',
    pages: 15,
  },
];
const quickStats = [
  {
    title: 'Uploads',
    value: 42,
    icon: Upload,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    title: 'Downloads',
    value: 215,
    icon: FileText,
    color: 'bg-green-50 text-green-500',
  },
  {
    title: 'Bookmarks',
    value: 18,
    icon: Bookmark,
    color: 'bg-purple-50 text-purple-500',
  },
  {
    title: 'Courses',
    value: 7,
    icon: BookOpen,
    color: 'bg-amber-50 text-amber-500',
  },
];

/* ----------------------------------
   Additional recommended docs (e.g.)
-----------------------------------*/
const recommendedDocs = [
  {
    title: 'Physics Lab Report Guidelines',
    course: 'Physics 101',
    downloads: 128,
    rating: 4.8,
  },
  {
    title: 'Calculus Exam Study Guide',
    course: 'Mathematics',
    downloads: 345,
    rating: 4.9,
  },
  {
    title: 'Introduction to Microeconomics',
    course: 'Econ 101',
    downloads: 212,
    rating: 4.7,
  },
];

/* ----------------------------------
   Additional dashboard sections
-----------------------------------*/
const additionalSections = [
  {
    title: 'Announcements',
    description: 'Read the latest updates and campus news.',
    icon: Lightbulb,
    link: '/dashboard/announcements',
  },
  {
    title: 'Study Groups',
    description: 'Join or create study groups with classmates.',
    icon: Users,
    link: '/dashboard/study-groups',
  },
  {
    title: 'Tutor Sessions',
    description: 'Book or attend live tutoring sessions.',
    icon: MessageSquare,
    link: '/dashboard/tutors',
  },
  {
    title: 'Exam Deadlines',
    description: 'Keep track of upcoming exams and due dates.',
    icon: ClipboardList,
    link: '/dashboard/exams',
  },
  {
    title: 'Trending Courses',
    description: 'See which courses are most popular right now.',
    icon: BookOpen,
    link: '/dashboard/trending',
  },
  {
    title: 'University Search',
    description: 'Find documents and notes from various universities.',
    icon: Home,
    link: '/dashboard/universities',
  },
  {
    title: 'Resource Hub',
    description: 'Tutorials, guides, and references in one place.',
    icon: Lightbulb,
    link: '/dashboard/resources',
  },
  {
    title: 'My Subscriptions',
    description: 'Track courses or authors you follow.',
    icon: Bookmark,
    link: '/dashboard/subscriptions',
  },
  {
    title: 'Live Q&A',
    description: 'Real-time sessions with peers or tutors.',
    icon: Users,
    link: '/dashboard/live-qa',
  },
  {
    title: 'Performance Analytics',
    description: 'Visualize your academic progress and stats.',
    icon: BarChart,
    link: '/dashboard/analytics',
  },
];

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  
  const userName = user?.user_metadata?.full_name || 'User';
  const userRole = user?.user_metadata?.role || 'USER';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-foreground" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-background shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border/50">
            <Link to="/" className="text-xl font-semibold text-gradient">
              eduVAULT
            </Link>
          </div>

          <div className="p-6">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 p-3 rounded-md bg-primary/10 text-primary"
              >
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>

              {[
                { name: 'My Documents', icon: FileText, path: '/documents' },
                { name: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
                { name: 'Recent Activity', icon: Clock, path: '/activity' },
                { name: 'Settings', icon: Settings, path: '/settings' },
                { name: 'Upload Document', icon: Upload, path: '/upload' },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-3 p-3 rounded-md text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-border/50">
            <button 
              onClick={signOut}
              className="flex items-center space-x-3 w-full p-3 rounded-md text-foreground/70 hover:bg-secondary hover:text-foreground transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-background/50 backdrop-blur-sm sticky top-0 z-30 border-b border-border/50">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="relative hidden md:block w-96"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by course, university, topic..."
                className="w-full py-2 pl-10 pr-4 rounded-full bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex items-center space-x-4">

              <Link to="/notifications" className="p-2 rounded-full bg-secondary/70 hover:bg-secondary relative">
                <Bell className="h-5 w-5 text-foreground/70" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">3</span>
              </Link>

              <Link
              to={`/profile/${user.id}`}
              className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full bg-secondary/70 hover:bg-secondary"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{userName.split(' ')[0]}</span>
            </Link>

            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userName.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Here's an overview of your academic resources and activities.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassMorphism className="p-6" intensity="light">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </GlassMorphism>
              </motion.div>
            ))}
          </div>

          {/* Recent Documents & Upload Button */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Link
              to="/upload-document"
              className="inline-flex items-center space-x-2 p-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Document</span>
            </Link>
          </div>

          

          {/* Document List */}
          <div className="space-y-4 mb-8">
            {recentDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <GlassMorphism className="p-4" intensity="light">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-md bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{doc.title}</h3>
                        <div className="flex flex-wrap items-center text-xs text-muted-foreground">
                          <span>{doc.course}</span>
                          <span className="mx-2">•</span>
                          <span>{doc.date}</span>
                          <span className="mx-2">•</span>
                          <span>{doc.pages} pages</span>
                          <span className="mx-2">•</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              doc.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : doc.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {doc.status === 'approved' && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {doc.status.charAt(0).toUpperCase() +
                              doc.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                      <Link to={`/documents/${doc.id}`}>View</Link>
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassMorphism>
              </motion.div>
            ))}
          </div>

          {/* Progress & Analytics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Your Activity</h2>
            <GlassMorphism className="p-6" intensity="light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Monthly Overview</h3>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Uploads
                  </Button>
                  <Button size="sm" variant="ghost">
                    Downloads
                  </Button>
                </div>
              </div>

              <div className="h-64 flex items-center justify-center">
                <div className="flex items-end space-x-2 h-full max-w-lg w-full mx-auto">
                  {/* Dummy bar chart data */}
                  {[35, 55, 75, 45, 65, 85, 60, 50, 70, 90, 80, 55].map(
                    (height, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="flex-1 flex flex-col items-center justify-end"
                      >
                        <div
                          style={{ height: `${height}%` }}
                          className="w-full rounded-t-sm bg-gradient-to-t from-primary/70 to-primary"
                        ></div>
                        <span className="text-xs mt-2 text-muted-foreground">
                          {
                            [
                              'Jan',
                              'Feb',
                              'Mar',
                              'Apr',
                              'May',
                              'Jun',
                              'Jul',
                              'Aug',
                              'Sep',
                              'Oct',
                              'Nov',
                              'Dec',
                            ][i]
                          }
                        </span>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </GlassMorphism>
          </div>

          {/* Recommended Documents */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Recommended for You</h2>
            <GlassMorphism className="p-6" intensity="light">
              <p className="text-muted-foreground mb-4">
                Based on your courses and recent activity:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedDocs.map((doc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="border border-border/50 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <h3 className="font-medium mb-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {doc.course}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {doc.downloads} downloads
                      </span>
                      <div className="flex items-center">
                        <span className="text-amber-500 text-xs mr-1">⭐</span>
                        <span className="text-xs">{doc.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" className="mt-2">
                  <Link to="/dashboard/recommendations">View All Recommendations</Link>
                </Button>
              </div>
            </GlassMorphism>
          </div>

          {/* Additional Features/Sections */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Explore More</h2>
            <GlassMorphism className="p-6" intensity="light">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {additionalSections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border/50 rounded-lg p-4 hover:bg-secondary/20 transition-colors"
                  >
                    <Link to={section.link} className="flex items-start space-x-3">
                      <section.icon className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </GlassMorphism>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
