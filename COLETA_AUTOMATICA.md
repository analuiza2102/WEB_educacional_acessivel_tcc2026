# 🤖 Sistema de Coleta Automática de Dados - EDUCA ACESSO

## 📋 Visão Geral

Este documento descreve o sistema completo de coleta automática de informações sobre vestibulares (ENEM, SISU, PROUNI, FUVEST, etc.) e o banco de provas anteriores implementado no EDUCA ACESSO.

---

## 🎯 Funcionalidades Implementadas

### ✅ 1. Coleta Automática de Dados de Vestibulares

**O que faz:**
- Coleta automaticamente datas de inscrição, provas e resultados
- Atualiza informações sobre isenção de taxas
- Monitora mudanças nos editais
- Identifica novos vestibulares

**Fontes de dados:**
- ✅ ENEM (INEP)
- ✅ SISU (MEC)
- ✅ PROUNI (MEC)
- ✅ FUVEST (USP)
- 🔄 Pode adicionar: UNICAMP, UNESP, outras universidades

**Localização dos arquivos:**
```
src/app/services/scrapers/
├── types.ts                    # Tipos TypeScript
├── vestibularScraper.ts        # Lógica de coleta
├── schedulerService.ts         # Agendamento de tarefas
└── README.md                   # Documentação técnica
```

### ✅ 2. Banco de Provas Anteriores

**O que oferece:**
- Acesso a provas de anos anteriores
- Filtros por instituição, ano, área
- Gabaritos oficiais
- Resoluções comentadas (quando disponíveis)
- Contador de downloads
- Links para sites oficiais

**Localização dos arquivos:**
```
src/app/services/api/
├── provasService.ts            # Serviço de gerenciamento de provas
└── index.ts                    # Exportações

src/app/pages/
└── BancoProvas.tsx             # Interface de usuário
```

---

## 🚀 Como Funciona

### Fluxograma do Sistema

```
┌──────────────────────────────────────────────┐
│         FONTES DE DADOS EXTERNAS             │
│  (Sites oficiais, APIs governamentais)       │
└──────────────────┬───────────────────────────┘
                   │
                   │ 1. Coleta automática (scrapers)
                   │    - A cada 6 horas
                   │    - Cron jobs / Edge Functions
                   ▼
┌──────────────────────────────────────────────┐
│           PROCESSAMENTO DE DADOS             │
│  - Validação                                 │
│  - Normalização                              │
│  - Detecção de mudanças                      │
└──────────────────┬───────────────────────────┘
                   │
                   │ 2. Armazenamento
                   ▼
┌──────────────────────────────────────────────┐
│           BANCO DE DADOS (Supabase)          │
│  - Vestibulares                              │
│  - Provas                                    │
│  - Logs de scraping                          │
└──────────────────┬───────────────────────────┘
                   │
                   │ 3. API / Consultas
                   ▼
┌──────────────────────────────────────────────┐
│           INTERFACE DO USUÁRIO               │
│  - Listagem de vestibulares                  │
│  - Banco de provas                           │
│  - Filtros e busca                           │
└──────────────────────────────────────────────┘
```

---

## 🔧 Implementação Técnica

### Fase 1: Estado Atual (Mock Data)

**✅ JÁ IMPLEMENTADO:**
- Estrutura completa de serviços
- Interfaces TypeScript
- Componentes de UI (páginas de Banco de Provas)
- Sistema de filtros e busca
- Dados mockados para demonstração

**Arquivos criados:**
- `vestibularScraper.ts` - Template de scrapers
- `schedulerService.ts` - Sistema de agendamento
- `provasService.ts` - Gerenciamento de provas
- `BancoProvas.tsx` - Interface de usuário
- Documentação completa

### Fase 2: Integração com Supabase (Próximo Passo)

**1. Conectar Supabase ao Make:**
```
1. Abra a Make settings page do seu projeto
2. Conecte seu projeto Supabase
3. Os arquivos de configuração serão criados automaticamente
```

**2. Criar Tabelas no Banco de Dados:**

Execute no Supabase SQL Editor:

