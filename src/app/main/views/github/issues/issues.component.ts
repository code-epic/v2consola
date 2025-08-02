import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { SessionService } from '@services/util/session.service';
import { GitHubIssuesService } from '@services/github/github-issues.service';
import { ApplicationsService } from '@services/github/applications.service';
import { Issue } from '@services/github/interfaces/issue.interface';
import { Application } from '@services/github/interfaces/application.interface';
@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent implements OnInit, OnDestroy {

  // Destroy subject for subscription management
  private destroy$ = new Subject<void>();

  // Content Header
  public contentHeader: object;
  private sessionMessagesSub: Subscription | undefined;
  private sessionStatusSub: Subscription | undefined;
  
  // Data
  public lstAplicaciones: any[] = [];
  public aplicacionSeleccionada: any = null;
  public searchValue: string = '';
  public basicSelectedOption: number = 10;
  public showIssuesTable: boolean = false;
  public selectedIssue: any = null;
  public showDetailView: boolean = false;
  userId: string = '';

  // Reactive observables from services
  public issues$: Observable<Issue[]>;
  public loadingIssues$: Observable<boolean>;
  public errorIssues$: Observable<string | null>;
  
  public applications$: Observable<Application[]>;
  public loadingApplications$: Observable<boolean>;
  public errorApplications$: Observable<string | null>;

  // Datatable
  public ColumnMode = ColumnMode;

  // Lista de aplicaciones (datos reales del servicio)
  aplicaciones: any[] = [];
  
  // Estados de carga
  loadingAplicaciones = false;
  errorLoadingAplicaciones = false;
  loadingIssues = false;
  errorLoadingIssues = false;

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService, 
    private sessionService: SessionService,
    private githubIssuesService: GitHubIssuesService,
    private applicationsService: ApplicationsService
  ) {
    // Initialize reactive observables from services
    this.issues$ = this.githubIssuesService.issues$;
    this.loadingIssues$ = this.githubIssuesService.loading$;
    this.errorIssues$ = this.githubIssuesService.error$;
    
    // Initialize applications observables
    this.applications$ = this.applicationsService.applications$;
    this.loadingApplications$ = this.applicationsService.loading$;
    this.errorApplications$ = this.applicationsService.error$;
    
    // Subscribe to applications changes for automatic UI updates
    this.applications$.pipe(takeUntil(this.destroy$)).subscribe(applications => {
      console.log(`🔄 Aplicaciones actualizadas automáticamente: ${applications.length}`);
      // Update local arrays for template compatibility
      this.aplicaciones = applications;
      this.lstAplicaciones = applications;
      console.log('🎯 UI actualizada con aplicaciones:', applications.slice(0, 3).map(app => app.name));
    });
  }

  ngOnInit(): void {
    this.userId = this.getUserId();
    console.log("llego");
    
    // Connect to WebSocket with userId
    this.sessionService.connect(this.userId);
    
    // Esperar 2 segundos para que se establezca la conexión WebSocket antes de cargar aplicaciones
    setTimeout(() => {
      console.log('🔌 Conexión WebSocket establecida, cargando aplicaciones...');
      this.getListAplicaciones();
    }, 2000);
    
    // No cargar issues automáticamente - solo mostrar cards
    // Subscribe to WebSocket messages
    this.sessionMessagesSub = this.sessionService.messages$.subscribe((msg) => {
      console.log("WebSocket message received:", msg);
      let parsedMsg: any;
      try {
        parsedMsg = typeof msg === 'string' ? JSON.parse(msg) : msg;
      } catch (e) {
        console.error('WebSocket message is not valid JSON:', msg);
        return;
      }

      console.log('Parsed WebSocket message:', parsedMsg);
      
      if (parsedMsg && parsedMsg.message) {
        // Parsear el mensaje interno que viene como string JSON
        let innerMessage: any;
        try {
          innerMessage = typeof parsedMsg.message === 'string' ? JSON.parse(parsedMsg.message) : parsedMsg.message;
          
          // Detectar si son aplicaciones o issues
          if (innerMessage && Array.isArray(innerMessage)) {
            // Verificar si el primer elemento parece una aplicación o un issue
            const firstItem = innerMessage[0];
            if (firstItem && this.applicationsService.isApplicationData(firstItem)) {
              console.log('🏢 Aplicaciones recibidas por WebSocket:', innerMessage.length);
              console.log('🔄 Procesando aplicaciones con el servicio');
              const processedApps = this.applicationsService.processApplications(innerMessage);
              this.applicationsService.setApplications(processedApps);
            } else {
              console.log('🎯 Issues recibidas del servidor:', innerMessage.length);
              this.processGitHubIssues(innerMessage);
            }
          } else if (innerMessage && innerMessage.issues && Array.isArray(innerMessage.issues)) {
            console.log('🎯 Issues recibidas del servidor:', innerMessage.issues.length);
            this.processGitHubIssues(innerMessage.issues);
          } else if (innerMessage && innerMessage.aplicaciones && Array.isArray(innerMessage.aplicaciones)) {
            console.log('🏢 Aplicaciones recibidas por WebSocket:', innerMessage.aplicaciones.length);
            const processedApps = this.applicationsService.processApplications(innerMessage.aplicaciones);
            this.applicationsService.setApplications(processedApps);
          } else {
            console.log('📄 Mensaje del servidor:', innerMessage);
          }
          
        } catch (e) {
          console.error('Inner message is not valid JSON:', parsedMsg.message);
          
          // Intentar extraer JSON de un mensaje mixto (texto + JSON) usando el servicio
          const jsonMatch = this.githubIssuesService.parseWebSocketMessage(parsedMsg.message);
          if (jsonMatch) {
            console.log('🔧 JSON extraído de mensaje mixto');
            if (Array.isArray(jsonMatch)) {
              // Detectar si son aplicaciones o issues también en el JSON extraído
              const firstItem = jsonMatch[0];
              if (firstItem && this.applicationsService.isApplicationData(firstItem)) {
                console.log('🏢 Aplicaciones extraídas del mensaje:', jsonMatch.length);
                const processedApps = this.applicationsService.processApplications(jsonMatch);
                this.applicationsService.setApplications(processedApps);
              } else {
                console.log('🎯 Issues extraídas del mensaje:', jsonMatch.length);
                this.processGitHubIssues(jsonMatch);
              }
            } else if (jsonMatch.issues && Array.isArray(jsonMatch.issues)) {
              console.log('🎯 Issues extraídas del mensaje:', jsonMatch.issues.length);
              this.processGitHubIssues(jsonMatch.issues);
            } else if (jsonMatch.aplicaciones && Array.isArray(jsonMatch.aplicaciones)) {
              console.log('🏢 Aplicaciones extraídas del mensaje:', jsonMatch.aplicaciones.length);
              const processedApps = this.applicationsService.processApplications(jsonMatch.aplicaciones);
              this.applicationsService.setApplications(processedApps);
            }
          } else {
            // Si no es JSON, tratarlo como texto plano para compatibilidad
            innerMessage = { mensaje: parsedMsg.message };
            console.log('📄 Mensaje de texto:', innerMessage.mensaje);
          }
        }
      }
    });
    // Content header configuration
    this.contentHeader = {
      headerTitle: 'GitHub Issues',
      actionText: '',
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Inicio',
            isLink: false
          }
        ]
      }
    };

    // Inicializar en modo cards (no cargar tabla automáticamente)
    this.showIssuesTable = false;
    console.log('🏠 Módulo iniciado - Mostrando cards de aplicaciones');
  }

  /**
   * Select Application
   */
  seleccionarAplicacion(aplicacion: any): void {
    console.log('🎨 Aplicación seleccionada:', aplicacion.name);
    console.log('🔍 DEBUG - Estado antes de selección:');
    console.log('  - showIssuesTable:', this.showIssuesTable);
    console.log('  - loadingIssues:', this.loadingIssues);
    console.log('  - aplicacionSeleccionada:', this.aplicacionSeleccionada?.name || 'ninguna');
    
    this.aplicacionSeleccionada = aplicacion;
    
    // Mostrar estado de carga
    this.loadingIssues = true;
    this.errorLoadingIssues = false;
    this.showIssuesTable = true; // Mostrar la tabla inmediatamente con loading
    
    console.log('🔍 DEBUG - Estado después de selección:');
    console.log('  - showIssuesTable:', this.showIssuesTable);
    console.log('  - loadingIssues:', this.loadingIssues);
    console.log('  - aplicacionSeleccionada:', this.aplicacionSeleccionada?.name);
    
    // Limpiar issues anteriores usando el servicio
    this.githubIssuesService.clearIssues();
    
    console.log('🚀 Cargando issues para la aplicación seleccionada...');
    console.log('⏳ Estado de carga activado');
    
    // Cargar issues
    this.getListIssues();
  }

  /**
   * Load Issues (Mock data for now)
   */
  cargarIssues(): void {
    console.log('⚠️ cargarIssues() llamado - Cargando datos mock como fallback');
    
    // Solo cargar mock si NO hay datos del servicio
    const currentIssues = this.githubIssuesService.getCurrentIssues();
    if (currentIssues.length === 0) {
      console.log('📝 Cargando datos mock como fallback');
      // Mock issues data - More realistic and complete
      const mockIssues = [
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
        title: 'Actualizar documentación de API REST v2',
        description: 'La documentación actual no refleja los cambios realizados en la API v2. Actualizar Swagger y ejemplos.',
        state: 'open',
        priority: 'low',
        assignee: 'Ana Martínez',
        assignee_avatar: '',
        created_at: '2024-01-12T11:15:00Z',
        updated_at: '2024-01-19T13:25:00Z',
        labels: ['documentation', 'api'],
        comments: 3,
        milestone: 'v2.1.0',
        author: 'Juan Pérez',
        tipo: 'Documentation'
      },
      {
        id: 5,
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
      },
      {
        id: 6,
        title: 'Error de memoria en procesamiento de archivos grandes',
        description: 'El sistema se queda sin memoria al procesar archivos superiores a 100MB. Implementar procesamiento por chunks.',
        state: 'open',
        priority: 'medium',
        assignee: 'Diego Torres',
        assignee_avatar: '',
        created_at: '2024-01-14T12:30:00Z',
        updated_at: '2024-01-21T18:15:00Z',
        labels: ['bug', 'performance', 'memory'],
        comments: 9,
        milestone: 'v2.1.1',
        author: 'Pedro Morales',
        tipo: 'Bug'
      },
      {
        id: 7,
        title: 'Mejorar interfaz de usuario del dashboard principal',
        description: 'Rediseñar el dashboard para mejorar la experiencia de usuario con gráficos más interactivos y mejor organización.',
        state: 'closed',
        priority: 'low',
        assignee: 'Sofía Ramírez',
        assignee_avatar: '',
        created_at: '2024-01-03T06:20:00Z',
        updated_at: '2024-01-17T19:40:00Z',
        labels: ['ui', 'ux', 'enhancement'],
        comments: 11,
        milestone: 'v2.0.0',
        author: 'Miguel Ángel',
        tipo: 'Enhancement'
      },
      {
        id: 8,
        title: 'Configurar backup automático de base de datos',
        description: 'Implementar sistema de backup automático diario con retención de 30 días y notificaciones de estado.',
        state: 'open',
        priority: 'high',
        assignee: '',
        assignee_avatar: '',
        created_at: '2024-01-16T14:00:00Z',
        updated_at: '2024-01-16T14:00:00Z',
        labels: ['infrastructure', 'backup', 'automation'],
        comments: 2,
        milestone: 'v2.1.0',
        author: 'Elena Vargas',
        tipo: 'Task'
      }
    ];
    
    // Usar el servicio para procesar los datos mock
    this.githubIssuesService.processIssues(mockIssues);
    this.showIssuesTable = true;
    }
  }

  /**
   * Filter issues by search
   */
  filterUpdate(event: any): void {
    const searchTerm = event.target.value;
    // Implement search filtering logic here
    console.log('Searching for:', searchTerm);
  }

  /**
   * Clear selection
   */
  limpiar(): void {
    this.aplicacionSeleccionada = null;
    this.showIssuesTable = false;
    this.githubIssuesService.clearIssues(); // Usar servicio en lugar de array local
    this.searchValue = '';
  }

  /**
   * Get priority badge class
   */
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'badge-light-danger';
      case 'medium':
        return 'badge-light-warning';
      case 'low':
        return 'badge-light-info';
      default:
        return 'badge-light-secondary';
    }
  }

  /**
   * Get state badge class
   */
  getStateClass(state: string): string {
    return state === 'open' ? 'badge-light-success' : 'badge-light-secondary';
  }



  /**
   * View issue details
   */
  verDetalle(issue: any): void {
    this.selectedIssue = issue;
    this.showDetailView = true;
  }

  /**
   * Close detail view
   */
  cerrarDetalle(): void {
    this.showDetailView = false;
    this.selectedIssue = null;
  }

  /**
   * Edit issue
   */
  editarIssue(issue: any): void {
    console.log('Editar issue:', issue);
    this.cerrarDetalle();
    // Implement edit functionality
  }

  /**
   * Open issue in GitHub
   */
  verEnGitHub(issue: any): void {
    const githubUrl = `https://github.com/${this.aplicacionSeleccionada?.owner}/${this.aplicacionSeleccionada?.repository}/issues/${issue.id}`;
    window.open(githubUrl, '_blank');
  }


  getListIssues(): void {
    console.log('🔄 Componente: Delegando carga de issues al servicio');
    
    // Usar el servicio para cargar las issues - el estado se maneja automáticamente
    this.githubIssuesService.loadIssues(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (issues) => {
          console.log('✅ Issues cargadas desde el servicio:', issues.length);
          
          // Actualizar estados locales
          this.loadingIssues = false;
          this.errorLoadingIssues = false;
          
          // Mostrar tabla si hay aplicación seleccionada
          if (this.aplicacionSeleccionada) {
            this.showIssuesTable = true;
            console.log('👁️ Aplicación seleccionada, mostrando tabla de issues');
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar issues desde el servicio:', error);
          
          // Establecer estado de error
          this.loadingIssues = false;
          this.errorLoadingIssues = true;
          
          // En caso de error, cargar datos mock como fallback
          this.cargarIssues();
        }
      });
  }

  /**
   * Get list of applications from service
   * Now uses ApplicationsService for loading applications
   */
  getListAplicaciones(): void {
    console.log('🚀 Componente: Delegando carga de aplicaciones al servicio');
    
    // Usar el servicio para cargar aplicaciones
    this.applicationsService.loadApplications(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (applications: Application[]) => {
          console.log(`✅ Aplicaciones cargadas desde el servicio: ${applications.length}`);
          console.log('📋 Primeras 3 aplicaciones:', applications.slice(0, 3).map(app => ({id: app.id, name: app.name})));
          
          // Actualizar AMBAS listas para compatibilidad con el template
          this.aplicaciones = applications;
          this.lstAplicaciones = applications; // Esta es la que usa el template para las cards
          
          console.log('🎯 Cards de aplicaciones listas para mostrar:', this.lstAplicaciones.length);
          
          // Asegurar que NO se muestre la tabla de issues automáticamente
          this.showIssuesTable = false;
          this.aplicacionSeleccionada = null;
          
          console.log('🏠 Mostrando cards de aplicaciones - tabla oculta');
          
          // Finalizar estado de carga
          this.loadingAplicaciones = false;
          this.errorLoadingAplicaciones = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar aplicaciones:', error);
          this.loadingAplicaciones = false;
          this.errorLoadingAplicaciones = true;
        }
      });
  }

  // Nuevo método para obtener un ID único o recuperar uno existente.
  private getUserId(): string {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = this.uuidv4(); // Genera un ID universal único
      localStorage.setItem('userId', id);
    }
    return id;
  }

  // Generador UUID v4 compatible con navegadores
  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Request applications via WebSocket as fallback
   */
  private requestApplicationsViaWebSocket(): void {
    console.log('🔌 Solicitando aplicaciones por WebSocket...');
    
    // Enviar comando simple para obtener lista de aplicaciones
    const message = 'gitea_repos';
    
    try {
      this.sessionService.sendMessage(message);
      console.log('📤 Comando enviado por WebSocket:', message);
      
      // Dar tiempo para que llegue la respuesta
      setTimeout(() => {
        if (this.aplicaciones.length <= 6) { // Si solo tiene datos mock
          console.log('⚠️ WebSocket no respondió, manteniendo datos mock');
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error enviando comando por WebSocket:', error);
    }
  }

  /**
   * Detect if data represents applications or issues
   */
  private isApplicationData(item: any): boolean {
    // Las aplicaciones tienen: id, name, full_name (y NO tienen title, body, state)
    // Los issues tienen: title, body, state, number (y NO tienen full_name)
    
    const hasAppFields = item.hasOwnProperty('name') && item.hasOwnProperty('full_name');
    const hasIssueFields = item.hasOwnProperty('title') || item.hasOwnProperty('body') || item.hasOwnProperty('state') || item.hasOwnProperty('number');
    
    // Criterio más estricto: debe tener campos de aplicación Y NO tener campos de issue
    const isApplication = hasAppFields && !hasIssueFields;
    
    console.log('🔍 Detectando tipo de datos:', {
      item: { id: item.id, name: item.name, full_name: item.full_name, title: item.title, body: item.body, state: item.state },
      hasAppFields,
      hasIssueFields,
      esAplicacion: isApplication
    });
    
    return isApplication;
  }





  /**
   * Map issue type from Spanish to English categories
   */
  private mapIssueType(spanishType: string): string {
    const typeMap: { [key: string]: string } = {
      'Solicitud del usuario calidad': 'Enhancement',
      'Solicitud del usuario': 'Feature',
      'Error de calculo': 'Bug',
      'Error de validaciones': 'Bug',
      'Error de Conexión': 'Bug'
    };
    
    // Buscar coincidencias parciales
    for (const [spanish, english] of Object.entries(typeMap)) {
      if (spanishType.toLowerCase().includes(spanish.toLowerCase())) {
        return english;
      }
    }
    
    return 'Task'; // Default
  }

  /**
   * Map priority from Spanish to standard levels
   */
  private mapPriority(spanishPriority: string): string {
    const priorityMap: { [key: string]: string } = {
      'ALTA': 'high',
      'MEDIA': 'medium',
      'BAJA': 'low',
      'Alta': 'high',
      'Media': 'medium',
      'Baja': 'low'
    };
    
    return priorityMap[spanishPriority] || 'medium';
  }



  /**
   * Process GitHub Issues received from WebSocket
   * Now uses GitHubIssuesService for processing
   */
  private processGitHubIssues(rawIssues: any[]): void {
    console.log('🔄 Componente: Delegando procesamiento de issues al servicio');
    
    // Usar el servicio para procesar las issues - el servicio maneja el estado automáticamente
    this.githubIssuesService.processIssues(rawIssues);
    
    console.log('✅ Issues procesadas y estado actualizado en el servicio');
    
    // SOLO mostrar la tabla si ya hay una aplicación seleccionada
    if (this.aplicacionSeleccionada) {
      this.showIssuesTable = true;
      // Finalizar estado de carga cuando se reciben issues
      this.loadingIssues = false;
      this.errorLoadingIssues = false;
      console.log('👁️ Aplicación ya seleccionada, mostrando tabla de issues');
      console.log('✅ Estado de carga finalizado - issues cargadas');
    } else {
      console.log('🏠 No hay aplicación seleccionada, manteniendo vista de cards');
    }
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up WebSocket subscriptions
    if (this.sessionMessagesSub) {
      this.sessionMessagesSub.unsubscribe();
    }
    if (this.sessionStatusSub) {
      this.sessionStatusSub.unsubscribe();
    }
    
    console.log('🧹 IssuesComponent destroyed and subscriptions cleaned up');
  }

}
