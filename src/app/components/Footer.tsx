import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-4">EDUCA ACESSO</h2>
            <p className="text-sm mb-4">
              Facilitando o acesso à educação gratuita e de qualidade para todos os brasileiros.
            </p>
            <p className="text-sm">
              Nosso compromisso é com a inclusão digital e educacional.
            </p>
          </div>

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

          <div>
            <h2 className="text-white font-bold text-lg mb-4">Projeto Acadêmico</h2>
            <p className="text-sm leading-relaxed">
              Este site foi desenvolvido exclusivamente para fins acadêmicos, como parte de um Trabalho de Conclusão de Curso.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} EDUCA ACESSO - Todos os direitos reservados
          </p>
          <p className="mt-2 text-xs">
            Projeto acadêmico para fins de TCC, desenvolvido seguindo diretrizes de acessibilidade.
          </p>
        </div>
      </div>
    </footer>
  );
}
