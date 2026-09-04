import React, { useEffect, useState } from 'react';
import type { ScoreData } from './ScoreCard';

export const ExtensionMockupView: React.FC = () => {
  const [data, setData] = useState<ScoreData | null>(null);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'https://trustlens-qtex.onrender.com';
    fetch(`${apiBase}/score?platform=zomato`)
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  if (!data || (data as any).status === 'pending') return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const getGradeStyle = (grade: string) => {
    switch(grade) {
      case 'A': 
      case 'B': return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60', dot: 'bg-emerald-600' };
      case 'C': 
      case 'D': return { bg: 'bg-amber-50 text-amber-800 border-amber-200/60', dot: 'bg-amber-600' };
      case 'F': return { bg: 'bg-rose-50 text-rose-800 border-rose-200/60', dot: 'bg-rose-600' };
      default: return { bg: 'bg-zinc-50 text-zinc-800 border-zinc-200/60', dot: 'bg-zinc-600' };
    }
  };

  const gradeStyle = getGradeStyle(data.grade);
  const dpdpStyle = data.dpdp_compliant 
    ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60', dot: 'bg-emerald-600' }
    : { bg: 'bg-rose-50 text-rose-800 border-rose-200/60', dot: 'bg-rose-600' };

  const circumference = 414.69;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 font-body py-12">
      {/* Extension Container (400x600) */}
      <div className="w-[400px] h-[600px] bg-surface relative overflow-hidden shadow-2xl rounded-xl border border-stone-200/40 flex flex-col">
        {/* Header */}
        <header className="bg-stone-50/80 backdrop-blur-xl w-full flex justify-between items-center px-6 py-4 border-b border-stone-200/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-headline font-bold text-zinc-900 tracking-tight">TrustLens</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-zinc-500 hover:text-zinc-900 transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Main Score Area */}
          <section className="flex flex-col items-center justify-center py-8 bg-surface-container-lowest rounded-2xl border border-stone-100 shadow-sm">
            <div className="relative flex items-center justify-center mb-6">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 144 144">
                <circle className="text-surface-container-high" cx="72" cy="72" fill="transparent" r="66" stroke="currentColor" strokeWidth="8"></circle>
                <circle 
                  className="text-primary transition-all duration-1000 ease-out" 
                  cx="72" cy="72" fill="transparent" r="66" stroke="currentColor" 
                  strokeDasharray={circumference} strokeDashoffset={offset} strokeWidth="8" strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-headline font-bold text-on-surface">{data.score}</span>
                <span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant mt-2 font-semibold">Trust Score</span>
              </div>
            </div>

            <h1 className="text-2xl font-headline font-bold capitalize text-on-surface mb-5">Zomato</h1>
            
            <div className="flex flex-col items-center gap-2.5">
              {/* Grade */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-sans font-semibold text-[10px] uppercase tracking-wide cursor-default ${gradeStyle.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${gradeStyle.dot}`}></span>
                <span>GRADE {data.grade}: {data.grade_desc}</span>
              </div>
              {/* DPDP */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-sans font-semibold text-[10px] uppercase tracking-wide cursor-default ${dpdpStyle.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dpdpStyle.dot}`}></span>
                <span>{data.dpdp_compliant ? 'DPDP Compliant' : 'DPDP Non-Compliant'}</span>
              </div>
            </div>
          </section>

          {/* Key Signals */}
          <section className="space-y-3">
            <h2 className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest text-center">Top Signals</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Breach */}
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-stone-100">
                <span className="material-symbols-outlined text-primary mb-2 text-xl">shield</span>
                <h3 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Breach History</h3>
                <p className="text-xl font-headline font-bold">{data.signals.breach.score}<span className="text-sm text-zinc-400 font-medium">/{data.signals.breach.max}</span></p>
              </div>
              {/* Tracker */}
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-stone-100 border-l-4 border-l-amber-500">
                <span className="material-symbols-outlined text-amber-600 mb-2 text-xl">radar</span>
                <h3 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">Trackers</h3>
                <p className="text-xl font-headline font-bold">{data.signals.tracker.score}<span className="text-sm text-zinc-400 font-medium">/{data.signals.tracker.max}</span></p>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 p-4 rounded-xl flex flex-col gap-2 border border-primary/10">
            <h4 className="text-[10px] font-label font-bold text-primary uppercase tracking-wider">Analysis Insight</h4>
            <p className="text-[13px] font-sans text-on-surface-variant leading-relaxed">{data.description}</p>
          </section>
        </div>

        {/* Footer Action */}
        <footer className="p-6 border-t border-stone-200/50 bg-surface shrink-0">
          <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-body font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
            View Full Report
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </footer>
      </div>
    </div>
  );
};
