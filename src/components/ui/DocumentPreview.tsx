import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Button } from './button';
import { getFileType } from '../../../backend/r2/documentService';
import { DocViewer } from 'docx2html';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentPreviewProps {
  url: string;
  fileName: string;
  onDownload: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showModeratorControls?: boolean;
  isVerified?: boolean;
}

export const DocumentPreview = ({
  url,
  fileName,
  onDownload,
  onApprove,
  onReject,
  showModeratorControls = false,
  isVerified = false,
}: DocumentPreviewProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const fileType = getFileType(fileName);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    setError('Failed to load document');
    setLoading(false);
    console.error('Error loading document:', error);
  }

  // For text files, fetch the content
  useEffect(() => {
    const fetchTextContent = async () => {
      if (fileType === 'text') {
        try {
          const response = await fetch(url);
          const text = await response.text();
          setTextContent(text);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching text content:', error);
          setError('Failed to load text content');
          setLoading(false);
        }
      }
    };

    if (fileType === 'text') {
      fetchTextContent();
    }
  }, [url, fileType]);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-[500px]">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <div className="flex flex-col items-center">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="flex justify-center"
            >
              <Page 
                pageNumber={pageNumber} 
                width={600}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
            
            {numPages && numPages > 1 && (
              <div className="flex justify-between items-center w-full mt-4">
                <Button
                  onClick={() => setPageNumber(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                  variant="outline"
                  size="sm"
                >
                  Previous Page
                </Button>
                <p className="text-sm">
                  Page {pageNumber} of {numPages}
                </p>
                <Button
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={pageNumber >= numPages}
                  variant="outline"
                  size="sm"
                >
                  Next Page
                </Button>
              </div>
            )}
          </div>
        );
      
      case 'image':
        return (
          <div className="flex justify-center">
            <img 
              src={url} 
              alt={fileName} 
              className="max-w-full max-h-[70vh] object-contain" 
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('Failed to load image');
                setLoading(false);
              }}
            />
          </div>
        );
      
      case 'office':
        return (
          <div className="flex justify-center">
            <iframe 
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
              width="100%" 
              height="600px" 
              title={fileName}
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('Failed to load office document');
                setLoading(false);
              }}
            />
          </div>
        );
      
      case 'text':
        return (
          <div className="bg-white p-4 rounded border overflow-auto max-h-[70vh] w-full">
            <pre className="whitespace-pre-wrap font-mono text-sm">{textContent}</pre>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <p className="mb-4">Preview not available for this file type</p>
            <Button onClick={onDownload} variant="default">Download to view</Button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{fileName}</h3>
          {isVerified && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified
            </span>
          )}
        </div>
        <Button onClick={onDownload} variant="outline">
          Download
        </Button>
      </div>

      <div className="mt-4">
        {renderPreview()}
      </div>

      {showModeratorControls && (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={onApprove} 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
          >
            Approve Document
          </Button>
          <Button 
            onClick={onReject} 
            variant="destructive"
          >
            Reject Document
          </Button>
        </div>
      )}
    </div>
  );
}; 