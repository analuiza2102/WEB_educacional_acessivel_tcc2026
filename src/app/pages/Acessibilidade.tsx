import { Eye, Keyboard, Palette, Smartphone, Type, Volume2 } from 'lucide-react';

export function Acessibilidade() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Política de Acessibilidade</h1>
          <p className="text-lg text-purple-100">
            Recursos de acessibilidade desenvolvidos para fins acadêmicos e demonstração no TCC.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Compromisso com a Acessibilidade
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            O EDUCA ACESSO foi desenvolvido como protótipo acadêmico com foco em inclusão digital, navegação clara e recursos de acessibilidade para diferentes perfis de usuários.
          </p>
          <p className="text-gray-700 leading-relaxed">
            O projeto utiliza como referência boas práticas de acessibilidade web, incluindo estrutura semântica, navegação por teclado, contraste visual e organização simples das informações.
          </p>
        </section>

        <section aria-labelledby="recursos-title" className="mb-8">
          <h2 id="recursos-title" className="text-2xl font-bold text-gray-900 mb-6">
            Recursos de Acessibilidade
          </h2>

          <div className="space-y-6">
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
                    A interface foi organizada com estrutura semântica e textos claros para favorecer o uso por tecnologias assistivas.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Uso de elementos HTML semânticos</li>
                    <li>Rótulos acessíveis em elementos interativos</li>
                    <li>Conteúdo organizado por títulos e seções</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                  <Keyboard className="w-6 h-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Navegação por Teclado
                  </h3>
                  <p className="text-gray-700 mb-3">
                    As principais áreas do site podem ser acessadas por teclado, com foco visível nos links e botões.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Link para pular diretamente ao conteúdo principal</li>
                    <li>Ordem de navegação previsível</li>
                    <li>Estados de foco visíveis</li>
                  </ul>
                </div>
              </div>
            </div>

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
                    O site possui opção de alto contraste para melhorar a leitura e a percepção dos elementos na tela.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Cores com maior contraste</li>
                    <li>Preferência salva no navegador</li>
                    <li>Melhor visibilidade para textos e botões</li>
                  </ul>
                </div>
              </div>
            </div>

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
                    Os textos foram pensados para facilitar a leitura, com tamanhos adequados e bom espaçamento.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Fonte sem serifa</li>
                    <li>Hierarquia visual clara</li>
                    <li>Espaçamento adequado entre linhas e seções</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-pink-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Design Responsivo
                  </h3>
                  <p className="text-gray-700 mb-3">
                    A interface se adapta a diferentes tamanhos de tela, incluindo celular, tablet e desktop.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Layout adaptável</li>
                    <li>Botões com área de clique adequada</li>
                    <li>Conteúdo reorganizado em telas pequenas</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-lg flex-shrink-0">
                  <Eye className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Baixa Carga Cognitiva
                  </h3>
                  <p className="text-gray-700 mb-3">
                    As informações são apresentadas com linguagem direta e organização visual simples.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Layout limpo</li>
                    <li>Textos objetivos</li>
                    <li>Separação clara entre conteúdos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8" aria-labelledby="padroes-title">
          <h2 id="padroes-title" className="text-2xl font-bold text-gray-900 mb-4">
            Padrões Utilizados
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              O projeto foi construído considerando os seguintes pontos:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>WCAG 2.1</strong> como referência de acessibilidade</li>
              <li><strong>HTML semântico</strong> para apoiar tecnologias assistivas</li>
              <li><strong>Design responsivo</strong> para diferentes dispositivos</li>
              <li><strong>Clareza textual</strong> para reduzir dificuldades de compreensão</li>
            </ul>
          </div>
        </section>

        <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Projeto Acadêmico
          </h2>
          <p className="text-purple-100 mb-4">
            Este site foi desenvolvido exclusivamente para fins acadêmicos, como parte de um Trabalho de Conclusão de Curso.
          </p>
          <p className="text-purple-100">
            As informações exibidas têm finalidade demonstrativa e educacional para apresentação do TCC.
          </p>
        </section>
      </div>
    </div>
  );
}
