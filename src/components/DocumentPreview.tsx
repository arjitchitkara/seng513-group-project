import { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface DocumentPreviewProps {
  url: string;
  fileName: string;
  onApprove?: () => void;
  onReject?: () => void;
  isModeratorView?: boolean;
  isVerified?: boolean;
}

export const DocumentPreview = ({
  url,
  fileName,
  onApprove,
  onReject,
  isModeratorView = false,
  isVerified = false,
}: DocumentPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We can't directly detect when DocViewer completes loading
    // So we'll use a timeout to simulate the loading state
    setLoading(true);
    setError(null);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [url]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleDocumentError = () => {
    setError('Failed to load document preview');
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full border rounded-lg overflow-hidden bg-card">
      <div className="flex justify-between items-center p-3 border-b bg-muted/50">
        <div className="flex items-center">
          <h3 className="font-medium truncate max-w-[200px]">{fileName}</h3>
          {isVerified && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Verified
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          Download
        </Button>
      </div>

      <div className="flex-1 min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full" />
          </div>
        )}
        
        {error ? (
          <div className="p-4 text-center text-destructive">
            <p>Error loading document: {error}</p>
            <Button 
              className="mt-2" 
              variant="outline" 
              onClick={handleDownload}
            >
              Download Instead
            </Button>
          </div>
        ) : (
          <div className="h-full" onError={handleDocumentError}>
            <DocViewer
              documents={[{ uri: url }]}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                },
              }}
              style={{ height: '100%' }}
            />
          </div>
        )}
      </div>

      {isModeratorView && (
        <div className="p-3 border-t bg-muted/30 flex justify-between">
          <Button variant="destructive" onClick={onReject}>
            Reject
          </Button>
          <Button variant="default" onClick={onApprove}>
            Approve
          </Button>
        </div>
      )}
    </div>
  );
}; 