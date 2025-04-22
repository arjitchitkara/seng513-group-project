import { useState, useEffect } from 'react';
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
                <Link to={`/profile/${user.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Complete Profile
                  </Button>
                </Link>
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
              <div className="mt-4 text-center">
                <Button variant="outline" className="mt-2">
                  <Link to="/dashboard/recommendations">View All Recommendations</Link>
                </Button>
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

export default Dashboard;
