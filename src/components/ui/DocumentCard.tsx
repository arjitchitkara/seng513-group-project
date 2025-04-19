import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { DocumentPreview } from './DocumentPreview';
import { getDocumentDownloadUrl } from '../../../backend/r2/documentService';

interface DocumentCardProps {
  id: string;
  title: string;
  type: string;
  pages: number;
  filePath: string;
  fileName: string;
  isVerified: boolean;
  createdAt: string;
}

export const DocumentCard = ({
  id,
  title,
  type,
  pages,
  filePath,
  fileName,
  isVerified,
  createdAt,
}: DocumentCardProps) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const url = await getDocumentDownloadUrl(filePath);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handlePreview = async () => {
    try {
      if (!downloadUrl) {
        const url = await getDocumentDownloadUrl(filePath);
        setDownloadUrl(url);
      }
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error generating preview URL:', error);
    }
  };

  // Format date to be more readable
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="w-full max-w-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {type} • {pages} pages
          </CardDescription>
        </div>
        {isVerified && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
            Verified
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-40 bg-muted rounded-md flex items-center justify-center">
          <p className="text-3xl font-bold text-muted-foreground/50">
            {fileName.split('.').pop()?.toUpperCase()}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Uploaded on {formattedDate}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={handlePreview}>Preview</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            {downloadUrl && (
              <DocumentPreview 
                url={downloadUrl} 
                fileName={fileName}
                onDownload={handleDownload}
                isVerified={isVerified}
              />
            )}
          </DialogContent>
        </Dialog>
        <Button onClick={handleDownload}>Download</Button>
      </CardFooter>
    </Card>
  );
}; 