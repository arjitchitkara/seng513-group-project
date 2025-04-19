import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { DocumentPreview } from './ui/DocumentPreview';
import { getDocumentDownloadUrl } from '../../backend/r2/documentService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { prisma } from '../lib/prisma';
import { Document as PrismaDocument, ApprovalStatus } from '@prisma/client';

export const ModeratorDocumentReview = () => {
  const { user } = useAuth();
  const [pendingDocuments, setPendingDocuments] = useState<PrismaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<PrismaDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchPendingDocuments = async () => {
      try {
        // This would be a real API call in production
        const response = await fetch('/api/moderator/pending-documents');
        
        if (!response.ok) {
          throw new Error('Failed to fetch pending documents');
        }
        
        const data = await response.json();
        setPendingDocuments(data);
      } catch (error) {
        console.error('Error fetching pending documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingDocuments();
  }, []);

  const handlePreview = async (document: PrismaDocument) => {
    try {
      setSelectedDocument(document);
      const url = await getDocumentDownloadUrl(document.filePath);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error generating preview URL:', error);
    }
  };

  const handleDownload = async (document: PrismaDocument) => {
    try {
      const url = await getDocumentDownloadUrl(document.filePath);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleApprove = async (documentId: string) => {
    try {
      // This would be a real API call in production
      const response = await fetch(`/api/moderator/documents/${documentId}/approve`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve document');
      }
      
      // Remove the document from the pending list
      setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setIsPreviewOpen(false);
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleReject = async (documentId: string) => {
    try {
      // This would be a real API call in production
      const response = await fetch(`/api/moderator/documents/${documentId}/reject`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject document');
      }
      
      // Remove the document from the pending list
      setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setIsPreviewOpen(false);
    } catch (error) {
      console.error('Error rejecting document:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Review</h2>
        <Badge variant="outline">
          {pendingDocuments.length} Pending
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : pendingDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">No pending documents to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="line-clamp-1">{document.title}</CardTitle>
                <CardDescription>
                  {new Date(document.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-3xl font-bold text-muted-foreground/50">
                    {document.filePath.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handlePreview(document)}
                >
                  Review
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(document.id)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleReject(document.id)}
                  >
                    Reject
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          {selectedDocument && previewUrl && (
            <DocumentPreview 
              url={previewUrl} 
              fileName={selectedDocument.title}
              onDownload={() => handleDownload(selectedDocument)}
              onApprove={() => handleApprove(selectedDocument.id)}
              onReject={() => handleReject(selectedDocument.id)}
              showModeratorControls={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 