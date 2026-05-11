# API Services Layer

## Overview

Esta camada de serviços fornece uma abstração para acesso aos dados da aplicação. Atualmente utiliza dados mockados, mas foi projetada para facilitar a migração futura para um banco de dados real (Supabase).

## Estrutura

```
services/
  api/
    ├── types.ts                  # Tipos TypeScript compartilhados
    ├── vestibularesService.ts    # Serviço para gerenciar vestibulares
    ├── cursosService.ts          # Serviço para gerenciar cursos
    └── index.ts                  # Ponto de exportação central
```

## Uso nos Componentes

```typescript
import { vestibularesService, cursosService } from './services/api';

// Buscar todos os vestibulares
const { data, error } = await vestibularesService.getAllVestibulares();

// Filtrar vestibulares
const { data } = await vestibularesService.filterVestibulares({
  tipo: 'Nacional',
  inscricoesAbertas: true
});

// Buscar cursos por área
const { data } = await cursosService.filterCursos({
  area: 'Tecnologia'
});
```

## Migração para Supabase

### Passo 1: Conectar Supabase

1. Vá até **Make settings page**
2. Conecte seu projeto Supabase
3. Os arquivos de configuração serão criados automaticamente em `supabase/`

### Passo 2: Criar Tabelas no Supabase

Execute as seguintes queries no Supabase SQL Editor:

```sql
-- Tabela de Vestibulares
CREATE TABLE vestibulares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nivel TEXT NOT NULL,
  prazo TEXT NOT NULL,
  inscricoes_abertas BOOLEAN DEFAULT false,
  isencao_disponivel BOOLEAN DEFAULT false,
  acessibilidade TEXT[] DEFAULT '{}',
  descricao TEXT,
  passos TEXT[] DEFAULT '{}',
  documentos TEXT[] DEFAULT '{}',
  datas JSONB DEFAULT '[]',
  link_oficial TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cursos
CREATE TABLE cursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  plataforma TEXT NOT NULL,
  area TEXT NOT NULL,
  gratuito BOOLEAN DEFAULT true,
  duracao TEXT,
  nivel TEXT NOT NULL,
  descricao TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_vestibulares_tipo ON vestibulares(tipo);
CREATE INDEX idx_vestibulares_inscricoes ON vestibulares(inscricoes_abertas);
CREATE INDEX idx_cursos_area ON cursos(area);
CREATE INDEX idx_cursos_plataforma ON cursos(plataforma);
```

### Passo 3: Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE vestibulares ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (dados são públicos)
CREATE POLICY "Permitir leitura pública de vestibulares"
  ON vestibulares FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir leitura pública de cursos"
  ON cursos FOR SELECT
  TO public
  USING (true);
```

### Passo 4: Atualizar os Serviços

Substitua as implementações mockadas pelos clientes Supabase:

```typescript
// vestibularesService.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async getAllVestibulares(): Promise<ApiResponse<Vestibular[]>> {
  try {
    const { data, error } = await supabase
      .from('vestibulares')
      .select('*')
      .order('nome');

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Erro ao buscar vestibulares'
    };
  }
}
```

### Passo 5: Migrar Dados Mockados

Use o script de migração para popular o banco:

```typescript
// scripts/migrate-mock-data.ts
import { vestibulares, cursos } from '../src/app/data/mockData';

async function migrateMockData() {
  // Inserir vestibulares
  const { error: vestError } = await supabase
    .from('vestibulares')
    .insert(vestibulares);

  // Inserir cursos
  const { error: cursosError } = await supabase
    .from('cursos')
    .insert(cursos);
}
```

## Benefícios da Arquitetura

✅ **Separação de Responsabilidades**: Componentes não precisam conhecer a fonte de dados  
✅ **Fácil Testabilidade**: Pode-se mockar os serviços nos testes  
✅ **Migração Gradual**: Pode migrar um serviço por vez  
✅ **Type Safety**: TypeScript garante contratos bem definidos  
✅ **Manutenibilidade**: Mudanças na API afetam apenas a camada de serviços  

## Recursos Adicionais

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
