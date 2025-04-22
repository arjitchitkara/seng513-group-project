import { useAuth } from '@/lib/auth';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ApprovalStatus } from '@prisma/client';
import { DocumentPreview } from '@/components/DocumentPreview';
import { toast } from 'sonner';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import {
  Bookmark,
  FileText,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
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
  Shield,
  AlertTriangle,
  Clock,
  CheckSquare,
  ArrowLeft,
} from 'lucide-react';

// Strict TypeScript interfaces
interface DocumentCourse {
  title: string;
}

interface Document {
  id: string;
  title: string;
  filePath: string;
  status: ApprovalStatus;
  createdAt: string;
  url: string;
  course: DocumentCourse;
}

interface StatCard {
    title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

// Stats data for dashboard
const moderatorStats: StatCard[] = [
  {
    title: 'Pending',
    value: 0,
    icon: Clock,
    color: 'bg-amber-50 text-amber-500',
  },
  {
    title: 'Approved',
    value: 0,
    icon: CheckSquare,
    color: 'bg-green-50 text-green-500',
  },
  {
    title: 'Rejected',
    value: 0,
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-500',
  },
  {
    title: 'Total',
    value: 0,
    icon: FileText,
    color: 'bg-blue-50 text-blue-500',
  },
];


interface DocumentStatistics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const ModeratorDashboard = () => {
  const { user, signOut } = useAuth();
  const userName = user?.user_metadata?.full_name || 'Moderator';
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [approvedDocuments, setApprovedDocuments] = useState<Document[]>([]);
  const [rejectedDocuments, setRejectedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stats, setStats] = useState<StatCard[]>(moderatorStats);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statRefreshCounter, setStatRefreshCounter] = useState<number>(0);
  const [activeView, setActiveView] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  // Calculate document counts from local state only
  const calculateDocumentCounts = () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      // Use local arrays to calculate counts
      const pendingCount = pendingDocuments.length;
      const approvedCount = approvedDocuments.length;
      const rejectedCount = rejectedDocuments.length;
      const totalCount = pendingCount + approvedCount + rejectedCount;
      
