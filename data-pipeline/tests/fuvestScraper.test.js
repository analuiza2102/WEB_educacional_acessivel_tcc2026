import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEventCorrections, normalizeFuvest } from '../scrapers/fuvestScraper.js';

const key = 'locais-primeira-fase';
const staleEvent = () => ({
  event_key: key, titulo: 'Divulgação dos locais de prova da 1ª Fase',
  data_inicio: '2026-10-21T15:00:00.000Z', data_fim: '2026-10-21T15:00:00.000Z',
  fonte_url: 'https://www.fuvest.br/vestibular-da-usp/'
});

test('correção oficial troca somente a data antiga e registra a fonte', () => {
  const [event] = applyEventCorrections(2027, [staleEvent()]);
  assert.equal(event.data_inicio, '2026-10-20T15:00:00.000Z');
  assert.equal(event.data_fim, event.data_inicio);
  assert.match(event.fonte_url, /fuvest-2027-fuvest-antecipa/);
  assert.equal(applyEventCorrections(2027, [event])[0].data_inicio, event.data_inicio);
});

test('correção não sobrescreve uma nova alteração no calendário oficial', () => {
  assert.throws(() => applyEventCorrections(2027, [{
    ...staleEvent(), data_inicio: '2026-10-19T15:00:00.000Z'
  }]), /revise a correção oficial/);
  assert.equal(applyEventCorrections(2028, [staleEvent()])[0].data_inicio, '2026-10-21T15:00:00.000Z');
});

test('publicações oficiais incluem PDFs novos sem capturar links fora da edição', () => {
  const html = `<html><head><title>Vestibular da USP – 2027</title></head><body>
    <p>Período: das 12h de 17/08/2026 às 12h de 09/10/2026</p>
    <div data-elemento="calendario" data-elemento-1="20261021120000|Divulgação dos locais de prova da 1ª Fase"></div>
    <a href="https://www.fuvest.br/fora.pdf">Fora da edição</a>
    <div class="elementor-toggle-item"><div class="elementor-tab-title">Vestibular FUVEST 2027</div>
      <div class="elementor-tab-content">
        <a href="https://www.fuvest.br/fuvest2027-relacao-candidato-vagas.pdf">Relação Candidato Vaga</a>
        <a href="https://www.fuvest.br/fuvest2027-fase1-locais-prova.pdf">Locais de prova da 1ª Fase</a>
      </div>
    </div></body></html>`;
  const { docs, eventos } = normalizeFuvest(html);
  assert.deepEqual(docs.map(doc => doc.title), ['Relação Candidato Vaga', 'Locais de prova da 1ª Fase']);
  assert.equal(eventos.find(event => event.event_key === key).data_inicio, '2026-10-20T15:00:00.000Z');
  assert.equal(normalizeFuvest(html).vestibular.prazo, '17/08/2026 a 09/10/2026');
  assert.deepEqual(normalizeFuvest(html).vestibular.datas, [{
    evento: 'Divulgação dos locais de prova da 1ª Fase', data: '20/10/2026'
  }]);
});

test('normaliza o novo portal da FUVEST usando o Guia de Jornada oficial', () => {
  const html = `<html><head><title>FUVEST</title></head><body>
    <div class="edital">
      <div class="titulo">VESTIBULAR DA USP</div>
      <div class="item"><a href="arquivos/vestibular/fuvest2027-programa-vestibular.pdf">Programa do Vestibular 2027</a></div>
      <div class="item"><a href="arquivos/vestibular/fuvest2027-guia-inclusao.pdf">Guia de Inclusão</a></div>
      <div class="item"><a href="arquivos/vestibular/fuvest2027-resolucao-DOE.pdf">Resolução CoG Nº 9008</a></div>
      <div class="item"><a href="arquivos/vestibular/fuvest2027-guia-jornada.pdf">Guia de Jornada</a></div>
    </div>
    <div class="edital"><div class="titulo">RESIDÊNCIA MÉDICA</div>
      <div class="item"><a href="arquivos/coreme/rm2027-edital.pdf">Documento de outro processo</a></div>
    </div>
  </body></html>`;
  const guide = `Calendário
Período de inscrições para o Vestibular 2027 17/08 (12h) até 09/10/2026 (12h)
Publicação da coleção 17/08/2026    Divulgação dos locais de prova da 1ª Fase 21/10/2026
Prova de conhecimentos gerais 01/11/2026
Divulgação dos locais de prova e da lista de convocação 23/11/2026
Prova de Português e Redação 06/12/2026
Prova das disciplinas específicas 07/12/2026
Primeira lista de chamada para matrícula 26/01/2027
A taxa de inscrição é de R$ 228,00.`;
  const { vestibular, eventos, docs } = normalizeFuvest(html, guide);
  assert.equal(vestibular.ano, 2027);
  assert.equal(vestibular.prazo, '17/08/2026 a 09/10/2026');
  assert.equal(vestibular.taxa_inscricao, 228);
  assert.equal(vestibular.manual_url, 'https://fuvest.br/arquivos/vestibular/fuvest2027-guia-jornada.pdf');
  assert.equal(eventos.find(event => event.event_key === key).data_inicio, '2026-10-20T15:00:00.000Z');
  assert.equal(eventos.find(event => event.event_key === 'segunda-fase-dia-2').data_inicio,
    '2026-12-07T15:00:00.000Z');
  assert.equal(docs.length, 4);
  assert.ok(docs.every(doc => !doc.url.includes('coreme')));
});
