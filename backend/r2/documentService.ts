import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, BUCKET_NAME } from './r2Client';
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
    const key = `documents/${userId}/${timestamp}-${fileName}.gz`;
    
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
    
    // Compress the buffer using gzip
    const compressedBuffer = await gzipAsync(buffer);
    
    // Calculate and log compression stats
    const originalSize = buffer.length;
    const compressedSize = compressedBuffer.length;
    const savingsPercent = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
    console.log(`Compression stats for ${fileName}:`);
    console.log(`Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`Space savings: ${savingsPercent}%`);
    
    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: compressedBuffer,
      ContentType: contentType,
      Metadata: {
        compressed: 'true'
      }
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
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    return await getSignedUrl(r2Client, command, { expiresIn: expirationSeconds });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Delete a document from R2
export const deleteDocument = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}; 