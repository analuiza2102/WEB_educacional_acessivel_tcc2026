import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUnesp, parseUnespDocuments } from '../scrapers/unespScraper.js';

const page = deadline => `<html><body>
  <section class="corner-ribbon-areaprojeto">
    <span class="ribbon">VNSP2514</span>
    <h3 class="course-title">Vestibular | <strong>Vestibular Unesp 2027</strong></h3>
    <div class="course-informations"><span class="apply from">04/09</span><span class="apply to">${deadline}</span></div>
    <div class="course-description">ATENÇÃO: INSCRIÇÕES PRORROGADAS ATÉ AS 18H DE 26/10</div>
    <a class="apply-to-it" href="/VNSP2514/Inscricao">Inscreva-se</a>
  </section>
  <a data-host="https://documento.vunesp.com.br" data-controller="projeto"
    data-tabname="documento" data-sigla="VNSP2514">Editais e Documentos</a>
</body></html>`;

const documents = `<table>
  <tr><td><a href="https://documento.vunesp.com.br/documento/stream/MANUAL">
    Manual do Candidato Vestibular Unesp 2027</a></td></tr>
  <tr><td><a href="https://documento.vunesp.com.br/documento/stream/RESOLUCAO">
    Resolução UNESP 2027</a></td></tr>
  <tr><td><a href="https://example.com/fora.pdf">Documento externo</a></td></tr>
</table>`;

const manual = `\fCalendário
SOLICITAÇÃO DE REDUÇÃO DE TAXA (LEI ESTADUAL)
24 a 30.08.2026 - Exclusivamente pela internet
SOLICITAÇÃO DE ISENÇÃO DE TAXA (CANDIDATOS)
24 a 30.08.2026 - Exclusivamente pela internet
PROVA DA 1ª FASE
22.11.2026 - Prova de Conhecimentos Gerais
PROVAS DA 2ª FASE
13.12.2026 - Prova de Conhecimentos Específicos (Ciências Humanas e Sociais Aplicadas)
14.12.2026 - Prova de Conhecimentos Específicos (Linguagens e Redação)
RESULTADOS
27.01.2027 - Divulgação da lista geral de classificação
CONVOCAÇÃO E MATRÍCULA
\fProcedimentos
para inscrição
As inscrições serão realizadas                         OUTRA COLUNA
exclusivamente pela internet, das 10h de 04 de setembro   Dados
às 23h59 de 20 de outubro de 2026                   Dados
A taxa de inscrição no valor de R$ 225,00.
`;

test('prioriza prorrogação anunciada pela Vunesp e preserva cronograma do manual', () => {
  const { vestibular, eventos, docs } = normalizeUnesp(page('26/10'), documents, manual,
    new Date('2026-10-20T15:00:00Z'));
  assert.equal(vestibular.inscricao_inicio, '2026-09-04T13:00:00.000Z');
  assert.equal(vestibular.inscricao_fim, '2026-10-26T21:00:00.000Z');
  assert.equal(vestibular.isencao_fim, '2026-08-31T02:59:00.000Z');
  assert.equal(vestibular.isencao_disponivel, false);
  assert.equal(vestibular.taxa_inscricao, 225);
  assert.equal(vestibular.status, 'pending_review');
  assert.equal(eventos.find(event => event.event_key === 'resultado-final').data_inicio,
    '2027-01-27T15:00:00.000Z');
  assert.equal(docs.length, 2);
  assert.equal(vestibular.manual_url, docs[0].url);
});

test('interrompe coleta quando prazo muda sem aviso correspondente', () => {
  assert.throws(() => normalizeUnesp(page('27/10'), documents, manual), /Novo prazo sem aviso/);
});

test('documentos exigem manual da edição correta', () => {
  assert.throws(() => parseUnespDocuments(documents, 2028), /Manual oficial da edição 2028/);
});
