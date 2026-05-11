import { Heart, Target, Users, Shield } from 'lucide-react';

export function Sobre() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Sobre o EDUCA ACESSO</h1>
          <p className="text-lg text-blue-100">
            Democratizando o acesso à educação de qualidade no Brasil
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8" aria-labelledby="missao-title">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-8 h-8 text-blue-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 id="missao-title" className="text-2xl font-bold text-gray-900 mb-4">
                Nossa Missão
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                O EDUCA ACESSO foi criado para facilitar o acesso de brasileiros de todas as regiões às oportunidades educacionais gratuitas. Acreditamos que a educação é um direito fundamental e deve ser acessível a todos, independentemente de condições socioeconômicas ou limitações físicas.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8" aria-labelledby="fazemos-title">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Heart className="w-8 h-8 text-green-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 id="fazemos-title" className="text-2xl font-bold text-gray-900 mb-4">
                O Que Fazemos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Centralizamos informações sobre vestibulares públicos e cursos gratuitos, tornando mais fácil encontrar e acessar oportunidades educacionais.
                </p>
                <p>
                  Nosso diferencial é a <strong>acessibilidade</strong>. Seguimos as diretrizes internacionais WCAG 2.1 para garantir que o sistema possa ser usado por pessoas com diferentes necessidades, incluindo:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Deficiência visual, com compatibilidade com leitores de tela</li>
                  <li>Deficiência motora, com navegação completa por teclado</li>
                  <li>Baixa visão, com modo de alto contraste</li>
                  <li>Deficiência cognitiva, com design simples e claro</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8" aria-labelledby="publico-title">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 id="publico-title" className="text-2xl font-bold text-gray-900 mb-4">
                Para Quem é o EDUCA ACESSO
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  O sistema foi desenvolvido pensando especialmente em:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Estudantes de Baixa Renda</h3>
                    <p className="text-sm">
                      Facilita o acesso a informações sobre isenções de taxa e programas de apoio.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Pessoas com Deficiência</h3>
                    <p className="text-sm">
                      Interface acessível seguindo padrões internacionais.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Idosos</h3>
                    <p className="text-sm">
                      Design simples e intuitivo, com textos claros e botões grandes.
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Primeiros Acessos</h3>
                    <p className="text-sm">
                      Guias passo a passo para quem nunca se inscreveu em vestibulares.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-8" aria-labelledby="principios-title">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-orange-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 id="principios-title" className="text-2xl font-bold text-gray-900 mb-4">
                Nossos Princípios
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Inclusão Digital</h3>
                  <p className="text-gray-700">
                    A plataforma foi pensada para ser usada por todos, com atenção à acessibilidade.
                  </p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Informação Clara</h3>
                  <p className="text-gray-700">
                    As informações são apresentadas de forma simples, direta e organizada.
                  </p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Segurança</h3>
                  <p className="text-gray-700">
                    O projeto prioriza links e referências oficiais para consulta dos usuários.
                  </p>
                </div>
                <div className="border-l-4 border-orange-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Gratuidade</h3>
                  <p className="text-gray-700">
                    O conteúdo tem caráter informativo e gratuito.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Projeto Acadêmico</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Este site foi desenvolvido exclusivamente para fins acadêmicos, como parte de um Trabalho de Conclusão de Curso. As informações exibidas têm finalidade demonstrativa e educacional para apresentação do TCC.
          </p>
        </div>
      </div>
    </div>
  );
}
