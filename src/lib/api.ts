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
 * Get recently viewed documents for a user
 */
export const getRecentlyViewedDocuments = async (userId: string, limit = 4) => {
  // Since we don't have a dedicated API for this yet, we'll fetch approved documents
  // In a real implementation, this would call a dedicated endpoint tracking view history
  const response = await fetch(`/api/documents?status=APPROVED&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch recently viewed documents');
  }
  
  const documents = await response.json();
  
  // Transform the response to match the expected format in the Dashboard
  return documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    course: doc.course.title,
    date: formatRelativeDate(new Date(doc.createdAt)),
    status: doc.status.toLowerCase(),
    type: doc.type.toLowerCase(),
    pages: doc.pages
  }));
};

/**
 * Format a date relative to now (e.g., "2 days ago")
 */
const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
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