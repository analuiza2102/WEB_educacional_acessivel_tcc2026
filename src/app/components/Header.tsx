import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Contrast, Menu, X } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export function Header() {
  const { highContrast, toggleHighContrast } = useAccessibility();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/vestibulares', label: 'Vestibulares' },
    { path: '/cursos', label: 'Cursos Gratuitos' },
    { path: '/banco-provas', label: 'Banco de Provas' },
    { path: '/sobre', label: 'Sobre' },
    { path: '/acessibilidade', label: 'Acessibilidade' },
  ];

  return (
    <header className="app-header sticky top-0 z-50 border-b-2 border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link
            to="/"
            className="brand-link flex items-center gap-2 rounded-lg px-2 py-1 focus:outline-none focus:ring-4 focus:ring-blue-500"
          >
            <div className="brand-mark rounded-lg bg-blue-600 px-3 py-2 text-white">
              <span className="text-xl font-bold">EA</span>
            </div>
            <span className="brand-text text-xl font-bold text-gray-900">EDUCA ACESSO</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Navegacao principal">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`site-nav-link rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 ${
                  isActive(link.path)
                    ? 'bg-blue-600 font-medium text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleHighContrast}
              className="contrast-toggle flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500"
              aria-label={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
              aria-pressed={highContrast}
            >
              <Contrast className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Alto Contraste</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-toggle rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500 md:hidden"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav border-t border-gray-200 py-4 md:hidden" aria-label="Navegacao mobile">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`site-nav-link block rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 ${
                  isActive(link.path)
                    ? 'bg-blue-600 font-medium text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
