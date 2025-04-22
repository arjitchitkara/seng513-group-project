import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  User as UserIcon,
  X,
  Bell,
  CheckCircle,
  BookOpen,
  BarChart,
  MessageSquare,
  Users,
  Lightbulb,
  ClipboardList,
  RefreshCw,
  ChevronDown,
  Network,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  checkBookmark,
} from '../lib/supabase-helpers';
import { getRecentlyViewedDocuments, getProxiedDocumentUrl, toggleBookmark } from '@/lib/api';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import EditProfileModal from './Profile/EditProfileModal';

// Define document type for type safety
interface Document {
  id: string;
  title: string;
  course: string;
  date: string;
  status: string;
  type: string;
  pages: number;
  url?: string;
  filePath?: string;
  bookmarked?: boolean;
}

const ONE_HOUR = 1000 * 60 * 60;
const TWENTY_FOUR_HOURS = ONE_HOUR * 24;
const FIVE_MINUTES = 1000 * 60 * 5;

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
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const { user, signOut } = useAuth();
  
  const queryClient = useQueryClient();

  const queryOptions = {
    staleTime: ONE_HOUR,
    gcTime: TWENTY_FOUR_HOURS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };

  const userId = user?.id || null;

  const { data: profile, isLoading: loadingProfile} = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
    ...queryOptions,
  });

  const { 
    data: recentDocuments = [], 
    isLoading: loadingDocuments,
    error: documentsError,
    refetch: refetchDocuments,
    isFetching: isFetchingDocuments 
  } = useQuery({
    queryKey: ['recentlyViewedDocuments', userId],
    queryFn: () => getRecentlyViewedDocuments(userId || ''),
    staleTime: FIVE_MINUTES,
    enabled: !!userId,
  });
  
  // Fetch bookmark status for documents
  const [bookmarkedDocs, setBookmarkedDocs] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!userId || !recentDocuments.length) return;
      
      try {
        const statuses: Record<string, boolean> = {};
        
        // Check bookmark status for each document
        for (const doc of recentDocuments) {
          const isBookmarked = await checkBookmark(userId, doc.id);
          statuses[doc.id] = isBookmarked;
        }
        
        setBookmarkedDocs(statuses);
      } catch (error) {
        console.error('Error fetching bookmark statuses:', error);
      }
    };
    
    fetchBookmarkStatus();
  }, [userId, recentDocuments]);

  if (loadingProfile) {
    return <p className="text-center mt-10">Loading…</p>;
  }
  const fullName  = profile.fullName || user.user_metadata?.full_name || 'User';
  const userName = fullName.split(' ')[0];
  
  const userRole = user?.user_metadata?.role || 'USER';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const openDocumentPreview = async (document: Document) => {
    try {
      // Create a proxied URL for the document
      // This approach ensures content is served through our API with proper headers
      const url = getProxiedDocumentUrl(document.id);
      
      setPreviewDocument({
        ...document,
        url
      });
    } catch (error) {
      console.error('Error preparing document preview:', error);
      setPreviewDocument(document);
    }
  };

  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  const handleBookmarkToggle = async (document: Document) => {
    if (!user?.id) {
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        toast.error("You must be logged in to bookmark documents");
      }, 0);
      return;
    }
    
    try {
      const result = await toggleBookmark(user.id, document.id);
      
      // Update local state immediately for better UX
      setBookmarkedDocs(prev => ({
        ...prev,
        [document.id]: result.bookmarked
      }));
      
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        toast.success(result.bookmarked 
          ? `Added "${document.title}" to your bookmarks` 
          : `Removed "${document.title}" from your bookmarks`
        );
      }, 0);
      
      // Invalidate bookmarks cache to reflect changes
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user.id] });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        toast.error("Failed to update bookmark");
      }, 0);
    }
  };

  // Add this function to get real-time documents for the knowledge graph
  const getActiveDocuments = () => {
    // If we have actual documents from the API, use them
    if (recentDocuments && recentDocuments.length > 0) {
      return recentDocuments;
    }
    
    // Otherwise use the sample data
    return [
      {
        id: '1',
        title: 'Advanced Calculus: Integration Techniques',
        course: 'Calculus II',
        date: '2 days ago',
        status: 'approved',
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
                <Avatar className="w-10 h-10 p-0">
                  {profile?.profile?.avatar ? (
                    <AvatarImage src={profile.profile.avatar} alt={profile.fullName} />
                  ) : (
                    <AvatarFallback>
                      <UserIcon className="h-8 w-8 text-primary" />
                    </AvatarFallback>
                  )}
                </Avatar>
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
                { name: 'My Documents', icon: FileText, path: '/my-documents' },
                { name: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
                { name: 'Upload Document', icon: Upload, path: '/upload-document' },
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
            <div className="text-xs text-muted-foreground text-center">
              <p className="mb-1">eduVAULT</p>
              <p>© {new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-background/50 backdrop-blur-sm sticky top-0 z-30 border-b border-border/50">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="relative w-full max-w-md"
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
              <div className="relative group">
                <button className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full bg-secondary/70 hover:bg-secondary transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Avatar className="w-8 h-8 p-0">
                      {profile?.profile?.avatar ? (
                        <AvatarImage src={profile.profile.avatar} alt={profile.fullName} />
                      ) : (
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-64 py-2 bg-background rounded-md shadow-lg border border-border/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  {/* Profile Preview Section */}
                  <div className="px-4 py-3 border-b border-border/50">
                    <div className="flex items-start">
                      <Avatar className="w-12 h-12 mr-3">
                        {profile?.profile?.avatar ? (
                          <AvatarImage src={profile.profile.avatar} alt={profile.fullName} />
                        ) : (
                          <AvatarFallback>
                            <UserIcon className="h-6 w-6 text-primary" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{fullName}</div>
                        <div className="text-xs text-muted-foreground mb-1">{user?.email}</div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {userRole}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Profile Completion */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Profile completion</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="px-2 py-1">
                    <Link to={`/profile/${user.id}`} className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                    <Link to="/settings/account" className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                    <Link to="/settings/privacy" className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-secondary/50 rounded-md">
                      <Settings className="h-4 w-4 mr-2" />
                      Privacy Settings
                    </Link>
                  </div>
                  
                  <hr className="my-1 border-border/50" />
                  <button 
                    onClick={signOut}
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-secondary/50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground">Here's an overview of your academic resources and activities.</p>
          </div>

          {/* Profile Completion Section */}
          <div className="mb-6">
            <GlassMorphism className="p-6" intensity="light">
              <div className="flex flex-wrap md:flex-nowrap items-start gap-6">
                <div className="w-full md:w-1/3">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-14 h-14">
                      {profile?.profile?.avatar ? (
                        <AvatarImage src={profile.profile.avatar} alt={profile.fullName} />
                      ) : (
                        <AvatarFallback>
                          <UserIcon className="h-8 w-8 text-primary" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{fullName}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <div className="flex mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          {userRole}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Complete your profile to unlock all features</span>
                      <span className="font-medium">75% Complete</span>
                    </div>
                    <div className="w-full bg-secondary/50 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-2 bg-secondary/20 rounded-md">
                      <p className="text-lg font-bold">{recentDocuments.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Documents</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/20 rounded-md">
                      <p className="text-lg font-bold">{Object.values(bookmarkedDocs).filter(Boolean).length || 0}</p>
                      <p className="text-xs text-muted-foreground">Bookmarks</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/20 rounded-md">
                      <p className="text-lg font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center p-2 bg-secondary/20 rounded-md">
                      <p className="text-lg font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <EditProfileModal 
                  userId={user.id} 
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
                  }}
                  buttonText="Complete Profile"
                />
              </div>
            </GlassMorphism>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
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
            <div className="flex items-center gap-2">
              {isFetchingDocuments && (
                <span className="text-xs text-muted-foreground flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Refreshing...
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchDocuments()}
                disabled={isFetchingDocuments}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              <Link to="/upload-document">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-4 mb-6">
            {loadingDocuments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
              </div>
            ) : documentsError ? (
              <GlassMorphism className="p-6 text-center" intensity="light">
                <p className="text-muted-foreground mb-4">Error loading recent documents.</p>
                <Button onClick={() => refetchDocuments()}>Try Again</Button>
              </GlassMorphism>
            ) : recentDocuments.length === 0 ? (
              <GlassMorphism className="p-6 text-center" intensity="light">
                <p className="text-muted-foreground mb-4">No recent documents found.</p>
                <Link to="/browse-documents">
                  <Button>Browse Documents</Button>
                </Link>
              </GlassMorphism>
            ) : (
              recentDocuments.map((doc, index) => (
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
                                  ? 'bg-success/20 text-success'
                                  : doc.status === 'pending'
                                  ? 'bg-warning/20 text-warning'
                                  : 'bg-destructive/20 text-destructive'
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openDocumentPreview(doc)}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleBookmarkToggle(doc)}
                          className={bookmarkedDocs[doc.id] ? "text-primary" : ""}
                        >
                          <Bookmark className={`h-4 w-4 ${bookmarkedDocs[doc.id] ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </GlassMorphism>
                </motion.div>
              ))
            )}
          </div>

          {/* Document Preview Dialog */}
          <Dialog open={previewDocument !== null} onOpenChange={(open) => !open && closeDocumentPreview()}>
            <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0">
              {previewDocument && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <DialogTitle className="font-medium">{previewDocument.title}</DialogTitle>
                    <Button variant="ghost" size="sm" onClick={closeDocumentPreview}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <DocumentPreview 
                      url={previewDocument.url || ''}
                      fileName={previewDocument.title}
                      isVerified={previewDocument.status === 'approved'}
                    />
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Progress & Analytics */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-6">Your Knowledge Network</h2>
            <GlassMorphism className="p-6" intensity="light">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Document & Course Connections</h3>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    By Course
                  </Button>
                  <Button size="sm" variant="ghost">
                    By Topic
                  </Button>
                </div>
              </div>

              <div className="h-64 relative">
                <KnowledgeGraph 
                  documents={getActiveDocuments()} 
                  onDocumentClick={openDocumentPreview}
                />
              </div>
            </GlassMorphism>
          </div>

          {/* Recommended Documents */}
          <div className="mb-6">
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
            </GlassMorphism>
          </div>

          {/* Additional Features/Sections */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-6">Explore More <span className="text-sm font-normal text-primary ml-2">(Coming Soon)</span></h2>
            <GlassMorphism className="p-6" intensity="light">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {additionalSections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border/50 rounded-lg p-4 hover:bg-secondary/20 transition-colors cursor-not-allowed opacity-80"
                  >
                    <div className="flex items-start space-x-3">
                      <section.icon className="h-6 w-6 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                        <p className="text-xs text-primary mt-2">Coming soon</p>
                      </div>
                    </div>
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

// Knowledge Graph Component
interface Node {
  id: string;
  label: string;
  type: 'document' | 'course';
  color: string;
}

interface Edge {
  source: string;
  target: string;
}

interface KnowledgeGraphProps {
  documents: Document[];
  onDocumentClick?: (document: Document) => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ documents, onDocumentClick }) => {
  // Extract unique courses
  const courses = Array.from(new Set(documents.map((doc) => doc.course)));
  
  // Create nodes for documents and courses
  const nodes: Node[] = [
    // Course nodes (positioned first to be in the background)
    ...courses.map((course) => ({
      id: `course-${course}`,
      label: course,
      type: 'course' as const,
      color: '#6366f1', // Indigo color for courses
    })),
    
    // Document nodes
    ...documents.map((doc) => ({
      id: doc.id,
      label: doc.title.length > 25 ? doc.title.substring(0, 22) + '...' : doc.title,
      type: 'document' as const,
      color: getColorForDocType(doc.type),
    })),
  ];
  
  // Create edges connecting documents to their courses
  const edges: Edge[] = documents.map((doc) => ({
    source: doc.id,
    target: `course-${doc.course}`,
  }));

  // State for hover effects and tooltip
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Add pan state for scrolling functionality
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Speed factors to control pan/scroll speed
  const dragSpeedFactor = 0.3; // Reduce drag speed (lower value = slower)
  const wheelSpeedFactor = 0.2; // Reduce wheel scroll speed (lower value = slower)
  
  // Initialize canvas reference to get dimensions for initial pan offset
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Remove animation state to make the graph static
  const animationTime = 0; // Fixed value instead of animated state
  
  // Effect to center the graph initially
  useEffect(() => {
    const initializeCanvas = () => {
      const canvas = document.getElementById('knowledge-graph') as HTMLCanvasElement;
      if (!canvas) return;
      
      // Set canvas reference
      canvasRef.current = canvas;
      
      // Calculate offset to center the virtual canvas
      // Virtual canvas is 1.5x larger, so we need to offset by -25% to center it
      setPanOffset({
        x: -canvas.offsetWidth * 0.25,
        y: -canvas.offsetHeight * 0.25
      });
    };
    
    // Run after component mounts
    initializeCanvas();
  }, []);
  
  useEffect(() => {
    // Canvas-based visualization with enhanced styling
    const canvas = document.getElementById('knowledge-graph') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with higher resolution for sharper rendering
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * pixelRatio;
    canvas.height = canvas.offsetHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    
    // Clear canvas with a subtle gradient background
    const bgGradient = ctx.createRadialGradient(
      canvas.offsetWidth / 2, canvas.offsetHeight / 2, 0,
      canvas.offsetWidth / 2, canvas.offsetHeight / 2, canvas.offsetWidth * 0.8
    );
    bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
    bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.03)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
    // Calculate positions with a more network-like flow
    const positions: Record<string, { x: number, y: number, vx?: number, vy?: number }> = {};
    
    // Distribute all nodes across the canvas for a more expansive feel
    // Make the virtual canvas larger than the visible area to allow for scrolling
    const virtualWidth = canvas.offsetWidth * 1.5;
    const virtualHeight = canvas.offsetHeight * 1.5;
    const centerX = virtualWidth / 2;
    const centerY = virtualHeight / 2;
    const nodeCount = courses.length + documents.length;
    
    // Use golden ratio for more natural node distribution
    const goldenRatio = 1.618033988749895;
    
    // Initialize all nodes with positions in a spiral pattern
    [...courses, ...documents.map(d => d.course)].forEach((item, index) => {
      // For courses, use the course name, for documents use their course
      const itemId = index < courses.length ? `course-${item}` : `course-${item}`;
      
      // Only add each course once
      if (!positions[itemId]) {
        // Use golden ratio to create a spiral pattern from center outward
        const angle = index * goldenRatio * Math.PI * 2;
        
        // Radius increases with index to create the spiral
        const radiusFactor = Math.sqrt(index + 1) / Math.sqrt(nodeCount);
        const maxRadius = Math.min(virtualWidth, virtualHeight) * 0.45;
        const radius = maxRadius * radiusFactor;
        
        positions[itemId] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          vx: 0,
          vy: 0
        };
      }
    });
    
    // Position document nodes initially near their courses but with more spread
    documents.forEach((doc, index) => {
      const courseId = `course-${doc.course}`;
      const coursePos = positions[courseId];
      
      if (coursePos) {
        // Create a more randomized distribution across the entire canvas
        // No longer tied closely to course positions
        const angle = Math.random() * Math.PI * 2;
        // Much larger spread factor for wider canvas usage
        const spreadFactor = Math.random() * 0.8 + 0.4; // Between 0.4 and 1.2
        const spreadRadius = Math.min(virtualWidth, virtualHeight) * 0.45 * spreadFactor;
        
        positions[doc.id] = {
          // More randomized positioning so nodes spread across entire canvas
          x: centerX + spreadRadius * Math.cos(angle),
          y: centerY + spreadRadius * Math.sin(angle),
          vx: 0,
          vy: 0
        };
      } else {
        // Fallback if course position isn't found
        positions[doc.id] = {
          x: centerX + (Math.random() - 0.5) * virtualWidth * 0.9,
          y: centerY + (Math.random() - 0.5) * virtualHeight * 0.9,
          vx: 0,
          vy: 0
        };
      }
    });
    
    // Force-directed layout for better distribution (run only once for initial positioning)
    const simulation = () => {
      const repulsionForce = 25; 
      const attractionForce = 0.03;
      const nodeIds = Object.keys(positions);
      
      // Clear forces
      nodeIds.forEach(id => {
        positions[id].vx = 0;
        positions[id].vy = 0;
      });
      
      // Apply repulsive forces between all nodes
      for (let i = 0; i < nodeIds.length; i++) {
        const nodeA = nodeIds[i];
        const posA = positions[nodeA];
        
        for (let j = i + 1; j < nodeIds.length; j++) {
          const nodeB = nodeIds[j];
          const posB = positions[nodeB];
          
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const distanceSquared = dx * dx + dy * dy;
          
          // Adjust minimum distance to ensure more spacing
          const minDistance = 100;
          const minDistanceSquared = minDistance * minDistance;
          
          if (distanceSquared < minDistanceSquared) {
            const distance = Math.sqrt(distanceSquared) || 0.1;
            const force = repulsionForce * (minDistance - distance) / distance;
            
            const forceX = (dx / distance) * force;
            const forceY = (dy / distance) * force;
            
            posA.vx! -= forceX;
            posA.vy! -= forceY;
            posB.vx! += forceX;
            posB.vy! += forceY;
          }
        }
      }
      
      // Apply attractive forces between connected nodes (edges)
      edges.forEach(edge => {
        const sourcePos = positions[edge.source];
        const targetPos = positions[edge.target];
        
        if (sourcePos && targetPos) {
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate optimal distance - increased for more spread
          const optimalDistance = 180;
          
          // Force is proportional to how far actual distance is from optimal
          const force = (distance - optimalDistance) * attractionForce;
          
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          
          sourcePos.vx! += forceX;
          sourcePos.vy! += forceY;
          targetPos.vx! -= forceX;
          targetPos.vy! -= forceY;
        }
      });
      
      // Less center gravity to allow nodes to spread out more
      nodeIds.forEach(id => {
        const pos = positions[id];
        const dx = centerX - pos.x;
        const dy = centerY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Much weaker gravity for nodes to spread further
        const gravityFactor = distance / (Math.min(virtualWidth, virtualHeight) * 0.8);
        const gravity = 0.01 * Math.max(0, gravityFactor - 0.8);
        
        pos.vx! += dx * gravity;
        pos.vy! += dy * gravity;
      });
      
      // Apply velocity with damping
      nodeIds.forEach(id => {
        const pos = positions[id];
        const damping = 0.8;
        
        pos.x += pos.vx! * damping;
        pos.y += pos.vy! * damping;
        
        // Keep nodes within virtual canvas bounds with padding
        const padding = 30;
        pos.x = Math.max(padding, Math.min(virtualWidth - padding, pos.x));
        pos.y = Math.max(padding, Math.min(virtualHeight - padding, pos.y));
      });
    };
    
    // Run simulation multiple times for better initial distribution, then stop
    for (let i = 0; i < 150; i++) {
      simulation();
    }
    
    // Function to redraw the canvas with current pan offset
    const redrawCanvas = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw background
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw a static network background instead of animated flow
      drawNetworkBackground();
      
      // Draw edges
      drawEdges();
      
      // Draw nodes
      drawNodes();
      
      // Draw scroll hint if needed
      if (Object.keys(positions).length > 10) {
        drawScrollHint();
      }
    };
    
    // Draw a static network background instead of animated flow
    const drawNetworkBackground = () => {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 0.5;
      
      const bgNodes = 20;
      const bgLines = 35;
      const bgNodePositions: {x: number, y: number}[] = [];
      
      // Create background node positions
      for (let i = 0; i < bgNodes; i++) {
        bgNodePositions.push({
          x: Math.random() * virtualWidth,
          y: Math.random() * virtualHeight
        });
      }
      
      // Draw static background connections
      for (let i = 0; i < bgLines; i++) {
        const startNode = bgNodePositions[Math.floor(Math.random() * bgNodePositions.length)];
        const endNode = bgNodePositions[Math.floor(Math.random() * bgNodePositions.length)];
        
        if (startNode !== endNode) {
          ctx.beginPath();
          ctx.moveTo(startNode.x + panOffset.x, startNode.y + panOffset.y);
          
          // Use bezier curve but with fixed control points (no animation)
          const controlPoint1 = {
            x: startNode.x + (endNode.x - startNode.x) * 0.33 + Math.cos(i * 0.8) * 60 + panOffset.x,
            y: startNode.y + (endNode.y - startNode.y) * 0.33 + Math.sin(i * 0.8) * 60 + panOffset.y
          };
          const controlPoint2 = {
            x: startNode.x + (endNode.x - startNode.x) * 0.66 + Math.sin(i * 0.8) * 60 + panOffset.x,
            y: startNode.y + (endNode.y - startNode.y) * 0.66 + Math.cos(i * 0.8) * 60 + panOffset.y
          };
          
          ctx.bezierCurveTo(
            controlPoint1.x, controlPoint1.y,
            controlPoint2.x, controlPoint2.y,
            endNode.x + panOffset.x, endNode.y + panOffset.y
          );
          ctx.stroke();
        }
      }
    };
    
    // Draw edges with static styling (no flow animation)
    const drawEdges = () => {
      edges.forEach(edge => {
        const sourcePos = positions[edge.source];
        const targetPos = positions[edge.target];
        
        if (!sourcePos || !targetPos) return;
        
        // Calculate control points for a smoother curve
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Find the source and target nodes
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return;
        
        // Decide edge appearance based on hover state
        const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
        
        // Apply pan offset to positions
        const sourceX = sourcePos.x + panOffset.x;
        const sourceY = sourcePos.y + panOffset.y;
        const targetX = targetPos.x + panOffset.x;
        const targetY = targetPos.y + panOffset.y;
        
        // Create gradient for edge (static, no flow animation)
        const gradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
        
        if (isHighlighted) {
          // Glowing highlight effect
          ctx.shadowBlur = 8;
          ctx.shadowColor = sourceNode.color;
          
          // Static gradient for highlighted paths
          gradient.addColorStop(0, sourceNode.color + '80');
          gradient.addColorStop(0.5, sourceNode.color);
          gradient.addColorStop(1, targetNode.color + '80');
          
          ctx.lineWidth = 2.5;
        } else {
          // Subtle default style
          ctx.shadowBlur = 0;
          
          // Static gradient
          gradient.addColorStop(0, 'rgba(148, 163, 184, 0.1)');
          gradient.addColorStop(1, 'rgba(148, 163, 184, 0.2)');
          ctx.lineWidth = 1.2;
        }
        
        ctx.strokeStyle = gradient;
        
        // Calculate control points for the curve with fixed randomness
        const curveMidpoint = {
          x: (sourceX + targetX) / 2,
          y: (sourceY + targetY) / 2
        };
        
        // Add some controlled randomness to the curve, but make it consistent
        const nodeIdSum = edge.source.charCodeAt(0) + edge.target.charCodeAt(0);
        const seedRandom = (seed: number) => Math.sin(seed) * 10000 % 1;
        const randomFactor = seedRandom(nodeIdSum) * 2 - 1; // Between -1 and 1
        
        const curveOffset = distance * 0.2 * randomFactor;
        const perpX = -dy / distance; // Perpendicular vector
        const perpY = dx / distance;
        
        const controlPoint = {
          x: curveMidpoint.x + perpX * curveOffset,
          y: curveMidpoint.y + perpY * curveOffset
        };
        
        // Draw the curved connection (no animation)
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, targetX, targetY);
        ctx.stroke();
        
        // Only draw particles if edge is highlighted (but make them static)
        if (isHighlighted) {
          const particleCount = 3;
          for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount); // Static positions instead of animated
            
            // Quadratic bezier formula
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            
            const px = uu * sourceX + 2 * u * t * controlPoint.x + tt * targetX;
            const py = uu * sourceY + 2 * u * t * controlPoint.y + tt * targetY;
            
            // Draw particle
            ctx.beginPath();
            ctx.fillStyle = sourceNode.color;
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    };
    
    // Draw nodes with static styling (no pulsing)
    const drawNodes = () => {
      nodes.forEach(node => {
        const pos = positions[node.id];
        if (!pos) return;
        
        // Apply pan offset
        const x = pos.x + panOffset.x;
        const y = pos.y + panOffset.y;
        
        const isHovered = node.id === hoveredNode;
        const isCourse = node.type === 'course';
        const radius = isCourse ? 20 : 9; // Fixed radius (no pulsing)
        
        // Glow effect for nodes
        ctx.shadowBlur = isHovered ? 15 : 8;
        ctx.shadowColor = isHovered ? node.color : `${node.color}55`;
        
        // Create radial gradient for node fill
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, radius
        );
        
        // Enhanced colors with gradient
        const baseColor = node.color;
        const lighterColor = lightenColor(baseColor, 20);
        
        gradient.addColorStop(0, lighterColor);
        gradient.addColorStop(0.7, baseColor);
        gradient.addColorStop(1, darkenColor(baseColor, 10));
        
        // Draw node circle with gradient fill
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Turn off shadow for the stroke
        ctx.shadowBlur = 0;
        
        // Draw node border
        ctx.strokeStyle = isHovered ? '#ffffff' : '#ffffff55';
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();
        
        // Draw course icons for better identification
        if (isCourse) {
          // Book icon in the center of course nodes
          ctx.fillStyle = '#ffffff';
          
          // Simplified book icon
          const iconSize = radius * 0.5;
          const bookX = x - iconSize * 0.5;
          const bookY = y - iconSize * 0.25;
          
          // Draw book shape
          ctx.beginPath();
          ctx.moveTo(bookX, bookY);
          ctx.lineTo(bookX + iconSize, bookY);
          ctx.lineTo(bookX + iconSize, bookY + iconSize * 0.8);
          ctx.lineTo(bookX + iconSize * 0.5, bookY + iconSize * 0.6);
          ctx.lineTo(bookX, bookY + iconSize * 0.8);
          ctx.closePath();
          ctx.fill();
        }
        
        // Draw node label with better typography
        if (node.type === 'course' || isHovered) {
          // Position labels differently for courses vs documents
          const labelY = isCourse ? y + radius + 18 : y + radius + 14;
          const fontSize = isCourse ? 12 : 10;
          ctx.font = `${isHovered ? 'bold' : ''} ${fontSize}px 'Inter', 'Segoe UI', sans-serif`;
          
          const textWidth = ctx.measureText(node.label).width;
          
          // Draw text background for better readability
          if (isHovered) {
            // Rounded rectangle background
            const padding = 6;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = fontSize + padding;
            const bgX = x - bgWidth / 2;
            const bgY = labelY - fontSize/2 - padding / 2;
            const cornerRadius = 4;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            
            // Draw rounded rectangle
            ctx.beginPath();
            ctx.moveTo(bgX + cornerRadius, bgY);
            ctx.lineTo(bgX + bgWidth - cornerRadius, bgY);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + cornerRadius);
            ctx.lineTo(bgX + bgWidth, bgY + bgHeight - cornerRadius);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - cornerRadius, bgY + bgHeight);
            ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
            ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius);
            ctx.lineTo(bgX, bgY + cornerRadius);
            ctx.quadraticCurveTo(bgX, bgY, bgX + cornerRadius, bgY);
            ctx.closePath();
            ctx.fill();
            
            // Small connecting triangle from node to label
            ctx.beginPath();
            ctx.moveTo(x, y + (isCourse ? 20 : 9));
            ctx.lineTo(x - 5, bgY);
            ctx.lineTo(x + 5, bgY);
            ctx.closePath();
            ctx.fill();
          }
          
          // Draw text
          ctx.fillStyle = isHovered ? '#1e293b' : 
                      (isCourse ? '#ffffff' : 'rgba(255, 255, 255, 0.85)');
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Draw text with a subtle text shadow for better readability
          if (!isHovered) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
          }
          
          ctx.fillText(node.label, x, labelY);
          
          // Reset shadow settings
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      });
    };
    
    // Draw a scroll hint to indicate the graph can be panned
    const drawScrollHint = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click and drag to pan', canvas.offsetWidth / 2, canvas.offsetHeight - 20);
      
      // Draw a small hand icon
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      
      // Simple hand cursor icon
      const handX = canvas.offsetWidth / 2;
      const handY = canvas.offsetHeight - 35;
      
      ctx.beginPath();
      // Simplified hand shape
      ctx.arc(handX, handY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    
    // Initial draw
    redrawCanvas();
    
    // Add hover detection and node finding
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
      const mouseY = ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
      
      // Handle panning
      if (isPanning) {
        // Apply drag speed factor to slow down panning
        const deltaX = (e.clientX - dragStart.x) * pixelRatio * dragSpeedFactor;
        const deltaY = (e.clientY - dragStart.y) * pixelRatio * dragSpeedFactor;
        
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setDragStart({
          x: e.clientX,
          y: e.clientY
        });
        
        // Redraw with new pan offset
        redrawCanvas();
        return;
      }
      
      // Check if mouse is over a node
      let foundNode = null;
      for (const node of nodes) {
        const pos = positions[node.id];
        if (!pos) continue;
        
        const isCourse = node.type === 'course';
        const baseRadius = isCourse ? 20 : 9;
        const radius = baseRadius * (isCourse ? 1.2 : 1.5); // Slightly larger hit area for better UX
        
        const distance = Math.sqrt(
          Math.pow((pos.x + panOffset.x) * pixelRatio - mouseX, 2) + 
          Math.pow((pos.y + panOffset.y) * pixelRatio - mouseY, 2)
        );
        
        if (distance <= radius * pixelRatio) {
          foundNode = node.id;
          break;
        }
      }
      
      if (foundNode !== hoveredNode) {
        setHoveredNode(foundNode);
        setMousePosition({ x: e.clientX, y: e.clientY });
        redrawCanvas();
      } else if (hoveredNode) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
      
      // Change cursor style if over a node or panning
      canvas.style.cursor = foundNode ? 'pointer' : (isPanning ? 'grabbing' : 'grab');
    };
    
    // Handle mouse down for panning
    const handleMouseDown = (e: MouseEvent) => {
      // Only initiate panning with primary mouse button and not on a node
      if (e.button === 0 && !hoveredNode) {
        setIsPanning(true);
        setDragStart({
          x: e.clientX,
          y: e.clientY
        });
        canvas.style.cursor = 'grabbing';
      }
    };
    
    // Handle mouse up for panning
    const handleMouseUp = (e: MouseEvent) => {
      if (isPanning) {
        setIsPanning(false);
        canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
      }
    };
    
    // Add click handler to open document preview
    const handleClick = (e: MouseEvent) => {
      if (isPanning) return; // Don't trigger click when panning
      
      if (hoveredNode) {
        const node = nodes.find(n => n.id === hoveredNode);
        if (node?.type === 'document') {
          // Find the actual document object
          const doc = documents.find(d => d.id === node.id);
          if (doc && onDocumentClick) {
            // Call the document preview function from parent component
            onDocumentClick(doc);
          }
        }
      }
    };
    
    // Add wheel handler for additional panning via mouse wheel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent page scrolling
      
      // Apply wheel speed factor to slow down scrolling
      setPanOffset(prev => ({
        x: prev.x - e.deltaX * wheelSpeedFactor,
        y: prev.y - e.deltaY * wheelSpeedFactor
      }));
      
      // Redraw with new pan offset
      redrawCanvas();
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); // Handle mouse leaving canvas
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [documents, courses, hoveredNode, isPanning, panOffset, dragStart]);
  
  // Get the node details for tooltip
  const hoveredNodeDetails = hoveredNode 
    ? nodes.find(node => node.id === hoveredNode) 
    : null;
  
  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative bg-gradient-to-r from-background/50 via-background to-background/50">
      <canvas 
        id="knowledge-graph" 
        className="w-full h-full"
        style={{ touchAction: 'none', cursor: 'grab' }}
        ref={canvasRef}
      />
      
      {/* Playful teaser text */}
      <div className="absolute top-4 left-4 text-xs font-medium text-primary/80 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-primary/20 animate-pulse">
        Catch the node if you can!
      </div>
      
      {/* Network indicator with pan hint */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground flex items-center gap-1">
        <Network className="h-3 w-3" />
        <span>Knowledge network</span>
        <span className="ml-2 text-xs opacity-70">(Click and drag to explore)</span>
      </div>
      
      {/* Enhanced tooltip with animation and better design */}
      {hoveredNodeDetails && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute bg-background/90 backdrop-blur-md shadow-lg rounded-md px-4 py-3 border border-border/50 z-10"
          style={{ 
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
            maxWidth: '280px',
            boxShadow: `0 0 20px 0 ${hoveredNodeDetails.type === 'course' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(147, 197, 253, 0.15)'}`
          }}
        >
          <div className="font-medium mb-2 flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: hoveredNodeDetails.color }}
            />
            {hoveredNodeDetails.label}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {hoveredNodeDetails.type === 'course' ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Course</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-1 mt-1">
                  <span>{documents.filter(d => d.course === hoveredNodeDetails.label.replace('course-', '')).length} documents</span>
                  <span className="text-primary text-xs">Browse all</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span className="capitalize">{documents.find(d => d.id === hoveredNodeDetails.id)?.type}</span>
                  <span className="mx-1">•</span>
                  <span>{documents.find(d => d.id === hoveredNodeDetails.id)?.pages || 0} pages</span>
                </div>
                {hoveredNodeDetails.type === 'document' && (
                  <div className="border-t border-border/40 pt-1 mt-1">
                    <div className="text-primary flex items-center">
                      <span className="mr-1">Click to preview</span>
                      <ChevronDown className="h-3 w-3 -rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Utility function to get color based on document type
const getColorForDocType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'notes':
      return '#3b82f6'; // Blue-500
    case 'lab_report':
      return '#10b981'; // Emerald-500
    case 'essay':
      return '#8b5cf6'; // Violet-500
    case 'study_guide':
      return '#f59e0b'; // Amber-500
    case 'practice_problems':
      return '#ef4444'; // Red-500
    default:
      return '#6b7280'; // Gray-500
  }
};

// Utility function to lighten a color
const lightenColor = (color: string, percent: number): string => {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Lighten
  r = Math.min(255, r + percent);
  g = Math.min(255, g + percent);
  b = Math.min(255, b + percent);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Utility function to darken a color
const darkenColor = (color: string, percent: number): string => {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Darken
  r = Math.max(0, r - percent);
  g = Math.max(0, g - percent);
  b = Math.max(0, b - percent);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export default Dashboard;
