import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Issue, RawIssue } from './interfaces/issue.interface';

/**
 * Professional GitHub Issues Service
 * Handles GitHub issues data processing, state management, and business logic
 */
@Injectable({
  providedIn: 'root'
})
export class GitHubIssuesService {

  // Reactive state management
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public issues$ = this.issuesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    console.log('🚀 GitHubIssuesService initialized');
  }

  /**
   * Process GitHub Issues received from WebSocket or API
   * Extracted from IssuesComponent.processGitHubIssues()
   */
  processIssues(rawIssues: RawIssue[]): Issue[] {
    console.log('🔄 GitHubIssuesService: Procesando issues recibidas:', rawIssues);
    
    const processedIssues: Issue[] = [];
    
    rawIssues.forEach((rawIssue, index) => {
      try {
        // ✨ NUEVA ESTRUCTURA: Usar directamente los campos del servicio enriquecido
        const issue: Issue = {
          // Campos principales
          id: rawIssue.id || index + 1,
          number: rawIssue.id || index + 1, // Usar id como number
          title: rawIssue.title || 'Sin título',
          description: rawIssue.description || '',
          state: (rawIssue.state as 'open' | 'closed') || 'open',
          
          // Campos de prioridad y tipo
          priority: this.mapPriorityFromLabel(rawIssue.labels?.[0] || rawIssue.priority || 'medium'),
          tipo: rawIssue.tipo || 'Bug',
          
          // Campos de asignación
          assignee: rawIssue.assignee || null,
          assignee_avatar: rawIssue.assignee_avatar || '',
          author: rawIssue.author || 'externosandra',
          
          // Fechas (usar las reales del servicio)
          created_at: rawIssue.created_at || new Date().toISOString(),
          updated_at: rawIssue.updated_at || new Date().toISOString(),
          
          // Metadatos
          labels: rawIssue.labels || [],
          comments: rawIssue.comments || 0,
          milestone: rawIssue.milestone || null,
          
          // Campos legacy para compatibilidad
          body: rawIssue.description || '',
          user: {
            login: rawIssue.author || 'externosandra'
          }
        };
        
        processedIssues.push(issue);
        
        // Mostrar cada issue en consola con formato legible
        console.log(`📋 Issue #${issue.id}:`, {
          título: issue.title,
          estado: issue.state,
          prioridad: issue.priority,
          asignado: issue.assignee,
          autor: issue.author,
          tipo: issue.tipo,
          comentarios: issue.comments
        });
        
      } catch (error) {
        console.error(`❌ Error procesando issue ${index}:`, error, rawIssue);
      }
    });
    
    // Mostrar resumen final
    console.log(`✅ Total de issues procesadas: ${processedIssues.length}`);
    console.log('📊 Resumen por estado:', {
      abiertas: processedIssues.filter(i => i.state === 'open').length,
      cerradas: processedIssues.filter(i => i.state === 'closed').length
    });
    console.log('📊 Resumen por prioridad:', {
      alta: processedIssues.filter(i => i.priority === 'high').length,
      media: processedIssues.filter(i => i.priority === 'medium').length,
      baja: processedIssues.filter(i => i.priority === 'low').length
    });
    
    // Actualizar el estado reactivo
    this.issuesSubject.next(processedIssues);
    this.setLoading(false);
    this.setError(null);
    
    return processedIssues;
  }

  /**
   * Map priority from label or priority field
   * Extracted from IssuesComponent.mapPriorityFromLabel()
   */
  private mapPriorityFromLabel(labelOrPriority: string): 'high' | 'medium' | 'low' {
    if (!labelOrPriority) return 'medium';
    
    const priority = labelOrPriority.toLowerCase();
    
    // Mapear desde etiquetas en español
    if (priority.includes('alta') || priority.includes('high')) {
      return 'high';
    } else if (priority.includes('baja') || priority.includes('low')) {
      return 'low';
    } else if (priority.includes('media') || priority.includes('medium')) {
      return 'medium';
    }
    
    // Mapear desde valores directos
    if (priority === 'high' || priority === 'alta') return 'high';
    if (priority === 'low' || priority === 'baja') return 'low';
    
    return 'medium'; // Default
  }

  /**
   * Get current issues synchronously
   */
  getCurrentIssues(): Issue[] {
    return this.issuesSubject.value;
  }

  /**
   * Clear all issues
   */
  clearIssues(): void {
    this.issuesSubject.next([]);
    console.log('🧹 Issues cleared');
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  /**
   * Get issues count
   */
  getIssuesCount(): number {
    return this.issuesSubject.value.length;
  }
}
