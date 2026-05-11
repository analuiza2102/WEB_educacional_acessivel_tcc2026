/**
 * Scheduler Service for Automated Data Collection
 *
 * Este serviço gerencia a execução periódica de coletas de dados.
 *
 * IMPLEMENTAÇÃO EM PRODUÇÃO:
 *
 * Opção 1 - Supabase Edge Functions + Cron (RECOMENDADO):
 * - Crie uma Edge Function no Supabase
 * - Use Supabase Cron Jobs para executar periodicamente
 * - Exemplo: https://supabase.com/docs/guides/functions/schedule-functions
 *
 * Opção 2 - Vercel Cron Jobs:
 * - Use Vercel Cron Jobs se hospedar na Vercel
 * - Exemplo: https://vercel.com/docs/cron-jobs
 *
 * Opção 3 - GitHub Actions:
 * - Use GitHub Actions scheduled workflows
 * - Gratuito e confiável para projetos open source
 *
 * Opção 4 - Node-cron (se tiver servidor próprio):
 * - Use biblioteca node-cron
 * - Requer servidor Node.js sempre ativo
 */

import { vestibularScraperService } from './vestibularScraper';

export interface ScheduledJob {
  id: string;
  nome: string;
  descricao: string;
  cronExpression: string; // Formato cron: "0 */6 * * *" = a cada 6 horas
  ultimaExecucao?: string;
  proximaExecucao?: string;
  ativo: boolean;
  handler: () => Promise<void>;
}

class SchedulerService {
  private jobs: Map<string, ScheduledJob> = new Map();

  /**
   * Registra um job agendado
   */
  registerJob(job: ScheduledJob): void {
    this.jobs.set(job.id, job);
    console.log(`Job registrado: ${job.nome}`);
  }

  /**
   * Job: Atualizar dados de vestibulares
   * Execução sugerida: A cada 6 horas
   */
  async updateVestibularesJob(): Promise<void> {
    console.log('[JOB] Iniciando coleta de dados de vestibulares...');

    try {
      const results = await vestibularScraperService.scrapAllSources();

      let sucessos = 0;
      let falhas = 0;

      for (const result of results) {
        if (result.sucesso && result.dados) {
          const saved = await vestibularScraperService.saveScrapedData(result.dados);
          if (saved) {
            sucessos++;
            console.log(`✓ Dados salvos: ${result.dados.nome}`);
          } else {
            falhas++;
            console.error(`✗ Erro ao salvar: ${result.dados.nome}`);
          }
        } else {
          falhas++;
          console.error(`✗ Erro na coleta: ${result.erro}`);
        }
      }

      console.log(`[JOB] Concluído - Sucessos: ${sucessos}, Falhas: ${falhas}`);

      // TODO: Enviar notificação se houver falhas
      // TODO: Registrar no histórico de execuções
    } catch (error) {
      console.error('[JOB] Erro fatal:', error);
      // TODO: Enviar alerta para administradores
    }
  }

  /**
   * Job: Verificar prazos próximos e enviar notificações
   * Execução sugerida: Diariamente às 8h
   */
  async checkDeadlinesJob(): Promise<void> {
    console.log('[JOB] Verificando prazos próximos...');

    try {
      // TODO: Buscar vestibulares com prazos nos próximos 7 dias
      // TODO: Enviar notificações para usuários inscritos
      // TODO: Criar alertas no sistema

      console.log('[JOB] Verificação de prazos concluída');
    } catch (error) {
      console.error('[JOB] Erro ao verificar prazos:', error);
    }
  }

  /**
   * Job: Limpar dados antigos
   * Execução sugerida: Semanalmente (domingo à meia-noite)
   */
  async cleanupOldDataJob(): Promise<void> {
    console.log('[JOB] Limpando dados antigos...');

    try {
      // TODO: Remover vestibulares com prazos vencidos há mais de 1 ano
      // TODO: Arquivar histórico de scraping antigo
      // TODO: Otimizar índices do banco de dados

      console.log('[JOB] Limpeza concluída');
    } catch (error) {
      console.error('[JOB] Erro na limpeza:', error);
    }
  }

  /**
   * Inicializa todos os jobs agendados
   */
  initializeJobs(): void {
    // Job 1: Atualizar vestibulares a cada 6 horas
    this.registerJob({
      id: 'update-vestibulares',
      nome: 'Atualizar Vestibulares',
      descricao: 'Coleta dados atualizados de ENEM, SISU, PROUNI, FUVEST',
      cronExpression: '0 */6 * * *', // A cada 6 horas
      ativo: true,
      handler: this.updateVestibularesJob.bind(this)
    });

    // Job 2: Verificar prazos diariamente às 8h
    this.registerJob({
      id: 'check-deadlines',
      nome: 'Verificar Prazos',
      descricao: 'Verifica prazos próximos e envia notificações',
      cronExpression: '0 8 * * *', // Todo dia às 8h
      ativo: true,
      handler: this.checkDeadlinesJob.bind(this)
    });

    // Job 3: Limpeza semanal aos domingos à meia-noite
    this.registerJob({
      id: 'cleanup-old-data',
      nome: 'Limpar Dados Antigos',
      descricao: 'Remove dados obsoletos e otimiza banco',
      cronExpression: '0 0 * * 0', // Domingo à meia-noite
      ativo: true,
      handler: this.cleanupOldDataJob.bind(this)
    });

    console.log(`✓ ${this.jobs.size} jobs inicializados`);
  }

  /**
   * Executa um job manualmente (útil para testes)
   */
  async runJobManually(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error(`Job não encontrado: ${jobId}`);
    }

    console.log(`Executando job manualmente: ${job.nome}`);
    await job.handler();
  }

  /**
   * Lista todos os jobs registrados
   */
  listJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();

/**
 * EXEMPLO DE IMPLEMENTAÇÃO COM SUPABASE EDGE FUNCTIONS
 *
 * 1. Crie um arquivo em supabase/functions/update-vestibulares/index.ts:
 *
 * import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 * import { vestibularScraperService } from "../../../src/app/services/scrapers/vestibularScraper.ts"
 *
 * serve(async (req) => {
 *   const results = await vestibularScraperService.scrapAllSources()
 *
 *   return new Response(
 *     JSON.stringify({ success: true, results }),
 *     { headers: { "Content-Type": "application/json" } }
 *   )
 * })
 *
 * 2. Configure o cron no Supabase Dashboard:
 *    - Vá em Functions > Cron Jobs
 *    - Adicione: "0 */6 * * *" para executar a cada 6 horas
 *    - Selecione a função update-vestibulares
 */
