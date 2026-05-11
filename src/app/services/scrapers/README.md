# Web Scraping e Coleta Automática de Dados

## ⚠️ IMPORTANTE - Leia antes de implementar

### Aspectos Legais e Éticos

**SEMPRE siga estas diretrizes:**

1. ✅ **Respeite o arquivo robots.txt** - Verifique quais páginas podem ser acessadas
2. ✅ **Use APIs oficiais quando disponíveis** - São mais confiáveis e legais
3. ✅ **Identifique seu bot** - Use um User-Agent apropriado
4. ✅ **Não sobrecarregue servidores** - Use delays entre requisições (2-5 segundos)
5. ✅ **Verifique termos de uso** - Alguns sites proíbem scraping
6. ✅ **Entre em contato** - Considere pedir permissão formal
7. ✅ **Use apenas dados públicos** - Não acesse áreas protegidas
8. ✅ **Dê crédito** - Sempre cite a fonte dos dados

### APIs Oficiais Recomendadas

Em vez de fazer scraping, prefira usar APIs oficiais:

#### 1. INEP (ENEM)
- **URL**: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos
- **Dados**: Microdados do ENEM, resultados, estatísticas
- **Formato**: CSV, JSON
- **Licença**: Dados Abertos Governamentais
- **Custo**: Gratuito

#### 2. Portal de Dados Abertos do Governo
- **URL**: https://dados.gov.br/
- **Dados**: Diversos datasets educacionais
- **Formato**: CSV, JSON, XML
- **Licença**: Aberta
- **Custo**: Gratuito

#### 3. API do MEC
- **URL**: https://api.mec.gov.br/ (verificar disponibilidade)
- **Dados**: SISU, PROUNI, FIES
- **Formato**: JSON
- **Custo**: Gratuito

#### 4. APIs Estaduais
- **FUVEST**: Verificar se disponibilizam API ou RSS feed
- **UNICAMP**: Verificar portal de dados abertos
- **UNESP**: Verificar sistema Vunesp

---

## 🏗️ Arquitetura da Solução

### Estrutura de Arquivos

```
services/scrapers/
├── types.ts                    # Tipos TypeScript
├── vestibularScraper.ts        # Lógica de coleta de vestibulares
├── schedulerService.ts         # Agendamento de tarefas
└── README.md                   # Esta documentação
```

### Fluxo de Dados

```
┌─────────────────┐
│  Sites Oficiais │
│  (ENEM, SISU,   │
│   FUVEST, etc)  │
└────────┬────────┘
         │
         │ (Web Scraping ou API)
         ▼
┌─────────────────┐
│   Scrapers      │
│  (coleta dados) │
└────────┬────────┘
         │
         │ (validação)
         ▼
┌─────────────────┐
│   Supabase DB   │
│  (armazena)     │
└────────┬────────┘
         │
         │ (consulta)
         ▼
┌─────────────────┐
│   Interface     │
│   (usuários)    │
└─────────────────┘
```

---

## 📅 Implementação de Cron Jobs

### Opção 1: Supabase Edge Functions + Cron (RECOMENDADO)

**Vantagens:**
- ✅ Integração nativa com Supabase
- ✅ Escala automaticamente
- ✅ Sem servidor para gerenciar
- ✅ Gratuito no tier inicial

**Configuração:**

1. **Crie a Edge Function:**

```bash
# No terminal do projeto
supabase functions new update-vestibulares
```

2. **Implemente a função em `supabase/functions/update-vestibulares/index.ts`:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Coleta dados do ENEM
    const enemData = await fetchEnemData();
    
    // Salva no banco
    const { error } = await supabase
      .from('vestibulares')
      .upsert(enemData);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

3. **Configure o Cron no Supabase Dashboard:**
   - Acesse: Functions > Cron Jobs
   - Adicione nova tarefa agendada
   - Expressão cron: `0 */6 * * *` (a cada 6 horas)
   - Selecione a função: `update-vestibulares`

### Opção 2: Vercel Cron Jobs

**Vantagens:**
- ✅ Fácil configuração
- ✅ Integrado com deploys
- ✅ Gratuito (com limites)

**Configuração:**

1. **Crie `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/update-vestibulares",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

2. **Crie endpoint API em `pages/api/cron/update-vestibulares.ts`:**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { vestibularScraperService } from '@/services/scrapers/vestibularScraper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar autenticação (Vercel Cron Secret)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = await vestibularScraperService.scrapAllSources();
    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Opção 3: GitHub Actions

**Vantagens:**
- ✅ Totalmente gratuito para repositórios públicos
- ✅ Confiável e bem documentado
- ✅ Flexível

**Configuração:**

Crie `.github/workflows/update-data.yml`:

```yaml
name: Update Vestibulares Data

on:
  schedule:
    - cron: '0 */6 * * *' # A cada 6 horas
  workflow_dispatch: # Permite execução manual

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run scraper
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: node scripts/run-scraper.js
```

---

## 🔍 Implementação de Web Scraping

### Bibliotecas Recomendadas

#### 1. Para Scraping Simples: Cheerio
```bash
pnpm add cheerio axios
```

**Exemplo:**
```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';

async function scrapEnem() {
  const { data } = await axios.get('https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem');
  const $ = cheerio.load(data);
  
  // Extrair datas
  const datas = $('.data-importante').map((i, el) => ({
    evento: $(el).find('.evento').text(),
    data: $(el).find('.data').text()
  })).get();
  
  return datas;
}
```

#### 2. Para Sites Dinâmicos: Puppeteer
```bash
pnpm add puppeteer
```

**Exemplo:**
```typescript
import puppeteer from 'puppeteer';

