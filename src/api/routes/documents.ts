import express from 'express';
import { PrismaClient, ApprovalStatus, DocumentType } from '@prisma/client';
import { getDocumentUrl, deleteDocument } from '../../../backend/r2/documentService';

const router = express.Router();
const prisma = new PrismaClient();

// Get documents with optional filtering
router.get('/', async (req, res) => {
  try {
    const { userId, courseId, status } = req.query;
    
    if (!userId && !courseId && !status) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Build query filters
    const filters: Record<string, unknown> = {};
    
    if (userId) {
      filters.userId = userId as string;
    }
    
    if (courseId) {
      filters.courseId = courseId as string;
    }
    
    if (status) {
      filters.status = status as ApprovalStatus;
    }
    
    // Get documents from database
    const documents = await prisma.document.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });
    
    // Generate proxy URLs for each document instead of direct R2 URLs
    const documentsWithUrls = documents.map(doc => {
      // Create a proxy URL that will be handled by our r2-proxy route
      const url = `/api/proxy/r2/${doc.id}`;
      return {
        ...doc,
        url,
      };
    });
    
    return res.json(documentsWithUrls);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new document
router.post('/', async (req, res) => {
  try {
    // In a real implementation, you would verify the user from the auth token
    const userId = req.body.userId; // For now, get from request body
    const { title, type, courseId, filePath, pages } = req.body;
    
    // Validate required fields
    if (!userId || !title || !type || !courseId || !filePath) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create document in database
    const document = await prisma.document.create({
      data: {
        title,
        type: type as DocumentType,
        pages: pages || 1,
        status: ApprovalStatus.PENDING,
        filePath,
        courseId,
        userId,
        uploaderId: userId,
      },
    });
    
    // Increment the document count for the course
    await prisma.course.update({
      where: { id: courseId },
      data: { documentCount: { increment: 1 } },
    });
    
    return res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update document status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Missing status field' });
    }
    
    // Update document status
    const document = await prisma.document.update({
      where: { id },
      data: { status: status as ApprovalStatus },
    });
    
    return res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document details before deletion
    const document = await prisma.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete from R2 storage
    await deleteDocument(document.filePath);
    
    // Delete from database
    await prisma.document.delete({
      where: { id },
    });
    
    // Decrement the document count for the course
    await prisma.course.update({
      where: { id: document.courseId },
      data: { documentCount: { decrement: 1 } },
    });
    
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router; 