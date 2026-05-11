import { Link } from 'react-router';
import { Mail, Phone, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-white font-bold text-lg mb-4">EDUCA ACESSO</h2>
            <p className="text-sm mb-4">
              Facilitando o acesso à educação gratuita e de qualidade para todos os brasileiros.
            </p>
            <p className="text-sm">
              Nosso compromisso é com a inclusão digital e educacional.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-white font-bold text-lg mb-4">Links Rápidos</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/vestibulares" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  Vestibulares
                </Link>
              </li>
              <li>
                <Link to="/cursos" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  Cursos Gratuitos
                </Link>
              </li>
              <li>
                <Link to="/acessibilidade" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  Política de Acessibilidade
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-white font-bold text-lg mb-4">Contato</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <a href="mailto:contato@educaacesso.gov.br" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  contato@educaacesso.gov.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <a href="tel:0800123456" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  0800 123 456
                </a>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-4 h-4 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="mb-1">Atendimento acessível:</p>
                  <p className="text-xs">
                    Segunda a sexta, 8h às 18h<br />
                    Suporte em Libras disponível
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} EDUCA ACESSO - Todos os direitos reservados
          </p>
          <p className="mt-2 text-xs">
            Este é um sistema educacional acessível desenvolvido seguindo as diretrizes WCAG 2.1
          </p>
        </div>
      </div>
    </footer>
  );
}
