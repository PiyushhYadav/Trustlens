import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export interface HeroProps {}

interface BreachData {
  n: string;
  d: string;
}

const SAFE_PLATFORMS = ["AdGuard", "Signal", "DuckDuckGo", "ProtonMail", "Apple", "Brave"];

export const Hero: React.FC<HeroProps> = () => {
  const [search, setSearch] = useState("");
  const [breaches, setBreaches] = useState<BreachData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/breaches.json')
      .then(res => res.json())
      .then(data => setBreaches(data))
      .catch(err => console.error("Could not load breach list", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setShowDropdown(false);
      navigate(`/score/${encodeURIComponent(search.trim())}`);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const showSuggestions = showDropdown && normalizedSearch.length >= 2;

  const breachedMatches = breaches
    .filter(b => b.n.toLowerCase().includes(normalizedSearch))
    .slice(0, 4);

  const safeMatches = SAFE_PLATFORMS
    .filter(s => s.toLowerCase().includes(normalizedSearch))
    .slice(0, 2);

  const hasAnyMatches = breachedMatches.length > 0 || safeMatches.length > 0;

  return (
    <section className="max-w-screen-2xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
      <div className="lg:col-span-7 lg:col-start-2">
        <h1 className="text-6xl md:text-8xl font-serif text-on-surface leading-[1.05] tracking-tighter mb-10">
          Trust, <br />Quantified.
        </h1>
        <p className="text-xl md:text-2xl text-on-surface-variant font-body leading-relaxed max-w-xl mb-14">
          Scoring apps and platforms on privacy practices, breach history, and DPDP Act 2023 compliance.
        </p>
        <form onSubmit={handleSearch} className="relative max-w-2xl group" ref={wrapperRef}>
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input 
            className="w-full pl-16 pr-32 py-6 rounded-2xl bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest text-lg transition-all placeholder:text-zinc-400" 
            placeholder="Search Platform (e.g. Zomato, Instagram)..." 
            type="text" 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          <button type="submit" className="absolute right-3 inset-y-3 px-6 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors">Analyze</button>

          {/* Autocomplete Dropdown */}
          {showSuggestions && hasAnyMatches && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Type to search...
              </div>
              <ul className="py-2">
                {breachedMatches.map((b, i) => (
                  <li key={`b-${i}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch(b.n);
                        setShowDropdown(false);
                        navigate(`/score/${encodeURIComponent(b.n)}`);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-stone-50 flex items-center justify-between transition-colors"
                    >
                      <span className="text-lg text-zinc-800 font-medium">{b.n}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-[11px] font-bold tracking-wide">
                        <svg className="w-3.5 h-3.5 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        BREACHED
                      </span>
                    </button>
                  </li>
                ))}
                {safeMatches.map((s, i) => (
                  <li key={`s-${i}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch(s);
                        setShowDropdown(false);
                        navigate(`/score/${encodeURIComponent(s)}`);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-stone-50 flex items-center justify-between transition-colors"
                    >
                      <span className="text-lg text-zinc-800 font-medium">{s}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold tracking-wide">
                        <svg className="w-3.5 h-3.5 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        SAFE
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="text-xs font-label uppercase tracking-widest text-zinc-400 self-center mr-2">Trending:</span>
          <button type="button" onClick={() => navigate('/score/telegram')} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium hover:bg-zinc-200 transition-colors">Telegram</button>
          <button type="button" onClick={() => navigate('/score/tinder')} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium hover:bg-zinc-200 transition-colors">Tinder</button>
          <button type="button" onClick={() => navigate('/score/aarogya%20setu')} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium hover:bg-zinc-200 transition-colors">Aarogya Setu</button>
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-4 relative">
        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-700 relative">
          <img className="w-full h-full object-cover" alt="Glass Monolith Data Vault" src="/hero_image.jpg" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/20 to-transparent"></div>
          <div className="absolute bottom-10 left-8 right-8 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest opacity-90 font-medium font-label">Live Analysis Engine</span>
            </div>
            <p className="text-xl font-body leading-snug">"Protecting user data through radical transparency."</p>
          </div>
        </div>
      </div>
    </section>
  );
};
