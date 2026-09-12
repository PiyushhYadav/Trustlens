import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';

export interface HeaderProps {}

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Extension detection
    if (document.getElementById('trustlens-extension-installed')) {
      setExtensionInstalled(true);
    }
    
    const handleInstalled = () => setExtensionInstalled(true);
    window.addEventListener('trustlens-installed', handleInstalled);
    
    const observer = new MutationObserver(() => {
      if (document.getElementById('trustlens-extension-installed')) {
        setExtensionInstalled(true);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('trustlens-installed', handleInstalled);
      observer.disconnect();
    };
  }, []);
  
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();
        
        setUser({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        });
        setProfileOpen(false);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    },
    onError: (error) => console.error('Google Sign-In Failed:', error),
  });

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    setProfileOpen(false);
  };

  const isCompare = location.pathname.startsWith('/compare');
  const isMethodology = location.pathname.startsWith('/methodology');
  const isIntelligence = !isCompare && !isMethodology;

  const [reportReady, setReportReady] = useState(false);

  React.useEffect(() => {
    const handleReportReady = (e: any) => {
      setReportReady(e.detail);
    };
    window.addEventListener('reportReady', handleReportReady);
    return () => window.removeEventListener('reportReady', handleReportReady);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100">
      <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 md:py-5 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-12">
          <Link className="flex items-center gap-3 text-2xl font-serif font-bold text-zinc-900 tracking-tight" to="/">
            <img src="/favicon.svg" alt="TrustLens" className="w-8 h-8 drop-shadow-sm" />
            TrustLens
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link className={`${isIntelligence ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/">Intelligence</Link>
            <Link className={`${isCompare ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/compare">Comparison</Link>
            <Link className={`${isMethodology ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'text-zinc-500 hover:text-zinc-900'} transition-colors pb-1`} to="/methodology">Methodology</Link>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {reportReady && (
            user ? (
              <button 
                onClick={() => {
                  const match = location.pathname.match(/^\/score\/(.+)$/);
                  const match2 = location.pathname.match(/^\/compare$/);
                  const platform = match ? match[1] : null;
                  if (platform) {
                    const apiBase = import.meta.env.VITE_API_URL || 'https://trustlens-qtex.onrender.com';
                    window.open(`${apiBase}/report/${platform}`, '_blank');
                  } else if(match2) {
                    window.dispatchEvent(new CustomEvent('triggerCompareDownload'));
                  } else {
                    window.print();
                  }
                }}
                className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium hover:bg-primary-container transition-all active:scale-95 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" } />
                </svg>
                Download Report
              </button>
            ) : (
              <button 
                onClick={() => login()}
                className="hidden md:flex items-center gap-2 bg-white text-primary border-2 border-primary/20 px-5 py-2.5 rounded-xl font-bold hover:bg-stone-50 hover:border-primary/40 transition-all active:scale-95 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Sign in to Download
              </button>
            )
          )}
          {extensionInstalled ? (
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-xl font-medium border border-emerald-200 cursor-default">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Extension Installed
            </div>
          ) : (
            <Link to="/install-extension" className="hidden md:inline-block bg-primary text-on-primary px-6 py-2.5 rounded-xl font-medium hover:bg-primary-container transition-all active:scale-95">
              Get Extension
            </Link>
          )}
          <div className="relative hidden md:block" ref={profileRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className={`w-10 h-10 rounded-full overflow-hidden transition-all duration-200 border shadow-sm ml-2 ${
                profileOpen ? 'scale-110 ring-2 ring-primary border-transparent' : 'border-stone-200 hover:ring-2 hover:ring-primary/20'
              }`}
            >
              <img src={user?.picture || "/profile.png"} alt="Profile" className="w-full h-full object-cover" />
            </button>
            
            {profileOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-stone-100 rounded-xl shadow-xl py-2 flex flex-col font-body z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-stone-100 mb-1">
                      <p className="font-semibold text-zinc-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <button className="text-left px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 hover:text-primary transition-colors">Settings</button>
                    <Link to="/methodology" onClick={() => setProfileOpen(false)} className="text-left px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 hover:text-primary transition-colors">About TrustLens</Link>
                    <button 
                      onClick={handleLogout}
                      className="text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium transition-colors border-t border-stone-100 mt-1 pt-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button className="text-left px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 hover:text-primary transition-colors">Settings</button>
                    <Link to="/methodology" onClick={() => setProfileOpen(false)} className="text-left px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 hover:text-primary transition-colors">About TrustLens</Link>
                    <button 
                      onClick={() => login()}
                      className="text-left px-4 py-2 text-sm text-primary font-medium hover:bg-stone-50 transition-colors border-t border-stone-100 mt-1 pt-2 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign In
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <button 
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
          <Link onClick={() => setMenuOpen(false)} className={`block ${isIntelligence ? 'text-blue-700 font-bold' : 'text-zinc-500'}`} to="/">Intelligence</Link>
          <Link onClick={() => setMenuOpen(false)} className={`block ${isCompare ? 'text-blue-700 font-bold' : 'text-zinc-500'}`} to="/compare">Comparison</Link>
          <Link onClick={() => setMenuOpen(false)} className={`block ${isMethodology ? 'text-blue-700 font-bold' : 'text-zinc-500'}`} to="/methodology">Methodology</Link>
          <hr className="border-stone-100" />
          {extensionInstalled ? (
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Extension Installed
            </div>
          ) : (
            <Link onClick={() => setMenuOpen(false)} to="/install-extension" className="block text-primary font-medium">Download Extension</Link>
          )}
          {user ? (
            <button 
              onClick={() => { setMenuOpen(false); handleLogout(); }} 
              className="block text-rose-600 font-medium w-full text-left"
            >
              Sign Out ({user.name})
            </button>
          ) : (
            <button 
              onClick={() => { setMenuOpen(false); login(); }} 
              className="block text-primary font-medium w-full text-left"
            >
              Sign In with Google
            </button>
          )}
        </div>
      )}
    </header>
  );
};
