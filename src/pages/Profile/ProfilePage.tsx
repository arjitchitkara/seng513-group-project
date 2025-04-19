// ProfilePage.tsx
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import EditProfileModal from './EditProfileModal';
import {
  USERS,
  PROFILES,
  DOCUMENTS,
  BOOKMARKS,
  COURSES,
  ENROLLMENTS,
} from '../../components/utils/db/dummy';;

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [tab, setTab] = useState<'documents' | 'bookmarks' | 'courses'>('documents');

  const user = USERS.find((u) => u.id === userId);
  if (!user) {
    return <p className="text-center mt-10">User not found</p>;
  }

  const profile = PROFILES.find((p) => p.userId === user.id);
  const userDocs = DOCUMENTS.filter((d) => d.userId === user.id);
  const userBookmarks = BOOKMARKS.filter((b) => b.userId === user.id).map(
    (b) => DOCUMENTS.find((d) => d.id === b.documentId)
  );
  const userCourses = ENROLLMENTS.filter((e) => e.userId === user.id).map(
    (e) => COURSES.find((c) => c.id === e.courseId)
  );

  const joinedDate = new Date(user.createdAt).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img
          src={profile?.avatar || '/avatar-placeholder.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <p className="text-gray-500">Joined {joinedDate}</p>
          {profile?.bio && <p className="mt-2">{profile.bio}</p>}
        </div>
        <div className="flex gap-2">
          <EditProfileModal />
          {user.role === 'MODERATOR' && (
            <Link to="/dashboard" className="btn btn-outline">
              Moderator Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mt-6 border-b">
        {['documents', 'bookmarks', 'courses'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as typeof tab)}
            className={`px-4 py-2 -mb-px font-medium focus:outline-none ${
              tab === t
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4">
        {tab === 'documents' && (
          <ul className="space-y-4">
            {userDocs.map((doc) => (
              <li key={doc.id} className="border p-4 rounded">
                <h3 className="font-semibold">{doc.title}</h3>
                <p className="text-sm text-gray-600">Type: {doc.type}</p>
                <p className="text-sm text-gray-600">Status: {doc.status}</p>
                <p className="text-sm text-gray-600">Pages: {doc.pages}</p>
              </li>
            ))}
            {userDocs.length === 0 && <p>No documents uploaded.</p>}
          </ul>
        )}

        {tab === 'bookmarks' && (
          <ul className="space-y-4">
            {userBookmarks.map(
              (doc) =>
                doc && (
                  <li key={doc.id} className="border p-4 rounded">
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-gray-600">Type: {doc.type}</p>
                  </li>
                )
            )}
            {userBookmarks.length === 0 && <p>No bookmarks yet.</p>}
          </ul>
        )}

        {tab === 'courses' && (
          <ul className="space-y-4">
            {userCourses.map(
              (course) =>
                course && (
                  <li key={course.id} className="border p-4 rounded">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.subject}</p>
                  </li>
                )
            )}
            {userCourses.length === 0 && <p>Not enrolled in any courses.</p>}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
