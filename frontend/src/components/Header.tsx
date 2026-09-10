import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isCompare = location.pathname.startsWith('/compare');
  const isMethodology = location.pathname.startsWith('/methodology');
  const isIntelligence = !isCompare && !isMethodology;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100">
      <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 md:py-5 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-12">
          <Link className="text-2xl font-serif font-bold text-zinc-900 tracking-tight" to="/">TrustLens</Link>
          <div className="hidden md:flex space-x-8">
            <Link className={`${isIntelligence ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/">Intelligence</Link>
            <Link className={`${isCompare ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/compare">Comparison</Link>
            <Link className={`${isMethodology ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/methodology">Methodology</Link>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/extension-mockup" target="_blank" rel="noopener noreferrer" className="hidden md:inline-block bg-primary text-on-primary px-6 py-2.5 rounded-xl font-medium hover:bg-primary-container transition-all active:scale-95">
            Get Extension
          </Link>
          <button className="hidden md:block w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all border border-stone-200 shadow-sm ml-2">
            <img src="/profile.png" alt="Profile" className="w-full h-full object-cover" />
          </button>
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
          <Link onClick={() => setMenuOpen(false)} to="/extension-mockup" className="block text-primary font-medium">Get Extension</Link>
        </div>
      )}
    </header>
  );
};
