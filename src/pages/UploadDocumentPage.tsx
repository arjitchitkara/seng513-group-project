import { useDropzone } from "react-dropzone";
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType } from "@prisma/client";
import { uploadDocument } from "../../backend/r2/documentService";
import { GlassMorphism } from "@/components/ui/GlassMorphism";
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// Maximum file size in bytes - 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// File size thresholds for warnings
const COMPRESSION_THRESHOLD = 5 * 1024 * 1024; // 5MB

const UploadDocumentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType | "">("");
  const [courseId, setCourseId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [willCompress, setWillCompress] = useState(false);

  useEffect(() => {
    if (file && file.size > COMPRESSION_THRESHOLD) {
      // Only image files can be compressed on the client side
      setWillCompress(file.type.startsWith('image/'));
    } else {
      setWillCompress(false);
    }
  }, [file]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !type || !courseId || !user) {
      setError("Please fill in all required fields and upload a file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload file to R2
      const { key, url } = await uploadDocument(file, user.id);

      // 2. Save document metadata to database
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          type,
          courseId,
          filePath: key,
          pages: 1, // Would need a PDF parser to get actual page count
          userId: user.id,
          uploaderId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document metadata');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size with appropriate units
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  // Helper to get file extension
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <GlassMorphism className="p-8" intensity="medium">
        <h1 className="text-2xl font-bold mb-6">Upload Document</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as DocumentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DocumentType.NOTES}>Notes</SelectItem>
                <SelectItem value={DocumentType.LAB_REPORT}>Lab Report</SelectItem>
                <SelectItem value={DocumentType.ESSAY}>Essay</SelectItem>
                <SelectItem value={DocumentType.STUDY_GUIDE}>Study Guide</SelectItem>
                <SelectItem value={DocumentType.PRACTICE_PROBLEMS}>Practice Problems</SelectItem>
                <SelectItem value={DocumentType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="courseId">Course ID</Label>
            <Input 
              id="courseId" 
              value={courseId} 
              onChange={(e) => setCourseId(e.target.value)}
              required
              placeholder="e.g. SENG513"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Upload Document</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? "bg-secondary/30 border-primary" : file ? "border-green-500 bg-green-50" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                    {willCompress && " (will be compressed)"}
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Change File
                  </Button>
                </div>
              ) : isDragActive ? (
                <p>Drop the file here...</p>
              ) : (
                <div className="space-y-2">
                  <p>Drag & drop your document here, or click to select</p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MD, JPG, PNG, GIF
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {willCompress && (
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your image will be compressed before upload to optimize storage and reduce bandwidth usage.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isUploading || !file || !title || !type || !courseId}
              className="w-full sm:w-auto"
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </GlassMorphism>
      
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Uploaded Successfully</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Your document has been uploaded and is now pending approval by a moderator.
            You will be redirected to your dashboard momentarily.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadDocumentPage;
