/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase-client';
import type { Database } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

export type Tables = Database['public']['Tables'];

// Profile helpers
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('User')
    .select(`
      id,
      email,
      fullName,
      role,
      createdAt,
      updatedAt,
      profile:Profile(
        id,
        userId,
        bio,
        avatar
      )
    `)
    .eq('id', userId)
    .single();
  if (error) throw error;
  if (data) {
    return {
      ...data,
      profile: data.profile[0] ?? null   // now `profile` is an object or null
    }
  }
  return null
}

// Helper to turn a File into a base64 Data URL
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload    = () => resolve(reader.result as string)
    reader.onerror   = reject
    reader.readAsDataURL(file)
  })
}

// Extract Cloudinary public_id from a full URL
function getPublicId(url: string): string {
  const parts = url.split('/')
  const last   = parts.pop()!
  return last.split('.')[0]
}

interface UpdateProfileOpts {
  fullName?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  bio?: string
  avatarFile?: File
}

export async function updateProfile(
  userId: string,
  opts: UpdateProfileOpts
) {
  // 1) Auth update: email + password
  if (opts.email || opts.newPassword) {
    const { error: authErr } = await supabase.auth.updateUser({
      email: opts.email,
      password: opts.newPassword,
    })
    if (authErr) throw authErr
  }

  // 2) Update your users table: fullName + email
  const userUpdates: any = {}
  if (opts.fullName) userUpdates.fullName = opts.fullName
  if (opts.email)    userUpdates.email    = opts.email

  if (Object.keys(userUpdates).length) {
    const { error: userErr } = await supabase
    .from('User')   
      .update(userUpdates)
      .eq('id', userId)

    if (userErr) throw userErr
  }

  // 2) Avatar upload (optional) via your Express route
  let avatarUrl: string | null = null
  if (opts.avatarFile) {
    // Build FormData
    const fd = new FormData()
    fd.append('avatar', opts.avatarFile)

    // POST to your server upload handler
    const url = `http://localhost:3001/api/users/${userId}/avatar`
    console.log(`[API] Uploading avatar to ${url}`)
    const res = await fetch(url, {
      method: 'POST',
      body: fd,
    })

    if (!res.ok) {
      // grab the HTML or JSON error
      const text = await res.text()
      throw new Error(`Avatar upload failed: ${text}`)
    }
    const { avatarUrl: uploaded } = await res.json()
    avatarUrl = uploaded
  }

  // 3) Now persist bio + avatarUrl into Supabase
  const profileUpdates: any = {}
  if (opts.bio     !== undefined) profileUpdates.bio    = opts.bio
  if (avatarUrl)                  profileUpdates.avatar = avatarUrl

  if (Object.keys(profileUpdates).length) {
    const { error: profErr } = await supabase
      .from('Profile')           // make sure this matches your table name
      .update(profileUpdates)
      .eq('userId', userId)      // snake_case FK column
    if (profErr) throw new Error(profErr.message)
  }
}

// Course helpers
export async function getCourses(limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('Course')
    .select('*')
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from('Course')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCourse(course: Tables['courses']['Insert']) {
  const { data, error } = await supabase
    .from('Course')
    .insert([course])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Document helpers
export async function getDocuments(courseId?: string, limit = 10, offset = 0) {
  let query = supabase
    .from('Document')
    .select('*, course:Course(*), uploader:User(id, fullName)')
    .order('createdAt', { ascending: false });
  
  if (courseId) {
    query = query.eq('courseId', courseId);
  }
  
  const { data, error } = await query.range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function getDocumentById(documentId: string) {
  const { data, error } = await supabase
    .from('Document')
    .select('*, course:Course(*), uploader:User(id, fullName)')
    .eq('id', documentId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createDocument(document: Tables['documents']['Insert']) {
  const { data, error } = await supabase
    .from('Document')
    .insert([document])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDocumentStatus(documentId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const { error } = await supabase
    .from('Document')
    .update({ status })
    .eq('id', documentId);
  
  if (error) throw error;
}

// Bookmark helpers
export async function getBookmarks(userId: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('Bookmark')
    .select('*, document:Document(*)')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function addBookmark(userId: string, documentId: string) {
  const { data, error } = await supabase
    .from('Bookmark')
    .insert([{ user_id: userId, document_id: documentId }])
    .select()
    .single();
  
  if (error && error.code !== '23505') throw error; // Ignore duplicate key error
  return data;
}

export async function removeBookmark(userId: string, documentId: string) {
  const { error } = await supabase
    .from('Bookmark')
    .delete()
    .match({ userId: userId, documentId: documentId });
  
  if (error) throw error;
}

// Enrollment helpers
export async function getEnrollments(userId: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('Enrollment')
    .select('*, course:Course(*)')
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('Enrollment')
    .insert([{ userId: userId, courseId: courseId }])
    .select()
    .single();
  
  if (error && error.code !== '23505') throw error; // Ignore duplicate key error
  
  // Increment the course user count
  await supabase.rpc('increment_course_user_count', { courseIdd: courseId });
  
  return data;
}

export async function unenrollFromCourse(userId: string, courseId: string) {
  const { error } = await supabase
    .from('Enrollments')
    .delete()
    .match({ userId: userId, courseId: courseId });
  
  if (error) throw error;
  
  // Decrement the course user count
  await supabase.rpc('decrement_course_user_count', { courseId: courseId });
}

// Check if a user is a moderator or admin
export function isModerator(user: User | null): boolean {
  if (!user) return false;
  const role = user.user_metadata?.role || 'USER';
  return role === 'MODERATOR' || role === 'ADMIN';
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  const role = user.user_metadata?.role || 'USER';
  return role === 'ADMIN';
} 