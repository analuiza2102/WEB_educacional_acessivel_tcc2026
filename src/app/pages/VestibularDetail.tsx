import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Calendar, FileText, CheckCircle, Accessibility } from 'lucide-react';
import { vestibularesService, Vestibular } from '../services/api';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric'
});
const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function dateLabel(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export function VestibularDetail() {
  const { id } = useParams();
  const [vestibular, setVestibular] = useState<Vestibular | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchVestibular() {
      setLoading(true);
      setError(null);
      if (!id) {
        setLoading(false);
        return;
      }
      const result = await vestibularesService.getVestibularById(id);
      if (!active) return;
      setVestibular(result.data);
      setError(result.error ?? null);
      setLoading(false);
    }
    fetchVestibular();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 text-lg">Carregando...</p></div>;
  }

  if (!vestibular) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{error ? 'Não foi possível carregar o vestibular' : 'Vestibular não encontrado'}</h1>
          <Link to="/vestibulares" className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1">Voltar para vestibulares</Link>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const registrationEnded = Boolean(vestibular.inscricaoFim && now > Date.parse(vestibular.inscricaoFim));
  const registrationUpcoming = Boolean(vestibular.inscricaoInicio && now < Date.parse(vestibular.inscricaoInicio));
  const exemptionEnded = Boolean(vestibular.isencaoFim && now > Date.parse(vestibular.isencaoFim));
  const exemptionUpcoming = Boolean(vestibular.isencaoInicio && now < Date.parse(vestibular.isencaoInicio));
  const ctaTitle = registrationEnded ? 'Acompanhe as próximas etapas' : registrationUpcoming ? 'Prepare-se para as inscrições' : 'Pronto para se inscrever?';
  const ctaText = registrationEnded
    ? 'Consulte o cronograma, os resultados e as publicações no site oficial.'
    : registrationUpcoming
      ? 'Confira os prazos e as orientações no site oficial.'
      : 'Acesse o site oficial para realizar sua inscrição de forma segura.';
  const ctaUrl = vestibular.inscricoesAbertas && vestibular.inscricaoUrl ? vestibular.inscricaoUrl : vestibular.linkOficial;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/vestibulares" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" /> Voltar para vestibulares
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{vestibular.nome}</h1>
          {vestibular.descricao && <p className="text-lg text-blue-100">{vestibular.descricao}</p>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-label="Informações gerais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div><p className="text-sm text-gray-600 mb-1">Tipo</p><p className="font-medium text-gray-900">{vestibular.tipo}</p></div>
            <div><p className="text-sm text-gray-600 mb-1">Nível</p><p className="font-medium text-gray-900">{vestibular.nivel}</p></div>
            {vestibular.taxaInscricao !== null && <div><p className="text-sm text-gray-600 mb-1">Taxa de inscrição</p><p className="font-medium text-gray-900">{moneyFormatter.format(vestibular.taxaInscricao)}</p></div>}
          </div>
          {vestibular.prazo && (
            <div className="flex items-start gap-2 text-gray-700 mb-4">
              <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Prazo de inscrições</p>
                <p>{vestibular.prazo}</p>
                {registrationEnded && <p className="text-sm text-amber-800 mt-1">Inscrições encerradas</p>}
                {registrationUpcoming && <p className="text-sm text-blue-800 mt-1">Inscrições ainda não iniciadas</p>}
              </div>
            </div>
          )}
          {vestibular.isencaoDisponivel && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-green-900 mb-1">Pedido de isenção disponível</p>
                <p className="text-sm text-green-800">Consulte as condições e o prazo no site oficial da organização.</p>
              </div>
            </div>
          )}
          {exemptionEnded && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
              <p className="font-medium">Prazo para pedir isenção encerrado</p>
              <p className="text-sm">O prazo terminou em {dateLabel(vestibular.isencaoFim)}. Consulte o site oficial para conferir outras regras de desconto.</p>
            </div>
          )}
          {exemptionUpcoming && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
              <p className="font-medium">Pedido de isenção previsto</p>
              <p className="text-sm">Período a partir de {dateLabel(vestibular.isencaoInicio)}. Confira as regras no site oficial.</p>
            </div>
          )}
        </section>

        {vestibular.passos.length > 0 && (
          <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="passos-title">
            <h2 id="passos-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />Passo a Passo para Inscrição</h2>
            <ol className="space-y-4">
              {vestibular.passos.map((passo, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold" aria-hidden="true">{index + 1}</span>
                  <p className="flex-1 pt-1 text-gray-900">{passo}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {vestibular.documentosOficiais.length > 0 && (
          <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="documentos-oficiais-title">
            <h2 id="documentos-oficiais-title" className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />Documentos e materiais oficiais</h2>
            <p className="text-gray-600 mb-5">Publicações da organização para consulta.</p>
            <ul className="space-y-3">
              {vestibular.documentosOficiais.map(doc => (
                <li key={doc.url}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-lg p-2 text-blue-700 hover:bg-blue-50 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="flex-1">{doc.titulo}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 mt-1" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {vestibular.documentos.length > 0 && (
          <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="documentos-title">
            <h2 id="documentos-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />Documentos Necessários</h2>
            <ul className="space-y-3">
              {vestibular.documentos.map((doc, index) => <li key={`${doc}-${index}`} className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" /><span className="text-gray-900">{doc}</span></li>)}
            </ul>
          </section>
        )}

        {vestibular.datas.length > 0 && (
          <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="datas-title">
            <h2 id="datas-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-600" aria-hidden="true" />Datas Importantes</h2>
            <ol className="divide-y divide-gray-200">
              {vestibular.datas.map((item, index) => (
                <li key={`${item.evento}-${index}`} className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-2 sm:gap-4 py-4 first:pt-0 last:pb-0">
                  <div><span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">{item.data}</span></div>
                  <p className="font-medium text-gray-900 self-center">{item.evento}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {vestibular.guiaInclusao && (
          <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="guia-inclusao-title">
            <h2 id="guia-inclusao-title" className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2"><Accessibility className="w-6 h-6 text-blue-600" aria-hidden="true" />Orientações de acessibilidade</h2>
            <p className="text-gray-600 mb-4">A organização publicou um guia com orientações de inclusão. Confira nele os procedimentos e prazos.</p>
            <a href={vestibular.guiaInclusao.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-700 font-medium underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">Abrir {vestibular.guiaInclusao.titulo}<ExternalLink className="w-4 h-4" aria-hidden="true" /></a>
          </section>
        )}

        {vestibular.acessibilidade.length > 0 && (
          <section className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8" aria-labelledby="acessibilidade-title">
            <h2 id="acessibilidade-title" className="text-2xl font-bold text-gray-900 mb-4">Recursos de Acessibilidade</h2>
            <p className="text-gray-600 mb-4">Este vestibular informa os seguintes recursos de acessibilidade:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vestibular.acessibilidade.map((recurso, index) => <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" /><span className="text-gray-900">{recurso}</span></div>)}
            </div>
          </section>
        )}

        {ctaUrl && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{ctaTitle}</h2>
            <p className="text-blue-100 mb-6">{ctaText}</p>
            <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300">
              {vestibular.inscricoesAbertas && vestibular.inscricaoUrl ? 'Ir para inscrição' : 'Acessar site oficial'}
              <ExternalLink className="w-6 h-6" aria-hidden="true" />
            </a>
            <p className="mt-4 text-sm text-blue-100">Você será redirecionado para o site oficial</p>
          </div>
        )}
      </div>
    </div>
  );
}
