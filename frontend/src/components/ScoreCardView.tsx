import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScoreCard } from './ScoreCard';
import type { ScoreData } from './ScoreCard';

export const ScoreCardView: React.FC = () => {
  const { platform } = useParams<{ platform: string }>();
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!platform) return;

    setLoading(true);
    setError('');
    setPending(false);

    fetch(`http://localhost:8000/score?platform=${encodeURIComponent(platform)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch data');
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
        console.error(err);
        setError('Failed to load trust score. Make sure the backend is running.');
        setLoading(false);
      });
  }, [platform]);

  if (loading) {
    return (
      <main className="pt-32 pb-32 max-w-screen-2xl mx-auto px-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-medium">Analyzing Veracity Signals...</p>
        </div>
      </main>
    );
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
