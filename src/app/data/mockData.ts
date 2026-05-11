export interface Vestibular {
  id: string;
  nome: string;
  tipo: string;
  nivel: string;
  prazo: string;
  inscricoesAbertas: boolean;
  isencaoDisponivel: boolean;
  acessibilidade: string[];
  descricao: string;
  passos: string[];
  documentos: string[];
  datas: { evento: string; data: string }[];
  linkOficial: string;
}

export interface Curso {
  id: string;
  nome: string;
  plataforma: string;
  area: string;
  gratuito: boolean;
  duracao: string;
  nivel: string;
  descricao: string;
  link: string;
}

export const vestibulares: Vestibular[] = [
  {
    id: '1',
    nome: 'ENEM - Exame Nacional do Ensino Médio',
    tipo: 'Nacional',
    nivel: 'Ensino Superior',
    prazo: 'Inscrições: 15 de maio a 26 de maio de 2026',
    inscricoesAbertas: false,
    isencaoDisponivel: true,
    acessibilidade: ['Prova em Braille', 'Tempo adicional', 'Ledores', 'Intérprete de Libras'],
    descricao: 'O ENEM é a principal porta de entrada para o ensino superior no Brasil. Com a nota do ENEM você pode participar do SISU, PROUNI e FIES.',
    passos: [
      'Acesse o site do INEP no período de inscrições',
      'Crie ou acesse sua conta gov.br',
      'Preencha os dados pessoais e socioeconômicos',
      'Solicite isenção da taxa (se aplicável) ou pague a taxa de inscrição',
      'Informe se precisa de recursos de acessibilidade',
      'Confirme sua inscrição e guarde o número de inscrição'
    ],
    documentos: [
      'CPF',
      'Documento de identidade (RG ou CNH)',
      'Comprovante de residência',
      'Comprovante de renda familiar (para isenção)',
      'Laudo médico (para recursos de acessibilidade)'
    ],
    datas: [
      { evento: 'Inscrições', data: '15/05/2026 a 26/05/2026' },
      { evento: 'Solicitação de isenção', data: '01/04/2026 a 14/04/2026' },
      { evento: 'Primeiro dia de prova', data: '08/11/2026' },
      { evento: 'Segundo dia de prova', data: '15/11/2026' },
      { evento: 'Resultado', data: '13/01/2027' }
    ],
    linkOficial: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem'
  },
  {
    id: '2',
    nome: 'FUVEST - Universidade de São Paulo',
    tipo: 'Estadual',
    nivel: 'Ensino Superior',
    prazo: 'Inscrições: agosto de 2026',
    inscricoesAbertas: false,
    isencaoDisponivel: true,
    acessibilidade: ['Prova ampliada', 'Tempo adicional', 'Sala especial', 'Auxílio para leitura'],
    descricao: 'Vestibular da USP, uma das universidades mais prestigiadas do Brasil.',
    passos: [
      'Acesse o site da FUVEST no período de inscrições',
      'Cadastre-se no sistema',
      'Escolha o curso desejado',
      'Solicite isenção ou realize o pagamento',
      'Solicite atendimento especial se necessário',
      'Acompanhe a publicação dos locais de prova'
    ],
    documentos: [
      'CPF',
      'RG',
      'Certificado de conclusão do Ensino Médio',
      'Comprovante de renda (para isenção)',
      'Documentação médica (para atendimento especial)'
    ],
    datas: [
      { evento: 'Inscrições', data: 'Agosto/2026' },
      { evento: 'Primeira fase', data: 'Novembro/2026' },
      { evento: 'Segunda fase', data: 'Dezembro/2026 e Janeiro/2027' },
      { evento: 'Resultado', data: 'Fevereiro/2027' }
    ],
    linkOficial: 'https://www.fuvest.br'
  },
  {
    id: '3',
    nome: 'SISU - Sistema de Seleção Unificada',
    tipo: 'Nacional',
    nivel: 'Ensino Superior',
    prazo: 'Duas edições por ano: fevereiro e junho',
    inscricoesAbertas: false,
    isencaoDisponivel: false,
    acessibilidade: ['Sistema acessível', 'Compatível com leitores de tela'],
    descricao: 'O SISU utiliza a nota do ENEM para selecionar estudantes para vagas em instituições públicas de ensino superior.',
    passos: [
      'Tenha participado do ENEM mais recente',
      'Acesse o site do SISU no período de inscrições',
      'Faça login com sua conta gov.br',
      'Escolha até 2 opções de curso',
      'Acompanhe as notas de corte diariamente',
      'Confirme sua matrícula se for aprovado'
    ],
    documentos: [
      'Número de inscrição do ENEM',
      'CPF',
      'Documentos pessoais para matrícula'
    ],
    datas: [
      { evento: 'Inscrições 1ª edição', data: 'Fevereiro/2026' },
      { evento: 'Resultado 1ª edição', data: 'Fevereiro/2026' },
      { evento: 'Inscrições 2ª edição', data: 'Junho/2026' },
      { evento: 'Resultado 2ª edição', data: 'Julho/2026' }
    ],
    linkOficial: 'https://sisu.mec.gov.br'
  },
  {
    id: '4',
    nome: 'PROUNI - Programa Universidade para Todos',
    tipo: 'Nacional',
    nivel: 'Ensino Superior',
    prazo: 'Duas edições por ano',
    inscricoesAbertas: false,
    isencaoDisponivel: false,
    acessibilidade: ['Sistema acessível', 'Suporte online'],
    descricao: 'Programa do governo federal que oferece bolsas de estudo integrais e parciais em instituições privadas.',
    passos: [
      'Tenha participado do ENEM mais recente com nota mínima de 450 pontos',
      'Acesse o site do PROUNI',
      'Faça login com conta gov.br',
      'Escolha até 2 opções de curso',
      'Comprove as informações socioeconômicas se pré-selecionado',
      'Realize a matrícula na instituição'
    ],
    documentos: [
      'Nota do ENEM',
      'CPF',
      'Comprovante de renda familiar',
      'Certificado de conclusão do Ensino Médio',
      'Comprovante de residência'
    ],
    datas: [
      { evento: 'Inscrições 1º semestre', data: 'Janeiro/2026' },
      { evento: 'Resultado 1º semestre', data: 'Fevereiro/2026' },
      { evento: 'Inscrições 2º semestre', data: 'Junho/2026' },
      { evento: 'Resultado 2º semestre', data: 'Julho/2026' }
    ],
    linkOficial: 'https://acessounico.mec.gov.br/prouni'
  }
];

