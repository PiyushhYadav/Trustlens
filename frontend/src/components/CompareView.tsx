import React, { useEffect, useState, useRef } from 'react';
import type { ScoreData } from './ScoreCard';
import { getGradeStyle } from './ScoreCard';

const SearchableSelect = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: string[], placeholder: string }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value); // revert to selected value if click outside without selecting
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filtered = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative flex-1 md:w-64" ref={wrapperRef}>
      <div 
        className="flex items-center px-4 py-3.5 rounded-2xl bg-white border border-slate-200 font-bold text-sm cursor-text shadow-sm"
        onClick={() => setOpen(true)}
      >
        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 mr-3">
          {query ? query.substring(0,1).toUpperCase() : '?'}
        </div>
        <input
          type="text"
          className="w-full outline-none bg-transparent capitalize text-slate-800 placeholder-slate-400"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery('');
            setOpen(true);
          }}
        />
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 font-bold">No platforms found.</div>
          ) : (
            filtered.map(p => (
              <div
                key={p}
                className="px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer capitalize transition-colors flex items-center"
                onClick={() => {
                  onChange(p);
                  setQuery(p);
                  setOpen(false);
                }}
              >
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 mr-3">
                  {p.substring(0,1).toUpperCase()}
                </div>
                {p}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const PlatformCard = ({ data, name, colorClass }: { data: ScoreData, name: string, colorClass: string }) => {
  if (!data) return null;
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex justify-between items-center relative overflow-hidden">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center gap-5 mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white ${colorClass}`}>
            {name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 capitalize mb-1">{name}</h3>
            <p className="text-slate-500 text-sm font-medium">{data.platform_info?.category || 'Digital Platform'}</p>
          </div>
        </div>
        <div className="flex gap-6 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> India</span>
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> Service</span>
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg> {name.toLowerCase()}.com</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 mb-4">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle className="text-slate-100" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="10"></circle>
            <circle 
              className={`${colorClass.replace('bg-', 'text-')} transition-all duration-1000`} 
              cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" 
              strokeDasharray={263.89} strokeDashoffset={263.89 - (data.score / 100) * 263.89} strokeWidth="10" strokeLinecap="round"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-slate-900 leading-none">{data.score}</span>
            <span className="text-[11px] font-bold text-slate-400 mt-1">/ 100</span>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getGradeStyle(data.grade).bg}`}>
          GRADE {data.grade}: {data.grade_desc}
        </div>
      </div>
    </div>
  );
};

const SignalCol = ({ keyName, s1, s2, max }: { keyName: string, s1: any, s2: any, max: number }) => {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-[13px] capitalize">{keyName}</h4>
          <p className="text-[10px] font-bold text-slate-400">({max} points)</p>
        </div>
      </div>
      
      <div className="space-y-5 mb-5 flex-1">
         <div>
            <div className="flex justify-between text-[11px] font-bold mb-2">
               <span className="text-slate-500">Platform 1</span>
               <span className="text-slate-900">{s1.score}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(s1.score/max)*100}%` }}></div>
            </div>
         </div>
         <div>
            <div className="flex justify-between text-[11px] font-bold mb-2">
               <span className="text-slate-500">Platform 2</span>
               <span className="text-slate-900">{s2.score}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(s2.score/max)*100}%` }}></div>
            </div>
         </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl text-[10px] text-slate-500 h-28 overflow-hidden relative">
         <p className="mb-2 leading-relaxed line-clamp-3"><strong className="text-slate-700">P1:</strong> {s1.summary}</p>
         <p className="leading-relaxed line-clamp-3"><strong className="text-slate-700">P2:</strong> {s2.summary}</p>
         <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>
    </div>
  )
};

export const CompareView: React.FC = () => {
  const [platform1, setPlatform1] = useState("");
  const [platform2, setPlatform2] = useState("");
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  
  const [data1, setData1] = useState<ScoreData | null>(null);
  const [data2, setData2] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchPlatforms = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'https://trustlens-qtex.onrender.com';
        const res = await fetch(`${apiBase}/platforms`, { signal: controller.signal });
        const data = await res.json();
        if (active && data.platforms) {
          setAvailablePlatforms(data.platforms.map((p: any) => p.name));
        }
      } catch (e) {
        if (active) {
          setAvailablePlatforms(["Zomato", "Swiggy", "Instagram", "Byjus", "Aarogya Setu", "Paytm", "Flipkart"]);
        }
      }
    };
    fetchPlatforms();

    const fetchScores = async () => {
      if (!platform1 || !platform2) return;
      
      setLoading(true);
      setError('');
      const apiBase = import.meta.env.VITE_API_URL || 'https://trustlens-qtex.onrender.com';
      try {
        const [res1, res2] = await Promise.all([
          fetch(`${apiBase}/score?platform=${encodeURIComponent(platform1)}`, { signal: controller.signal }),
          fetch(`${apiBase}/score?platform=${encodeURIComponent(platform2)}`, { signal: controller.signal })
        ]);
        
        if (!res1.ok || !res2.ok) {
           throw new Error("Failed to fetch data for comparison");
        }

        const json1 = await res1.json();
        const json2 = await res2.json();
        
        if (!active) return;
        
        setData1(json1);
        setData2(json2);
      } catch (e: any) {
        if (!active || e.name === 'AbortError') return;
        setError(e.message || "Failed to load comparison data.");
      }
      setLoading(false);
    };

    if (showResults) {
      fetchScores();
    }
    return () => { 
      active = false; 
      controller.abort();
    };
  }, [platform1, platform2, showResults]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('reportReady', { detail: !loading && (data1 || data2) }));
    return () => { window.dispatchEvent(new CustomEvent('reportReady', { detail: false })); };
  }, [loading, data1, data2]);

  useEffect(() => {
    const handleDownload = async () => {
      if (!data1 || !data2) return;
      const element = document.getElementById('compare-report-content');
      if (element) {
        const originalWidth = element.style.width;
        element.style.width = '1400px'; 
        
        try {
          const html2pdf = (await import('html2pdf.js')).default;
          const opt = {
            margin:       0,
            filename:     `${platform1}-vs-${platform2}-trustlens-report.pdf`,
            image:        { type: 'jpeg' as const, quality: 1.0 },
            html2canvas:  { scale: 2, useCORS: true, logging: false, windowWidth: 1400 },
            jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'landscape' as const }
          };
          await html2pdf().set(opt).from(element).save();
        } catch (e) {
          console.error("Failed to generate PDF:", e);
        } finally {
           element.style.width = originalWidth;
        }
      }
    };

    window.addEventListener('triggerCompareDownload', handleDownload);
    return () => window.removeEventListener('triggerCompareDownload', handleDownload);
  }, [data1, data2, platform1, platform2]);

  let summary = "";
  if (data1 && data2 && !loading) {
    let p1Wins = 0;
    let p2Wins = 0;
    const signals = Object.keys(data1.signals);
    signals.forEach(key => {
      const s1 = data1.signals[key];
      const s2 = data2.signals[key];
      if (s1 && s2) {
        if (s1.score > s2.score) p1Wins++;
        else if (s2.score > s1.score) p2Wins++;
      }
    });
    if (p1Wins > p2Wins) {
      summary = `${platform1} outperforms ${platform2} on ${p1Wins} out of 5 key trust signals.`;
    } else if (p2Wins > p1Wins) {
      summary = `${platform2} outperforms ${platform1} on ${p2Wins} out of 5 key trust signals.`;
    } else {
      summary = `It's a tie! Both platforms win on an equal number of signals.`;
    }
  }

  const trend1 = data1 ? (Array.isArray(data1.trend) && data1.trend.length > 0 ? data1.trend : [...Array(12).fill(data1.score)]) : [];
  const trend2 = data2 ? (Array.isArray(data2.trend) && data2.trend.length > 0 ? data2.trend : [...Array(12).fill(data2.score)]) : [];
  
  const safeTrend1 = trend1.length < 12 ? [...Array(12 - trend1.length).fill(trend1[0]), ...trend1] : trend1.slice(-12);
  const safeTrend2 = trend2.length < 12 ? [...Array(12 - trend2.length).fill(trend2[0]), ...trend2] : trend2.slice(-12);

  const stepX = 100 / 11;
  const buildPath = (arr: number[]) => {
      const pointCoords = arr.map((val, idx) => ({ x: idx * stepX, y: 100 - val }));
      if (pointCoords.length === 0) return '';
      let smoothPath = `M ${pointCoords[0].x},${pointCoords[0].y}`;
      for (let i = 1; i < pointCoords.length; i++) {
         const p0 = pointCoords[i - 1];
         const p1 = pointCoords[i];
         const cpX = (p0.x + p1.x) / 2;
         smoothPath += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
      }
      return smoothPath;
  };

  const path1 = buildPath(safeTrend1);
  const path2 = buildPath(safeTrend2);

  const monthsArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels = [];
  let mIdx = new Date().getMonth();
  for (let i = 0; i < 12; i++) {
    monthLabels.unshift(monthsArr[mIdx]);
    mIdx = (mIdx - 1 + 12) % 12;
  }

  return (
    <div className="bg-[#F8FAFF] min-h-screen pt-32 pb-32 font-sans overflow-x-hidden text-slate-800">
      <main id="compare-report-content" className="max-w-[1400px] mx-auto px-10 bg-[#F8FAFF]">
        {/* Header Title Area */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-8">
          <div>
            <h2 className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-3 ml-1">Platform Comparison</h2>
            <h1 className="text-5xl font-black text-slate-900 mb-3 leading-tight tracking-tight">Two platforms.<br/>Five signals. One clear answer.</h1>
            <p className="text-slate-500 font-medium ml-1">Compare privacy, security and data practices side by side.</p>
          </div>
          <div className="flex items-center gap-5 bg-white p-5 rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 max-w-sm">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.98-7 10.08-3.87-1.1-7-5.41-7-10.08V6.3l7-3.12zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-[13px] text-slate-900 mb-0.5">Same signals. A safer internet.</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">We analyze multiple data sources to help you make informed choices.</p>
            </div>
          </div>
        </div>

        {/* Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <SearchableSelect 
            value={platform1} 
            onChange={(val) => { setPlatform1(val); setShowResults(false); }}
            options={availablePlatforms}
            placeholder="Platform 1"
          />
          <div className="text-slate-300 font-black tracking-widest text-sm">VS</div>
          <SearchableSelect 
            value={platform2} 
            onChange={(val) => { setPlatform2(val); setShowResults(false); }}
            options={availablePlatforms}
            placeholder="Platform 2"
          />
          <button 
            onClick={() => setShowResults(true)}
            disabled={!platform1 || !platform2}
            className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50 ml-2"
          >
            Compare
          </button>
        </div>

        {!showResults && (
           <div className="min-h-[40vh]"></div>
        )}

        {loading && showResults && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && !loading && showResults && (
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-200 text-center font-bold">
            {error}
          </div>
        )}

        {!loading && !error && data1 && data2 && showResults && (
          <div className="space-y-6">
            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlatformCard data={data1} name={platform1} colorClass="bg-blue-500" />
              <PlatformCard data={data2} name={platform2} colorClass="bg-emerald-500" />
            </div>

            {/* Signal Breakdown */}
            <div className="mt-8">
              <div className="flex justify-between items-end mb-6 ml-2 mr-2">
                <div className="flex items-center gap-4">
                   <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                   <div>
                     <h3 className="text-lg font-black text-slate-900 mb-0.5">Signal Breakdown</h3>
                     <p className="text-xs font-bold text-slate-400">Compare scores across key risk and trust factors.</p>
                   </div>
                </div>
                <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> {platform1}</span>
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {platform2}</span>
                  <span className="flex items-center gap-1.5 ml-4 text-slate-400 cursor-help"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Points in each category</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.keys(data1.signals).map(key => (
                   <SignalCol key={key} keyName={key} s1={data1.signals[key]} s2={data2.signals[key]} max={data1.signals[key].max} />
                ))}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
               {/* Trend Chart */}
               <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-10">
                     <div className="flex items-center gap-4">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                        <div>
                          <h3 className="text-base font-black text-slate-900 mb-0.5">Score Comparison Trend</h3>
                          <p className="text-[11px] font-bold text-slate-400">Track how trust scores have changed over time.</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {platform1}</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {platform2}</span>
                        <select className="ml-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-600 outline-none">
                           <option>Last 12 months</option>
                        </select>
                     </div>
                  </div>

                  <div className="relative w-full flex-1 min-h-[220px]">
                     {/* Y-Axis */}
                     <div className="absolute top-0 left-0 bottom-6 w-6 flex flex-col justify-between py-[2px] text-[10px] font-bold text-slate-400">
                        <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
                     </div>
                     
                     <div className="absolute top-0 left-10 right-4 bottom-6">
                        {/* Grid */}
                        <div className="absolute inset-0 flex flex-col justify-between py-1">
                           {[...Array(6)].map((_, i) => (
                           <div key={`h-${i}`} className="w-full h-px bg-slate-100" />
                           ))}
                        </div>

                        {/* Chart */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                           <path d={path1} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                           <path d={path2} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                           
                           {/* Points for P1 */}
                           {safeTrend1.map((v, i) => (
                             <circle key={`p1-${i}`} cx={(i/11)*100} cy={100 - v} r="2" fill="#3b82f6" />
                           ))}
                           {/* Points for P2 */}
                           {safeTrend2.map((v, i) => (
                             <circle key={`p2-${i}`} cx={(i/11)*100} cy={100 - v} r="2" fill="#10b981" />
                           ))}
                        </svg>

                        {/* End Badges */}
                        <div className="absolute w-6 h-5 bg-blue-500 text-white rounded-[4px] flex items-center justify-center text-[9px] font-black transform -translate-x-1/2 -translate-y-1/2" style={{ left: '100%', top: `${100 - safeTrend1[11]}%` }}>
                           {safeTrend1[11]}
                        </div>
                        <div className="absolute w-6 h-5 bg-emerald-500 text-white rounded-[4px] flex items-center justify-center text-[9px] font-black transform -translate-x-1/2 -translate-y-1/2" style={{ left: '100%', top: `${100 - safeTrend2[11]}%` }}>
                           {safeTrend2[11]}
                        </div>
                     </div>

                     {/* X-Axis */}
                     <div className="absolute bottom-0 left-10 right-4 h-5">
                        {monthLabels.map((m, i) => (
                           <span key={i} className="absolute text-[10px] font-bold text-slate-400 transform -translate-x-1/2 whitespace-nowrap" style={{ left: `${(i / 11) * 100}%` }}>
                           {m}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Key Takeaway */}
               <div className="lg:col-span-1 bg-[#FFF9E5] p-8 rounded-3xl border border-[#FFE898] flex flex-col justify-between">
                  <div>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-lg">🏆</div>
                        <h4 className="font-black text-[11px] uppercase tracking-wider text-amber-900">Key Takeaway</h4>
                     </div>
                     <h2 className="text-xl font-black text-amber-950 leading-tight mb-4">{summary}</h2>
                     <p className="text-xs font-medium text-amber-900/70 leading-relaxed mb-6">
                        While both platforms have similar overall trust scores, {data1.score > data2.score ? platform1 : platform2} performs better in critical analysis vectors.
                     </p>
                  </div>
                  <div className="flex gap-3 items-start bg-amber-100/50 p-4 rounded-2xl">
                     <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     <p className="text-[10px] text-amber-800/80 font-bold leading-relaxed">
                        Scores are based on a combination of automated scanning and manual verification. They may not be exhaustive.
                     </p>
                  </div>
               </div>
            </div>

            {/* Print Footer */}
            <div className="mt-8 pt-8 border-t border-slate-200 flex justify-between items-center px-4">
               <div className="flex items-center gap-3 opacity-60">
                  <img src="/favicon.svg" alt="TrustLens" className="w-6 h-6 grayscale" />
                  <div>
                     <h4 className="text-sm font-black text-slate-800 leading-none mb-1">TrustLens</h4>
                     <p className="text-[9px] font-bold text-slate-400">Privacy & Security for a Safer Internet</p>
                  </div>
               </div>
               <div className="opacity-40">
                  <span className="font-serif italic text-lg text-slate-600">More clarity. A Safer Tomorrow.</span>
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};
