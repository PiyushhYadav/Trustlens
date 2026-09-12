import React from 'react';

export const InstallExtensionView: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-900 font-body py-24 px-4 sm:px-8">
      <div className="max-w-3xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">
            Install TrustLens Extension
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Get the TrustLens extension for your browser and start seeing privacy scores as you browse.
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-8 md:p-12 shadow-2xl border border-stone-200/20">
          <div className="flex flex-col items-center text-center space-y-6 mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary">download</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Step 1: Download the Extension</h2>
              <p className="text-zinc-600 mb-6">Download the extension package to your computer.</p>
              <a 
                href="/trustlens-extension.zip" 
                download="trustlens-extension.zip"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-xl font-medium hover:bg-primary-container transition-all active:scale-95 shadow-sm text-lg"
              >
                Download .zip File
                <span className="material-symbols-outlined">download</span>
              </a>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 text-center">Step 2: Install in Chrome</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-1">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Extract the downloaded file</h3>
                  <p className="text-zinc-600">Locate <code className="bg-stone-100 px-2 py-1 rounded text-sm text-rose-600">trustlens-extension.zip</code> in your Downloads folder and extract/unzip it to a folder.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-1">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Open Chrome Extensions</h3>
                  <p className="text-zinc-600">Open Chrome and navigate to <code className="bg-stone-100 px-2 py-1 rounded text-sm font-medium">chrome://extensions</code> in your address bar.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-1">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Enable Developer Mode</h3>
                  <p className="text-zinc-600">Toggle the <strong>Developer mode</strong> switch in the top right corner of the page.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 mt-1">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Load the Extension</h3>
                  <p className="text-zinc-600">Click the <strong>Load unpacked</strong> button that appears in the top left, and select the folder you extracted in Step 1.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-1">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">You're all set!</h3>
                  <p className="text-zinc-600">TrustLens is now installed. Pin it to your browser toolbar for quick access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
