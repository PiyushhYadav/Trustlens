import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScoreCardView } from './components/ScoreCardView';
import { CompareView } from './components/CompareView';
import { MethodologyView } from './components/MethodologyView';
import { InstallExtensionView } from './components/InstallExtensionView';
import './index.css';

const GOOGLE_CLIENT_ID = "11727542694-i30l5qdvm55qft3ogeqfmbbumgqtthbu.apps.googleusercontent.com";

const AppContent = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Routes>
        <Route path="/" element={
          <main className="pt-32 pb-16">
            <Hero />
          </main>
        } />
        <Route path="/score/:platform" element={<ScoreCardView />} />
        <Route path="/compare" element={<CompareView />} />
        <Route path="/methodology" element={<MethodologyView />} />
        <Route path="/install-extension" element={<InstallExtensionView />} />
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
