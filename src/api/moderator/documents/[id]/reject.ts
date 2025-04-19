import { Request, Response } from 'express';
import { prisma } from '@/lib/db';
import { ApprovalStatus } from '@prisma/client';

// POST /api/moderator/documents/:id/reject
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  try {
    // Update document status to REJECTED
    const updatedDocument = await prisma.document.update({
      where: {
        id,
      },
      data: {
        status: ApprovalStatus.REJECTED,
      },
    });

    return res.status(200).json(updatedDocument);
  } catch (error) {
    console.error('Error rejecting document:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 