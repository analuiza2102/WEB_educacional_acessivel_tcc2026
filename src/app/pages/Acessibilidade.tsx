import { Eye, Keyboard, Volume2, Palette, Type, Smartphone } from 'lucide-react';

export function Acessibilidade() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Política de Acessibilidade</h1>
          <p className="text-lg text-purple-100">
            Nosso compromisso com a inclusão digital e acessibilidade web
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Compromisso com a Acessibilidade
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            O EDUCA ACESSO está comprometido em garantir que nosso sistema seja acessível a todas as pessoas, incluindo aquelas com deficiências. Seguimos as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1 nível AA.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Trabalhamos continuamente para melhorar a acessibilidade do nosso site e garantir que ele atenda aos mais altos padrões de usabilidade para todos os usuários.
          </p>
        </section>

        {/* Features */}
        <section aria-labelledby="recursos-title" className="mb-8">
          <h2 id="recursos-title" className="text-2xl font-bold text-gray-900 mb-6">
            Recursos de Acessibilidade
          </h2>
          
          <div className="space-y-6">
            {/* Leitores de Tela */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                  <Volume2 className="w-6 h-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Compatibilidade com Leitores de Tela
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Nosso site é totalmente compatível com leitores de tela populares como NVDA, JAWS e VoiceOver.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Todos os elementos possuem textos alternativos apropriados</li>
                    <li>Estrutura semântica HTML5 correta</li>
                    <li>ARIA labels onde necessário</li>
                    <li>Feedback sonoro de ações importantes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Navegação por Teclado */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                  <Keyboard className="w-6 h-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Navegação Completa por Teclado
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Todas as funcionalidades do site podem ser acessadas usando apenas o teclado.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li><kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Tab</kbd> - Navegar entre elementos interativos</li>
                    <li><kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Shift + Tab</kbd> - Navegar para trás</li>
                    <li><kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Enter</kbd> ou <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Espaço</kbd> - Ativar botões e links</li>
                    <li><kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Esc</kbd> - Fechar menus e modais</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Alto Contraste */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                  <Palette className="w-6 h-6 text-purple-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Modo Alto Contraste
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Oferecemos um modo de alto contraste para usuários com baixa visão ou sensibilidade a cores.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Ative clicando no botão "Alto Contraste" no cabeçalho</li>
                    <li>Cores otimizadas para máxima legibilidade</li>
                    <li>Contraste mínimo de 7:1 em textos importantes</li>
                    <li>Sua preferência é salva automaticamente</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tipografia */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                  <Type className="w-6 h-6 text-orange-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Tipografia Acessível
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Usamos fontes claras e tamanhos adequados para facilitar a leitura.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Fonte sem serifa de alta legibilidade</li>
                    <li>Tamanho mínimo de 16px para textos principais</li>
                    <li>Espaçamento adequado entre linhas e parágrafos</li>
                    <li>Textos escaláveis até 200% sem perda de funcionalidade</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Design Responsivo */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-pink-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Design Responsivo e Mobile-First
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Nosso site funciona perfeitamente em todos os dispositivos e tamanhos de tela.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Interface adaptável a smartphones, tablets e desktops</li>
                    <li>Botões e áreas clicáveis de tamanho adequado para toque</li>
                    <li>Conteúdo reorganizado inteligentemente em telas pequenas</li>
                    <li>Imagens e elementos responsivos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Baixa Carga Cognitiva */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-lg flex-shrink-0">
                  <Eye className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Design com Baixa Carga Cognitiva
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Projetamos nossa interface para ser simples e fácil de entender.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Layout limpo e organizado</li>
                    <li>Informações apresentadas de forma clara e direta</li>
                    <li>Hierarquia visual bem definida</li>
                    <li>Evitamos sobrecarga de informações em cada página</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Standards */}
        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8" aria-labelledby="padroes-title">
          <h2 id="padroes-title" className="text-2xl font-bold text-gray-900 mb-4">
            Padrões e Conformidade
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Nosso site foi desenvolvido seguindo os seguintes padrões:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>WCAG 2.1 Nível AA</strong> - Diretrizes de Acessibilidade para Conteúdo Web</li>
              <li><strong>HTML5 Semântico</strong> - Estrutura adequada para leitores de tela</li>
              <li><strong>ARIA</strong> - Atributos de acessibilidade quando necessário</li>
              <li><strong>Design Responsivo</strong> - Compatível com todos os dispositivos</li>
            </ul>
          </div>
        </section>

        {/* Feedback */}
        <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Ajude-nos a Melhorar
          </h2>
          <p className="text-purple-100 mb-6">
            Encontrou alguma barreira de acessibilidade em nosso site? Sua opinião é muito importante para nós.
          </p>
          <div className="space-y-3">
            <p>
              <strong>Entre em contato:</strong>
            </p>
            <p>
              Email: <a href="mailto:acessibilidade@educaacesso.gov.br" className="text-white hover:text-purple-100 underline focus:outline-none focus:ring-2 focus:ring-white rounded px-1">
                acessibilidade@educaacesso.gov.br
              </a>
            </p>
            <p>
              Telefone: <a href="tel:0800123456" className="text-white hover:text-purple-100 underline focus:outline-none focus:ring-2 focus:ring-white rounded px-1">
                0800 123 456
              </a>
            </p>
            <p className="text-sm text-purple-100 mt-4">
              Atendimento em Libras disponível de segunda a sexta, das 8h às 18h
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
