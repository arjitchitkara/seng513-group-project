import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Download, Presentation } from 'lucide-react';

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
  const [contentType, setContentType] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate URL with cache-busting
  const getFetchUrl = () => {
    const timestamp = Date.now();
    return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}&retry=${retryCount}`;
  };

  // Check if the file is a PowerPoint file based on content type or filename
  const isPowerPointFile = (type: string | null, name: string): boolean => {
    if (!type) return false;
    return (
      type.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
      type.includes('application/vnd.ms-powerpoint') ||
      name.toLowerCase().endsWith('.pptx') ||
      name.toLowerCase().endsWith('.ppt')
    );
  };

  useEffect(() => {
    console.log(`[CustomDocPreview] Loading document: ${url}, retry: ${retryCount}`);
    setLoading(true);
    setError(null);
    setTextContent(null);
    
    // Cancel previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    // Fetch the document to determine type and prepare rendering
    console.log(`[CustomDocPreview] Fetching document from: ${getFetchUrl()}`);
    fetch(getFetchUrl(), { signal, cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const type = response.headers.get('content-type');
        setContentType(type);
        console.log(`[CustomDocPreview] Document content type detected: ${type}`);
        
        // For PDFs, we'll use iframe 
        if (type?.includes('application/pdf')) {
          console.log(`[CustomDocPreview] Detected PDF, will use iframe viewer`);
          setLoading(false);
          return { type, data: null };
        } else if (type?.includes('text/plain')) {
          console.log(`[CustomDocPreview] Detected text file, will load content`);
          return response.text().then(text => ({ type, data: text }));
        } else if (isPowerPointFile(type, fileName)) {
          console.log(`[CustomDocPreview] Detected PowerPoint file, using download-only mode`);
          setLoading(false);
          return { type, data: null };
        } else {
          // For unsupported types, we'll just offer download option
          console.log(`[CustomDocPreview] Unsupported content type: ${type}, offering download option`);
          setLoading(false);
          return { type, data: null };
        }
      })
      .then(({ type, data }) => {
        if (type?.includes('text/plain')) {
          // Display text content
          console.log(`[CustomDocPreview] Loaded text content, length: ${(data as string)?.length || 0} chars`);
          setTextContent(data as string);
          setLoading(false);
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('[CustomDocPreview] Fetch aborted');
          return;
        }
        
        console.error(`[CustomDocPreview] Error loading document:`, err);
        setError(`Failed to load document: ${err.message}`);
        setLoading(false);
      });
      
    // Timeout safety net
    const timeout = setTimeout(() => {
      if (loading && abortControllerRef.current) {
        console.log(`[CustomDocPreview] Loading timeout reached`);
        setError('Loading timed out. Please try again.');
        setLoading(false);
        abortControllerRef.current.abort();
      }
    }, 15000);
    
    return () => {
      console.log(`[CustomDocPreview] Cleaning up effect`);
      clearTimeout(timeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [url, retryCount, fileName]);
  
  const handleDownload = () => {
    console.log(`[CustomDocPreview] Initiating download for: ${fileName}`);
    const link = document.createElement('a');
    link.href = getFetchUrl();
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };
  
  const handleRetry = () => {
    console.log(`[CustomDocPreview] Retrying document load, retry count: ${retryCount + 1}`);
    setRetryCount(prev => prev + 1);
  };
  
  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const handleIframeError = () => {
    console.log('[CustomDocPreview] Iframe error detected');
    setError('Failed to load document in iframe');
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

      <div className="flex-1 min-h-[400px] relative" ref={containerRef}>
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
          <>
            {/* PDF Viewer (using iframe) */}
            {contentType?.includes('application/pdf') && (
              <div className="h-full w-full overflow-hidden">
                <iframe 
                  ref={iframeRef}
                  src={getFetchUrl()}
                  className="w-full h-full border-none"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </div>
            )}
            
            {/* Text Viewer */}
            {contentType?.includes('text/plain') && textContent && (
              <div className="h-full overflow-auto p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-md">
                  {textContent}
                </pre>
              </div>
            )}
            
            {/* PowerPoint Viewer - Styled Download Button */}
            {contentType && isPowerPointFile(contentType, fileName) && !loading && !error && (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center max-w-md p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Presentation size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">PowerPoint Presentation</h3>
                  <p className="mb-6 text-gray-600">
                    This is a PowerPoint presentation that needs to be downloaded to view all slides and content properly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="default" 
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      <Download size={16} />
                      Download Presentation
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* For other unsupported types */}
            {contentType && 
              !contentType.includes('application/pdf') && 
              !contentType.includes('text/plain') && 
              !isPowerPointFile(contentType, fileName) &&
              !loading && 
              !error && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="mb-4">This document format ({contentType}) cannot be previewed directly.</p>
                  <Button 
                    variant="default" 
                    onClick={handleDownload}
                  >
                    Download to View
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isModeratorView && (
        <div className="p-3 border-t flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReject}
          >
            Reject
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onApprove}
          >
            Approve
          </Button>
        </div>
      )}
    </div>
  );
};