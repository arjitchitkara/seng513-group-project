import { useState, useEffect } from 'react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FeaturedSection } from '@/components/ui/FeaturedSection';
import { SearchBar } from '@/components/ui/SearchBar';
import { CourseCard } from '@/components/ui/CourseCard';
import { searchDB } from '@/lib/utils';
import { BackToTop } from '@/components/ui/BackToTop';

import courseImage from '/img/courseImage.jpg'

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

const featuredCourses = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    subject: 'Computer Science',
    description: 'Comprehensive introduction to computer science principles and programming fundamentals.',
    documentCount: 124,
    rating: 4.8,
    userCount: 2340,
    imageSrc: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  },
  {
    id: '2',
    title: 'Organic Chemistry I',
    subject: 'Chemistry',
    description: 'Explore the structures, properties, and reactions of organic compounds.',
    documentCount: 89,
    rating: 4.6,
    userCount: 1870,
    imageSrc: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
  },
  {
    id: '3',
    title: 'Calculus and Analytical Geometry',
    subject: 'Mathematics',
    description: 'Advanced mathematical concepts with applications in science and engineering.',
    documentCount: 156,
    rating: 4.7,
    userCount: 3120,
    imageSrc: 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
  },
  {
    id: '4',
    title: 'Principles of Microeconomics',
    subject: 'Economics',
    description: 'Study of individual consumer and firm behavior in different market structures.',
    documentCount: 78,
    rating: 4.5,
    userCount: 1550,
    imageSrc: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
  },
  {
    id: '5',
    title: 'World History: Modern Era',
    subject: 'History',
    description: 'Comprehensive overview of major historical events and movements since 1750.',
    documentCount: 112,
    rating: 4.3,
    userCount: 980,
    imageSrc: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e',
  },
  {
    id: '6',
    title: 'Introduction to Psychology',
    subject: 'Psychology',
    description: 'Foundational concepts in the scientific study of behavior and mental processes.',
    documentCount: 95,
    rating: 4.9,
    userCount: 2680,
    imageSrc: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
  },
];

const Courses = () => {

  {/* list of search results, each element is a list of strings, each string for a column in courses table*/}
  const [searchResults, setSearchResults] = useState([])

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleSearchResults = (results: string[][]) => {
    setSearchResults(results)
  }

  {/* calls searchDB function to search for input string, results returned in searchResult */}
  const onSearch = (input: string) => (input: string) => searchDB("Course", ["title", "subject", "description"], input, handleSearchResults)

  const stringToCourseCard = (courses: string[][]) => {
    return (
      courses.map((course: string[]) => ({
        id: course[0],
        title: course[1],
        subject: course[2],
        description: course[3],
        documentCount: parseInt(course[4]),
        rating: parseInt(course[5]),
        userCount: parseInt(course[6]),
        imageSrc: course[7]
      } as CourseCardProps))
    )
  }
  
  useEffect(() => {
    // Check for mobile view
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardLayout = isMobile ? "" : "grid-cols-4";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BackToTop />
      <img 
        className="relative mt-20 h-80 pb-5 -z-10"
        src={courseImage}
      />
      <div className="absolute pt-32 w-full text-center text-gradient text-4xl font-semibold drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]">
        Search From Hundreds of Courses!
      </div>
      <SearchBar searchLabel="Search..." handleSearch={onSearch} />

      {/* 
        Temporary hard coded courses 
        Commented out div below will display search results
      */}
      <div className={`grid justify-evenly py-5 px-5 gap-5 ${cardLayout}`}>
        {featuredCourses.map((course) => CourseCard(course))}
      </div>

      {/*
      {!searchResults.length ? <FeaturedSection /> :
      <div className={`grid justify-evenly py-10 px-5 gap-5 ${cardLayout}`}>
        {stringToCourseCard(searchResults).map((course) => CourseCard(course))}
      </div>
      }
      */}
      <Footer />
    </div>
  );
};

export default Courses;