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