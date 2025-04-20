import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DocumentType } from '@prisma/client';
import { useAuth } from '@/lib/auth';
import { uploadDocumentToServer } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DocumentUploaderProps {
  courseId: string;
  onUploadComplete: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DocumentUploader = ({ courseId, onUploadComplete }: DocumentUploaderProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>(DocumentType.NOTES);
  const [uploading, setUploading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }
      
      setFile(selectedFile);
      
      // Autofill title from filename (without extension)
      const fileName = selectedFile.name;
      const titleFromName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setTitle(titleFromName);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.ms-powerpoint': ['.ppt'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !docType || !user) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setUploading(true);
      
      // Upload to server (which handles conversion to PDF and R2 storage)
      const filePath = await uploadDocumentToServer(file, user.id);
      
      // Create document record in database via API
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          type: docType,
          courseId,
          filePath,
          userId: user.id,
          pages: 1, // You might want to calculate this based on the file type
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document record');
      }
      
      toast.success('Document uploaded successfully');
      
      // Reset form
      setFile(null);
      setTitle('');
      setDocType(DocumentType.NOTES);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'bg-secondary/30 border-primary' : 'border-border hover:border-primary/50'
        } ${file ? 'bg-secondary/20' : ''}`}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="py-2">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="mt-2" 
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <p>Drag & drop a file here, or click to select</p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports PDF, DOCX, PPTX, TXT (Max 10MB)
            </p>
          </div>
        )}
      </div>
      
      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Document Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter document title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="type">Document Type</Label>
          <Select 
            value={docType} 
            onValueChange={(value) => setDocType(value as DocumentType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={!file || uploading}>
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Uploading...
          </>
        ) : (
          'Upload Document'
        )}
      </Button>
    </form>
  );
}; 