```sql
-- Tabela de Vestibulares
CREATE TABLE vestibulares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nivel TEXT NOT NULL,
  
  -- Datas importantes
  data_inscricao_inicio DATE,
  data_inscricao_fim DATE,
  data_isencao_inicio DATE,
  data_isencao_fim DATE,
  data_prova_1 DATE,
  data_prova_2 DATE,
  data_resultado DATE,
  
  -- Informações adicionais
  taxa_inscricao DECIMAL(10,2),
  isencao_disponivel BOOLEAN DEFAULT false,
  acessibilidade TEXT[] DEFAULT '{}',
  
  -- Links
  link_oficial TEXT NOT NULL,
  link_edital TEXT,
  
  -- Metadados
  fonte_dados TEXT DEFAULT 'manual', -- 'api', 'scraping', 'manual'
  ultima_atualizacao TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(nome, instituicao)
);

-- Tabela de Provas
CREATE TABLE provas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  ano INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- '1ª Fase', '2ª Fase', 'Completa', etc.
  area TEXT,
  nivel TEXT NOT NULL,
  
  -- Arquivo
  formato TEXT DEFAULT 'pdf',
  url_arquivo TEXT, -- Supabase Storage URL
  url_oficial TEXT,
  
  -- Características
  gabarito BOOLEAN DEFAULT false,
  resolucao BOOLEAN DEFAULT false,
  numero_questoes INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  
  -- Estatísticas
  download_count INTEGER DEFAULT 0,
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Logs de Scraping
CREATE TABLE scraping_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fonte TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error', 'partial'
  dados_coletados INTEGER DEFAULT 0,
  erro TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_vestibulares_instituicao ON vestibulares(instituicao);
CREATE INDEX idx_vestibulares_data_inscricao ON vestibulares(data_inscricao_fim);
CREATE INDEX idx_provas_instituicao ON provas(instituicao);
CREATE INDEX idx_provas_ano ON provas(ano DESC);
CREATE INDEX idx_scraping_timestamp ON scraping_logs(timestamp DESC);

-- Row Level Security (RLS)
ALTER TABLE vestibulares ENABLE ROW LEVEL SECURITY;
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (leitura pública)
CREATE POLICY "Permitir leitura pública de vestibulares"
  ON vestibulares FOR SELECT TO public USING (true);

CREATE POLICY "Permitir leitura pública de provas"
  ON provas FOR SELECT TO public USING (true);
```

**3. Configurar Supabase Storage para Provas:**

```sql
-- Criar bucket para armazenar PDFs de provas
INSERT INTO storage.buckets (id, name, public)
VALUES ('provas', 'provas', true);

-- Política de acesso ao bucket
CREATE POLICY "Permitir download público de provas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'provas');
```

**4. Criar Supabase Edge Function:**

Crie `supabase/functions/update-vestibulares/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Coletar dados (exemplo com ENEM)
    const enemData = await collectEnemData();
    
    // Inserir ou atualizar no banco
    const { error } = await supabase
      .from('vestibulares')
      .upsert(enemData, {
        onConflict: 'nome,instituicao'
      });

    if (error) throw error;

    // Registrar log
    await supabase.from('scraping_logs').insert({
      fonte: 'ENEM',
      status: 'success',
      dados_coletados: 1
    });

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

**5. Configurar Cron Job no Supabase:**

No Supabase Dashboard:
1. Vá em **Functions** > **Cron Jobs**
2. Adicione nova tarefa:
   - Nome: "Atualizar Vestibulares"
   - Cron: `0 */6 * * *` (a cada 6 horas)
   - Função: `update-vestibulares`

---

## 📊 Monitoramento e Manutenção

### Dashboard de Monitoramento

Crie queries no Supabase para monitorar:

```sql
-- Últimas execuções de scraping
SELECT 
  fonte,
  status,
  dados_coletados,
  timestamp
FROM scraping_logs
ORDER BY timestamp DESC
LIMIT 20;

-- Taxa de sucesso por fonte
SELECT 
  fonte,
  COUNT(*) as total_execucoes,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as sucessos,
  ROUND(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 2) as taxa_sucesso
FROM scraping_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY fonte;

-- Vestibulares com prazo próximo
SELECT 
  nome,
  data_inscricao_fim,
  data_inscricao_fim - CURRENT_DATE as dias_restantes
