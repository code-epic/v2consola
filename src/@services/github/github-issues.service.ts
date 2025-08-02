import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Issue, RawIssue } from './interfaces/issue.interface';
import { ApiService } from '@services/apicore/api.service';

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

  constructor(private apiService: ApiService) {
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

  /**
   * Load issues from API
   * Extracted from IssuesComponent.getListIssues()
   */
  loadIssues(userId: string): Observable<Issue[]> {
    console.log('🚀 GitHubIssuesService: INICIANDO loadIssues()');
    console.log('📋 userId:', userId);
    console.log('📊 issues actuales length:', this.getIssuesCount());
    
    // Set loading state
    this.setLoading(true);
    this.setError(null);
    
    const fnx = {
      funcion: "Fnx_DatosServidorGitHub",
      id_cliente: userId
    };
    console.log('📤 Enviando al servicio:', fnx);
    
    return this.apiService.ExecFnx(fnx).pipe(
      map((data: any) => {
        console.log('Respuesta del servicio:', data);
        
        // Extract issues from different possible response structures
        let rawIssues: any[] = [];
        
        if (data && Array.isArray(data)) {
          console.log('🎯 Issues recibidas del servicio (array directo):', data.length);
          rawIssues = data;
        } else if (data && data.issues && Array.isArray(data.issues)) {
          console.log('🎯 Issues recibidas del servicio (data.issues):', data.issues.length);
          rawIssues = data.issues;
        } else if (data && data.contenido && Array.isArray(data.contenido)) {
          console.log('🎯 Issues recibidas del servicio (data.contenido):', data.contenido.length);
          rawIssues = data.contenido;
        } else if (data && data.contenido && data.contenido.issues && Array.isArray(data.contenido.issues)) {
          console.log('🎯 Issues recibidas del servicio (data.contenido.issues):', data.contenido.issues.length);
          rawIssues = data.contenido.issues;
        } else {
          console.warn('⚠️ Respuesta del servicio no contiene issues válidas:', data);
          console.log('🔍 Estructura de la respuesta:', Object.keys(data || {}));
          
          // Inspeccionar contenido en detalle
          if (data && data.contenido) {
            console.log('🔎 Inspeccionando data.contenido:', data.contenido);
            console.log('🔎 Tipo de data.contenido:', typeof data.contenido);
            console.log('🔎 Es array data.contenido:', Array.isArray(data.contenido));
            console.log('🔎 Keys de data.contenido:', Object.keys(data.contenido));
            
            // Intentar extraer de diferentes propiedades del contenido
            const contenido = data.contenido;
            if (contenido.issues && Array.isArray(contenido.issues)) {
              console.log('🎯 Issues encontradas en contenido.issues:', contenido.issues.length);
              rawIssues = contenido.issues;
            } else if (contenido.data && Array.isArray(contenido.data)) {
              console.log('🎯 Issues encontradas en contenido.data:', contenido.data.length);
              rawIssues = contenido.data;
            } else if (contenido.result && Array.isArray(contenido.result)) {
              console.log('🎯 Issues encontradas en contenido.result:', contenido.result.length);
              rawIssues = contenido.result;
            }
          }
        }
        
        // Process the issues if we found any
        if (rawIssues.length > 0) {
          return this.processIssues(rawIssues);
        } else {
          console.warn('⚠️ No se encontraron issues válidas, retornando array vacío');
          this.setLoading(false);
          return [];
        }
      }),
      catchError((error) => {
        console.error('❌ Error al obtener issues del servicio:', error);
        
        // Set error state
        this.setLoading(false);
        this.setError('Error al cargar issues: ' + error.message);
        
        // Return empty array on error
        return of([]);
      })
    );
  }
}
