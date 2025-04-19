import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, BUCKET_NAME } from './r2Client';
import imageCompression from 'browser-image-compression';

// Maximum file size before compression (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Generate a unique key for the file
const generateFileKey = (userId: string, originalFilename: string): string => {
  const timestamp = Date.now();
  const cleanFileName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${timestamp}_${cleanFileName}`;
};

// Get file extension
const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Determine if the file is an image
const isImage = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Compress an image file
const compressImage = async (file: File): Promise<File> => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
};

// Process file before upload (apply compression if needed)
const processFileBeforeUpload = async (file: File): Promise<File> => {
  // If file is smaller than the max size, no need to compress
  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }
  
  // Compress images
  if (isImage(file)) {
    return await compressImage(file);
  }
  
  // For other file types, we return the original
  // PDF compression would require server-side processing
  return file;
};

// Upload a document to R2
export const uploadDocument = async (
  file: File,
  userId: string
): Promise<{ key: string; url: string }> => {
  try {
    // Process and potentially compress the file before upload
    const processedFile = await processFileBeforeUpload(file);
    
    const fileKey = generateFileKey(userId, file.name);
    const fileBuffer = await processedFile.arrayBuffer();
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    });

    await r2Client.send(command);
    const publicUrl = `${process.env.VITE_R2_PUBLIC_URL}/${fileKey}`;
    
    return {
      key: fileKey,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
};

// Get a temporary download URL
export const getDocumentDownloadUrl = async (fileKey: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    // URL expires in 1 hour
    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

// Delete a document
export const deleteDocument = async (fileKey: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
};

// List documents for a user
export const listUserDocuments = async (userId: string): Promise<string[]> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${userId}/`,
    });

    const response = await r2Client.send(command);
    return response.Contents?.map(item => item.Key as string) || [];
  } catch (error) {
    console.error('Error listing user documents:', error);
    throw new Error('Failed to list user documents');
  }
};

// Get file type for preview purposes
export const getFileType = (filename: string): 'pdf' | 'image' | 'office' | 'text' | 'other' => {
  const ext = getFileExtension(filename);
  
  if (ext === 'pdf') {
    return 'pdf';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
    return 'office';
  } else if (['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'].includes(ext)) {
    return 'text';
  } else {
    return 'other';
  }
}; 