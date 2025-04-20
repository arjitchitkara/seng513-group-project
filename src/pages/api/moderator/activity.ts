import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ActivityType } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user using your auth system
  const session = await getSession({ req });
  
  // Check if user is authenticated and is a moderator
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userEmail = session.user.email;
  
  // Fetch the user from database with role
  const user = await prisma.user.findUnique({
    where: { email: userEmail || '' },
  });
  
  if (!user || (user.role !== 'MODERATOR' && user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Forbidden: Requires moderator privileges' });
  }

  // Handle different HTTP methods
  if (req.method === 'GET') {
    try {
      // Fetch the latest moderator activities
      const activities = await prisma.moderatorActivity.findMany({
        where: {
          moderatorId: user.id,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 10, // Limit to 10 recent activities
      });
      
      return res.status(200).json(activities);
    } catch (error) {
      console.error('Error fetching moderator activities:', error);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }
  } else if (req.method === 'POST') {
    try {
      const { type, documentTitle, documentId } = req.body;
      
      // Validate required fields
      if (!type || !documentTitle) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Convert string type to enum
      let activityType: ActivityType;
      switch (type) {
        case 'APPROVE':
          activityType = ActivityType.APPROVE;
          break;
        case 'REJECT':
          activityType = ActivityType.REJECT;
          break;
        case 'NEW':
          activityType = ActivityType.NEW;
          break;
        default:
          return res.status(400).json({ error: 'Invalid activity type' });
      }
      
      // Create a new activity record
      const activity = await prisma.moderatorActivity.create({
        data: {
          type: activityType,
          documentTitle,
          document: documentId ? {
            connect: { id: documentId }
          } : undefined,
          moderator: {
            connect: { id: user.id }
          },
          timestamp: new Date(),
        },
      });
      
      return res.status(201).json(activity);
    } catch (error) {
      console.error('Error creating moderator activity:', error);
      return res.status(500).json({ error: 'Failed to record activity' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 