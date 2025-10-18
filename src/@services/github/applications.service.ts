import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { ApiService } from '../apicore/api.service';
import { Application, RawApplication } from './interfaces/application.interface';

/**
 * ApplicationsService - Professional service for GitHub applications management
 * 
 * Features:
 * - Reactive state management with BehaviorSubjects
 * - Intelligent caching with expiration
 * - Robust data transformation with fallbacks
 * - Error handling with mock data as backup
 * - Reactive filtering and search
 * - Detailed logging for debugging
 * - Synchronous methods for direct state access
 */
@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  // Reactive state management
  private applicationsSubject = new BehaviorSubject<Application[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private selectedApplicationSubject = new BehaviorSubject<Application | null>(null);

  // Public observables
  public applications$ = this.applicationsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public selectedApplication$ = this.selectedApplicationSubject.asObservable();

  // Cache management
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes
  private lastFetchTime = 0;

  constructor(private apiService: ApiService) {
    console.log('🚀 ApplicationsService initialized');
  }

  /**
   * Load applications from API with intelligent caching
   */
  loadApplications(userId: string): Observable<Application[]> {
    console.log('🔄 Cargando aplicaciones...');
    
    // Check cache validity
    const now = Date.now();
    if (now - this.lastFetchTime < this.cacheExpiration && this.applicationsSubject.value.length > 0) {
      console.log('📦 Usando aplicaciones desde cache');
      return this.applications$;
    }

    this.setLoading(true);
    this.setError(null);

    const fnx = {
      funcion: "Fnx_ListaAplicacionGitea",
      id_cliente: userId
    };
    console.log('📤 Enviando al servicio:', fnx);

    return this.apiService.ExecFnx(fnx).pipe(
      switchMap((response: any) => {
        console.log('📡 Respuesta del servidor para aplicaciones:', response);
        return this.extractApplicationsFromResponse(response);
      }),
      tap((applications: Application[]) => {
        console.log(`✅ ${applications.length} aplicaciones cargadas y procesadas`);
        this.applicationsSubject.next(applications);
        this.setLoading(false);
        this.lastFetchTime = Date.now();
      }),
      catchError((error) => {
        console.error('❌ Error al cargar aplicaciones:', error);
        this.setLoading(false);
        this.setError('Error al cargar aplicaciones: ' + error.message);
        
        // Return mock data as fallback
        const mockApplications = this.getMockApplications();
        const processedMockApps = this.processApplications(mockApplications);
        this.applicationsSubject.next(processedMockApps);
        return of(processedMockApps);
      })
    );
  }

  /**
   * Extract applications from API response with multiple fallback strategies
   */
  private extractApplicationsFromResponse(response: any): Observable<Application[]> {
    return of(response).pipe(
      map((data: any) => {
        console.log('🔍 Analizando respuesta para extraer aplicaciones...');
        let rawApplications: any[] = [];

        // Strategy 1: Direct array
        if (Array.isArray(data)) {
          console.log('📋 Datos son array directo:', data.length);
          rawApplications = data;
        }
        // Strategy 2: Response with data property
        else if (data && data.data && Array.isArray(data.data)) {
          console.log('📋 Aplicaciones encontradas en data.data:', data.data.length);
          rawApplications = data.data;
        }
        // Strategy 3: Response with contenido property
        else if (data && data.contenido) {
          console.log('🔎 Inspeccionando data.contenido para aplicaciones...');
          const contenido = data.contenido;
          
          if (Array.isArray(contenido)) {
            console.log('📋 Contenido es array directo:', contenido.length);
            rawApplications = contenido;
          } else if (contenido.aplicaciones && Array.isArray(contenido.aplicaciones)) {
            console.log('📋 Aplicaciones encontradas en contenido.aplicaciones:', contenido.aplicaciones.length);
            rawApplications = contenido.aplicaciones;
          } else if (contenido.data && Array.isArray(contenido.data)) {
            console.log('📋 Aplicaciones encontradas en contenido.data:', contenido.data.length);
            rawApplications = contenido.data;
          }
        }

        // Process applications if found
        if (rawApplications.length > 0) {
          console.log('✅ Aplicaciones válidas encontradas, procesando...');
          return this.processApplications(rawApplications);
        } else {
          console.warn('⚠️ No se encontraron aplicaciones válidas en la respuesta del servidor');
          console.log('🔍 Estructura de la respuesta completa:', JSON.stringify(data, null, 2));
          console.warn('📦 Cargando datos mock como fallback');
          const mockApplications = this.getMockApplications();
          return this.processApplications(mockApplications);
        }
      })
    );
  }

  /**
   * Process raw applications data into strongly typed Application objects
   * Extracted from IssuesComponent.processAplicaciones()
   */
  processApplications(rawApplications: RawApplication[]): Application[] {
    console.log(`🔄 Procesando ${rawApplications.length} aplicaciones...`);
    const processedApplications: Application[] = [];

    // Friendly names mapping for better UX
    const friendlyNames: { [key: string]: string } = {
      'fideicomiso': 'Fideicomiso - Code Epic',
      'gdoc': 'Gestión de Documentos', 
      'nomina': 'Nómina Empresarial',
      'sandra_cli': 'Sandra CLI',
      'v2consola': 'V2 Consola',
      'inventario': 'Sistema de Inventario',
      'cmpdivisas': 'Componente Divisas',
      'cmpfood': 'Componente Food',
      'sandra-enterprise': 'Sandra Enterprise',
      'wkfsolicitudes': 'Workflow Solicitudes',
      'ipostel': 'Sistema Ipostel',
      'app.te-escucha': 'App Te Escucha',
      'inea.app.movil': 'INEA App Móvil'
    };

    rawApplications.forEach((rawApp, index) => {
      try {
        const rawName = rawApp.name || rawApp.full_name || `App ${index + 1}`;
        const application: Application = {
          id: rawApp.id || index + 1,
          name: friendlyNames[rawName] || rawName, // Use friendly name if available
          description: rawApp.description || 'Sin descripción',
          owner: rawApp.owner || 'code-epic',
          repository: rawApp.repository || rawApp.name || `repo-${index + 1}`,
          language: rawApp.language || 'JavaScript',
          stars: rawApp.stars || rawApp.stargazers_count || 0,
          forks: rawApp.forks || rawApp.forks_count || 0,
          issues_count: rawApp.issues_count || rawApp.open_issues_count || 0,
          pull_requests: rawApp.pull_requests || 0,
          last_updated: rawApp.last_updated || rawApp.updated_at || rawApp.pushed_at || new Date().toISOString(),
          created_at: rawApp.created_at || new Date().toISOString(),
          status: this.mapStatus(rawApp.status),
          visibility: rawApp.private ? 'private' : (rawApp.visibility as 'public' | 'private' || 'public'),
          topics: rawApp.topics || [],
          homepage: rawApp.homepage,
          license: rawApp.license,
          size: rawApp.size || 0,
          default_branch: rawApp.default_branch || 'main',
          has_issues: rawApp.has_issues ?? true,
          has_projects: rawApp.has_projects ?? true,
          has_wiki: rawApp.has_wiki ?? true
        };

        processedApplications.push(application);
      } catch (error) {
        console.error(`❌ Error procesando aplicación ${index}:`, error, rawApp);
      }
    });

    console.log(`✅ ${processedApplications.length} aplicaciones procesadas exitosamente`);
    return processedApplications;
  }

  /**
   * Check if data represents application information
   * Extracted from IssuesComponent.isApplicationData()
   */
  isApplicationData(item: any): boolean {
    if (!item || typeof item !== 'object') {
      return false;
    }

    // FIRST: Check if it's clearly an ISSUE (not an application)
    const issueFields = ['title', 'description', 'state', 'priority', 'assignee', 'labels', 'comments'];
    const hasIssueFields = issueFields.some(field => 
      item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
    );
    
    if (hasIssueFields) {
      console.log(`🔍 isApplicationData result: false (detected as ISSUE)`, { item: Object.keys(item) });
      return false; // It's an issue, not an application
    }

    // SECOND: Check for application-specific properties
    const applicationFields = ['full_name', 'repository'];
    const hasApplicationFields = applicationFields.some(field => 
      item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
    );

    // Additional checks for GitHub-specific repository fields
    const hasGitHubRepoFields = item.hasOwnProperty('stargazers_count') || 
                               item.hasOwnProperty('forks_count') || 
                               (item.hasOwnProperty('html_url') && !item.hasOwnProperty('title'));

    const result = hasApplicationFields || hasGitHubRepoFields;
    console.log(`🔍 isApplicationData result: ${result}`, { 
      item: Object.keys(item),
      hasApplicationFields,
      hasGitHubRepoFields,
      hasIssueFields
    });
    return result;
  }

  /**
   * Map status from various formats to standardized values
   */
  private mapStatus(status: any): 'active' | 'inactive' | 'archived' {
    if (!status) return 'active';
    
    const statusStr = status.toString().toLowerCase();
    if (statusStr.includes('archive')) return 'archived';
    if (statusStr.includes('inactive') || statusStr.includes('disabled')) return 'inactive';
    return 'active';
  }

  /**
   * Set applications directly (for WebSocket updates)
   */
  setApplications(applications: Application[]): void {
    console.log(`📝 Actualizando aplicaciones directamente: ${applications.length}`);
    this.applicationsSubject.next(applications);
    this.lastFetchTime = Date.now(); // Update cache timestamp
  }

  /**
   * Set selected application
   */
  setSelectedApplication(application: Application | null): void {
    console.log('🎯 Aplicación seleccionada:', application?.name || 'ninguna');
    this.selectedApplicationSubject.next(application);
  }

  /**
   * Clear all applications
   */
  clearApplications(): void {
    console.log('🧹 Limpiando aplicaciones...');
    this.applicationsSubject.next([]);
    this.setSelectedApplication(null);
  }

  /**
   * Filter applications by search term
   */
  filterApplications(searchTerm: string): Observable<Application[]> {
    return this.applications$.pipe(
      map(applications => 
        applications.filter(app => 
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.owner.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  // Utility methods for state management
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  // Synchronous getters for direct state access
  getCurrentApplications(): Application[] {
    return this.applicationsSubject.value;
  }

  getSelectedApplication(): Application | null {
    return this.selectedApplicationSubject.value;
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  getError(): string | null {
    return this.errorSubject.value;
  }

  /**
   * Get mock applications data as fallback
   */
  private getMockApplications(): RawApplication[] {
    return [
      {
        id: 1,
        name: 'consola-frontend',
        description: 'Frontend principal de la consola administrativa con Angular y Bootstrap',
        owner: 'code-epic',
        repository: 'consola-frontend',
        language: 'TypeScript',
        stars: 45,
        forks: 12,
        issues_count: 8,
        pull_requests: 3,
        last_updated: '2024-01-20T14:30:00Z',
        created_at: '2023-06-15T09:00:00Z',
        status: 'active',
        visibility: 'private',
        topics: ['angular', 'typescript', 'bootstrap', 'frontend'],
        size: 2048,
        default_branch: 'main',
        has_issues: true,
        has_projects: true,
        has_wiki: false
      },
      {
        id: 2,
        name: 'api-gateway',
        description: 'Gateway principal para microservicios con autenticación y rate limiting',
        owner: 'code-epic',
        repository: 'api-gateway',
        language: 'Node.js',
        stars: 32,
        forks: 8,
        issues_count: 5,
        pull_requests: 1,
        last_updated: '2024-01-18T16:45:00Z',
        created_at: '2023-08-10T11:30:00Z',
        status: 'active',
        visibility: 'private',
        topics: ['nodejs', 'express', 'microservices', 'api'],
        size: 1536,
        default_branch: 'main',
        has_issues: true,
        has_projects: false,
        has_wiki: true
      },
      {
        id: 3,
        name: 'data-processor',
        description: 'Procesador de datos en tiempo real con Apache Kafka y Redis',
        owner: 'code-epic',
        repository: 'data-processor',
        language: 'Python',
        stars: 28,
        forks: 6,
        issues_count: 12,
        pull_requests: 2,
        last_updated: '2024-01-15T10:20:00Z',
        created_at: '2023-09-05T14:15:00Z',
        status: 'active',
        visibility: 'private',
        topics: ['python', 'kafka', 'redis', 'data-processing'],
        size: 1024,
        default_branch: 'develop',
        has_issues: true,
        has_projects: true,
        has_wiki: true
      },
      {
        id: 4,
        name: 'mobile-app',
        description: 'Aplicación móvil híbrida con React Native para iOS y Android',
        owner: 'code-epic',
        repository: 'mobile-app',
        language: 'JavaScript',
        stars: 18,
        forks: 4,
        issues_count: 6,
        pull_requests: 0,
        last_updated: '2024-01-12T08:30:00Z',
        created_at: '2023-10-20T13:45:00Z',
        status: 'inactive',
        visibility: 'private',
        topics: ['react-native', 'mobile', 'ios', 'android'],
        size: 768,
        default_branch: 'main',
        has_issues: true,
        has_projects: false,
        has_wiki: false
      }
    ];
  }
}
