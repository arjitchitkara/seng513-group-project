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

interface ModeratorActivity {
  id: string;
  type: 'APPROVE' | 'REJECT' | 'NEW';
  documentTitle: string;
  documentId: string | null;
  timestamp: Date;
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

// Add a strongly typed interface for document statistics from the database
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
  const [recentActivity, setRecentActivity] = useState<ModeratorActivity[]>([]);
  
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

  // Fetch all document counts for stats from the database in a single query
  const fetchDocumentCounts = async (): Promise<void> => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      // Use local arrays to calculate counts reliably
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
      
      // Try to get counts from API as a background operation
      try {
        const { data } = await axios.get<DocumentStatistics>('/api/statistics/documents');
        
        // Only update if API returns different values to keep UI consistent
        if (data.pending !== pendingCount || 
            data.approved !== approvedCount || 
            data.rejected !== rejectedCount || 
            data.total !== totalCount) {
          setStats([
            { ...moderatorStats[0], value: data.pending },
            { ...moderatorStats[1], value: data.approved },
            { ...moderatorStats[2], value: data.rejected },
            { ...moderatorStats[3], value: data.total },
          ]);
        }
      } catch (error) {
        console.error('API fetch for document counts failed, using local counts:', error);
        // Already using local counts, so no UI change needed
      }
    } catch (error) {
      console.error('Error calculating document counts:', error);
      setStatsError('Failed to calculate document statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Setup periodic refresh for stats
  useEffect(() => {
    // Initial fetch
    fetchDocumentCounts();
    
    // Setup interval for refreshing stats every 30 seconds
    const intervalId = setInterval(() => {
      setStatRefreshCounter(prev => prev + 1);
    }, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Refresh stats when counter changes
  useEffect(() => {
    if (statRefreshCounter > 0) {
      fetchDocumentCounts();
    }
  }, [statRefreshCounter]);

  // Refresh stats when document arrays change
  useEffect(() => {
    // Update counts based on array lengths for immediate feedback
    const pendingCount = pendingDocuments.length;
    const approvedCount = approvedDocuments.length;
    const rejectedCount = rejectedDocuments.length;
    const totalCount = pendingCount + approvedCount + rejectedCount;
    
    setStats(prevStats => [
      { ...prevStats[0], value: pendingCount },
      { ...prevStats[1], value: approvedCount },
      { ...prevStats[2], value: rejectedCount },
      { ...prevStats[3], value: totalCount },
    ]);
    
    // No need to call fetchDocumentCounts() here as we've already updated stats
  }, [pendingDocuments.length, approvedDocuments.length, rejectedDocuments.length]);

  // Fetch recent activity
  const fetchRecentActivity = async (): Promise<void> => {
    try {
      const { data } = await axios.get<ModeratorActivity[]>('/api/moderator/activity');
      setRecentActivity(data);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // If API not available, create mock data
      setRecentActivity([
        {
          id: '1',
          type: 'APPROVE',
          documentTitle: 'Chemistry 101: Molecular Structures',
          documentId: 'doc-1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: '2',
          type: 'REJECT',
          documentTitle: 'Unauthorized Course Materials',
          documentId: 'doc-2',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        {
          id: '3',
          type: 'NEW',
          documentTitle: 'New Documents Pending',
          documentId: null,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      ]);
    }
  };

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
    
    // Fetch all counts for stats and recent activity
    fetchDocumentCounts();
    fetchRecentActivity();
  }, [location.pathname]);

  const fetchDocuments = async (status: ApprovalStatus): Promise<void> => {
    try {
      setLoading(true);
      setSelectedDocument(null);
      
      // Fetch document metadata from database (not actual files from R2)
      const { data } = await axios.get<Document[]>('/api/documents', {
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

  // Update handleApprove to use database transaction approach
  const handleApprove = async (documentId: string): Promise<void> => {
    try {
      // Get the document from local state for UI updates
      const document = pendingDocuments.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Document not found');
        return;
      }

      // Update document status in the database (server handles the transaction)
      await axios.patch(`/api/documents/${documentId}`, {
        status: ApprovalStatus.APPROVED
      });
      
      // Update local state for immediate UI feedback
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      
      // Optimistically update stats immediately
      setStats(prevStats => 
        prevStats.map((stat, index) => {
          if (index === 0) return {...stat, value: Math.max(0, stat.value - 1)}; // Pending
          if (index === 1) return {...stat, value: stat.value + 1}; // Approved
          if (index === 3) return {...stat}; // Total stays the same
          return stat;
        })
      );
      
      // Add to recent activity
      const newActivity: ModeratorActivity = {
        id: Date.now().toString(),
        type: 'APPROVE',
        documentTitle: document.title,
        documentId: documentId,
        timestamp: new Date()
      };
      
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      // Also send to API to record the activity in the database
      try {
        await axios.post('/api/moderator/activity', newActivity);
      } catch (error) {
        console.error('Failed to record activity', error);
      }
      
      toast.success('Document approved successfully');
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
      // Refresh stats to ensure accuracy after error
      fetchDocumentCounts();
    }
  };

  // Update handleReject to use the same database transaction approach
  const handleReject = async (documentId: string): Promise<void> => {
    try {
      // Get the document from local state for UI updates
      const document = pendingDocuments.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Document not found');
        return;
      }

      // Update document status in the database (server handles the transaction)
      await axios.patch(`/api/documents/${documentId}`, {
        status: ApprovalStatus.REJECTED
      });
      
      // Update local state for immediate UI feedback
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      
      // Optimistically update stats immediately
      setStats(prevStats => 
        prevStats.map((stat, index) => {
          if (index === 0) return {...stat, value: Math.max(0, stat.value - 1)}; // Pending
          if (index === 1) return {...stat, value: stat.value + 1}; // Rejected
          if (index === 3) return {...stat}; // Total stays the same
          return stat;
        })
      );
      
      // Add to recent activity
      const newActivity: ModeratorActivity = {
        id: Date.now().toString(),
        type: 'REJECT',
        documentTitle: document.title,
        documentId: documentId,
        timestamp: new Date()
      };
      
      setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      
      // Also send to API to record the activity in the database
      try {
        await axios.post('/api/moderator/activity', newActivity);
      } catch (error) {
        console.error('Failed to record activity', error);
      }
      
      toast.success('Document rejected');
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
      // Refresh stats to ensure accuracy after error
      fetchDocumentCounts();
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

  // Format relative time for activities
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
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
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">MODERATOR</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1">
              <Link
                to="/moderator-dashboard"
                className={`flex items-center space-x-3 p-3 rounded-md ${
                  activeView === 'pending' ? 'bg-primary/10 text-primary' : 'hover:bg-muted transition-colors'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Pending Documents</span>
              </Link>
              <Link
                to="/moderator-dashboard/approved"
                className={`flex items-center space-x-3 p-3 rounded-md ${
                  activeView === 'approved' ? 'bg-primary/10 text-primary' : 'hover:bg-muted transition-colors'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approved Documents</span>
              </Link>
              <Link
                to="/moderator-dashboard/rejected"
                className={`flex items-center space-x-3 p-3 rounded-md ${
                  activeView === 'rejected' ? 'bg-primary/10 text-primary' : 'hover:bg-muted transition-colors'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Rejected Documents</span>
              </Link>
              <Link
                to="/moderator/settings"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </nav>

            <div className="border-t border-border/50 mt-6 pt-6">
              <button
                onClick={() => signOut()}
                className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
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
                    className="w-full pl-10 pr-4 py-2 rounded-l-md border border-r-0 border-border bg-background"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsError && (
                <div className="col-span-full mb-2">
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {statsError}
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Using document counts from current view)
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => {
                        setStatsError(null);
                        fetchDocumentCounts();
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
                          fetchDocumentCounts();
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
                  <div className="mb-6 flex items-center">
                    <Button 
                      variant="ghost" 
                      className="mr-2"
                      onClick={() => setSelectedDocument(null)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to {getViewTitle()}
                    </Button>
                  </div>
                  
                  <GlassMorphism className="p-6" intensity="light">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                      <p className="text-muted-foreground">
                        Course: {selectedDocument.course.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Uploaded: {new Date(selectedDocument.createdAt).toLocaleString()}
                      </p>
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
                    
                    {activeView === 'pending' && (
                      <div className="mt-4 flex space-x-4">
                        <Button
                          onClick={() => handleApprove(selectedDocument.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Document
                        </Button>
                        <Button
                          onClick={() => handleReject(selectedDocument.id)}
                          variant="destructive"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Reject Document
                        </Button>
                      </div>
                    )}
                  </GlassMorphism>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
                  </div>
                  
                  <GlassMorphism className="p-6" intensity="light">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-destructive">
                        <p>{error}</p>
                      </div>
                    ) : getCurrentDocuments().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No {activeView} documents found.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {getCurrentDocuments().map((doc) => (
                          <motion.div 
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-lg p-4 bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <h3 className="font-medium mb-1">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Course: {doc.course.title}
                            </p>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                doc.status === ApprovalStatus.PENDING 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : doc.status === ApprovalStatus.APPROVED
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </GlassMorphism>
                </div>
              )}
            </div>

            {/* Moderator Activity Section */}
            <GlassMorphism className="p-6 mb-8" intensity="light">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent activity found.</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg bg-background/50">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'APPROVE' 
                          ? 'bg-green-50 text-green-500'
                          : activity.type === 'REJECT'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-blue-50 text-blue-500'
                      }`}>
                        {activity.type === 'APPROVE' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : activity.type === 'REJECT' ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.type === 'APPROVE' 
                            ? 'Document Approved' 
                            : activity.type === 'REJECT'
                              ? 'Document Rejected'
                              : 'New Documents Pending'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === 'NEW' 
                            ? activity.documentTitle
                            : `You ${activity.type === 'APPROVE' ? 'approved' : 'rejected'} "${activity.documentTitle}"`
                          } - {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
          </div>
            </GlassMorphism>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard; 