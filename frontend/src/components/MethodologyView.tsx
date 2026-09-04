import React from 'react';

export const MethodologyView: React.FC = () => {
  const signals = [
    {
      name: "Breach History",
      weight: "30",
      description: "Historical data exposure incidents, leaks, and how the platform handled disclosure and mitigation. Evaluated against global breach databases."
    },
    {
      name: "Privacy Policy",
      weight: "20",
      description: "AI-driven semantic analysis of the platform's terms of service, focusing on data retention limits, third-party sharing clauses, and consent mechanics."
    },
    {
      name: "DPDP Compliance",
      weight: "20",
      description: "Rigorous checklist evaluating adherence to the Digital Personal Data Protection Act, including data minimization, purpose limitation, and user erasure rights."
    },
    {
      name: "User Complaints",
      weight: "15",
      description: "Volume and severity of privacy-related grievances reported by users, encompassing spam, telemarketing, and unauthorized data usage."
    },
    {
      name: "Trackers & Ad Networks",
      weight: "15",
      description: "Technical footprint analysis to detect embedded third-party trackers, analytics pixels, and data brokers operating within the application."
    }
  ];

  return (
    <main className="pt-32 pb-32 max-w-screen-xl mx-auto px-8">
      <div className="max-w-3xl mb-16">
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-on-surface mb-6 leading-[1.1]">
          The Anatomy of Trust
        </h1>
        <p className="text-xl md:text-2xl text-on-surface-variant font-body leading-relaxed">
          TrustLens isn't based on vibes or marketing copy. We calculate a mathematically rigorous, composite score based on five verifiable veracity signals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
        <div className="md:col-span-8 space-y-8">
          <h2 className="text-sm font-sans uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-8">Signal Weighting</h2>
          
          <div className="space-y-6">
            {signals.map((signal) => (
              <div key={signal.name} className="flex gap-6 p-8 bg-surface-container-lowest rounded-2xl border border-stone-100 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-primary-fixed/30 flex items-center justify-center border-2 border-primary">
                  <span className="text-2xl font-headline font-bold text-primary-fixed-variant">{signal.weight}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{signal.name}</h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-lg">{signal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 space-y-8 relative">
          <div className="sticky top-32 p-10 bg-surface-variant rounded-2xl border border-outline-variant/30 text-on-surface shadow-xl">
            <h3 className="text-2xl font-headline font-bold mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">security</span>
              Tamper-Proof
            </h3>
            <div className="space-y-6 font-body text-lg leading-relaxed text-on-surface-variant">
              <p>
                <strong>Can platforms game the score?</strong>
              </p>
              <p>
                No. A common flaw in legacy privacy audits is their over-reliance on self-reported policies. 
              </p>
              <p className="text-on-surface font-semibold bg-primary-fixed/20 p-4 rounded-xl border border-primary/20">
                Policy analysis makes up only 20% of the TrustLens grade. The remaining 80% is derived from independent, third-party data — breach databases, active tracker detections, and user complaints — which the platforms themselves cannot control or manipulate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
