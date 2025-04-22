import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { PlusIcon, RefreshCw, Clock } from 'lucide-react';
import { ApprovalStatus } from '@prisma/client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  title: string;
  filePath: string;
  status: ApprovalStatus;
  createdAt: string;
  url: string;
  course: {
    title: string;
  };
}

// Caching constants
const ONE_HOUR = 1000 * 60 * 60;
const FIVE_MINUTES = 1000 * 60 * 5;

const fetchUserDocuments = async (userId: string | undefined): Promise<Document[]> => {
  if (!userId) return [];
  
  const response = await fetch(`/api/documents?userId=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  
  return response.json();
};

const MyDocumentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const { 
    data: documents = [], 
    isLoading, 
    error, 
    refetch,
    isFetching,
    dataUpdatedAt
  } = useQuery<Document[]>({
    queryKey: ['userDocuments', user?.id],
    queryFn: () => fetchUserDocuments(user?.id),
    staleTime: FIVE_MINUTES,
    gcTime: ONE_HOUR,
    enabled: !!user?.id,
  });

  const handleRefresh = async () => {
    await refetch();
    setLastRefreshed(new Date());
  };

  const formatLastUpdated = () => {
    const updateTime = new Date(dataUpdatedAt);
    // If within last hour, show "X minutes ago"
    if (Date.now() - updateTime.getTime() < ONE_HOUR) {
      return `${formatDistanceToNow(updateTime, { addSuffix: true })}`;
    }
    // Otherwise show full time
    return `${format(updateTime, 'h:mm a')}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last updated: {dataUpdatedAt ? formatLastUpdated() : 'Never'}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/upload-document')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>{(error as Error).message || 'Failed to load documents'}</p>
          <Button variant="outline" className="mt-4" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      ) : documents.length === 0 ? (
        <GlassMorphism className="p-8 text-center" intensity="light">
          <p className="text-muted-foreground mb-4">You haven't uploaded any documents yet.</p>
          <Button onClick={() => navigate('/upload-document')}>
            Upload Your First Document
          </Button>
        </GlassMorphism>
      ) : (
        <div className="grid gap-6">
          {/* Document preview section */}
          {selectedDocument && (
            <div className="mb-6">
              <GlassMorphism className="p-6" intensity="light">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Course: {selectedDocument.course.title}
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedDocument(null)}>
                    Close Preview
                  </Button>
                </div>
                
                <div className="h-[500px]">
                  <DocumentPreview
                    url={selectedDocument.url}
                    fileName={selectedDocument.title}
                    isVerified={selectedDocument.status === ApprovalStatus.APPROVED}
                  />
                </div>
              </GlassMorphism>
            </div>
          )}

          {/* Document cards grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="border rounded-lg p-4 bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{doc.title}</h3>
                  {doc.status === ApprovalStatus.APPROVED && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Verified
                    </span>
                  )}
                  {doc.status === ApprovalStatus.PENDING && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                      Pending
                    </span>
                  )}
                  {doc.status === ApprovalStatus.REJECTED && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Rejected
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Course: {doc.course.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocumentsPage;
  