import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
        subject: true,
        description: true,
        documentCount: true,
        userCount: true,
        rating: true,
        imageSrc: true,
      },
    });
    
    return res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        documents: {
          where: {
            status: 'APPROVED',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    return res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router; 