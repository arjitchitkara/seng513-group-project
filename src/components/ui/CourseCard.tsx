
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Star, Users } from 'lucide-react';
import { GlassMorphism } from './GlassMorphism';

interface CourseCardProps {
  id: string;
  title: string;
  subject: string;
  description: string;
  documentCount: number;
  rating: number;
  userCount: number;
  imageSrc: string;
}

export const CourseCard = ({
  id,
  title,
  subject,
  description,
  documentCount,
  rating,
  userCount,
  imageSrc,
}: CourseCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={`/course/${id}`}>
        <GlassMorphism 
          className="h-full overflow-hidden flex flex-col transition-all duration-300"
          intensity="light"
        >
          <div
            className="h-48 w-full bg-cover bg-center transition-all duration-300"
            style={{ backgroundImage: `url(${imageSrc})` }}
          >
            <div className="w-full h-full flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="bg-primary/90 text-white text-xs font-semibold px-2 py-1 rounded-full w-fit">
                {subject}
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-5 flex flex-col">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{documentCount} docs</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{userCount}</span>
                </div>
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 mr-1 fill-amber-500" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-4 border-t border-border/40 bg-secondary/50 transform transition-transform duration-300 ${
              isHovered ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <span className="text-sm font-medium text-primary">View course materials →</span>
          </div>
        </GlassMorphism>
      </Link>
    </motion.div>
  );
};