async function scrapDynamicSite() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://sisu.mec.gov.br');
  await page.waitForSelector('.cronograma');
  
  const data = await page.evaluate(() => {
    const eventos = [];
    document.querySelectorAll('.evento').forEach(el => {
      eventos.push({
        nome: el.querySelector('.nome').textContent,
        data: el.querySelector('.data').textContent
      });
    });
    return eventos;
  });
  
  await browser.close();
  return data;
}
```

### Boas Práticas de Scraping

```typescript
class EthicalScraper {
  private readonly USER_AGENT = 'EducaAcesso/1.0 (Projeto academico de TCC)';
  private readonly DELAY_MS = 2000;
  
  async scrape(url: string) {
    // 1. Verificar robots.txt
    const allowed = await this.checkRobotsTxt(url);
    if (!allowed) {
      throw new Error('Acesso negado por robots.txt');
    }
    
    // 2. Respeitar rate limiting
    await this.delay(this.DELAY_MS);
    
    // 3. Usar User-Agent apropriado
    const response = await fetch(url, {
      headers: { 'User-Agent': this.USER_AGENT }
    });
    
    // 4. Tratar erros gracefully
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.text();
  }
  
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 💾 Armazenamento no Supabase

### Schema do Banco de Dados

```sql
-- Tabela de vestibulares
CREATE TABLE vestibulares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nivel TEXT NOT NULL,
  
  -- Datas
  data_inscricao_inicio DATE,
  data_inscricao_fim DATE,
  data_prova_1 DATE,
  data_prova_2 DATE,
  data_resultado DATE,
  
  -- Informações
  taxa_inscricao DECIMAL(10,2),
  isencao_disponivel BOOLEAN DEFAULT false,
  link_oficial TEXT,
  link_edital TEXT,
  
  -- Metadados
  fonte_dados TEXT, -- 'API', 'Scraping', 'Manual'
  ultima_atualizacao TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de scraping
CREATE TABLE scraping_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fonte TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error'
  dados_coletados INTEGER,
  erro TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_vestibulares_instituicao ON vestibulares(instituicao);
CREATE INDEX idx_vestibulares_data_inscricao ON vestibulares(data_inscricao_fim);
CREATE INDEX idx_scraping_logs_timestamp ON scraping_logs(timestamp DESC);
```

### Operações UPSERT

```typescript
// Atualizar se existir, inserir se não existir
async function saveVestibular(data: VestibularData) {
  const { error } = await supabase
    .from('vestibulares')
    .upsert({
      nome: data.nome,
      instituicao: data.instituicao,
      // ... outros campos
    }, {
      onConflict: 'nome,instituicao', // Chave única composta
      ignoreDuplicates: false // Atualizar se existir
    });
    
  if (error) throw error;
}
```

---

## 📊 Monitoramento e Alertas

### Registrar Logs de Scraping

```typescript
async function logScrapingResult(result: ScrapingResult) {
  await supabase.from('scraping_logs').insert({
    fonte: result.fonte,
    status: result.sucesso ? 'success' : 'error',
    dados_coletados: result.dados?.length || 0,
    erro: result.erro
  });
}
```

### Enviar Alertas em Caso de Erro

```typescript
async function alertOnFailure(error: Error) {
  // Opção 1: Email via Supabase Edge Functions
  await supabase.functions.invoke('send-email', {
    body: {
      to: 'email-institucional-exemplo@dominio.com',
      subject: 'Erro no scraping de dados',
      text: `Erro: ${error.message}`
    }
  });
  
  // Opção 2: Webhook para Discord/Slack
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `⚠️ Erro no scraping: ${error.message}`
    })
  });
}
```

---

## 🧪 Testes

### Testar Scrapers Localmente

```typescript
// scripts/test-scraper.ts
import { vestibularScraperService } from './src/services/scrapers/vestibularScraper';

async function test() {
  console.log('Testando coleta de dados...');
  
  const result = await vestibularScraperService.scrapEnemData();
  
  if (result.sucesso) {
    console.log('✓ Sucesso!');
    console.log('Dados coletados:', result.dados);
  } else {
    console.error('✗ Erro:', result.erro);
  }
}

test();
```

---

## 📚 Recursos Adicionais

- [Guia de Web Scraping Legal](https://blog.apify.com/is-web-scraping-legal/)
- [Robots.txt Specification](https://www.robotstxt.org/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Cron Expression Generator](https://crontab.guru/)

---

## ❓ FAQ

**Q: É legal fazer scraping de sites governamentais?**  
A: Geralmente sim, especialmente se os dados são públicos. Mas sempre verifique os termos de uso e prefira APIs oficiais.

**Q: Com que frequência devo atualizar os dados?**  
A: Depende da fonte. Para datas de vestibulares, 1-2x por dia é suficiente. Para notas de corte do SISU, pode ser a cada hora durante o período de inscrições.

**Q: O que fazer se um site bloquear meu bot?**  
A: 1) Verifique se está respeitando robots.txt; 2) Adicione delays maiores; 3) Use um User-Agent apropriado; 4) Entre em contato com o site para pedir permissão.

**Q: Como lidar com mudanças na estrutura do site?**  
A: Implemente testes automatizados e monitoramento. Configure alertas para quando o scraping falhar.

**Q: Posso vender os dados coletados?**  
A: Não. Os dados são públicos e devem permanecer assim. O EDUCA ACESSO é um projeto social sem fins lucrativos.
