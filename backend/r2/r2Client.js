import { S3Client } from '@aws-sdk/client-s3';
// Initialize the S3 client with R2 compatibility
export const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});
export const BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
