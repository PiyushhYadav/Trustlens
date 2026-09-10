import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScoreCard } from './ScoreCard';
import type { ScoreData } from './ScoreCard';

const LoadingAnimation = ({ platform }: { platform: string }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Scanning Exodus Trackers",
    "Analyzing Play Store Reviews",
    "Checking HIBP Breaches",
    "Querying Mozilla Observatory",
    "Gemini AI Synthesizing..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="pt-32 pb-32 max-w-screen-2xl mx-auto px-8 flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface-container-lowest p-10 rounded-2xl border border-stone-100 shadow-sm w-full max-w-md">
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-8 text-center capitalize">
          Auditing {platform}...
        </h2>
        <div className="space-y-5">
          {steps.map((label, index) => {
            const isCompleted = step > index;
            const isActive = step === index;
            const isPending = step < index;

            return (
              <div key={label} className={`flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors duration-300 ${
                  isCompleted ? 'bg-primary border-primary text-white' : 
                  isActive ? 'border-primary border-t-transparent animate-spin' : 
                  'border-outline-variant text-transparent'
                }`}>
                  {isCompleted && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export const ScoreCardView: React.FC = () => {
  const { platform } = useParams<{ platform: string }>();
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!platform) return;

    // Use AbortController for fetch
    const controller = new AbortController();
    
    setLoading(true);
    setError('');
    setPending(false);
    const apiBase = import.meta.env.VITE_API_URL || 'https://trustlens-qtex.onrender.com';
    
    fetch(`${apiBase}/score?platform=${encodeURIComponent(platform)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.detail || 'Failed to fetch data');
        }
        return res.json();
      })
      .then((json) => {
        if (json.status === "pending") {
          setPending(true);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError(err.message === 'Failed to fetch data' 
          ? 'Failed to load trust score. Make sure the backend is running.' 
          : err.message);
        setLoading(false);
      });

      return () => controller.abort();
  }, [platform]);

  useEffect(() => {
    // Notify header when report is ready for download
    window.dispatchEvent(new CustomEvent('reportReady', { detail: !loading && !error && data }));
    return () => { window.dispatchEvent(new CustomEvent('reportReady', { detail: false })); };
  }, [loading, error, data]);

  if (loading) {
    return <LoadingAnimation platform={platform || 'app'} />;
  }

  if (error) {
    return (
      <main className="pt-32 pb-32 max-w-screen-2xl mx-auto px-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-200 shadow-sm max-w-lg text-center">
          <span className="material-symbols-outlined text-4xl mb-4">error</span>
          <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (pending || !data) {
    return (
      <main className="pt-32 pb-32 max-w-screen-2xl mx-auto px-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface-container-lowest p-12 rounded-2xl shadow-xl max-w-xl text-center border border-stone-100">
          <span className="material-symbols-outlined text-6xl text-primary mb-6">hourglass_empty</span>
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">Live Analysis Pending</h2>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-4">
            The platform <strong className="text-on-surface capitalize">{platform}</strong> is not in our immediate cache. Our AI modules are currently indexing its privacy policies and user complaints. 
          </p>
        </div>
      </main>
    );
  }

  return <ScoreCard platform={platform!} data={data} />;
};
