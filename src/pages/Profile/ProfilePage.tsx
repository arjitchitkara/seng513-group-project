// ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProfileHeaderSkeleton from '@/components/ui/ProfileHeaderSkeleton';
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
  BookmarkIcon,
  MapPin,
  Mail,
  School,
  Award,
  Share2,
  Grid,
  List,
  Filter,
  Download,
  Bookmark,
  User,
  Home,
  Laptop,
  Book,
  Quote,
  Lightbulb
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EditProfileModal from './EditProfileModal';
import NotFound from '../NotFound';

const ONE_HOUR = 1000 * 60 * 60;
const TWENTY_FOUR_HOURS = ONE_HOUR * 24;

// List of motivational quotes and tips
const MOTIVATIONAL_CONTENT = [
  { 
    type: "quote",
    content: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  },
  { 
    type: "quote",
    content: "Education is not the filling of a pail, but the lighting of a fire.",
    author: "William Butler Yeats"
  },
  { 
    type: "quote",
    content: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss"
  },
  { 
    type: "quote",
    content: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi"
  },
  { 
    type: "quote",
    content: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X"
  },
  { 
    type: "tip",
    content: "Study in short, focused sessions of 25-30 minutes with 5-minute breaks in between.",
    title: "Pomodoro Technique"
  },
  { 
    type: "tip",
    content: "Explain concepts to yourself or others to identify gaps in your understanding.",
    title: "The Feynman Technique"
  },
  { 
    type: "tip",
    content: "Review your notes within 24 hours of taking them to significantly improve retention.",
    title: "Spaced Repetition"
  },
  { 
    type: "tip",
    content: "Organize study materials using colors, diagrams, and mind maps to engage multiple parts of your brain.",
    title: "Visual Learning"
  },
  { 
    type: "tip",
    content: "Set specific, measurable, achievable, relevant, and time-bound goals for your studies.",
    title: "SMART Goals"
  },
  { 
    type: "quote",
    content: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  { 
    type: "quote",
    content: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.",
    author: "Pelé"
  },
  { 
    type: "quote",
    content: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch"
  },
  { 
    type: "quote",
    content: "Your education is a dress rehearsal for a life that is yours to lead.",
    author: "Nora Ephron"
  },
  { 
    type: "quote",
    content: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.",
    author: "Abigail Adams"
  },
  { 
    type: "tip",
    content: "Listen to instrumental music or white noise to improve focus while studying.",
    title: "Sound Environment"
  },
  { 
    type: "tip",
    content: "Take brief walks or do light exercises between study sessions to refresh your mind.",
    title: "Physical Movement"
  },
  { 
    type: "tip",
    content: "Use active recall by closing your books and trying to remember key concepts.",
    title: "Active Learning"
  },
  { 
    type: "tip",
    content: "Stay hydrated and maintain a healthy diet to optimize brain function during study sessions.",
    title: "Brain Health"
  },
  { 
    type: "tip",
    content: "Join or form study groups to discuss material and teach each other difficult concepts.",
    title: "Collaborative Learning"
  }
];

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [randomContent, setRandomContent] = useState(MOTIVATIONAL_CONTENT[0]);

  // Get a random quote or tip when the component mounts
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_CONTENT.length);
    setRandomContent(MOTIVATIONAL_CONTENT[randomIndex]);
  }, []);

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

  if (loadingProfile) {
    return <ProfileHeaderSkeleton />;
  }
  if (!profile) {
    return <NotFound />;
  }
  
  const isCurrentUser = currentUser?.id === userId;
  const fullName  = profile.fullName || currentUser?.user_metadata?.full_name || 'User';
  const firstName = fullName.split(' ')[0];

  const joinedDate = new Date(profile.createdAt || '').toLocaleDateString(
    'default',
    { month: 'long', year: 'numeric' }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Page Header */}
      <header className="bg-background/50 backdrop-blur-sm sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => window.navigator.share?.({
                title: `${fullName}'s Profile`,
                url: window.location.href
              }) || alert('Share link copied!')}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden md:inline">Share Profile</span>
            </Button>
            
            {isCurrentUser && (
              <EditProfileModal
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['profile', userId] });
                }}
                userId={userId}
              />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <GlassMorphism className="p-8 mb-8 relative overflow-hidden" intensity="medium">
          {/* Background pattern */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex flex-col items-center text-center md:text-left space-y-3">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                {profile?.profile?.avatar ? (
                  <AvatarImage src={profile.profile.avatar} alt={profile.fullName} />
                ) : (
                  <AvatarFallback className="text-4xl">{profile.fullName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{profile.fullName}</h1>
                <p className="text-sm text-muted-foreground capitalize">{profile.role.toLowerCase()}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {isCurrentUser ? (
                  <>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>You</span>
                    </Badge>
                  </>
                ) : (
                  <Button size="sm" variant="default">
                    Follow
                  </Button>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {joinedDate}</span>
                </Badge>
                
                {profile?.profile?.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{profile.profile.location}</span>
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 w-full md:w-auto">
              <div className="mb-4 max-w-2xl">
                {profile?.profile?.bio ? (
                  <p className="text-foreground/80">{profile.profile.bio}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    {isCurrentUser ? "Add a bio to tell others about yourself." : "This user hasn't added a bio yet."}
                  </p>
                )}
              </div>
              
              {/* Contact Information */}
              {(profile?.email || profile?.profile?.website || profile?.profile?.university) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {profile?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                  )}
                  {profile?.profile?.website && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" 
                         className="text-sm text-primary hover:underline">{profile.profile.website}</a>
                    </div>
                  )}
                  {profile?.profile?.university && (
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.profile.university}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassMorphism>

        {/* Motivational Content */}
        <GlassMorphism className="p-8 text-center" intensity="light">
          <div className="max-w-3xl mx-auto">
            {randomContent.type === "quote" ? (
              <>
                <div className="mb-6 flex justify-center">
                  <Quote className="h-12 w-12 text-primary/40" />
                </div>
                <blockquote className="text-xl md:text-2xl font-medium text-foreground italic mb-4">
                  "{randomContent.content}"
                </blockquote>
                <cite className="text-sm text-muted-foreground">— {randomContent.author}</cite>
              </>
            ) : (
              <>
                <div className="mb-6 flex justify-center">
                  <Lightbulb className="h-12 w-12 text-primary/40" />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">{randomContent.title}</h3>
                <p className="text-foreground mb-4">{randomContent.content}</p>
              </>
            )}
            
            <Button 
              variant="ghost" 
              className="mt-6"
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_CONTENT.length);
                setRandomContent(MOTIVATIONAL_CONTENT[randomIndex]);
              }}
            >
              Show Another
            </Button>
          </div>
        </GlassMorphism>
      </div>
    </div>
  );
};

export default ProfilePage;