export const cursos: Curso[] = [
  {
    id: '1',
    nome: 'Introdução à Programação',
    plataforma: 'Coursera',
    area: 'Tecnologia',
    gratuito: true,
    duracao: '6 semanas',
    nivel: 'Iniciante',
    descricao: 'Aprenda os fundamentos da programação com Python.',
    link: 'https://www.coursera.org'
  },
  {
    id: '2',
    nome: 'Desenvolvimento Web Completo',
    plataforma: 'Fundação Bradesco',
    area: 'Tecnologia',
    gratuito: true,
    duracao: '40 horas',
    nivel: 'Intermediário',
    descricao: 'Curso completo de HTML, CSS e JavaScript.',
    link: 'https://www.ev.org.br'
  },
  {
    id: '3',
    nome: 'Primeiros Socorros',
    plataforma: 'AVAMEC',
    area: 'Saúde',
    gratuito: true,
    duracao: '20 horas',
    nivel: 'Iniciante',
    descricao: 'Aprenda técnicas básicas de primeiros socorros.',
    link: 'https://avamec.mec.gov.br'
  },
  {
    id: '4',
    nome: 'Gestão de Pequenos Negócios',
    plataforma: 'SEBRAE',
    area: 'Administração',
    gratuito: true,
    duracao: '30 horas',
    nivel: 'Intermediário',
    descricao: 'Gestão financeira e administrativa para empreendedores.',
    link: 'https://www.sebrae.com.br'
  },
  {
    id: '5',
    nome: 'Excel Básico ao Avançado',
    plataforma: 'Fundação Bradesco',
    area: 'Administração',
    gratuito: true,
    duracao: '35 horas',
    nivel: 'Todos os níveis',
    descricao: 'Domine o Excel do básico ao avançado.',
    link: 'https://www.ev.org.br'
  },
  {
    id: '6',
    nome: 'Inglês Online',
    plataforma: 'Duolingo',
    area: 'Idiomas',
    gratuito: true,
    duracao: 'Autoinstrucional',
    nivel: 'Todos os níveis',
    descricao: 'Aprenda inglês de forma interativa e gamificada.',
    link: 'https://www.duolingo.com'
  },
  {
    id: '7',
    nome: 'Marketing Digital',
    plataforma: 'Google Ateliê Digital',
    area: 'Marketing',
    gratuito: true,
    duracao: '40 horas',
    nivel: 'Iniciante',
    descricao: 'Fundamentos de marketing digital e redes sociais.',
    link: 'https://learndigital.withgoogle.com'
  },
  {
    id: '8',
    nome: 'Ciência de Dados com Python',
    plataforma: 'edX',
    area: 'Tecnologia',
    gratuito: true,
    duracao: '8 semanas',
    nivel: 'Intermediário',
    descricao: 'Análise de dados e visualização com Python.',
    link: 'https://www.edx.org'
  },
  {
    id: '9',
    nome: 'Preparação para o ENEM',
    plataforma: 'Me Salva!',
    area: 'Ensino Médio',
    gratuito: true,
    duracao: 'Contínuo',
    nivel: 'Ensino Médio',
    descricao: 'Videoaulas e exercícios para todas as disciplinas do ENEM.',
    link: 'https://www.mesalva.com'
  },
  {
    id: '10',
    nome: 'Libras Básico',
    plataforma: 'CursosOnlineSP',
    area: 'Acessibilidade',
    gratuito: true,
    duracao: '60 horas',
    nivel: 'Iniciante',
    descricao: 'Aprenda a Língua Brasileira de Sinais.',
    link: 'https://www.cursosonlinesp.sp.gov.br'
  },
  {
    id: '11',
    nome: 'Administração Financeira',
    plataforma: 'FGV',
    area: 'Administração',
    gratuito: true,
    duracao: '12 horas',
    nivel: 'Intermediário',
    descricao: 'Gestão financeira pessoal e empresarial.',
    link: 'https://educacao-executiva.fgv.br'
  },
  {
    id: '12',
    nome: 'Enfermagem: Cuidados Básicos',
    plataforma: 'AVAMEC',
    area: 'Saúde',
    gratuito: true,
    duracao: '40 horas',
    nivel: 'Iniciante',
    descricao: 'Técnicas básicas de cuidados de enfermagem.',
    link: 'https://avamec.mec.gov.br'
  }
];
