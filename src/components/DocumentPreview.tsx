import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add a timestamp to the URL to avoid browser cache issues
  const getUrlWithTimestamp = useCallback(() => {
    const timestamp = new Date().getTime();
    return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}&retry=${retryCount}`;
  }, [url, retryCount]);

  // Log document loading
  useEffect(() => {
    console.log(`[DocumentPreview] Attempting to load document: ${url}`);
    return () => {
      console.log(`[DocumentPreview] Cleaning up document load: ${url}`);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [url]);

  useEffect(() => {
    // Reset state when URL changes
    setLoading(true);
    setError(null);
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Pre-fetch the document to check if it loads properly
    console.log(`[DocumentPreview] Pre-fetching document to validate: ${url}`);
    fetch(getUrlWithTimestamp(), { 
      signal: abortControllerRef.current.signal,
      cache: 'no-cache'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        // Check content type to ensure it's supported
        const contentType = response.headers.get('content-type');
        console.log(`[DocumentPreview] Document content type: ${contentType}`);
        
        if (contentType && !contentType.includes('pdf') && 
            !contentType.includes('docx') && 
            !contentType.includes('pptx') && 
            !contentType.includes('text/plain')) {
          throw new Error(`Unsupported content type: ${contentType}`);
        }
        
        return response.blob();
      })
      .then(blob => {
        console.log(`[DocumentPreview] Document pre-fetch succeeded, content type: ${blob.type}, size: ${blob.size} bytes`);
        // If the document loads successfully, we can set loading to false
        setLoading(false);
      })
      .catch(err => {
        console.error(`[DocumentPreview] Document pre-fetch failed:`, err);
        setError(`Failed to load document: ${err.message}`);
        setLoading(false);
      });
    
    // Fallback timer in case fetch doesn't complete
    const timer = setTimeout(() => {
      console.log(`[DocumentPreview] Loading timeout reached for: ${url}`);
      setLoading(false);
    }, 8000); // Longer timeout to allow more time for document loading
    
    return () => {
      clearTimeout(timer);
    };
  }, [url, retryCount, getUrlWithTimestamp]);

  const handleDownload = () => {
    console.log(`[DocumentPreview] Initiating download for: ${url}`);
    const link = document.createElement('a');
    link.href = getUrlWithTimestamp();
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleDocumentError = (error: Error | unknown) => {
    console.error(`[DocumentPreview] Error in DocViewer:`, error);
    setError('Failed to load document preview');
    setLoading(false);
  };

  const handleRetry = () => {
    console.log(`[DocumentPreview] Retrying document load, retry count: ${retryCount + 1}`);
    setRetryCount(prev => prev + 1);
  };

  // DocumentURI with unique timestamp for each render to avoid caching issues
  const documentUri = getUrlWithTimestamp();
  console.log(`[DocumentPreview] Final document URI: ${documentUri}`);

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
            <div className="mt-2 flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={handleRetry}
              >
                Retry
              </Button>
              <Button 
                variant="default" 
                onClick={handleDownload}
              >
                Download Instead
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full" ref={viewerRef}>
            <DocViewer
              documents={[{ uri: documentUri }]}
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