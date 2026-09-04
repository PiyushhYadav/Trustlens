import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface HeroProps {}

export const Hero: React.FC<HeroProps> = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/score/${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <section className="max-w-screen-2xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
      <div className="lg:col-span-7 lg:col-start-2">
        <h1 className="text-6xl md:text-8xl font-serif text-on-surface leading-[1.05] tracking-tighter mb-10">
          Trust, <br />Quantified.
        </h1>
        <p className="text-xl md:text-2xl text-on-surface-variant font-body leading-relaxed max-w-xl mb-14">
          Scoring apps and platforms on privacy practices, breach history, and DPDP Act 2023 compliance.
        </p>
        <form onSubmit={handleSearch} className="relative max-w-2xl group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input 
            className="w-full pl-16 pr-32 py-6 rounded-2xl bg-surface-container-highest border-0 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest text-lg transition-all placeholder:text-zinc-400" 
            placeholder="Search Platform (e.g. Zomato, Instagram)..." 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute right-3 inset-y-3 px-6 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors">Analyze</button>
        </form>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="text-xs font-label uppercase tracking-widest text-zinc-400 self-center mr-2">Trending:</span>
          <button type="button" onClick={() => navigate('/score/zomato')} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium hover:bg-zinc-200 transition-colors">Zomato</button>
          <button type="button" onClick={() => navigate('/score/instagram')} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium hover:bg-zinc-200 transition-colors">Instagram</button>
          <button type="button" onClick={() => navigate('/score/paytm')} className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium hover:bg-zinc-200 transition-colors">Paytm</button>
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-4 relative">
        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-stone-200/50 relative bg-surface-container-lowest flex items-center justify-center">
          {/* Abstract background */}
          <div className="absolute inset-0 opacity-50">
            <svg className="w-full h-full text-zinc-300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="heroDotGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#heroDotGrid)" />
              {/* Abstract network paths */}
              <path d="M -50 150 C 100 150 200 -50 400 100 M 0 300 C 150 400 250 200 500 350 M -100 500 C 100 450 300 600 500 450" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 50 100 L 150 300 L 350 250 L 450 400" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              {/* Network nodes */}
              <circle cx="50" cy="100" r="3.5" fill="currentColor" />
              <circle cx="150" cy="300" r="3.5" fill="currentColor" />
              <circle cx="350" cy="250" r="3.5" fill="currentColor" />
              <circle cx="450" cy="400" r="3.5" fill="currentColor" />
            </svg>
          </div>

          {/* Central Gauge */}
          <div className="relative w-64 h-64 z-10 bg-white rounded-full p-6 shadow-2xl border border-stone-100 flex flex-col items-center justify-center transform -translate-y-8">
            <svg className="absolute inset-0 w-full h-full -rotate-90 p-4" viewBox="0 0 100 100">
              <circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="6"></circle>
              <circle 
                className="text-primary transition-all duration-1000 ease-out" 
                cx="50" cy="50" fill="transparent" r="44" 
                stroke="currentColor" 
                strokeDasharray="276.46" 
                strokeDashoffset="63" 
                strokeWidth="6" 
                strokeLinecap="round"
              ></circle>
            </svg>
            <span className="text-7xl font-headline font-bold text-on-surface">77</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label mt-1 font-bold">Trust Score</span>
          </div>

          {/* Floating UI Elements */}
          <div className="absolute top-16 right-8 z-10 flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-lg shadow-sm transform rotate-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">Grade B</span>
          </div>

          <div className="absolute top-56 left-6 z-10 flex flex-col gap-2 bg-white border border-stone-100 p-4 rounded-xl shadow-md transform -rotate-3">
            <div className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">Trackers Detected</div>
            <div className="flex gap-1.5">
              <div className="w-10 h-1.5 bg-amber-500 rounded-full"></div>
              <div className="w-6 h-1.5 bg-surface-container-high rounded-full"></div>
            </div>
          </div>

          {/* Bottom text overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface via-surface/95 to-transparent pt-32 pb-10 px-10 z-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Live Analysis Engine</span>
            </div>
            <p className="text-2xl font-body leading-snug text-on-surface">"Protecting user data through radical transparency."</p>
          </div>
        </div>
      </div>
    </section>
  );
};
