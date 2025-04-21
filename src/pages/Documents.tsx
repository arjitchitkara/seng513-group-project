
import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { SearchBar } from "@/components/ui/SearchBar";
import { DocumentCard } from '@/components/ui/DocumentCard';
import { searchDB } from "@/lib/utils";

import documentImage from '/img/documentImage.jpg';
import documentImageMobile from '/img/documentImageMobile.jpg';

const recentDocuments = [
  {
    id: '1',
    title: 'Advanced Calculus: Integration Techniques',
    pages: 12,
    status: 'APPROVED',
    filePath: '/math/advanced-calculus-notes.pdf',
    updatedAt: new Date('2025-04-18T00:00:00'),
    downloads: 198,
    rating: 4.3,
    course: { title: 'Calculus II' }
  },
  {
    id: '2',
    title: 'Organic Chemistry Lab Report: Synthesis of Aspirin',
    pages: 8,
    status: 'PENDING',
    filePath: '/chemistry/aspirin-lab-report.pdf',
    updatedAt: new Date('2025-04-15T00:00:00'),
    downloads: 365,
    rating: 3.7,
    course: { title: 'Organic Chemistry' }
  },
  {
    id: '3',
    title: 'Literary Analysis: Symbolism in The Great Gatsby',
    pages: 6,
    status: 'APPROVED',
    filePath: '/literature/gatsby-symbolism.pdf',
    updatedAt: new Date('2025-04-13T00:00:00'),
    downloads: 274,
    rating: 4.9,
    course: { title: 'American Literature' }
  },
  {
    id: '4',
    title: 'Principles of Macroeconomics: Study Guide',
    pages: 15,
    status: 'APPROVED',
    filePath: '/economics/macroeconomics-study-guide.pdf',
    updatedAt: new Date('2025-04-08T00:00:00'),
    downloads: 119,
    rating: 3.2,
    course: { title: 'Economics 101' }
  },
  {
    id: '5',
    title: 'Physics Lab Report Guidelines',
    pages: 10,
    status: 'APPROVED',
    filePath: '/physics/lab-report-guidelines.pdf',
    updatedAt: new Date('2025-03-02T00:00:00'),
    downloads: 128,
    rating: 4.8,
    course: { title: 'Physics 101' }
  },
  {
    id: '6',
    title: 'Calculus Exam Study Guide',
    pages: 14,
    status: 'PENDING',
    filePath: '/math/calculus-exam-guide.pdf',
    updatedAt: new Date('2025-02-18T00:00:00'),
    downloads: 345,
    rating: 4.9,
    course: { title: 'Mathematics' }
  },
  {
    id: '7',
    title: 'Introduction to Microeconomics',
    pages: 9,
    status: 'APPROVED',
    filePath: '/economics/microeconomics-intro.pdf',
    updatedAt: new Date('2025-04-17T00:00:00'),
    downloads: 212,
    rating: 4.7,
    course: { title: 'Econ 101' }
  }
];

const Documents = () => {

  const [searchResults, setSearchResults] = useState([]);

  const [isMobile, setIsMobile] = useState(false);

  const onSearch = (input: string) => searchDB("Document", input, setSearchResults);

  useEffect(() => {
    // Check for mobile view
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardLayout = isMobile ? "" : "grid-cols-2";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BackToTop />
      <img 
        className="relative mt-20 h-80 pb-5 -z-10"
        src={isMobile ? documentImageMobile : documentImage}
      />
      <div className="absolute pt-32 my-10 w-full text-center text-gradient text-4xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,1.5)]">
        Access Thousands of Course Documents!
      </div>
      <SearchBar searchLabel="Search..." handleSearch={onSearch} />

      {!searchResults.length ? 
        <div className={`grid justify-evenly py-10 px-5 gap-5 ${cardLayout}`}>
          {recentDocuments.map((document) => DocumentCard(document))}
        </div>
      : 
        <div className={`grid justify-evenly py-10 px-5 gap-5 ${cardLayout}`}>
          {searchResults.map((document) => DocumentCard(document))}
        </div>
      }

      <Footer />
    </div>
  )
};

export default Documents;