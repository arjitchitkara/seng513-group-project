// API utility functions for client-side

/**
 * Upload a document to the server
 * This calls the backend API which handles the R2 storage
 */
export const uploadDocumentToServer = async (file: File, userId: string) => {
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  // Send to backend
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  const data = await response.json();
  return data.filePath;
};

/**
 * Get all documents for a user
 */
export const getUserDocuments = async (userId: string) => {
  const response = await fetch(`/api/documents?userId=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  
  return response.json();
};

/**
 * Get pending documents for moderation
 */
export const getPendingDocuments = async () => {
  const response = await fetch('/api/documents?status=PENDING');
  
  if (!response.ok) {
    throw new Error('Failed to fetch pending documents');
  }
  
  return response.json();
};

/**
 * Update document status
 */
export const updateDocumentStatus = async (documentId: string, status: string) => {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update document status');
  }
  
  return response.json();
}; 