      // Update stats with local data
      setStats([
        { ...moderatorStats[0], value: pendingCount },
        { ...moderatorStats[1], value: approvedCount },
        { ...moderatorStats[2], value: rejectedCount },
        { ...moderatorStats[3], value: totalCount },
      ]);
    } catch (error) {
      console.error('Error calculating document counts:', error);
      setStatsError('Failed to calculate document statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Setup periodic refresh for stats
  useEffect(() => {
    // Setup interval for refreshing stats every 30 seconds
    const intervalId = setInterval(() => {
      setStatRefreshCounter(prev => prev + 1);
    }, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate stats when counter changes or when documents change
  useEffect(() => {
    calculateDocumentCounts();
  }, [
    statRefreshCounter,
    pendingDocuments.length, 
    approvedDocuments.length, 
    rejectedDocuments.length
  ]);

  // Determine which documents to fetch based on the path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/approved')) {
      setActiveView('approved');
      fetchDocuments(ApprovalStatus.APPROVED);
    } else if (path.includes('/rejected')) {
      setActiveView('rejected');
      fetchDocuments(ApprovalStatus.REJECTED);
    } else {
      setActiveView('pending');
      fetchDocuments(ApprovalStatus.PENDING);
    }
    
    // Stats will be calculated by the other useEffect when document arrays change
  }, [location.pathname]);

  const fetchDocuments = async (status: ApprovalStatus): Promise<void> => {
    try {
      setLoading(true);
      setSelectedDocument(null);
      
      // Fetch document metadata from database using our apiClient with auth token
      const { data } = await apiClient.get('/documents', {
        params: { status }
      });
      
      // Store documents in state - these only contain metadata, not file contents
      if (status === ApprovalStatus.PENDING) {
        setPendingDocuments(data);
      } else if (status === ApprovalStatus.APPROVED) {
        setApprovedDocuments(data);
      } else if (status === ApprovalStatus.REJECTED) {
        setRejectedDocuments(data);
      }
      
    } catch (error) {
      console.error(`Error fetching ${status.toLowerCase()} documents:`, error);
      setError(`Failed to load ${status.toLowerCase()} documents`);
    } finally {
      setLoading(false);
    }
  };

  // Update handleApprove to use database transaction approach with apiClient
  const handleApprove = async (documentId: string): Promise<void> => {
    try {
      // Get the document from local state for UI updates
      const document = pendingDocuments.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Document not found');
        return;
      }

      // Update document status in the database (server handles the transaction)
      await apiClient.patch(`/documents/${documentId}`, {
        status: ApprovalStatus.APPROVED
      });
      
      // Update local state for immediate UI feedback
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      
      // Refresh stats to ensure accuracy after error
      calculateDocumentCounts();
      
      toast.success('Document approved successfully');
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
      // Refresh stats to ensure accuracy after error
      calculateDocumentCounts();
    }
  };

  // Update handleReject to use the same database transaction approach with apiClient
  const handleReject = async (documentId: string): Promise<void> => {
    try {
      // Get the document from local state for UI updates
      const document = pendingDocuments.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Document not found');
        return;
      }

      // Update document status in the database (server handles the transaction)
      await apiClient.patch(`/documents/${documentId}`, {
        status: ApprovalStatus.REJECTED
      });
      
      // Update local state for immediate UI feedback
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      
      // Refresh stats to ensure accuracy after error
      calculateDocumentCounts();
      
      toast.success('Document rejected');
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
      // Refresh stats to ensure accuracy after error
      calculateDocumentCounts();
    }
  };

  // Get the current documents based on active view
  const getCurrentDocuments = (): Document[] => {
    switch (activeView) {
      case 'approved':
        return approvedDocuments;
      case 'rejected':
        return rejectedDocuments;
      case 'pending':
      default:
        return pendingDocuments;
    }
  };

  // Get the title for the current view
  const getViewTitle = (): string => {
    switch (activeView) {
      case 'approved':
        return 'Approved Documents';
      case 'rejected':
        return 'Rejected Documents';
      case 'pending':
      default:
        return 'Pending Documents';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Mobile Sidebar Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-background/90 backdrop-blur-sm shadow-md border border-border/50"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-background/95 backdrop-blur-sm shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border/50">
            <Link to="/" className="text-xl font-semibold text-gradient">
              eduVAULT
            </Link>
          </div>

          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-primary/5">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">MODERATOR</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1 mt-2">
              <Link
                to="/moderator-dashboard"
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  activeView === 'pending' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted transition-colors'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Pending Documents</span>
              </Link>
              <Link
                to="/moderator-dashboard/approved"
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  activeView === 'approved' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted transition-colors'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approved Documents</span>
              </Link>
              <Link
                to="/moderator-dashboard/rejected"
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  activeView === 'rejected' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted transition-colors'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Rejected Documents</span>
              </Link>
              <Link
                to="/moderator-dashboard/settings"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </nav>

            <div className="border-t border-border/50 mt-6 pt-6">
              <button
                onClick={() => signOut()}
                className="flex w-full items-center space-x-3 p-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Moderator Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Review, approve, and moderate document submissions
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="w-full pl-10 pr-4 py-2 rounded-l-md border border-r-0 border-border bg-card/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="rounded-l-none">
                  Search
                </Button>
              </form>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {statsError && (
                <div className="col-span-full mb-2">
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-1">{statsError}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => {
                        setStatsError(null);
                        calculateDocumentCounts();
                      }}
                    >
                      Retry
                    </Button>
                  </p>
                </div>
              )}
              {stats.map((stat, index) => (
                <GlassMorphism
                  key={stat.title}
                  className="p-4 relative overflow-hidden"
                  intensity="light"
                  rounded="lg"
                  hoverEffect={true}
                >
                  {statsLoading && index === 0 && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                      <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent" />
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    {index === 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8"
                        onClick={() => {
                          calculateDocumentCounts();
                          setStatRefreshCounter(prev => prev + 1);
                        }}
                        disabled={statsLoading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`}
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <path d="M16 21h5v-5" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </GlassMorphism>
              ))}
            </div>

            {/* Documents Section */}
            <div className="mb-8">
              {selectedDocument ? (
                <div>
                  <div className="mb-4 flex items-center">
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => setSelectedDocument(null)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to {getViewTitle()}
                    </Button>
                  </div>
                  
                  <GlassMorphism className="p-4 md:p-6" intensity="medium" rounded="lg">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-muted-foreground">
                          Course: {selectedDocument.course.title}
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {new Date(selectedDocument.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-[600px]">
                      <DocumentPreview
                        url={selectedDocument.url}
                        fileName={selectedDocument.title}
                        isModeratorView={activeView === 'pending'}
                        onApprove={activeView === 'pending' ? () => handleApprove(selectedDocument.id) : undefined}
                        onReject={activeView === 'pending' ? () => handleReject(selectedDocument.id) : undefined}
                      />
                    </div>
                  </GlassMorphism>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
                    <div className="text-sm text-muted-foreground">
                      {!loading && !error && `${getCurrentDocuments().length} document${getCurrentDocuments().length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                  
                  <GlassMorphism className="p-4 md:p-6" intensity="medium" rounded="lg">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-destructive">
                        <p>{error}</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => fetchDocuments(
                            activeView === 'pending' 
                              ? ApprovalStatus.PENDING 
                              : activeView === 'approved' 
                                ? ApprovalStatus.APPROVED 
                                : ApprovalStatus.REJECTED
                          )}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : getCurrentDocuments().length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No {activeView} documents found.</p>
                        {activeView !== 'pending' && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => navigate('/moderator-dashboard')}
                          >
                            View Pending Documents
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {getCurrentDocuments().map((doc) => (
                          <motion.div 
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md hover:bg-card/80 cursor-pointer transition-all"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium truncate pr-2">{doc.title}</h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                                doc.status === ApprovalStatus.PENDING 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : doc.status === ApprovalStatus.APPROVED
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 truncate">
                              Course: {doc.course.title}
                            </p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                <p>{doc.title.split('.').pop()?.toUpperCase()}</p>
                              </div>
                              <p>
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </GlassMorphism>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard; 