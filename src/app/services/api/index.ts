/**
 * API Services Index
 *
 * Central export point for all API services.
 * This provides a clean import structure for components.
 *
 * Usage in components:
 * import { vestibularesService, cursosService, provasService } from './services/api';
 */

export * from './types';
export { vestibularesService } from './vestibularesService';
export { cursosService } from './cursosService';
export { provasService } from './provasService';
export type { Prova, ProvaFilters, ProvaUpload } from './provasService';
