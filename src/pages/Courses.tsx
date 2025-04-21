import { useState, useEffect } from 'react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FeaturedSection } from '@/components/ui/FeaturedSection';
import { SearchBar } from '@/components/ui/SearchBar';
import { CourseCard } from '@/components/ui/CourseCard';
import { BackToTop } from '@/components/ui/BackToTop';
import { searchDB } from '@/lib/utils';

import courseImage from '/img/courseImage.jpg';
import courseImageMobile from '/img/courseImageMobile.jpg'

const Courses = () => {

  {/* list of search results, each element is a list of strings, each string for a column in courses table*/}
  const [searchResults, setSearchResults] = useState([]);

  const [isMobile, setIsMobile] = useState(false);

  {/* calls searchDB function to search for input string, results returned in searchResult */}
  const onSearch = (input: string) => searchDB("Course", input, setSearchResults);

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
        src={isMobile ? courseImageMobile : courseImage}
      />
      <div className="absolute pt-32 my-10 w-full text-center text-gradient text-4xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,1.5)]">
        Search From Hundreds of Courses!
      </div>
      <SearchBar searchLabel="Search..." handleSearch={onSearch} />

      {!searchResults.length ? <FeaturedSection /> :
      <div className={`grid justify-evenly py-10 px-5 gap-5 ${cardLayout}`}>
        {searchResults.map((course) => CourseCard(course))}
      </div>
      }

      <Footer />
    </div>
  );
};

export default Courses;