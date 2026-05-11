import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Filter, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { vestibularesService, Vestibular } from '../services/api';

export function Vestibulares() {
  const [vestibulares, setVestibulares] = useState<Vestibular[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTipo, setSelectedTipo] = useState<string>('Todos');
  const [selectedNivel, setSelectedNivel] = useState<string>('Todos');
  const [isencaoOnly, setIsencaoOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    async function fetchVestibulares() {
      setLoading(true);
      const { data } = await vestibularesService.getAllVestibulares();
      setVestibulares(data);
      setLoading(false);
    }
    fetchVestibulares();
  }, []);

  const tiposDisponiveis = ['Todos', ...Array.from(new Set(vestibulares.map(v => v.tipo)))];
  const niveisDisponiveis = ['Todos', ...Array.from(new Set(vestibulares.map(v => v.nivel)))];

  const vestibularesFiltrados = vestibulares.filter(v => {
    if (selectedTipo !== 'Todos' && v.tipo !== selectedTipo) return false;
    if (selectedNivel !== 'Todos' && v.nivel !== selectedNivel) return false;
    if (isencaoOnly && !v.isencaoDisponivel) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Vestibulares Públicos</h1>
          <p className="text-lg text-blue-100">
            Encontre vestibulares gratuitos e acessíveis com guias passo a passo
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
                  className="lg:hidden text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  aria-expanded={showFilters}
                  aria-controls="filtros-container"
                >
                  {showFilters ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              <div id="filtros-container" className={showFilters ? 'space-y-6' : 'hidden lg:block space-y-6'}>
                {/* Tipo Filter */}
                <div>
                  <label htmlFor="tipo-filter" className="block font-medium text-gray-900 mb-3">
                    Tipo
                  </label>
                  <select
                    id="tipo-filter"
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {tiposDisponiveis.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                {/* Nível Filter */}
                <div>
                  <label htmlFor="nivel-filter" className="block font-medium text-gray-900 mb-3">
                    Nível
                  </label>
                  <select
                    id="nivel-filter"
                    value={selectedNivel}
                    onChange={(e) => setSelectedNivel(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {niveisDisponiveis.map(nivel => (
                      <option key={nivel} value={nivel}>{nivel}</option>
                    ))}
                  </select>
                </div>

                {/* Isenção Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isencaoOnly}
                      onChange={(e) => setIsencaoOnly(e.target.checked)}
                      className="w-5 h-5 mt-0.5 border-2 border-gray-300 rounded focus:outline-none focus:ring-4 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">
                      Apenas com isenção de taxa disponível
                    </span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedTipo('Todos');
                    setSelectedNivel('Todos');
                    setIsencaoOnly(false);
                  }}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500"
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
                <p className="text-gray-600 text-lg">Carregando vestibulares...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-700">
                    <span className="font-medium text-lg">{vestibularesFiltrados.length}</span> {vestibularesFiltrados.length === 1 ? 'vestibular encontrado' : 'vestibulares encontrados'}
                  </p>
                </div>

                {vestibularesFiltrados.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Nenhum vestibular encontrado com os filtros selecionados.
                </p>
                <button
                  onClick={() => {
                    setSelectedTipo('Todos');
                    setSelectedNivel('Todos');
                    setIsencaoOnly(false);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {vestibularesFiltrados.map((vestibular) => (
                  <VestibularCard key={vestibular.id} vestibular={vestibular} />
                ))}
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VestibularCard({ vestibular }: { vestibular: Vestibular }) {
  return (
    <article className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {vestibular.nome}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {vestibular.tipo}
            </span>
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {vestibular.nivel}
            </span>
            {vestibular.isencaoDisponivel && (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                Isenção disponível
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-start gap-2 text-gray-700 mb-2">
          <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
          <span className="font-medium">{vestibular.prazo}</span>
        </div>
        <p className="text-gray-600">{vestibular.descricao}</p>
      </div>

      {vestibular.acessibilidade.length > 0 && (
        <div className="mb-4">
          <p className="font-medium text-gray-900 mb-2">Recursos de acessibilidade:</p>
          <div className="flex flex-wrap gap-2">
            {vestibular.acessibilidade.map((recurso, index) => (
              <span key={index} className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                {recurso}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <Link
          to={`/vestibulares/${vestibular.id}`}
          className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Ver passo a passo
        </Link>
        <a
          href={vestibular.linkOficial}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500"
        >
          Ir para site oficial
          <ExternalLink className="w-5 h-5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
