// ProfilePage.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import {
  getProfile,
  getDocuments,
  getBookmarks,
  getEnrollments,
} from '../../lib/supabase-helpers';
import {
  Search,
  Bell,
  User as UserIcon,
  ExternalLink as LinkIcon,
  Calendar,
  CheckCircle,
  FileText,
  BookmarkIcon
} from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import { USERS, PROFILES, DOCUMENTS, BOOKMARKS, COURSES, ENROLLMENTS } from '../../components/utils/db/dummy';
import NotFound from '../NotFound';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  // const { user: authUser } = useAuth();
  // const authName = authUser?.user_metadata.full_name || 'User';
  // const [searchQuery, setSearchQuery] = useState('');
  // const [tab, setTab] = useState<'documents' | 'bookmarks' | 'courses'>('documents');

  // const user = USERS.find((u) => u.id === userId);
  // if (!user) return <NotFound/>;

  // const profile = PROFILES.find((p) => p.userId === user.id);
  // const joinedDate = new Date(user.createdAt).toLocaleDateString('default', { month: 'long', year: 'numeric' });

  // const docs = DOCUMENTS.filter((d) => d.userId === user.id);
  // const bookmarks = BOOKMARKS.filter((b) => b.userId === user.id).map((b) => DOCUMENTS.find((d) => d.id === b.documentId));
  // const courses = ENROLLMENTS.filter((e) => e.userId === user.id).map((e) => COURSES.find((c) => c.id === e.courseId));




  // — 1) Grab the logged‐in user from context
  const [searchQuery, setSearchQuery] = useState('');
  const { user: user } = useAuth();

  const authName = user.user_metadata.full_name || 'User';

  // — 2) Set up your tabs and search state
  const [tab, setTab] = useState<'documents' | 'bookmarks' | 'courses'>('documents');

  // — 3) Fire off your queries
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
  });

  const { data: docs = [],  isLoading: loadingDocs    } = useQuery({
    queryKey: ['documents', userId],
    queryFn: () => getDocuments(userId),
  });

  const { data: bms = [],   isLoading: loadingBms     } = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => getBookmarks(userId),
  });

  const { data: enrolls = [], isLoading: loadingEnrs } = useQuery({
    queryKey: ['enrollments', userId],
    queryFn: () => getEnrollments(userId),
  });

  // — 4) Loading / error guard
  if (loadingProfile || loadingDocs || loadingBms || loadingEnrs) {
    return <p className="text-center mt-10">Loading…</p>;
  }
  if (!profile) {
    return <NotFound />;
  }

  // — 5) Pull out the nested data
  const bookmarks = bms.map((row) => row.document);
  const courses   = enrolls.map((row) => row.course);

  // — 6) Compute display values
  const joinedDate = new Date(user.user_metadata.created_at || '').toLocaleDateString(
    'default',
    { month: 'long', year: 'numeric' }
  );


  return (
    <div className="min-h-screen bg-background/20">
      {/* Dashboard Header */}
      <header className="bg-background/50 backdrop-blur-sm sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-4 flex items-center justify-between">
          <form onSubmit={(e) => e.preventDefault()} className="relative hidden md:block w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by course, university, topic..."
              className="w-full py-2 pl-10 pr-4 rounded-full bg-secondary/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-secondary/70 hover:bg-secondary relative">
              <Bell className="h-5 w-5 text-foreground/70" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">3</span>
            </button>
            <button className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full bg-secondary/70 hover:bg-secondary">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{authName.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Profile Header */}
        <GlassMorphism className="p-8 mb-8 bg-primary/20" intensity="medium">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="w-28 h-28">
              {profile?.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.fullName} />
              ) : (
                <AvatarFallback>{profile.fullName.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <h1 className="text-3xl font-bold text-foreground">{profile.fullName}</h1>
            <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            <div className="flex items-center space-x-3 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {joinedDate}</span>
            </div>
            {profile?.bio && <p className="text-foreground/80 max-w-xl">{profile.bio}</p>}
            
            <div className="flex gap-4 mt-4">
              <EditProfileModal />
              <AnimatedButton hoverLift ripple gradient>Dashboard</AnimatedButton>
            </div>
          </div>
        </GlassMorphism>

        {/* Tabs */}
        <div className="border-b border-border/50 mb-6">
          <nav className="flex justify-center space-x-6">
            {['documents', 'bookmarks', 'courses'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as typeof tab)}
                className={`pb-2 font-medium transition-colors ${
                  tab === t
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Lists */}
        <div className="space-y-6">
          {/* Documents */}
          {tab === 'documents' && (docs.length ? docs.map((doc) => {
            const course = COURSES.find((c) => c.id === doc.courseId);
            return (
              <GlassMorphism key={doc.id} className="p-4" intensity="light">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-md bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{doc.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                      <span>{course?.title}</span>
                      <span>• {doc.pages} pages</span>
                      <span>• {new Date(doc.createdAt).toLocaleDateString()}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        doc.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      >
                        {doc.status === 'APPROVED' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </GlassMorphism>
            );
          }) : <p>No documents uploaded.</p>)}

          {/* Bookmarks */}
          {tab === 'bookmarks' && (bookmarks.length ? bookmarks.map((doc) => doc && (
            <GlassMorphism key={doc.id} className="p-4" intensity="light">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-foreground">{doc.title}</h3>
                <Button variant="outline" size="sm"><BookmarkIcon className="h-4 w-4" /></Button>
              </div>
            </GlassMorphism>
          )) : <p>No bookmarks yet.</p>)}

          {/* Courses */}
          {tab === 'courses' && (courses.length ? courses.map((course) => course && (
            <GlassMorphism key={course.id} className="p-4" intensity="light">
              <div className="flex items-center space-x-4">
                {course.imageSrc ? <img src={course.imageSrc} alt={course.title} className="w-10 h-10 rounded object-cover" /> : <div className="p-3 rounded-md bg-secondary/10"><BookmarkIcon className="h-6 w-6 text-secondary" /></div>}
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{course.subject}</p>
                </div>
                <Button variant="outline" size="sm">Go</Button>
              </div>
            </GlassMorphism>
          )) : <p>Not enrolled in any courses.</p>)}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
