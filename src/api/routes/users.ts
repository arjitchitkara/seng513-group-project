/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import {v2 as cloudinary} from "cloudinary";
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

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

// Avatar upload route
router.post(
  '/:userId/avatar',
  upload.single('avatar'),
  async (req: MulterRequest, res) => {
    const { userId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded under field "avatar"' })
    }

    try {
      // 1) Look up existing profile to see if there's an old avatar to delete
      const existing = await prisma.profile.findUnique({
        where: { userId }
      })
      if (existing?.avatar) {
        // extract public_id from the URL (everything after the last '/' and before the extension)
        const parts    = existing.avatar.split('/')
        const lastSeg  = parts[parts.length - 1]
        const publicId = lastSeg.split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }

      // 2) Upload new avatar buffer to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars' },      
          (err, result) => {
            if (err) return reject(err)
            resolve(result!)
          }
        )
        stream.end(req.file.buffer)
      })

      // 3) Upsert the profile row with the new URL
      const updatedProfile = await prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          bio:    existing?.bio || null,
          avatar: uploadResult.secure_url
        },
        update: {
          avatar: uploadResult.secure_url
        }
      })

      // 4) Return the new avatar URL (and profile if you like)
      return res.json({
        avatarUrl:     uploadResult.secure_url,
        updatedProfile
      })
    } catch (e: any) {
      console.error('Avatar upload error:', e)
      return res.status(500).json({ error: e.message || 'Unknown error' })
    }
  }
)

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