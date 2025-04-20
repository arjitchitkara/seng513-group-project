import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, getBucketName } from './r2Client';
import zlib from 'zlib';
import { promisify } from 'util';

// Promisify zlib methods
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

// Convert browser File to Buffer (client-side)
const fileToBuffer = async (file: File): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(Buffer.from(reader.result));
      } else {
        reject(new Error('Failed to convert file to buffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

// Type to handle both browser File and server-side file object
type FileInput = 
  | File 
  | { 
      buffer: Buffer; 
      name: string; 
      type: string;
    };

// Check if the input is a browser File or a server file object
const isBrowserFile = (file: FileInput): file is File => {
  return typeof window !== 'undefined' && file instanceof File;
};

// Upload file to R2
export const uploadDocument = async (file: FileInput, userId: string): Promise<string> => {
  try {
    // Generate a unique key for the file
    const timestamp = Date.now();
    const fileName = isBrowserFile(file) ? file.name : file.name;
    const key = `documents/${userId}/${timestamp}-${fileName}`;
    
    // Get the buffer and content type
    let buffer: Buffer;
    let contentType: string;
    
    if (isBrowserFile(file)) {
      // Browser File object
      buffer = await fileToBuffer(file);
      contentType = file.type;
    } else {
      // Server file object
      buffer = file.buffer;
      contentType = file.type;
    }
    
    // Get R2 client and bucket name
    const r2Client = getR2Client();
    const bucketName = getBucketName();
    
    console.log(`[R2-SERVICE] Uploading to bucket: ${bucketName}`);
    
    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType
    });
    
    await r2Client.send(command);
    return key;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Generate a signed URL for downloading a document
export const getDocumentUrl = async (key: string, expirationSeconds = 3600): Promise<string> => {
  try {
    // Validate input parameters
    if (!key) {
      throw new Error('Missing required parameter: key');
    }
    
    // Get R2 client and bucket name
    const r2Client = getR2Client();
    const bucketName = getBucketName();
    
    // Validate R2 configuration
    if (!bucketName) {
      throw new Error('R2_BUCKET_NAME environment variable is not configured');
    }
    
    // Log request details
    console.log(`[R2-SERVICE] Generating signed URL for key: ${key}`);
    console.log(`[R2-SERVICE] Using bucket: ${bucketName}`);
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    const url = await getSignedUrl(r2Client, command, { expiresIn: expirationSeconds });
    console.log(`[R2-SERVICE] Successfully generated signed URL for ${key}`);
    return url;
  } catch (error) {
    console.error('[R2-SERVICE] Error generating signed URL:', error);
    console.error(`[R2-SERVICE] Error details - Key: ${key}, Bucket: ${getBucketName()}`);
    throw error;
  }
};

// Delete a document from R2
export const deleteDocument = async (key: string): Promise<void> => {
  try {
    // Get R2 client and bucket name
    const r2Client = getR2Client();
    const bucketName = getBucketName();
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}; 