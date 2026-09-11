import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScoreCardView } from './components/ScoreCardView';
import { CompareView } from './components/CompareView';
import { MethodologyView } from './components/MethodologyView';
import { ExtensionMockupView } from './components/ExtensionMockupView';
import './index.css';

const GOOGLE_CLIENT_ID = "11727542694-i30l5qdvm55qft3ogeqfmbbumgqtthbu.apps.googleusercontent.com";

const AppContent = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/extension-mockup';

  return (
    <div className="min-h-screen bg-surface">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={
          <main className="pt-32 pb-16">
            <Hero />
          </main>
        } />
        <Route path="/score/:platform" element={<ScoreCardView />} />
        <Route path="/compare" element={<CompareView />} />
        <Route path="/methodology" element={<MethodologyView />} />
        <Route path="/extension-mockup" element={<ExtensionMockupView />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
