import { Link } from 'react-router';
import { BookOpen, CheckCircle, ExternalLink, GraduationCap, Search } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen">
      <section
        className="hero-section bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-white sm:py-24"
        aria-labelledby="hero-title"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 id="hero-title" className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl">
              Encontre oportunidades educacionais gratuitas de forma simples e acessivel
            </h1>
            <p className="hero-lead mb-10 text-lg text-blue-100 sm:text-xl">
              Centralizamos informacoes sobre vestibulares publicos e cursos gratuitos para facilitar
              seu acesso a educacao de qualidade.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/vestibulares"
                className="hero-primary-cta inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-medium text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
                Quero fazer Vestibular
              </Link>
              <Link
                to="/cursos"
                className="hero-secondary-cta inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                <BookOpen className="h-6 w-6" aria-hidden="true" />
                Quero fazer Curso Gratuito
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-section bg-gray-50 py-16" aria-labelledby="como-funciona-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="como-funciona-title" className="section-title mb-12 text-center text-3xl font-bold text-gray-900">
            Como Funciona
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div
                className="step-number mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
                aria-hidden="true"
              >
                1
              </div>
              <div className="info-card rounded-lg bg-white p-6 shadow-sm">
                <Search className="step-icon mx-auto mb-4 h-12 w-12 text-blue-600" aria-hidden="true" />
                <h3 className="card-title mb-2 text-xl font-bold text-gray-900">Escolha</h3>
                <p className="card-body text-gray-600">
                  Navegue por vestibulares publicos ou cursos gratuitos usando nossos filtros acessiveis.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div
                className="step-number mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
                aria-hidden="true"
              >
                2
              </div>
              <div className="info-card rounded-lg bg-white p-6 shadow-sm">
                <BookOpen className="step-icon mx-auto mb-4 h-12 w-12 text-blue-600" aria-hidden="true" />
                <h3 className="card-title mb-2 text-xl font-bold text-gray-900">Entenda os Requisitos</h3>
                <p className="card-body text-gray-600">
                  Veja um guia passo a passo claro sobre documentos, datas e como solicitar isencao.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div
                className="step-number mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
                aria-hidden="true"
              >
                3
              </div>
              <div className="info-card rounded-lg bg-white p-6 shadow-sm">
                <ExternalLink className="step-icon mx-auto mb-4 h-12 w-12 text-blue-600" aria-hidden="true" />
                <h3 className="card-title mb-2 text-xl font-bold text-gray-900">Acesse o Link Oficial</h3>
                <p className="card-body text-gray-600">
                  Clique no botao para ir direto ao site oficial e realizar sua inscricao com seguranca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" aria-labelledby="destaques-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="destaques-title" className="section-title mb-12 text-center text-3xl font-bold text-gray-900">
            Destaques
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="feature-card rounded-lg border-2 border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
              <div className="highlight-icon mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="card-title mb-2 text-xl font-bold text-gray-900">ENEM 2026</h3>
              <p className="card-body mb-4 text-gray-600">
                O principal exame para acesso ao ensino superior no Brasil. Mais de 500 universidades aceitam a nota do ENEM.
              </p>
              <ul className="feature-list mb-6 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Isencao para baixa renda</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Recursos de acessibilidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Vale para SISU, PROUNI e FIES</span>
                </li>
              </ul>
              <Link
                to="/vestibulares/1"
                className="feature-link inline-block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Ver detalhes do ENEM
              </Link>
            </div>

            <div className="feature-card rounded-lg border-2 border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
              <div className="highlight-icon mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="card-title mb-2 text-xl font-bold text-gray-900">Vestibulares Estaduais</h3>
              <p className="card-body mb-4 text-gray-600">
                Vestibulares de universidades estaduais como USP, UNICAMP e UNESP oferecem ensino de excelencia.
              </p>
              <ul className="feature-list mb-6 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Ensino publico e gratuito</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Atendimento especial disponivel</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Diversos cursos disponiveis</span>
                </li>
              </ul>
              <Link
                to="/vestibulares"
                className="feature-link inline-block w-full rounded-lg bg-purple-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
              >
                Ver todos os vestibulares
              </Link>
            </div>

            <div className="feature-card rounded-lg border-2 border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
              <div className="highlight-icon mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="card-title mb-2 text-xl font-bold text-gray-900">Cursos Gratuitos Online</h3>
              <p className="card-body mb-4 text-gray-600">
                Milhares de cursos gratuitos em diversas areas: tecnologia, saude, administracao e muito mais.
              </p>
              <ul className="feature-list mb-6 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>100% gratuitos com certificado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Estude no seu ritmo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
                  <span>Plataformas renomadas</span>
                </li>
              </ul>
              <Link
                to="/cursos"
                className="feature-link inline-block w-full rounded-lg bg-green-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                Explorar cursos gratuitos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section bg-blue-600 py-16 text-white" aria-labelledby="cta-title">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="cta-title" className="mb-4 text-3xl font-bold">
            Pronto para comecar sua jornada educacional?
          </h2>
          <p className="cta-lead mb-8 text-lg text-blue-100">
            Explore todas as oportunidades disponiveis e de o proximo passo rumo ao seu futuro.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/vestibulares"
              className="hero-primary-cta inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-medium text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Ver Vestibulares
            </Link>
            <Link
              to="/cursos"
              className="hero-secondary-cta inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-8 py-4 font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Ver Cursos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
