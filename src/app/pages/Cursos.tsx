import { useState, useEffect } from 'react';
import { Search, ExternalLink, Clock, Award } from 'lucide-react';
import { cursosService, Curso } from '../services/api';

export function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('Todas');

  useEffect(() => {
    async function fetchCursos() {
      setLoading(true);
      const { data } = await cursosService.getAllCursos();
      setCursos(data);
      setLoading(false);
    }
    fetchCursos();
  }, []);

  const areasDisponiveis = ['Todas', ...Array.from(new Set(cursos.map(c => c.area)))];

  const cursosFiltrados = cursos.filter(curso => {
    const matchesSearch = curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.plataforma.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'Todas' || curso.area === selectedArea;
    return matchesSearch && matchesArea && curso.gratuito;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Cursos Gratuitos Online</h1>
          <p className="text-lg text-green-100">
            Milhares de cursos gratuitos com certificado em diversas áreas do conhecimento
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label htmlFor="search-courses" className="block font-medium text-gray-900 mb-3 text-lg">
                Buscar cursos
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" aria-hidden="true" />
                <input
                  id="search-courses"
                  type="text"
                  placeholder="Digite o nome do curso, plataforma ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-green-500 focus:border-green-500"
                  aria-describedby="search-help"
                />
              </div>
              <p id="search-help" className="mt-2 text-sm text-gray-600">
                Exemplo: "Excel", "Programação", "Marketing Digital"
              </p>
            </div>

            {/* Area Filters */}
            <div>
              <p className="block font-medium text-gray-900 mb-3">Filtrar por área</p>
              <div className="flex flex-wrap gap-3">
                {areasDisponiveis.map(area => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-green-500 ${
                      selectedArea === area
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={selectedArea === area}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">Carregando cursos...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-700">
                <span className="font-medium text-lg">{cursosFiltrados.length}</span> {cursosFiltrados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
              </p>
            </div>

            {/* Courses Grid */}
            {cursosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              Nenhum curso encontrado com os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('Todas');
              }}
              className="text-green-600 hover:text-green-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1"
            >
              Limpar busca e filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursosFiltrados.map(curso => (
              <article key={curso.id} className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {curso.nome}
                    </h3>
                    {curso.gratuito && (
                      <span className="flex-shrink-0 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                        GRATUITO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{curso.plataforma}</p>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4 flex-1">
                  {curso.descricao}
                </p>

                {/* Info */}
                <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span><strong>Duração:</strong> {curso.duracao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span><strong>Nível:</strong> {curso.nivel}</span>
                  </div>
                </div>

                {/* Area Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    {curso.area}
                  </span>
                </div>

                {/* CTA */}
                <a
                  href={curso.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  Acessar curso
                  <ExternalLink className="w-5 h-5" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sobre os cursos gratuitos
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Todos os cursos listados aqui são <strong>100% gratuitos</strong> e oferecidos por plataformas renomadas de ensino online.
            </p>
            <p>
              A maioria oferece <strong>certificado de conclusão</strong> que pode ser usado para comprovar conhecimentos em processos seletivos e oportunidades de trabalho.
            </p>
            <p>
              Você pode estudar no seu próprio ritmo, de qualquer lugar, precisando apenas de um dispositivo com acesso à internet.
            </p>
            <p className="font-medium">
              Ao clicar em "Acessar curso", você será redirecionado para o site oficial da plataforma onde poderá se cadastrar e iniciar seus estudos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
