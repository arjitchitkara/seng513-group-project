
import { useState, useEffect, useRef } from 'react';

export const SearchBar = ({ searchLabel, handleSearch }) => {
  {/* "searchLabel" is placeholder text in search bar
      "handleSearch" is function to be called when search is clicked */}

  const inputRef = useRef<HTMLInputElement>();
  
  const [isMobile, setIsMobile] = useState(false);

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    handleSearch(inputRef.current.value);
    event.preventDefault();
  };
  
  useEffect(() => {
    // Check for mobile view
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    
    <div className="w-5/6 flex self-center py-5 top-30">
      <div className="w-full min-w-[200px]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute w-5 h-5 top-3 left-2.5 text-slate-600">
            <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
          </svg>
          <input
            className={`w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-${isMobile ? "full" : "md"} pl-10 py-3 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow`}
            placeholder={searchLabel}
            type="text"
            ref={inputRef}
          />
          <button
            className={`absolute right-1 flex items-center rounded-${isMobile ? "full" : "md"} bg-primary py-${isMobile ? "2.5" : "2"} px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-primary/90 focus:shadow-none active:bg-primary/90 hover:bg-primary/90 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none`}
            type="submit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${isMobile ? "" : "mr-2"}`}>
              <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
            </svg>
      
            {isMobile ? "" : "Search"}
          </button> 
        </form>
      </div>
    </div>
  );
};
