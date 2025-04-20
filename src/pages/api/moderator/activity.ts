import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, ActivityType } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create a Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get the authenticated user from the request cookie
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No valid auth token' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Verify the token
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
  
  const userEmail = user.email;
  
  // Fetch the user from database with role
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail || '' },
  });
  
  if (!dbUser || (dbUser.role !== 'MODERATOR' && dbUser.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Forbidden: Requires moderator privileges' });
  }

  // Handle different HTTP methods
  if (req.method === 'GET') {
    try {
      // Fetch the latest moderator activities
      const activities = await prisma.moderatorActivity.findMany({
        where: {
          moderatorId: dbUser.id,
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
            connect: { id: dbUser.id }
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