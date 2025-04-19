import { S3Client } from '@aws-sdk/client-s3';

const REGION = 'auto';
const ACCOUNT_ID = process.env.VITE_R2_ACCOUNT_ID || '';
const ACCESS_KEY_ID = process.env.VITE_R2_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.VITE_R2_SECRET_ACCESS_KEY || '';

export const r2Client = new S3Client({
  region: REGION,
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  }
});

export const BUCKET_NAME = process.env.VITE_R2_BUCKET_NAME || ''; 