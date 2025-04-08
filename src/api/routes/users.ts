import express from 'express';
import { prisma } from '../../lib/prisma';

const router = express.Router();

// Create a user
router.post('/', async (req, res) => {
  const { id, email, fullName } = req.body;
  
  try {
    const user = await prisma.user.create({
      data: {
        id,
        email,
        fullName,
        profile: {
          create: {} // Create an empty profile
        }
      },
    });
    
    return res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

export default router; 