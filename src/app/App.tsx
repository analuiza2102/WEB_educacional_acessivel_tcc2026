import { BrowserRouter, Routes, Route } from 'react-router';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Vestibulares } from './pages/Vestibulares';
import { VestibularDetail } from './pages/VestibularDetail';
import { Cursos } from './pages/Cursos';
import { BancoProvas } from './pages/BancoProvas';
import { Sobre } from './pages/Sobre';
import { Acessibilidade } from './pages/Acessibilidade';

export default function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <div className="min-h-screen flex flex-col">
          {/* Skip to main content link for keyboard navigation */}
          <a 
            href="#main-content" 
            className="skip-to-main"
          >
            Pular para o conteúdo principal
          </a>
          
          <Header />
          
          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vestibulares" element={<Vestibulares />} />
              <Route path="/vestibulares/:id" element={<VestibularDetail />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/banco-provas" element={<BancoProvas />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/acessibilidade" element={<Acessibilidade />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AccessibilityProvider>
    </BrowserRouter>
  );
}
