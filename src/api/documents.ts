import { PrismaClient, ApprovalStatus, DocumentType } from '@prisma/client';
import { getDocumentUrl, deleteDocument } from '../../backend/r2/documentService';
import { supabase } from '../lib/supabase-client';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const db = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const courseId = url.searchParams.get('courseId');
    const status = url.searchParams.get('status') as ApprovalStatus | null;
    
    if (!userId && !courseId && !status) {
      return new Response('Missing required parameters', { status: 400 });
    }
    
    // Build query filters
    const filters: Record<string, string> = {};
    
    if (userId) {
      filters.userId = userId;
    }
    
    if (courseId) {
      filters.courseId = courseId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    // Get documents from database
    const documents = await db.document.findMany({
      where: filters,
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
    
    // Generate signed URLs for each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const url = await getDocumentUrl(doc.filePath);
        return {
          ...doc,
          url,
        };
      })
    );
    
    return Response.json(documentsWithUrls);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Get auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const userId = session.user.id;
    const { title, type, courseId, filePath, pages } = await req.json();
    
    // Validate required fields
    if (!title || !type || !courseId || !filePath) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Create document in database
    const document = await db.document.create({
      data: {
        title,
        type: type as DocumentType,
        pages: pages || 1,
        status: ApprovalStatus.PENDING,
        filePath,
        courseId,
        userId,
        uploaderId: userId,
      },
    });
    
    // Increment the document count for the course
    await db.course.update({
      where: { id: courseId },
      data: { documentCount: { increment: 1 } },
    });
    
    return Response.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    
    if (!id || !status) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Update document status
    const document = await db.document.update({
      where: { id },
      data: { status: status as ApprovalStatus },
    });
    
    return Response.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response('Missing document ID', { status: 400 });
    }
    
    // Get document details before deletion
    const document = await db.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      return new Response('Document not found', { status: 404 });
    }
    
    // Delete from R2 storage
    await deleteDocument(document.filePath);
    
    // Delete from database
    await db.document.delete({
      where: { id },
    });
    
    // Decrement the document count for the course
    await db.course.update({
      where: { id: document.courseId },
      data: { documentCount: { decrement: 1 } },
    });
    
    return new Response('Document deleted successfully');
  } catch (error) {
    console.error('Error deleting document:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 