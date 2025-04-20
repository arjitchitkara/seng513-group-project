import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ApprovalStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get counts for all document statuses in a single DB query
    // This is much more efficient than multiple separate queries
    const pendingCount = await prisma.document.count({
      where: { status: ApprovalStatus.PENDING }
    });

    const approvedCount = await prisma.document.count({
      where: { status: ApprovalStatus.APPROVED }
    });

    const rejectedCount = await prisma.document.count({
      where: { status: ApprovalStatus.REJECTED }
    });

    const totalCount = await prisma.document.count();

    // Return all statistics in a single response
    return res.status(200).json({
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    return res.status(500).json({ error: 'Failed to fetch document statistics' });
  }
} 