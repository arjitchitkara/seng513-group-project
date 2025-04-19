import { useAuth } from '@/lib/auth';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ApprovalStatus } from '@prisma/client';
import { DocumentPreview } from '@/components/DocumentPreview';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || 'Moderator';
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents?status=${ApprovalStatus.PENDING}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending documents');
      }
      
      const data = await response.json();
      setPendingDocuments(data);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      setError('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDocuments();
  }, []);

  const handleApprove = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: ApprovalStatus.APPROVED,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve document');
      }
      
      // Update local state
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      toast.success('Document approved successfully');
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    }
  };

  const handleReject = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: ApprovalStatus.REJECTED,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject document');
      }
      
      // Update local state
      setPendingDocuments(pendingDocuments.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      toast.success('Document rejected');
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    }
  };

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
              Review and moderate document submissions below.
            </p>
          </GlassMorphism>
          
          <div className="mt-8">
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Pending Documents ({pendingDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="preview" disabled={!selectedDocument}>
                  Document Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-4">
                <GlassMorphism className="p-6" intensity="light">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-destructive">
                      <p>{error}</p>
                    </div>
                  ) : pendingDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No pending documents to review.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pendingDocuments.map((doc) => (
                        <div 
                          key={doc.id}
                          className="border rounded-lg p-4 bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <h3 className="font-medium mb-1">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Course: {doc.course.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassMorphism>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                {selectedDocument && (
                  <GlassMorphism className="p-6" intensity="light">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">{selectedDocument.title}</h2>
                      <p className="text-muted-foreground">
                        Course: {selectedDocument.course.title}
                      </p>
                    </div>
                    
                    <div className="h-[600px]">
                      <DocumentPreview
                        url={selectedDocument.url}
                        fileName={selectedDocument.title}
                        isModeratorView={true}
                        onApprove={() => handleApprove(selectedDocument.id)}
                        onReject={() => handleReject(selectedDocument.id)}
                      />
                    </div>
                  </GlassMorphism>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModeratorDashboard; 