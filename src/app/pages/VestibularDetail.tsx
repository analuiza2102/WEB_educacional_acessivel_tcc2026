import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { vestibularesService, Vestibular } from '../services/api';

export function VestibularDetail() {
  const { id } = useParams();
  const [vestibular, setVestibular] = useState<Vestibular | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVestibular() {
      if (!id) return;
      setLoading(true);
      const { data } = await vestibularesService.getVestibularById(id);
      setVestibular(data);
      setLoading(false);
    }
    fetchVestibular();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!vestibular) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vestibular não encontrado</h1>
          <Link to="/vestibulares" className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">
            Voltar para vestibulares
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/vestibulares"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            Voltar para vestibulares
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{vestibular.nome}</h1>
          <p className="text-lg text-blue-100">{vestibular.descricao}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Info */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipo</p>
              <p className="font-medium text-gray-900">{vestibular.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Nível</p>
              <p className="font-medium text-gray-900">{vestibular.nivel}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-gray-700 mb-4">
            <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
            <div>
              <p className="font-medium text-gray-900 mb-1">Prazo de inscrições</p>
              <p>{vestibular.prazo}</p>
            </div>
          </div>
          {vestibular.isencaoDisponivel && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-green-900 mb-1">Isenção de taxa disponível</p>
                <p className="text-sm text-green-800">
                  Este vestibular oferece isenção da taxa de inscrição para pessoas de baixa renda. Veja os requisitos no passo a passo abaixo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Passo a Passo */}
        <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="passos-title">
          <h2 id="passos-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />
            Passo a Passo para Inscrição
          </h2>
          <ol className="space-y-4">
            {vestibular.passos.map((passo, index) => (
              <li key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold" aria-hidden="true">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-900">{passo}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Documentos */}
        <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="documentos-title">
          <h2 id="documentos-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />
            Documentos Necessários
          </h2>
          <ul className="space-y-3">
            {vestibular.documentos.map((doc, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-gray-900">{doc}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-blue-900">
                <strong>Importante:</strong> Mantenha cópias digitalizadas de todos os documentos. Você pode precisar enviá-los durante o processo de inscrição ou matrícula.
              </p>
            </div>
          </div>
        </section>

        {/* Datas Importantes */}
        <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="datas-title">
          <h2 id="datas-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" aria-hidden="true" />
            Datas Importantes
          </h2>
          <div className="space-y-4">
            {vestibular.datas.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    {item.data}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.evento}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Acessibilidade */}
        {vestibular.acessibilidade.length > 0 && (
          <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="acessibilidade-title">
            <h2 id="acessibilidade-title" className="text-2xl font-bold text-gray-900 mb-4">
              Recursos de Acessibilidade
            </h2>
            <p className="text-gray-600 mb-4">
              Este vestibular oferece os seguintes recursos de acessibilidade:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vestibular.acessibilidade.map((recurso, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-900">{recurso}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>Lembre-se:</strong> Solicite os recursos de acessibilidade no momento da inscrição. Se tiver dúvidas, entre em contato com a organização do vestibular.
              </p>
            </div>
          </section>
        )}

        {/* CTA - Site Oficial */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Pronto para se inscrever?</h2>
          <p className="text-blue-100 mb-6">
            Acesse o site oficial para realizar sua inscrição de forma segura
          </p>
          <a
            href={vestibular.linkOficial}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Acessar site oficial
            <ExternalLink className="w-6 h-6" aria-hidden="true" />
          </a>
          <p className="mt-4 text-sm text-blue-100">
            Você será redirecionado para o site oficial
          </p>
        </div>
      </div>
    </div>
  );
}
