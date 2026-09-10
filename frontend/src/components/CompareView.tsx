import React, { useEffect, useState } from 'react';
import type { ScoreData } from './ScoreCard';


import { getGradeStyle } from './ScoreCard';

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
        
        if (!res1.ok) {
           const errData = await res1.json().catch(() => null);
           throw new Error(errData?.detail || `Failed to fetch data for ${platform1}`);
        }
        if (!res2.ok) {
           const errData = await res2.json().catch(() => null);
           throw new Error(errData?.detail || `Failed to fetch data for ${platform2}`);
        }

        const json1 = await res1.json();
        const json2 = await res2.json();
        
        if (!active) return;

        if (json1.status === "pending" || json2.status === "pending") {
           setError("One of the platforms is pending live analysis.");
           setLoading(false);
           return;
        }
        
        setData1(json1);
        setData2(json2);
      } catch (e: any) {
        if (!active || e.name === 'AbortError') return;
        setError(e.message || "Failed to load comparison data.");
      }
      setLoading(false);
    };

    fetchScores();
    return () => { 
      active = false; 
      controller.abort();
    };
  }, [platform1, platform2]);

  useEffect(() => {
    // Notify header when report is ready for download
    window.dispatchEvent(new CustomEvent('reportReady', { detail: !loading && (data1 || data2) }));
    return () => { window.dispatchEvent(new CustomEvent('reportReady', { detail: false })); };
  }, [loading, data1, data2]);

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
      summary = `${platform1.charAt(0).toUpperCase() + platform1.slice(1)} wins on ${p1Wins} of ${signals.length} signals.`;
    } else if (p2Wins > p1Wins) {
      summary = `${platform2.charAt(0).toUpperCase() + platform2.slice(1)} wins on ${p2Wins} of ${signals.length} signals.`;
    } else {
      summary = `It's a tie! Both platforms win on an equal number of signals.`;
    }
  }

  return (
    <main className="pt-32 pb-32 max-w-screen-2xl mx-auto px-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface mb-4">Platform Comparison</h1>
          <p className="text-lg text-on-surface-variant font-body">Benchmarking veracity signals head-to-head.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <select 
            value={platform1} 
            onChange={(e) => {
              setPlatform1(e.target.value);
              setShowResults(false);
            }}
            className="flex-1 md:w-48 px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant font-label text-sm capitalize"
          >
            <option value="" disabled>Select platform...</option>
            {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex items-center text-on-surface-variant font-bold font-label">VS</div>
          <select 
            value={platform2} 
            onChange={(e) => {
              setPlatform2(e.target.value);
              setShowResults(false);
            }}
            className="flex-1 md:w-48 px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant font-label text-sm capitalize"
          >
            <option value="" disabled>Select platform...</option>
            {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button 
            onClick={() => setShowResults(true)}
            disabled={!platform1 || !platform2}
            className="px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare
          </button>
        </div>
      </div>

      {!showResults && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center mt-12">
          <div className="flex items-center gap-8 mb-8 text-zinc-200">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-zinc-200"></div>
            <span className="text-3xl font-black font-headline tracking-widest">VS</span>
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-zinc-200"></div>
          </div>
          <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">Ready to Benchmark</h3>
          <p className="text-lg text-on-surface-variant font-body max-w-md mx-auto leading-relaxed">
            Select two platforms from the dropdowns above and click <strong className="text-on-surface">Compare</strong> to see how they stack up.
          </p>
        </div>
      )}

      {loading && showResults && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && !loading && showResults && (
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-200 text-center">
          <p className="font-bold">{error}</p>
        </div>
      )}

      {!loading && !error && data1 && data2 && showResults && (
        <div className="space-y-12">
          {/* Top Level Scores */}
          <div className="grid grid-cols-2 gap-8 md:gap-16">
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
              <h2 className="text-3xl font-headline font-bold capitalize mb-8">{platform1}</h2>
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="6"></circle>
                  <circle 
                    className="text-primary transition-all duration-1000" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" 
                    strokeDasharray={276.46} strokeDashoffset={276.46 - (data1.score / 100) * 276.46} strokeWidth="6" strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-headline font-bold">{data1.score}</span>
                </div>
              </div>
              <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-md border font-sans font-semibold text-xs uppercase tracking-wide cursor-default ${getGradeStyle(data1.grade).bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getGradeStyle(data1.grade).dot}`}></span>
                <span>
                  GRADE {data1.grade}: {data1.grade_desc}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
              <h2 className="text-3xl font-headline font-bold capitalize mb-8">{platform2}</h2>
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" strokeWidth="6"></circle>
                  <circle 
                    className="text-primary transition-all duration-1000" cx="50" cy="50" fill="transparent" r="44" stroke="currentColor" 
                    strokeDasharray={276.46} strokeDashoffset={276.46 - (data2.score / 100) * 276.46} strokeWidth="6" strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-headline font-bold">{data2.score}</span>
                </div>
              </div>
              <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-md border font-sans font-semibold text-xs uppercase tracking-wide cursor-default ${getGradeStyle(data2.grade).bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getGradeStyle(data2.grade).dot}`}></span>
                <span>
                  GRADE {data2.grade}: {data2.grade_desc}
                </span>
              </div>
            </div>
          </div>

          {/* Signals Breakdown */}
          <div className="space-y-6">
            <h3 className="text-sm font-label uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-8 text-center">Signal Breakdown</h3>
            
            {Object.keys(data1.signals).map(key => {
              const sig1 = data1.signals[key];
              const sig2 = data2.signals[key];
              
              if (!sig1 || !sig2) return null;

              const p1Wins = sig1.score > sig2.score;
              const p2Wins = sig2.score > sig1.score;

              return (
                <div key={key} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-stone-100">
                  <div className="text-center mb-6">
                    <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest">{key} ({sig1.max} pts)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8 md:gap-16">
                    {/* P1 Side */}
                    <div className={`p-4 rounded-xl border-2 transition-all ${p1Wins ? 'border-primary bg-primary-fixed/20' : 'border-transparent'}`}>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-label text-on-surface-variant capitalize">{platform1}</span>
                        <span className="text-2xl font-headline font-bold">{sig1.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-primary" style={{ width: `${(sig1.score / sig1.max) * 100}%` }}></div>
                      </div>
                      <p className="text-xs text-on-surface-variant font-body">{sig1.summary}</p>
                    </div>

                    {/* P2 Side */}
                    <div className={`p-4 rounded-xl border-2 transition-all ${p2Wins ? 'border-primary bg-primary-fixed/20' : 'border-transparent'}`}>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-label text-on-surface-variant capitalize">{platform2}</span>
                        <span className="text-2xl font-headline font-bold">{sig2.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-primary" style={{ width: `${(sig2.score / sig2.max) * 100}%` }}></div>
                      </div>
                      <p className="text-xs text-on-surface-variant font-body">{sig2.summary}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="mt-12 p-8 bg-zinc-900 text-white rounded-2xl text-center shadow-xl">
            <h4 className="text-2xl font-headline font-bold">{summary}</h4>
          </div>
        </div>
      )}
    </main>
  );
};
