import { S3Client } from '@aws-sdk/client-s3';

// Create a factory function to initialize the S3 client
let _r2Client: S3Client | null = null;
let _bucketName: string = '';

// Function to get or create the R2 client
export function getR2Client(): S3Client {
  if (!_r2Client) {
    console.log('[R2-CLIENT] Initializing R2 client now...');
    
    // Check critical environment variables
    const requiredEnvVars = [
      'R2_ENDPOINT', 
      'R2_ACCESS_KEY_ID', 
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME'
    ];

    // Log environment variable status
    console.log('[R2-CLIENT] Environment variable status:');
    const missingVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`[R2-CLIENT] Error: Missing required environment variable: ${envVar}`);
        missingVars.push(envVar);
      } else {
        console.log(`[R2-CLIENT] ✓ ${envVar} is configured`);
      }
    }

    if (missingVars.length > 0) {
      console.warn(`[R2-CLIENT] Warning: Missing ${missingVars.length} required R2 configuration variables`);
    }

    // Initialize the S3 client with R2 compatibility
    _r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
    
    _bucketName = process.env.R2_BUCKET_NAME || '';
    console.log(`[R2-CLIENT] Configured with bucket: "${_bucketName}"`);
  }
  
  return _r2Client;
}

// Function to get the bucket name
export function getBucketName(): string {
  if (!_bucketName) {
    _bucketName = process.env.R2_BUCKET_NAME || '';
  }
  return _bucketName;
}

// For backwards compatibility
export const r2Client = {
  get instance() {
    return getR2Client();
  }
};

export const BUCKET_NAME = {
  get name() {
    return getBucketName();
  }
};

// Export helper to check if R2 is properly configured
export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT && 
    process.env.R2_ACCESS_KEY_ID && 
    process.env.R2_SECRET_ACCESS_KEY && 
    process.env.R2_BUCKET_NAME
  );
} 