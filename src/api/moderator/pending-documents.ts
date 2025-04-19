import { Request, Response } from 'express';
import { prisma } from '@/lib/db';
import { ApprovalStatus } from '@prisma/client';

// GET /api/moderator/pending-documents
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const pendingDocuments = await prisma.document.findMany({
      where: {
        status: ApprovalStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(pendingDocuments);
  } catch (error) {
    console.error('Error fetching pending documents:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 