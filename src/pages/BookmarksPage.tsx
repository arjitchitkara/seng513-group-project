import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Search, Bookmark, FileText, CheckCircle, Bell, User as UserIcon} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {getBookmarks, getProfile} from '../lib/supabase-helpers';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ONE_HOUR = 1000 * 60 * 60;
const TWENTY_FOUR_HOURS = ONE_HOUR * 24;

const BookmarksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const userId = user?.id || '';

  const queryOptions = {
    staleTime: ONE_HOUR,
    cacheTime: TWENTY_FOUR_HOURS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  };

  const { data: profile, isLoading: loadingProfile} = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
    ...queryOptions,
  });

  const { data: bms = [],   isLoading: loadingBms} = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => getBookmarks(userId),
    ...queryOptions,
  });

  if (loadingProfile || loadingBms) {
    return <p className="text-center mt-10">Loading…</p>;
  }

  const bookmarks = bms.map((row) => row.document);

  const filtered = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userName = profile?.fullName|| 'User';

  return (
    <div className="min-h-screen bg-background/20">
      {/* Header */}
      <header className="bg-background/50 backdrop-blur-sm sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-4 flex items-center space-x-4">
          {/* Title */}
          <h1 className="text-2xl font-bold">Your bookmarks</h1>

          {/* Search bar: now grows to fill space */}
          <div className="flex-1">
            <form onSubmit={e => e.preventDefault()} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                className="w-full py-2 pl-10 pr-4 rounded-full bg-secondary/50 border border-border/50 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* User / notifications */}
          <div className="flex items-center space-x-4">
            <Link
              to="/notifications"
              className="p-2 rounded-full bg-secondary/70 hover:bg-secondary relative"
            >
              <Bell className="h-5 w-5 text-foreground/70" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                3
              </span>
            </Link>

            <Link
              to={`/profile/${user?.id}`}
              className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full bg-secondary/70 hover:bg-secondary"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Avatar className="w-8 h-8 p-0">
                  {profile?.profile?.avatar ? (
                    <AvatarImage src={profile.profile.avatar} alt={profile.fullName} />
                  ) : (
                    <AvatarFallback>
                      <UserIcon className="h-8 w- text-primary" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <span className="text-sm font-medium">{userName.split(' ')[0]}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* List */}
      <div className="p-6 space-y-4">
        {filtered.length > 0 ? (
          filtered.map(doc => {
            const course    = doc.course;
            const isApproved = doc.status.toLowerCase() === 'approved';

            return (
              <GlassMorphism key={doc.id} className="p-4" intensity="light">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-md bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{doc.title}</h3>
                      <div className="flex flex-wrap items-center text-xs text-muted-foreground">
                        <span>{course?.title}</span>
                        <span className="mx-2">•</span>
                        <span>{doc.date}</span>
                        <span className="mx-2">•</span>
                        <span>{doc.pages} pages</span>
                        <span className="mx-2">•</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isApproved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {isApproved && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Link to={`/documents/${doc.id}`}>View</Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassMorphism>
            );
          })
        ) : (
          <p className="text-center text-muted-foreground">No bookmarks found.</p>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
