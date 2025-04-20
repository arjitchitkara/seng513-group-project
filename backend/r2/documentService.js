import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, BUCKET_NAME } from './r2Client';
// Convert browser File to Buffer (client-side)
const fileToBuffer = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(Buffer.from(reader.result));
            }
            else {
                reject(new Error('Failed to convert file to buffer'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
};
// Check if the input is a browser File or a server file object
const isBrowserFile = (file) => {
    return typeof window !== 'undefined' && file instanceof File;
};
// Upload file to R2
export const uploadDocument = async (file, userId) => {
    try {
        // Generate a unique key for the file
        const timestamp = Date.now();
        const fileName = isBrowserFile(file) ? file.name : file.name;
        const key = `documents/${userId}/${timestamp}-${fileName}`;
        // Get the buffer and content type
        let buffer;
        let contentType;
        if (isBrowserFile(file)) {
            // Browser File object
            buffer = await fileToBuffer(file);
            contentType = file.type;
        }
        else {
            // Server file object
            buffer = file.buffer;
            contentType = file.type;
        }
        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });
        await r2Client.send(command);
        return key;
    }
    catch (error) {
        console.error('Error uploading document:', error);
        throw error;
    }
};
// Generate a signed URL for downloading a document
export const getDocumentUrl = async (key, expirationSeconds = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        return await getSignedUrl(r2Client, command, { expiresIn: expirationSeconds });
    }
    catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};
// Delete a document from R2
export const deleteDocument = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await r2Client.send(command);
    }
    catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
};
