import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Button } from '@/components/ui/button';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { PlusIcon } from 'lucide-react';
import { ApprovalStatus } from '@prisma/client';
import { useNavigate } from 'react-router-dom';

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

const MyDocumentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const fetchUserDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/documents?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDocuments();
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Button onClick={() => navigate('/upload-document')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>{error}</p>
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
  