import { supabase } from './supabase-client';
import type { Database } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

export type Tables = Database['public']['Tables'];

// Profile helpers
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', userId)
    .single();
  console.log('Profile data:', data);
  console.log('Profile error:', error);
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Tables['profiles']['Update']>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId);
  
  if (error) throw error;
}

// Course helpers
export async function getCourses(limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCourse(course: Tables['courses']['Insert']) {
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Document helpers
export async function getDocuments(courseId?: string, limit = 10, offset = 0) {
  let query = supabase
    .from('documents')
    .select('*, course:courses(*), uploader:users(id, full_name)')
    .order('created_at', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query.range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function getDocumentById(documentId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*, course:courses(*), uploader:users(id, full_name)')
    .eq('id', documentId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createDocument(document: Tables['documents']['Insert']) {
  const { data, error } = await supabase
    .from('documents')
    .insert([document])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDocumentStatus(documentId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const { error } = await supabase
    .from('documents')
    .update({ status })
    .eq('id', documentId);
  
  if (error) throw error;
}

// Bookmark helpers
export async function getBookmarks(userId: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, document:documents(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function addBookmark(userId: string, documentId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert([{ user_id: userId, document_id: documentId }])
    .select()
    .single();
  
  if (error && error.code !== '23505') throw error; // Ignore duplicate key error
  return data;
}

export async function removeBookmark(userId: string, documentId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .match({ user_id: userId, document_id: documentId });
  
  if (error) throw error;
}

// Enrollment helpers
export async function getEnrollments(userId: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data;
}

export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([{ user_id: userId, course_id: courseId }])
    .select()
    .single();
  
  if (error && error.code !== '23505') throw error; // Ignore duplicate key error
  
  // Increment the course user count
  await supabase.rpc('increment_course_user_count', { course_id: courseId });
  
  return data;
}

export async function unenrollFromCourse(userId: string, courseId: string) {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .match({ user_id: userId, course_id: courseId });
  
  if (error) throw error;
  
  // Decrement the course user count
  await supabase.rpc('decrement_course_user_count', { course_id: courseId });
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