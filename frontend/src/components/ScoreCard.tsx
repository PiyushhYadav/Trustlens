import React from 'react';

export interface SignalData {
  score: number;
  max: number;
  summary: string;
  compliant?: boolean;
  source?: string;
  verified?: boolean;
  is_fallback?: boolean;
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

export const getGradeStyle = (grade: string) => {
  switch(grade) {
    case 'A': 
    case 'B': return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60', dot: 'bg-emerald-600' };
    case 'C': 
    case 'D': return { bg: 'bg-amber-50 text-amber-800 border-amber-200/60', dot: 'bg-amber-600' };
    case 'F': return { bg: 'bg-rose-50 text-rose-800 border-rose-200/60', dot: 'bg-rose-600' };
    default: return { bg: 'bg-zinc-50 text-zinc-800 border-zinc-200/60', dot: 'bg-zinc-600' };
  }
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ platform, data }) => {

  const gradeStyle = getGradeStyle(data.grade);

  const dpdpStyle = data.dpdp_compliant 
    ? { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60', dot: 'bg-emerald-600' }
    : { bg: 'bg-rose-50 text-rose-800 border-rose-200/60', dot: 'bg-rose-600' };

  // SVG Gauge Math (radius 44, circumference ~276.46)
  const circumference = 276.46;
  const offset = circumference - (data.score / 100) * circumference;

  // Trend line math (dynamically scaled for visual drama)
  const safeTrend = Array.isArray(data.trend) && data.trend.length > 0 ? data.trend : [data.score, data.score, data.score];
  const trendMax = Math.max(...safeTrend);
  const trendMin = Math.min(...safeTrend);
  // Add 10% padding to the range so the line doesn't hit the absolute top/bottom edges
  const padding = (trendMax - trendMin) * 0.1 || 1; 
  const displayMax = trendMax + padding;
  const displayMin = trendMin - padding;
  const range = displayMax - displayMin;
  
  // map trend values to SVG coordinates (0 to 100 on X, Y from 35 down to 5)
  const stepX = 100 / (safeTrend.length - 1);
  const pointCoords = safeTrend.map((val, idx) => {
    const x = idx * stepX;
    const normalized = (val - displayMin) / range;
    const y = 35 - (normalized * 30);
    return { x, y };
  });

  // Generate smoothed path (Cubic Bezier)
  let smoothPath = '';
  if (pointCoords.length > 0) {
    smoothPath = `M ${pointCoords[0].x},${pointCoords[0].y}`;
    for (let i = 1; i < pointCoords.length; i++) {
       const p0 = pointCoords[i - 1];
       const p1 = pointCoords[i];
       const cpX = (p0.x + p1.x) / 2;
       smoothPath += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
  }
  
  const fillPath = `${smoothPath} L 100,40 L 0,40 Z`;

  return (
    <main className="pt-32 pb-32 max-w-screen-2xl mx-auto px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
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
              
              <div className="flex items-center justify-between">
                <h1 className="text-4xl md:text-6xl font-headline text-on-surface leading-[1.15] font-bold capitalize">
                  {platform}
                </h1>
              </div>
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
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-sm font-label font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      {key}
                      {signal.is_fallback && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-200" title="Estimated score due to missing data or analysis timeout">
                          Est.
                        </span>
                      )}
                    </h3>
                    <div className="text-2xl font-headline font-bold text-on-surface">
                      {signal.score}<span className="text-sm font-medium text-zinc-400">/{signal.max}</span>
                    </div>
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
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#005dac" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#005dac" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="1,1" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="1,1" />

              {/* Gradient Fill under the line */}
              <path 
                d={fillPath} 
                fill="url(#trendGradient)" 
              />
              
              {/* Smoothed Trend Line */}
              <path 
                d={smoothPath} 
                fill="none" 
                stroke="#005dac" 
                strokeWidth="2.5" 
                strokeLinejoin="round" 
                strokeLinecap="round"
              />

              {/* Monthly Dots */}
              {pointCoords.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="1.25" fill="#005dac" className="transition-all hover:r-2" />
              ))}
            </svg>
          </div>
          <div className="mt-6 flex justify-between text-[10px] font-bold font-label uppercase tracking-widest text-on-surface-variant/60">
            <span>12 Months Ago</span>
            <span>Present</span>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/15">
            <p className="text-sm font-sans leading-relaxed text-on-surface-variant">
              Latest score is <span className="text-primary font-bold">{safeTrend[safeTrend.length - 1]}</span> out of 100.
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
      </div>

      {/* Data Transparency Panel */}
      <section className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold font-headline text-zinc-900 mb-1">
                Data Sources & Verification
              </h3>
              <p className="text-sm text-zinc-500 font-body">
                We collect and verify information from multiple trusted sources to ensure an unbiased and accurate analysis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50/50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-100/50 flex-shrink-0">
            <span className="material-symbols-outlined text-sm">info</span>
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.signals).map(([key, signal]) => {
            let title = key;
            let desc = '';
            let icon = null;
            if (key === 'breach') {
              title = 'Breach Data';
              desc = 'Checks for data breaches and security incidents.';
              icon = (
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              );
            } else if (key === 'policy') {
              title = 'Company Policy';
              desc = 'Analyzes privacy policy and terms of service.';
              icon = (
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">description</span>
                </div>
              );
            } else if (key === 'security' || key === 'compliance') {
              title = 'Compliance Records';
              desc = 'Checks regulatory compliance and legal records.';
              icon = (
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">security</span>
                </div>
              );
            } else if (key === 'review') {
              title = 'User Complaints';
              desc = 'Analyzes user complaints from multiple platforms.';
              icon = (
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">error</span>
                </div>
              );
            } else if (key === 'tracker') {
              title = 'Tracker Analysis';
              desc = 'Detects third-party trackers and data collection scripts.';
              icon = (
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">database</span>
                </div>
              );
            }

            return (
              <div key={key} className="bg-white border border-stone-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {icon}
                    <h4 className="text-sm font-bold text-zinc-900 font-headline truncate max-w-[120px] sm:max-w-none">{title}</h4>
                  </div>
                  {signal.is_fallback ? (
                    <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 border border-amber-100/50 flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span className="hidden sm:inline">Fallback</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 border border-emerald-100/50 flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span className="hidden sm:inline">Verified</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 font-body leading-relaxed flex-grow sm:pl-[52px]">
                  {desc}
                </p>
                <hr className="border-stone-100 my-4" />
                <a href="#" onClick={(e) => e.preventDefault()} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline w-fit sm:pl-[52px]">
                  View source <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mt-4 text-sm font-body border border-blue-100/50">
          <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
          <p>
            We use a combination of automated scanning and manual verification to ensure accuracy. <a href="/methodology" className="text-blue-600 font-medium hover:underline">Learn more about our methodology.</a>
          </p>
        </div>
      </section>
    </main>
  );
};
