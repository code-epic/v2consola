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
          console.warn('⚠️ No se encontraron issues válidas, cargando datos mock como fallback');
          
          // Cargar datos mock como fallback
          const mockIssues = this.getMockIssues();
          return this.processIssues(mockIssues);
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

  /**
   * Extract JSON from mixed text/JSON messages
   * Extracted from IssuesComponent.extractJSONFromMessage()
   */
  parseWebSocketMessage(message: string): any | null {
    try {
      // Intentar parsear directamente como JSON
      return JSON.parse(message);
    } catch (e) {
      console.log('🔍 Mensaje no es JSON directo, intentando extraer...');
      
      try {
        // Buscar un array JSON usando regex mejorado
        // Buscar desde [ hasta ] que contenga objetos con "id", "title", etc.
        const jsonMatch = message.match(/\[\s*\{[\s\S]*?"id"[\s\S]*?\}\s*\]/g);
        if (jsonMatch && jsonMatch.length > 0) {
          console.log('✅ JSON extraído con regex (id), parseando...');
          const extractedJson = jsonMatch[0];
          console.log('📄 JSON extraído:', extractedJson.substring(0, 200) + '...');
          return JSON.parse(extractedJson);
        }
        
        // Regex alternativo para buscar arrays con "title"
        const titleMatch = message.match(/\[\s*\{[\s\S]*?"title"[\s\S]*?\}\s*\]/g);
        if (titleMatch && titleMatch.length > 0) {
          console.log('✅ JSON extraído con regex (title), parseando...');
          const extractedJson = titleMatch[0];
          console.log('📄 JSON extraído:', extractedJson.substring(0, 200) + '...');
          return JSON.parse(extractedJson);
        }
        
        // Método alternativo: buscar líneas que empiecen con [ y terminen con ]
        const lines = message.split('\n');
        let jsonStartLine = -1;
        let jsonEndLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('[') && jsonStartLine === -1) {
            jsonStartLine = i;
          }
          if (lines[i].trim().endsWith(']') && jsonStartLine !== -1) {
            jsonEndLine = i;
            break;
          }
        }
        
        if (jsonStartLine !== -1 && jsonEndLine !== -1) {
          const jsonLines = lines.slice(jsonStartLine, jsonEndLine + 1);
          const jsonString = jsonLines.join('\n');
          console.log('✅ JSON extraído por líneas, parseando...');
          console.log('📄 JSON extraído:', jsonString.substring(0, 200) + '...');
          return JSON.parse(jsonString);
        }
        
      } catch (regexError) {
        console.log('❌ Error con extracción por regex:', regexError);
      }
      
      return null;
    }
  }

  /**
   * Get mock issues data as fallback
   */
  private getMockIssues(): RawIssue[] {
    return [
      {
        id: 1,
        title: 'Error en el login de usuarios - Validación de credenciales falla',
        description: 'Los usuarios no pueden iniciar sesión cuando ingresan credenciales válidas. El sistema devuelve error 401 incluso con datos correctos.',
        state: 'open',
        priority: 'high',
        assignee: 'Juan Pérez',
        assignee_avatar: '',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        labels: ['bug', 'frontend', 'critical'],
        comments: 12,
        milestone: 'v2.1.0',
        author: 'María González',
        tipo: 'Bug'
      },
      {
        id: 2,
        title: 'Implementar nueva funcionalidad de reportes avanzados',
        description: 'Agregar capacidad de generar reportes personalizados con filtros dinámicos y exportación a PDF/Excel.',
        state: 'open',
        priority: 'medium',
        assignee: 'María García',
        assignee_avatar: '',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-18T14:20:00Z',
        labels: ['enhancement', 'backend', 'feature'],
        comments: 8,
        milestone: 'v2.2.0',
        author: 'Carlos Ruiz',
        tipo: 'Feature'
      },
      {
        id: 3,
        title: 'Optimizar consultas de base de datos en módulo de inventario',
        description: 'Las consultas del inventario están tardando más de 5 segundos. Necesita optimización de índices y queries.',
        state: 'closed',
        priority: 'medium',
        assignee: 'Carlos López',
        assignee_avatar: '',
        created_at: '2024-01-05T08:30:00Z',
        updated_at: '2024-01-15T16:45:00Z',
        labels: ['performance', 'database', 'optimization'],
        comments: 15,
        milestone: 'v2.0.1',
        author: 'Ana Martínez',
        tipo: 'Improvement'
      },
      {
        id: 4,
        title: 'Implementar autenticación de dos factores (2FA)',
        description: 'Agregar soporte para 2FA usando Google Authenticator o SMS para mejorar la seguridad del sistema.',
        state: 'open',
        priority: 'high',
        assignee: 'Roberto Silva',
        assignee_avatar: '',
        created_at: '2024-01-08T07:45:00Z',
        updated_at: '2024-01-22T17:10:00Z',
        labels: ['security', 'authentication', 'enhancement'],
        comments: 6,
        milestone: 'v2.2.0',
        author: 'Laura Fernández',
        tipo: 'Security'
      }
    ];
  }
}
