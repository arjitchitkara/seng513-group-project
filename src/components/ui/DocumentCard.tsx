
import { motion } from 'framer-motion';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Bookmark, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from "date-fns";
import { Link } from 'react-router-dom';

interface CourseCardProps {
  title: string;
  }

interface DocumentCardProps {
  id: string;
  title: string;
  pages: number;
  status: string;
  filePath: string;
  updatedAt: Date;
  downloads: number;
  rating: number;
  course: CourseCardProps;
}

export const DocumentCard = ({
  id,
  title,
  pages,
  status,
  filePath,
  updatedAt,
  downloads,
  rating,
  course,
}: DocumentCardProps) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={filePath}>
        <GlassMorphism className="p-4" intensity="light">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-md bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{title}</h3>
                <div className="flex flex-wrap items-center text-xs text-muted-foreground">
                  <span>{course.title}</span>
                  <span className="mx-2">•</span>
                  <span>{`${formatDistanceToNow(updatedAt)} ago`}</span>
                  <span className="mx-2">•</span>
                  <span>{pages} pages</span>
                  <span className="mx-2">•</span>
                  <span>{downloads} downloads</span>
                  <span className="mx-2">•</span>
                  <span>{`⭐ ${rating}`}</span>
                  <span className="mx-2">•</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {status === 'APPROVED' && (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {status.charAt(0) +
                      status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassMorphism>
      </Link>
    </motion.div>
  )
}