FROM vestibulares
WHERE data_inscricao_fim BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY data_inscricao_fim;
```

### Alertas Automáticos

Configure alertas para:
- ❌ Falhas consecutivas de scraping
- 📅 Novos vestibulares adicionados
- ⏰ Prazos de inscrição próximos (7 dias)
- 📊 Atualizações de dados importantes

---

## 🎓 Banco de Provas - Aspectos Legais

### ✅ O que é LEGAL:

1. **Provas Públicas:**
   - ENEM (INEP disponibiliza oficialmente)
   - FUVEST (disponível no site oficial)
   - Provas de universidades públicas (geralmente disponibilizadas)

2. **Uso Permitido:**
   - Fins educacionais
   - Estudos e preparação
   - Sem fins lucrativos

3. **Como Fazer Corretamente:**
   - ✅ Link para site oficial (não hospedar sem permissão)
   - ✅ Dar crédito à instituição
   - ✅ Não modificar conteúdo
   - ✅ Respeitar direitos autorais

### ❌ O que NÃO fazer:

- ❌ Vender acesso às provas
- ❌ Modificar questões sem autorização
- ❌ Hospedar provas sem permissão da instituição
- ❌ Remover créditos da instituição

### 📋 Fontes Oficiais Recomendadas:

| Instituição | URL Oficial | Licença |
|-------------|-------------|---------|
| **ENEM** | https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos | Dados Abertos Governamentais |
| **FUVEST** | https://www.fuvest.br/provas-anteriores/ | Uso educacional permitido |
| **UNICAMP** | https://www.comvest.unicamp.br/vestibulares-anteriores/ | Uso educacional permitido |
| **UNESP** | https://www.vunesp.com.br/ | Verificar termos de uso |

---

## 🔮 Recursos Futuros

### Curto Prazo (1-3 meses)

- [ ] Sistema de notificações de prazos
- [ ] Calendário integrado de vestibulares
- [ ] Filtros avançados por região
- [ ] Sistema de favoritos para usuários

### Médio Prazo (3-6 meses)

- [ ] OCR para tornar provas pesquisáveis
- [ ] Sistema de questões separadas por tópico
- [ ] Estatísticas de desempenho em simulados
- [ ] Resolução de questões com IA (opcional)

### Longo Prazo (6-12 meses)

- [ ] Plataforma de simulados online
- [ ] Correção automática de redações com IA
- [ ] Sistema de mentoria peer-to-peer
- [ ] App mobile nativo

---

## 📞 Suporte e Contribuições

### Precisa de Ajuda?

- 📖 Leia a documentação em `src/app/services/scrapers/README.md`
- 📖 Consulte `src/app/services/README.md` para integração Supabase
- 🐛 Reporte bugs criando uma issue no GitHub
- 💡 Sugira melhorias

### Como Contribuir

1. **Adicionar novos vestibulares:**
   - Identifique vestibulares regionais relevantes
   - Implemente scraper seguindo template em `vestibularScraper.ts`
   - Teste localmente antes de submeter PR

2. **Adicionar provas:**
   - Verifique que a fonte é oficial e pública
   - Use o serviço `provasService.uploadProva()`
   - Preencha todos os metadados corretamente

3. **Melhorias de código:**
   - Siga os padrões estabelecidos
   - Adicione testes quando relevante
   - Documente mudanças significativas

---

## ⚖️ Aspectos Éticos e Responsabilidade Social

### Missão do EDUCA ACESSO

> "Democratizar o acesso à educação superior, removendo barreiras informacionais e tecnológicas para estudantes de baixa renda e pessoas com deficiência."

### Princípios Éticos

1. **Gratuidade Total:** Todos os recursos são 100% gratuitos
2. **Transparência:** Código aberto e dados públicos
3. **Acessibilidade:** WCAG 2.1 AA compliant
4. **Privacidade:** Não coletamos dados pessoais sem consentimento
5. **Veracidade:** Informações verificadas e atualizadas
6. **Inclusão:** Design para todos, sem discriminação

### Responsabilidade com os Dados

- ✅ Usar apenas dados públicos
- ✅ Respeitar robots.txt e termos de uso
- ✅ Não sobrecarregar servidores governamentais
- ✅ Citar fontes corretamente
- ✅ Manter dados atualizados
- ✅ Corrigir informações incorretas rapidamente

---

## 📚 Recursos e Referências

### Documentação Técnica
- [Supabase Documentation](https://supabase.com/docs)
- [Web Scraping Best Practices](https://www.scrapehero.com/web-scraping-best-practices/)
- [Cron Expression Guide](https://crontab.guru/)

### Aspectos Legais
- [Lei de Acesso à Informação](http://www.acessoainformacao.gov.br/)
- [Dados Abertos Governamentais](https://dados.gov.br/)
- [Diretrizes de Web Scraping](https://blog.apify.com/is-web-scraping-legal/)

### APIs Governamentais
- [Portal Dados Abertos](https://dados.gov.br/)
- [INEP Dados Abertos](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos)

---

## 🎉 Conclusão

O sistema de coleta automática e banco de provas do EDUCA ACESSO representa um avanço significativo na democratização do acesso à informação educacional no Brasil.

**Impacto Social Esperado:**
- 📈 Milhares de estudantes com acesso centralizado a informações
- ⏰ Redução de perda de prazos de inscrição
- 📚 Acesso gratuito a materiais de estudo de qualidade
- ♿ Informações sobre recursos de acessibilidade
- 💰 Orientação sobre isenção de taxas

**Próximos Passos:**
1. Conectar Supabase via Make settings
2. Criar tabelas no banco de dados
3. Implementar Edge Functions para scraping
4. Configurar cron jobs
5. Testar e monitorar

---

**Desenvolvido com ❤️ para democratizar a educação no Brasil**
