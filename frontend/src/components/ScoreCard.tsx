import React from 'react';

export interface SignalData {
  score: number;
  max: number;
  summary: string;
  compliant?: boolean;
}

export interface ScoreData {
  score: number;
  grade: string;
  grade_desc: string;
  dpdp_compliant: boolean;
  signals: Record<string, SignalData>;
  action_steps: string[];
  trend: number[];
  description?: string;
}

interface ScoreCardProps {
  platform: string;
  data: ScoreData;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ platform, data }) => {
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

  // SVG Gauge Math (radius 44, circumference ~276.46)
  const circumference = 276.46;
  const offset = circumference - (data.score / 100) * circumference;

  // Trend line math (dynamically scaled for visual drama)
  const trendMax = Math.max(...data.trend);
  const trendMin = Math.min(...data.trend);
  // Add 10% padding to the range so the line doesn't hit the absolute top/bottom edges
  const padding = (trendMax - trendMin) * 0.1 || 1; 
  const displayMax = trendMax + padding;
  const displayMin = trendMin - padding;
  const range = displayMax - displayMin;
  
  // map trend values to SVG coordinates (0 to 100 on X, Y from 35 down to 5)
  const stepX = 100 / (data.trend.length - 1);
  const points = data.trend.map((val, idx) => {
    const x = idx * stepX;
    const normalized = (val - displayMin) / range;
    const y = 35 - (normalized * 30);
    return `${x},${y}`;
  }).join(' ');

  const yFirst = 35 - (((data.trend[0] - displayMin) / range) * 30);
  const yLast = 35 - (((data.trend[data.trend.length - 1] - displayMin) / range) * 30);

  return (
    <main className="pt-32 pb-32 max-w-screen-2xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
      {/* Main Content Area: Left/Center Column */}
      <div className="lg:col-span-8 space-y-24">
        
        {/* Hero Intelligence Summary */}
        <section className="flex flex-col md:flex-row items-start md:items-center gap-12">
          <div className="relative flex-shrink-0 w-48 h-48 md:w-64 md:h-64 group cursor-default">
            {/* Progress Gauge */}
            <svg className="w-full h-full -rotate-90 transform group-hover:scale-[1.02] transition-transform duration-700 ease-out" viewBox="0 0 100 100">
              <circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="6"></circle>
              <circle 
                className="text-primary transition-all duration-1000 ease-out" 
                cx="50" cy="50" fill="transparent" r="44" 
                stroke="currentColor" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
                strokeWidth="6" 
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-out">
              <span className="text-6xl md:text-7xl font-headline font-bold text-on-surface bg-clip-text text-transparent bg-gradient-to-br from-on-surface to-on-surface-variant">{data.score}</span>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-label mt-1">Trust Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Grade Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-sans font-semibold text-xs uppercase tracking-wide cursor-default ${gradeStyle.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${gradeStyle.dot}`}></span>
                  <span>
                    GRADE {data.grade}: {data.grade_desc}
                  </span>
                </div>
                
                {/* DPDP Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-sans font-semibold text-xs uppercase tracking-wide cursor-default ${dpdpStyle.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dpdpStyle.dot}`}></span>
                  <span>
                    {data.dpdp_compliant ? 'DPDP Compliant' : 'DPDP Non-Compliant'}
                  </span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-headline text-on-surface leading-[1.15] font-bold capitalize">
                {platform}
              </h1>
            </div>
            <p className="text-xl text-on-surface-variant leading-relaxed font-body">
              {data.description || "An automated trust and privacy audit based on five independent veracity signals."}
            </p>
          </div>
        </section>

        {/* Veracity Breakdown Grid */}
        <section className="space-y-10">
          <h2 className="text-sm font-label uppercase tracking-[0.2em] text-on-surface-variant font-bold">Signal Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(data.signals).map(([key, signal]) => {
              const percentage = (signal.score / signal.max) * 100;
              const barColor = 'bg-primary';

              return (
                <div key={key} className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_12px_32px_rgba(25,28,29,0.04)] space-y-6 border border-stone-100 transition-shadow hover:shadow-[0px_16px_48px_rgba(25,28,29,0.08)]">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest">{key}</span>
                    <span className="text-2xl font-headline font-bold text-on-surface">
                      {signal.score}<span className="text-sm font-medium text-zinc-400">/{signal.max}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <p className="text-sm font-sans text-on-surface-variant leading-relaxed">{signal.summary}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sidebar / Right Column */}
      <aside className="lg:col-span-4 space-y-12">
        
        {/* Trend Graph Card */}
        <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-[0px_12px_32px_rgba(25,28,29,0.04)] border border-stone-100">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">12-Month Trend</h4>
            <span className="material-symbols-outlined text-primary">analytics</span>
          </div>
          <div className="h-40 w-full flex items-end justify-between gap-1 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
              <polyline 
                points={points} 
                fill="none" 
                stroke="#005dac" 
                strokeWidth="2.5" 
                strokeLinejoin="round" 
                strokeLinecap="round"
              />
              <circle cx="0" cy={yFirst} fill="#005dac" r="2"></circle>
              <circle cx="100" cy={yLast} fill="#005dac" r="2"></circle>
            </svg>
          </div>
          <div className="mt-6 flex justify-between text-[10px] font-bold font-label uppercase tracking-widest text-on-surface-variant/60">
            <span>12 Months Ago</span>
            <span>Present</span>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/15">
            <p className="text-sm font-sans leading-relaxed text-on-surface-variant">
              Latest score is <span className="text-primary font-bold">{data.trend[data.trend.length - 1]}</span> out of 100.
            </p>
          </div>
        </div>

        {/* Actionable Advice Card */}
        <div className="bg-primary text-on-primary p-10 rounded-2xl shadow-xl space-y-8">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary-fixed text-3xl">tips_and_updates</span>
            <h4 className="text-2xl font-headline font-bold">What You Should Do</h4>
          </div>
          <ul className="space-y-6 text-primary-fixed/90 text-sm font-sans leading-relaxed">
            {data.action_steps.map((step, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="font-bold opacity-50">{(idx + 1).toString().padStart(2, '0')}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

      </aside>
    </main>
  );
};
