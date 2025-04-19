import { Request, Response } from 'express';
import { prisma } from '@/lib/db';
import { ApprovalStatus, Prisma } from '@prisma/client';

// POST /api/documents - Create a new document
// GET /api/documents - Get all documents
export default async function handler(req: Request, res: Response) {
  if (req.method === 'POST') {
    try {
      const { 
        title, 
        type, 
        courseId, 
        filePath, 
        pages, 
        userId,
        uploaderId 
      } = req.body;

      if (!title || !type || !courseId || !filePath || !userId || !uploaderId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const document = await prisma.document.create({
        data: {
          title,
          type,
          pages: pages || 1,
          status: ApprovalStatus.PENDING,
          filePath,
          courseId,
          userId,
          uploaderId,
        },
      });

      return res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    try {
      const { userId, courseId, status } = req.query;
      
      const whereClause: Prisma.DocumentWhereInput = {};
      
      if (userId) {
        whereClause.userId = userId as string;
      }
      
      if (courseId) {
        whereClause.courseId = courseId as string;
      }
      
      if (status) {
        whereClause.status = status as ApprovalStatus;
      }
      
      const documents = await prisma.document.findMany({
        where: whereClause,
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
      
      return res.status(200).json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 