import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const isCompare = location.pathname.startsWith('/compare');
  const isMethodology = location.pathname.startsWith('/methodology');
  const isIntelligence = !isCompare && !isMethodology;

  const [reportReady, setReportReady] = useState(false);

  React.useEffect(() => {
    const handleReportReady = (e: any) => {
      setReportReady(e.detail);
    };
    window.addEventListener('reportReady', handleReportReady);
    return () => window.removeEventListener('reportReady', handleReportReady);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100">
      <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 md:py-5 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-12">
          <Link className="flex items-center gap-3 text-2xl font-serif font-bold text-zinc-900 tracking-tight" to="/">
            <img src="/favicon.svg" alt="TrustLens" className="w-8 h-8 drop-shadow-sm" />
            TrustLens
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link className={`${isIntelligence ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/">Intelligence</Link>
            <Link className={`${isCompare ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/compare">Comparison</Link>
            <Link className={`${isMethodology ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/methodology">Methodology</Link>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {reportReady && (
            <button 
              onClick={() => {
                const match = location.pathname.match(/^\/score\/(.+)$/);
                const platform = match ? match[1] : null;
                if (platform) {
                  const apiBase = import.meta.env.VITE_API_URL || 'https://trustlens-qtex.onrender.com';
                  window.open(`${apiBase}/report/${platform}`, '_blank');
                } else {
                  window.print(); // fallback for comparison or other pages
                }
              }}
              className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium hover:bg-primary-container transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" } />
              </svg>
              Download Report
            </button>
          )}
          <Link to="/extension-mockup" target="_blank" rel="noopener noreferrer" className="hidden md:inline-block bg-primary text-on-primary px-6 py-2.5 rounded-xl font-medium hover:bg-primary-container transition-all active:scale-95">
            Get Extension
          </Link>
          <div className="relative hidden md:block" ref={profileRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className={`w-10 h-10 rounded-full overflow-hidden transition-all duration-200 border shadow-sm ml-2 ${
                profileOpen ? 'scale-110 ring-2 ring-primary border-transparent' : 'border-stone-200 hover:ring-2 hover:ring-primary/20'
              }`}
            >
              <img src="/profile.png" alt="Profile" className="w-full h-full object-cover" />
            </button>
            
            {profileOpen && (
              <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-stone-100 rounded-xl shadow-xl py-2 flex flex-col font-body z-50">
                <button className="text-left px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 hover:text-primary transition-colors">Settings</button>
                <Link to="/methodology" onClick={() => setProfileOpen(false)} className="text-left px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 hover:text-primary transition-colors">About TrustLens</Link>
                <button className="text-left px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 hover:text-primary transition-colors border-t border-stone-100 mt-1 pt-3">Sign In</button>
              </div>
            )}
          </div>
          <button 
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
          <Link onClick={() => setMenuOpen(false)} className={`block ${isIntelligence ? 'text-blue-700 font-bold' : 'text-zinc-500'}`} to="/">Intelligence</Link>
          <Link onClick={() => setMenuOpen(false)} className={`block ${isCompare ? 'text-blue-700 font-bold' : 'text-zinc-500'}`} to="/compare">Comparison</Link>
          <Link onClick={() => setMenuOpen(false)} className={`block ${isMethodology ? 'text-blue-700 font-bold' : 'text-zinc-500'}`} to="/methodology">Methodology</Link>
          <hr className="border-stone-100" />
          <Link onClick={() => setMenuOpen(false)} to="/extension-mockup" className="block text-primary font-medium">Download Extension</Link>
        </div>
      )}
    </header>
  );
};
