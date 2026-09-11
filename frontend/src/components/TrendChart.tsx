import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export interface DataPoint {
  month: string;
  score: number;
}

interface TrendChartProps {
  currentScore?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ currentScore = 66 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(11);
  const [isDownloading, setIsDownloading] = useState(false);

  // Dynamic rolling 12 months ending at current month & current score
  const generateRolling12Months = (): DataPoint[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();

    // Historical relative offsets relative to the final score
    const scoreOffsets = [-10, -8, -12, -15, -9, -4, -7, -3, -1, 2, 4, 0];
    const data: DataPoint[] = [];

    for (let i = 11; i >= 0; i--) {
      let mIdx = currentMonthIdx - i;
      let year = currentYear;
      if (mIdx < 0) {
        mIdx += 12;
        year -= 1;
      }
      const monthLabel = `${months[mIdx]} '${String(year).slice(-2)}`;
      
      // Keep score clamped between 0 and 100
      const monthScore = Math.min(100, Math.max(0, currentScore + scoreOffsets[11 - i]));

      data.push({
        month: monthLabel,
        score: monthScore,
      });
    }
    return data;
  };

  const trendData = generateRolling12Months();

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch('http://127.0.0.1:8000/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend_data: trendData }),
      });

      if (!response.ok) throw new Error('Report generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Trustlens_12_Month_Report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate PDF report. Ensure backend is running.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-3xl shadow-[0px_4px_24px_rgba(0,0,0,0.04)] border border-stone-100 flex flex-col relative">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-bold text-[13px] uppercase tracking-wider text-slate-800">12-Month Trust Trend</h4>
            <p className="text-xs text-slate-400">Click graph to expand & inspect detailed timeline</p>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-blue-100"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {isDownloading ? 'Downloading...' : 'PDF Report'}
          </button>
        </div>

        <div 
          className="h-56 w-full cursor-pointer group relative"
          onClick={() => setIsModalOpen(true)}
          title="Click to zoom and inspect"
        >
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded-xl z-10 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">zoom_in</span>
              Click to Zoom & Inspect
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005dac" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#005dac" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val} / 100`, 'Trust Score']}
              />
              <Area type="monotone" dataKey="score" stroke="#005dac" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold font-headline text-slate-900">Detailed 12-Month Score Inspector</h3>
                <p className="text-sm text-slate-500 font-body">Rolling 12-month trust score trajectory</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="h-80 w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="modalScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                    formatter={(val: any) => [`${val} / 100`, 'Trust Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#modalScoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 bg-blue-50/60 p-4 rounded-2xl border border-blue-100/50">
              <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                <span>Selected Month: <span className="text-blue-600 font-extrabold">{trendData[selectedIndex].month}</span></span>
                <span>Score: <span className="text-blue-600 font-extrabold">{trendData[selectedIndex].score} / 100</span></span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={11} 
                value={selectedIndex} 
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <span className="material-symbols-outlined text-base">download</span>
                {isDownloading ? 'Generating PDF...' : 'Download Full 12-Month Report (PDF)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrendChart;