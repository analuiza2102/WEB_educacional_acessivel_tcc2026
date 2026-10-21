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
