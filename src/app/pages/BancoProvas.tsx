import { useState, useEffect } from 'react';
import { Search, Download, FileText, CheckCircle, Calendar, Filter } from 'lucide-react';
import { provasService, Prova } from '../services/api';

export function BancoProvas() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstituicao, setSelectedInstituicao] = useState<string>('Todas');
  const [selectedAno, setSelectedAno] = useState<string>('Todos');
  const [comGabarito, setComGabarito] = useState(false);
  const [comResolucao, setComResolucao] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [instituicoes, setInstituicoes] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [provasResult, instituicoesResult, anosResult] = await Promise.all([
        provasService.getAllProvas(),
        provasService.getInstituicoes(),
        provasService.getAnosDisponiveis()
      ]);

      setProvas(provasResult.data);
      setInstituicoes(instituicoesResult.data);
      setAnos(anosResult.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const provasFiltradas = provas.filter(prova => {
    const matchesSearch = searchTerm === '' ||
      prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prova.instituicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prova.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesInstituicao = selectedInstituicao === 'Todas' || prova.instituicao === selectedInstituicao;
    const matchesAno = selectedAno === 'Todos' || prova.ano.toString() === selectedAno;
    const matchesGabarito = !comGabarito || prova.gabarito;
    const matchesResolucao = !comResolucao || prova.resolucao;

    return matchesSearch && matchesInstituicao && matchesAno && matchesGabarito && matchesResolucao;
  });

  const handleDownload = async (prova: Prova) => {
    await provasService.incrementDownloadCount(prova.id);
    // Redirecionar para URL oficial
    if (prova.urlOficial) {
      window.open(prova.urlOficial, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Banco de Provas</h1>
          <p className="text-lg text-purple-100">
            Acesse provas anteriores de vestibulares com gabaritos e resoluções comentadas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 mb-8 lg:mb-0" aria-labelledby="filtros-title">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 id="filtros-title" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" aria-hidden="true" />
                  Filtros
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                  aria-expanded={showFilters}
                  aria-controls="filtros-container"
                >
                  {showFilters ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              <div id="filtros-container" className={showFilters ? 'space-y-6' : 'hidden lg:block space-y-6'}>
                {/* Search */}
                <div>
                  <label htmlFor="search-provas" className="block font-medium text-gray-900 mb-3">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="search-provas"
                      type="text"
                      placeholder="Digite sua busca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Instituição */}
                <div>
                  <label htmlFor="instituicao-filter" className="block font-medium text-gray-900 mb-3">
                    Instituição
                  </label>
                  <select
                    id="instituicao-filter"
                    value={selectedInstituicao}
                    onChange={(e) => setSelectedInstituicao(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Todas">Todas</option>
                    {instituicoes.map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                {/* Ano */}
                <div>
                  <label htmlFor="ano-filter" className="block font-medium text-gray-900 mb-3">
                    Ano
                  </label>
                  <select
                    id="ano-filter"
                    value={selectedAno}
                    onChange={(e) => setSelectedAno(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Todos">Todos</option>
                    {anos.map(ano => (
                      <option key={ano} value={ano.toString()}>{ano}</option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comGabarito}
                      onChange={(e) => setComGabarito(e.target.checked)}
                      className="w-5 h-5 mt-0.5 border-2 border-gray-300 rounded focus:outline-none focus:ring-4 focus:ring-purple-500"
                    />
                    <span className="text-gray-900">Com gabarito</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comResolucao}
                      onChange={(e) => setComResolucao(e.target.checked)}
                      className="w-5 h-5 mt-0.5 border-2 border-gray-300 rounded focus:outline-none focus:ring-4 focus:ring-purple-500"
                    />
                    <span className="text-gray-900">Com resolução comentada</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedInstituicao('Todas');
                    setSelectedAno('Todos');
                    setComGabarito(false);
                    setComResolucao(false);
                  }}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-500"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">Carregando provas...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-700">
                    <span className="font-medium text-lg">{provasFiltradas.length}</span>{' '}
                    {provasFiltradas.length === 1 ? 'prova encontrada' : 'provas encontradas'}
                  </p>
                </div>

                {provasFiltradas.length === 0 ? (
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
                    <p className="text-gray-600 text-lg mb-4">
                      Nenhuma prova encontrada com os filtros selecionados.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedInstituicao('Todas');
                        setSelectedAno('Todos');
                        setComGabarito(false);
                        setComResolucao(false);
                      }}
                      className="text-purple-600 hover:text-purple-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                    >
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {provasFiltradas.map((prova) => (
                      <ProvaCard key={prova.id} prova={prova} onDownload={handleDownload} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-purple-50 border-2 border-purple-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sobre o Banco de Provas
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Todas as provas disponíveis são de domínio público</strong> e foram
              disponibilizadas oficialmente pelas instituições organizadoras.
            </p>
            <p>
              Ao clicar em "Baixar prova", você será redirecionado para o site oficial da
              instituição onde poderá fazer o download de forma segura e legal.
            </p>
            <p>
              Os gabaritos e resoluções comentadas são materiais complementares que facilitam
              seus estudos e preparação para os vestibulares.
            </p>
            <p className="font-medium text-purple-900">
              💡 Dica: Resolva as provas em tempo real para simular as condições do dia da prova!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProvaCard({ prova, onDownload }: { prova: Prova; onDownload: (prova: Prova) => void }) {
  return (
    <article className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {prova.titulo}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {prova.instituicao}
            </span>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {prova.ano}
            </span>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {prova.tipo}
            </span>
            {prova.area && (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {prova.area}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {prova.gabarito && (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Inclui gabarito</span>
          </div>
        )}
        {prova.resolucao && (
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FileText className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Inclui resolução comentada</span>
          </div>
        )}
        {prova.numeroQuestoes > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-5 h-5" aria-hidden="true" />
            <span>{prova.numeroQuestoes} questões</span>
          </div>
        )}
      </div>

      {prova.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {prova.tags.map((tag, index) => (
              <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <Download className="inline w-4 h-4 mr-1" aria-hidden="true" />
          {prova.downloadCount.toLocaleString('pt-BR')} downloads
        </p>

        <button
          onClick={() => onDownload(prova)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          <Download className="w-5 h-5" aria-hidden="true" />
          Baixar prova
        </button>
      </div>
    </article>
  );
}
