import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScoreCardView } from './components/ScoreCardView';
import { CompareView } from './components/CompareView';
import { MethodologyView } from './components/MethodologyView';
import { ExtensionMockupView } from './components/ExtensionMockupView';
import './index.css';

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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
