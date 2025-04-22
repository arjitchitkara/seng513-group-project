import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Check if a document is bookmarked
router.get('/check', async (req, res) => {
  try {
    const { userId, documentId } = req.query;
    
    if (!userId || !documentId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_documentId: {
          userId: userId as string,
          documentId: documentId as string
        }
      }
    });
    
    return res.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Toggle bookmark (add or remove)
router.post('/toggle', async (req, res) => {
  try {
    const { userId, documentId } = req.body;
    
    if (!userId || !documentId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId
        }
      }
    });
    
    let bookmarked = false;
    
    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId,
          documentId
        }
      });
      bookmarked = true;
    }
    
    return res.json({ bookmarked });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router; 