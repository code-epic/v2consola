import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { SessionService } from '@services/util/session.service';
import { GitHubIssuesService } from '@services/github/github-issues.service';
import { ApplicationsService } from '@services/github/applications.service';
import { ErrorHandlerService } from '@services/github/error-handler.service';
import { IssueStatusService, IssueStatusChangeResponse } from '@services/github/issue-status.service';
import { Issue } from '@services/github/interfaces/issue.interface';
import { Application } from '@services/github/interfaces/application.interface';
import jwt_decode from "jwt-decode";


@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssuesComponent implements OnInit, OnDestroy {

  // Destroy subject for subscription management
  private destroy$ = new Subject<void>();

  // Content Header
  public contentHeader: object;
  private sessionMessagesSub: Subscription | undefined;
  private sessionStatusSub: Subscription | undefined;

  // Component state
  public aplicacionSeleccionada: Application | null = null;
  public searchValue: string = '';
  public basicSelectedOption: number = 10;
  public showIssuesTable: boolean = false;
  public selectedIssue: Issue | null = null;
  public showDetailView: boolean = false;
  private userId: string = '';

  // Reactive observables from services
  public issues$: Observable<Issue[]>;
  public applications$: Observable<Application[]>;
  public issuesLoading$: Observable<boolean>;
  public applicationsLoading$: Observable<boolean>;
  public issuesError$: Observable<string | null>;
  public applicationsError$: Observable<string | null>;

  // Navigation tracking
  private isFirstLoad: boolean = true;
  private currentRoute: string = '';
  private navigationSubscription?: Subscription;

  // Error and connection state observables (initialized in constructor)
  public errors$: Observable<any>;
  public connectionState$: Observable<any>;
  public toastNotifications$: Observable<any>;

  // Datatable
  public ColumnMode = ColumnMode;

  // Local state for template compatibility (updated by observables)
  public aplicaciones: Application[] = [];
  // Lista que se muestra (posiblemente filtrada por usuario)
  public displayedAplicaciones: Application[] = [];
  public loadingIssues = false;

  // ========================================
  // ENHANCED UX LOADING STATES
  // ========================================

  // Granular loading states for better UX
  public isInitialLoading = true;
  public isApplicationsLoading = false;
  public isIssuesLoading = false;
  public isSearching = false;

  // Error states with user-friendly messages
  public applicationsError: string | null = null;
  public issuesError: string | null = null;

  // Success states for positive feedback
  public showSuccessMessage = false;
  public successMessage = '';

  // ========================================
  // BLOCKING LOADING STATES (Full Screen)
  // ========================================

  // Bloquear toda la interfaz hasta que las aplicaciones estén listas
  public showApplicationsLoadingScreen = true;

  // Bloquear la tabla de issues hasta que estén listas
  public showIssuesLoadingScreen = false;

  // Mensajes de carga personalizados
  public loadingMessage = 'Cargando aplicaciones...';
  public loadingSubMessage = 'Conectando con el servidor';

  // Control de visibilidad de contenido
  public showMainContent = false;

  // ========================================
  // PRE-SELECCIÓN DE USUARIO PARA APPS/ISSUES
  // ========================================
  // Datos crudos desde SEC (_SYS_LstAplicaciones) para extraer usuarios y mapear repos
  private secAplicaciones: any[] = [];
  // Usuarios disponibles extraídos de SEC (únicos)
  public usuariosDisponibles: { usua: string; pass: string }[] = [];
  public selectedUsuario: string = '';
  private selectedPass: string = '';
  private userName = ''

  constructor(
    private modalService: NgbModal,
    private apiService: ApiService,
    private sessionService: SessionService,
    private githubIssuesService: GitHubIssuesService,
    private applicationsService: ApplicationsService,
    private errorHandler: ErrorHandlerService,
    private issueStatusService: IssueStatusService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Initialize reactive observables from services
    this.issues$ = this.githubIssuesService.issues$;
    this.issuesLoading$ = this.githubIssuesService.loading$;
    this.issuesError$ = this.githubIssuesService.error$;

    this.applications$ = this.applicationsService.applications$;
    this.applicationsLoading$ = this.applicationsService.loading$;
    this.applicationsError$ = this.applicationsService.error$;

    // Initialize ErrorHandlerService observables for professional error handling
    this.errors$ = this.errorHandler.errorState$;
    this.connectionState$ = this.errorHandler.connectionState$;
    this.toastNotifications$ = this.errorHandler.toastNotifications$;

    // Subscribe to applications changes for automatic UI updates
    this.applications$.pipe(takeUntil(this.destroy$)).subscribe(applications => {
      console.log(`🔄 Aplicaciones actualizadas automáticamente: ${applications.length}`);
      // Update local arrays for template compatibility
      this.aplicaciones = applications;
      console.log('🎯 UI actualizada con aplicaciones:', applications.slice(0, 3).map(app => app.name));
      // Actualizar lista visible según filtro de usuario (si existe)
      this.applyUserFilter();
      // Trigger change detection for OnPush
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    const token = sessionStorage.getItem("token");
    const Usuario: any = jwt_decode(token);
    this.userName = Usuario.nombre;

    this.userId = this.getUserId();

    console.log('🚀 Iniciando componente Issues - SIEMPRE recargando aplicaciones');
    console.log('📍 UserId:', this.userId);
    // Paso 1: solo mostrar el selector de usuario (no cargar aplicaciones todavía)
    this.showMainContent = true;
    this.showApplicationsLoadingScreen = false;
    // Por ahora usuarios "quemados" (hasta tener servicio SEC)
    this.usuariosDisponibles = [
      { usua: 'admin', pass: '' },
      { usua: 'dev', pass: '' },
      { usua: 'ops', pass: '' }
    ];
    this.selectedUsuario = '';

    // No cargar issues automáticamente - solo mostrar cards
    // Subscribe to WebSocket messages with professional error handling
    this.sessionMessagesSub = this.sessionService.messages$.subscribe({
      next: (msg) => {
        console.log("WebSocket message received:", msg);
        // Update connection state to connected
        this.errorHandler.updateConnectionState(true, false);

        let parsedMsg: any;
        try {
          parsedMsg = typeof msg === 'string' ? JSON.parse(msg) : msg;
        } catch (e) {
          console.error('WebSocket message is not valid JSON:', msg);
          this.errorHandler.handleError(e, 'WebSocket - JSON Parsing');
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

              // AHORA SÍ ocultar la pantalla de carga - aplicaciones reales llegaron
              console.log('✅ Aplicaciones reales recibidas por WebSocket - ocultando pantalla de carga');
              this.hideApplicationsLoading();
              this.setInitialLoadingComplete();
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

                  // AHORA SÍ ocultar la pantalla de carga - aplicaciones reales llegaron
                  console.log('✅ Aplicaciones reales recibidas por WebSocket - ocultando pantalla de carga');
                  this.hideApplicationsLoading();
                  this.setInitialLoadingComplete();
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

                // AHORA SÍ ocultar la pantalla de carga - aplicaciones reales llegaron
                console.log('✅ Aplicaciones reales extraídas por WebSocket - ocultando pantalla de carga');
                this.hideApplicationsLoading();
                this.setInitialLoadingComplete();
              }
            } else {
              // Si no es JSON, tratarlo como texto plano para compatibilidad
              innerMessage = { mensaje: parsedMsg.message };
              console.log('📄 Mensaje de texto:', innerMessage.mensaje);
            }
          }
        }
      },
      error: (error) => {
        console.error('❌ WebSocket error:', error);
        this.errorHandler.updateConnectionState(false, false);
        this.errorHandler.handleError(error, 'WebSocket - Conexión');
      },
      complete: () => {
        console.log('🔌 WebSocket connection closed');
        this.errorHandler.updateConnectionState(false, false);
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
  seleccionarAplicacion(aplicacion: Application): void {
    console.log('Aplicación seleccionada:', aplicacion.name);

    console.log('🔍 DEBUG - Estado antes de selección:');
    console.log('  - showIssuesTable:', this.showIssuesTable);
    console.log('  - loadingIssues:', this.loadingIssues);
    console.log('  - aplicacionSeleccionada:', this.aplicacionSeleccionada?.name || 'ninguna');

    // Establecer la aplicación seleccionada
    this.aplicacionSeleccionada = aplicacion;

    // Limpiar issues anteriores usando el servicio
    this.githubIssuesService.clearIssues();

    // Mostrar pantalla de carga bloqueante para issues
    this.showIssuesLoading();
    this.setIssuesLoading(true);
    this.showIssuesTable = true; // Mostrar la tabla inmediatamente con loading

    console.log('🔍 DEBUG - Estado después de selección:');
    console.log('  - showIssuesTable:', this.showIssuesTable);
    console.log('  - loadingIssues:', this.loadingIssues);
    console.log('  - aplicacionSeleccionada:', this.aplicacionSeleccionada?.name);

    console.log('🚀 Cargando issues para la aplicación seleccionada...');
    console.log('⏳ Estado de carga activado');

    // Trigger change detection for OnPush
    this.cdr.markForCheck();

    // Cargar issues inmediatamente (sin delay artificial)
    console.log('🚀 Iniciando carga de issues inmediatamente');
    this.getListIssues();
  }

  /**
   * Filter issues by search - Enhanced UX with loading states
   */
  filterUpdate(event: any): void {
    const searchTerm = event.target.value;
    this.searchValue = searchTerm;

    // Show search loading state for better UX
    this.setSearchLoading(true);

    console.log('🔍 Filtering issues with term:', searchTerm);

    // Simulate search delay for better UX (debounce effect)
    setTimeout(() => {
      // TODO: Implement reactive filtering in future iteration
      console.log('✅ Search completed for term:', searchTerm);

      // Hide search loading state
      this.setSearchLoading(false);
    }, 300);
  }

  /**
   * Clear search input and reset filter
   */
  clearSearch(): void {
    this.searchValue = '';
    this.filterUpdate({ target: { value: '' } });
    console.log('🧹 Búsqueda limpiada');
  }

  /**
   * Cambia el estatus de una issue (cerrar o reabrir)
   * @param issue Issue a modificar
   * @param open true para reabrir, false para cerrar
   */
  changeIssueStatus(issue: Issue, open?: boolean): void {
    if (!issue || !issue.id) {
      this.errorHandler.showErrorToast({
        id: 'invalid-issue',
        type: 'error',
        title: 'Error',
        message: 'Issue inválida para cambiar estatus',
        duration: 5000,
        dismissible: true
      });
      return;
    }

    const action = open ? 'reabrir' : 'cerrar';
    console.log(`🔄 Iniciando ${action} de issue #${issue.id}`);

    // Mostrar toast de progreso
    // Info toast deshabilitado por solicitud del usuario

    this.issueStatusService.changeIssueStatus(issue.id, this.userId, open).subscribe({
      next: (response: IssueStatusChangeResponse) => {
        console.log('✅ Estatus cambiado exitosamente:', response);

        // Mostrar toast de éxito
        // Success toast deshabilitado por solicitud del usuario

        // Actualizar el issue en el servicio
        this.updateIssueInService(issue.id, open ? 'open' : 'closed');

        // Refrescar la lista de issues
        this.refreshIssuesList();
      },
      error: (error: any) => {
        console.error(`❌ Error al ${action} issue:`, error);

        // Mostrar toast de error con opción de reintentar
        this.errorHandler.showErrorToast({
          id: `status-change-error-${issue.id}`,
          type: 'error',
          title: `Error al ${action} issue`,
          message: error.message || `No se pudo ${action} la issue #${issue.id}`,
          duration: 0,
          dismissible: true,
          actions: [{
            label: 'Reintentar',
            callback: () => this.changeIssueStatus(issue, open),
            style: 'primary'
          }]
        });
      }
    });
  }

  /**
   * Cierra una issue específica
   * @param issue Issue a cerrar
   */
  closeIssue(issue: Issue): void {
    console.log(`🔒 Cerrando issue #${issue.id}`);
    this.changeIssueStatus(issue, false);
  }

  /**
   * Reabre una issue específica
   * @param issue Issue a reabrir
   */
  reopenIssue(issue: Issue): void {
    console.log(`🔓 Reabriendo issue #${issue.id}`);
    this.changeIssueStatus(issue, true);
  }

  /**
   * Actualiza el estatus de una issue en el servicio
   * @param issueId ID de la issue
   * @param newStatus Nuevo estatus
   */
  private updateIssueInService(issueId: number, newStatus: 'open' | 'closed'): void {
    // Usar el método optimizado del servicio para actualizar una issue específica
    this.githubIssuesService.updateIssueById(issueId, {
      state: newStatus,
      updated_at: new Date().toISOString() // Actualizar timestamp
    });

    console.log(`🔄 Issue #${issueId} actualizada en el servicio con estatus: ${newStatus}`);
  }

  /**
   * Refresca la lista de issues desde el servidor
   */
  private refreshIssuesList(): void {
    if (this.aplicacionSeleccionada) {
      console.log('🔄 Refrescando lista de issues...');
      // Recargar issues para la aplicación seleccionada
      this.getListIssues();
    }
  }

  /**
   * Configura la detección de navegación para recargar aplicaciones cuando el usuario regrese
   */
  private setupNavigationDetection(): void {
    // Suscribirse a eventos de navegación
    this.navigationSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        console.log('🧪 Evento de navegación detectado:', event.url);

        // Si navegamos a la ruta de issues y no es la primera carga
        if (event.url.includes('/github/issues') && !this.isFirstLoad) {
          console.log('🔄 Usuario regresó al módulo de Issues - recargando aplicaciones');

          // Resetear estado y recargar aplicaciones
          this.resetComponentStateCompletely();
          this.initializeApplicationsLoad();
        }

        this.currentRoute = event.url;
      });
  }

  /**
   * Inicializa la carga de aplicaciones con toda la lógica necesaria
   */
  private initializeApplicationsLoad(): void {
    console.log('🚀 Inicializando carga de aplicaciones...');

    // Mostrar pantalla de carga bloqueante desde el inicio
    this.showApplicationsLoading();

    // Connect to WebSocket with userId
    this.sessionService.connect(this.userId, this.userName);

    // Actualizar mensaje de carga
    this.updateLoadingMessage('Estableciendo conexión...', 'Conectando con WebSocket');

    // Esperar 2 segundos para que se establezca la conexión WebSocket antes de cargar aplicaciones
    setTimeout(() => {
      this.updateLoadingMessage('Cargando aplicaciones...', 'Obteniendo lista de repositorios');
      console.log('🔌 Conexión WebSocket establecida, cargando aplicaciones...');
      this.getListAplicaciones();
    }, 2000);
  }

  /**
   * SOLUCIÓN ROBUSTA: Fuerza la recarga de aplicaciones SIEMPRE
   * Este método se ejecuta en cada ngOnInit para asegurar que las aplicaciones se carguen
   */
  private forceApplicationsReload(): void {
    console.log('🔥 FORZANDO recarga de aplicaciones - solución robusta');

    // 1. Limpiar todo el estado anterior
    this.resetComponentStateCompletely();

    // 2. Mostrar pantalla de carga inmediatamente
    this.showApplicationsLoading();
    this.updateLoadingMessage('Recargando aplicaciones...', 'Obteniendo lista actualizada de repositorios');

    // 3. Conectar WebSocket
    console.log('🔌 Conectando WebSocket...');
    this.sessionService.connect(this.userId, this.userName);

    // 4. Configurar listener de WebSocket
    this.setupWebSocketMessages();

    // 5. Cargar aplicaciones después de un delay
    setTimeout(() => {
      console.log('📡 Solicitando aplicaciones al servidor...');
      this.getListAplicaciones();
    }, 2000);
  }

  /**
   * Resetea COMPLETAMENTE el estado del componente
   */
  private resetComponentStateCompletely(): void {
    console.log('🧹 Reseteando COMPLETAMENTE el estado del componente...');

    // Limpiar selección actual
    this.aplicacionSeleccionada = null;
    this.selectedIssue = null;
    this.showDetailView = false;
    this.showIssuesTable = false;

    // Limpiar servicios COMPLETAMENTE
    this.applicationsService.clearApplications();
    this.githubIssuesService.clearIssues();

    // Resetear TODOS los estados de carga
    this.loadingIssues = false;

    // Limpiar suscripciones anteriores si existen
    if (this.sessionMessagesSub) {
      this.sessionMessagesSub.unsubscribe();
      this.sessionMessagesSub = null;
    }

    console.log('✨ Estado del componente COMPLETAMENTE reseteado');
  }

  /**
   * Configura los listeners de WebSocket para recibir aplicaciones e issues
   */
  private setupWebSocketMessages(): void {
    console.log('🔧 Configurando listeners de WebSocket...');

    // Subscribe to WebSocket messages with professional error handling
    this.sessionMessagesSub = this.sessionService.messages$.subscribe({
      next: (msg) => {
        console.log("WebSocket message received:", msg);
        // Update connection state to connected
        this.errorHandler.updateConnectionState(true, false);

        let parsedMsg: any;
        try {
          parsedMsg = typeof msg === 'string' ? JSON.parse(msg) : msg;
        } catch (e) {
          console.error('WebSocket message is not valid JSON:', msg);
          this.errorHandler.handleError(e, 'WebSocket - JSON Parsing');
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

                // OCULTAR la pantalla de carga - aplicaciones reales llegaron
                console.log('✅ Aplicaciones reales recibidas por WebSocket - ocultando pantalla de carga');
                this.hideApplicationsLoading();
                this.setInitialLoadingComplete();
              } else {
                console.log('🎯 Issues recibidas del servidor:', innerMessage.length);
                this.processGitHubIssues(innerMessage);
              }
            } else if (innerMessage && innerMessage.aplicaciones && Array.isArray(innerMessage.aplicaciones)) {
              console.log('🏢 Aplicaciones recibidas por WebSocket:', innerMessage.aplicaciones.length);
              const processedApps = this.applicationsService.processApplications(innerMessage.aplicaciones);
              this.applicationsService.setApplications(processedApps);

              // OCULTAR la pantalla de carga - aplicaciones reales llegaron
              console.log('✅ Aplicaciones reales recibidas por WebSocket - ocultando pantalla de carga');
              this.hideApplicationsLoading();
              this.setInitialLoadingComplete();
            } else {
              console.log('📄 Mensaje del servidor:', innerMessage);
            }

          } catch (e) {
            console.error('Inner message is not valid JSON:', parsedMsg.message);

            // Intentar extraer JSON de un mensaje mixto usando el servicio
            const jsonMatch = this.githubIssuesService.parseWebSocketMessage(parsedMsg.message);
            if (jsonMatch && Array.isArray(jsonMatch)) {
              const firstItem = jsonMatch[0];
              if (firstItem && this.applicationsService.isApplicationData(firstItem)) {
                console.log('🏢 Aplicaciones extraídas del mensaje:', jsonMatch.length);
                const processedApps = this.applicationsService.processApplications(jsonMatch);
                this.applicationsService.setApplications(processedApps);

                // OCULTAR la pantalla de carga - aplicaciones reales llegaron
                console.log('✅ Aplicaciones reales recibidas por WebSocket - ocultando pantalla de carga');
                this.hideApplicationsLoading();
                this.setInitialLoadingComplete();
              } else {
                console.log('🎯 Issues extraídas del mensaje:', jsonMatch.length);
                this.processGitHubIssues(jsonMatch);
              }
            }
          }
        }
      },
      error: (error) => {
        console.error('WebSocket error:', error);
        this.errorHandler.updateConnectionState(false, true);
        this.errorHandler.handleError(error, 'WebSocket - Connection');
      }
    });
  }

  /**
   * Clear selection
   */
  limpiar(): void {
    this.aplicacionSeleccionada = null;
    this.showIssuesTable = false;
    this.githubIssuesService.clearIssues(); // Usar servicio en lugar de array local
    this.searchValue = '';
    // Trigger change detection for OnPush
    this.cdr.markForCheck();
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
  verDetalle(issue: Issue): void {
    this.selectedIssue = issue;
    this.showDetailView = true;
    // Trigger change detection for OnPush
    this.cdr.markForCheck();
  }

  /**
   * Close detail view
   */
  cerrarDetalle(): void {
    this.showDetailView = false;
    this.selectedIssue = null;
    // Trigger change detection for OnPush
    this.cdr.markForCheck();
  }

  /**
   * Edit issue - Optimized for OnPush
   */
  editarIssue(issue: Issue): void {
    console.log('Editar issue:', issue);
    this.cerrarDetalle();
    // Implement edit functionality
    // Future: Open edit modal or navigate to edit view
  }

  /**
   * Open issue in GitHub - Optimized for OnPush
   */
  verEnGitHub(issue: Issue): void {
    if (!this.aplicacionSeleccionada) {
      console.warn('No application selected');
      return;
    }

    const githubUrl = `https://github.com/${this.aplicacionSeleccionada.owner}/${this.aplicacionSeleccionada.repository}/issues/${issue.id}`;
    window.open(githubUrl, '_blank');
    console.log('🔗 Opening GitHub issue:', githubUrl);
  }

  // ========================================
  // PERFORMANCE OPTIMIZATION METHODS
  // ========================================

  /**
   * TrackBy function for applications list - optimizes *ngFor performance
   */
  trackByApplicationId(index: number, application: Application): string | number {
    return application.id;
  }

  /**
   * TrackBy function for issues list - optimizes *ngFor performance
   */
  trackByIssueId(index: number, issue: Issue): number {
    return issue.id;
  }

  /**
   * TrackBy function for labels list - optimizes *ngFor performance
   */
  trackByLabel(index: number, label: string): string {
    return label;
  }

  /**
   * TrackBy function for toast notifications - optimizes *ngFor performance
   */
  trackByToastId(index: number, toast: any): string {
    return toast.id;
  }

  // ========================================
  // TOAST NOTIFICATION METHODS
  // ========================================

  /**
   * Dismiss a toast notification
   */
  dismissToast(toastId: string): void {
    this.errorHandler.removeToast(toastId);
  }

  /**
   * Execute a toast action (like retry button)
   */
  executeToastAction(action: any): void {
    if (action.callback && typeof action.callback === 'function') {
      try {
        action.callback();
        console.log('✅ Toast action executed:', action.label);
      } catch (error) {
        console.error('❌ Error executing toast action:', error);
        this.errorHandler.handleError(error, 'Toast Action');
      }
    }
  }

  // ========================================
  // ENHANCED UX STATE MANAGEMENT
  // ========================================

  /**
   * Set applications loading state with UX feedback
   */
  private setApplicationsLoading(loading: boolean, error: string | null = null): void {
    this.isApplicationsLoading = loading;
    this.applicationsError = error;

    if (loading) {
      console.log('🔄 Applications loading started...');
    } else {
      console.log('✅ Applications loading completed');
      if (!error && this.aplicaciones.length > 0) {
        // Success banner deshabilitado por solicitud del usuario
      }
    }

    this.cdr.markForCheck();
  }

  /**
   * Set issues loading state with UX feedback
   */
  private setIssuesLoading(loading: boolean, error: string | null = null): void {
    this.isIssuesLoading = loading;
    this.loadingIssues = loading; // Keep compatibility
    this.issuesError = error;

    if (loading) {
      console.log('🔄 Issues loading started...');
    } else {
      console.log('✅ Issues loading completed');
    }

    this.cdr.markForCheck();
  }

  /**
   * Set search loading state
   */
  private setSearchLoading(loading: boolean): void {
    this.isSearching = loading;
    this.cdr.markForCheck();
  }

  /**
   * Hide success message after delay
   */
  private hideSuccessMessage(): void {
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.successMessage = '';
      this.cdr.markForCheck();
    }, 3000);
  }

  /**
   * Set initial loading complete
   */
  private setInitialLoadingComplete(): void {
    this.isInitialLoading = false;
    this.cdr.markForCheck();
  }

  // ========================================
  // BLOCKING LOADING SCREEN MANAGEMENT
  // ========================================

  /**
   * Show applications loading screen (blocks entire UI)
   */
  private showApplicationsLoading(): void {
    this.showApplicationsLoadingScreen = true;
    this.showMainContent = false;
    this.loadingMessage = 'Cargando aplicaciones...';
    this.loadingSubMessage = 'Conectando con el servidor y obteniendo datos';
    console.log('🔄 Mostrando pantalla de carga de aplicaciones');
    this.cdr.markForCheck();
  }

  /**
   * Hide applications loading screen and show main content
   */
  private hideApplicationsLoading(): void {
    this.showApplicationsLoadingScreen = false;
    this.showMainContent = true;
    console.log('✅ Ocultando pantalla de carga - aplicaciones listas');
    this.cdr.markForCheck();
  }

  // ========================================
  // USUARIOS (SEC) Y FILTRO DE APLICACIONES
  // ========================================
  /**
   * Cargar lista de aplicaciones desde SEC para extraer usuarios (usua/pass)
   * y permitir filtrar aplicaciones por usuario.
   */
  private cargarUsuariosDesdeSEC(): void {
    try {
      const xAPI: IAPICore = {
        id: '',
        funcion: '_SYS_LstAplicaciones',
        relacional: false,
        concurrencia: false,
        retorna: false,
        migrar: false,
        parametros: '',
        modulo: '',
        valores: null,
        logs: false,
        cache: 0,
        estatus: false
      };

      this.apiService.Ejecutar(xAPI)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: any) => {
            // Esperamos data.Cuerpo como en otros componentes
            const cuerpo = Array.isArray(data?.Cuerpo) ? data.Cuerpo : [];
            this.secAplicaciones = cuerpo;
            // Extraer usuarios únicos con su pass
            const mapUsers = new Map<string, string>();
            for (const app of cuerpo) {
              const u = app.usua || app.usuario || app.USER || app.user;
              const p = app.pass || app.clave || app.PASS || app.token;
              if (u && !mapUsers.has(u)) {
                mapUsers.set(u, p || '');
              }
            }
            this.usuariosDisponibles = Array.from(mapUsers.entries()).map(([usua, pass]) => ({ usua, pass }));
            console.log('👥 Usuarios disponibles (SEC):', this.usuariosDisponibles.map(u => u.usua));
            this.cdr.markForCheck();
          },
          error: (error: any) => {
            console.error('❌ Error cargando usuarios desde SEC:', error);
            // No bloquea el flujo principal; simplemente no habrá pre-filtro
          }
        });
    } catch (err) {
      console.error('❌ Excepción en cargarUsuariosDesdeSEC:', err);
    }
  }

  /**
   * Handler al cambiar el usuario en el selector
   */
  public onUsuarioChange(usua: string): void {
    this.selectedUsuario = usua || '';
    const found = this.usuariosDisponibles.find(u => u.usua === this.selectedUsuario);
    this.selectedPass = found?.pass || '';
    console.log('👤 Usuario seleccionado:', this.selectedUsuario);

    // Paso 2: al elegir cualquier usuario, ejecutar el flujo actual de carga de aplicaciones
    if (this.selectedUsuario) {
      // Mostrar pantalla de carga y disparar flujo robusto existente
      this.forceApplicationsReload();
    } else {
      // Si limpia la selección, limpiar UI
      this.displayedAplicaciones = [];
      this.aplicacionSeleccionada = null;
      this.showIssuesTable = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Volver a la selección de usuario. Limpia estado visual y muestra la intro.
   */
  public resetUserSelection(): void {
    console.log('↩️ Volver a selección de usuario');
    this.selectedUsuario = '';
    this.selectedPass = '';
    this.displayedAplicaciones = [];
    this.aplicacionSeleccionada = null;
    this.showIssuesTable = false;
    this.applicationsError = null as any; // mantener tipados previos
    this.loadingMessage = '';
    this.loadingSubMessage = '';
    this.showApplicationsLoadingScreen = false;
    this.cdr.markForCheck();
  }

  /**
   * Aplica el filtro de usuario sobre la lista de aplicaciones gestionada por ApplicationsService.
   * Se mapea por nombre de repositorio (SEC.repositorio ~ Application.repository)
   */
  private applyUserFilter(): void {
    if (!this.selectedUsuario) {
      this.displayedAplicaciones = this.aplicaciones.slice();
      return;
    }

    // Construir set de repos del usuario seleccionado según SEC
    const reposUsuario = new Set<string>();
    for (const app of this.secAplicaciones) {
      const u = app.usua || app.usuario || app.USER || app.user;
      if (u === this.selectedUsuario) {
        const repo = (app.repositorio || app.repo || app.nombre || '').toString();
        if (repo) reposUsuario.add(repo.toLowerCase());
      }
    }

    // Filtrar aplicaciones cargadas
    this.displayedAplicaciones = this.aplicaciones.filter(a => {
      const repo = (a.repository || a.name || '').toString().toLowerCase();
      return reposUsuario.size === 0 ? true : reposUsuario.has(repo);
    });

    console.log(`🎯 Aplicaciones filtradas para ${this.selectedUsuario}: ${this.displayedAplicaciones.length}`);
    this.cdr.markForCheck();
  }

  /**
   * Show issues loading screen (blocks issues table)
   */
  private showIssuesLoading(): void {
    console.log('🔄 INICIANDO showIssuesLoading()');
    console.log('  - showIssuesLoadingScreen ANTES:', this.showIssuesLoadingScreen);

    this.showIssuesLoadingScreen = true;
    this.loadingMessage = 'Cargando issues...';
    this.loadingSubMessage = `Obteniendo issues de ${this.aplicacionSeleccionada?.name || 'la aplicación'}`;

    console.log('  - showIssuesLoadingScreen DESPUÉS:', this.showIssuesLoadingScreen);
    console.log('  - loadingMessage:', this.loadingMessage);
    console.log('  - loadingSubMessage:', this.loadingSubMessage);
    console.log('🔄 Pantalla de carga de issues ACTIVADA');

    this.cdr.markForCheck();
  }

  /**
   * Hide issues loading screen
   */
  private hideIssuesLoading(): void {
    console.log('✅ INICIANDO hideIssuesLoading()');
    console.log('  - showIssuesLoadingScreen ANTES:', this.showIssuesLoadingScreen);

    this.showIssuesLoadingScreen = false;

    console.log('  - showIssuesLoadingScreen DESPUÉS:', this.showIssuesLoadingScreen);
    console.log('✅ Pantalla de carga de issues DESACTIVADA');

    this.cdr.markForCheck();
  }

  /**
   * Update loading message dynamically
   */
  private updateLoadingMessage(message: string, subMessage?: string): void {
    this.loadingMessage = message;
    if (subMessage) {
      this.loadingSubMessage = subMessage;
    }
    this.cdr.markForCheck();
  }


  getListIssues(): void {
    console.log('🔄 Componente: Delegando carga de issues al servicio');

    // Usar el servicio para cargar las issues - el estado se maneja automáticamente
    this.githubIssuesService.loadIssues(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (issues) => {
          console.log('✅ Issues cargadas desde el servicio:', issues.length);

          // Show success message for API fallback data
          // Info toast deshabilitado por solicitud del usuario

          // IMPORTANTE: NO ocultar la pantalla de carga aquí
          // porque estas pueden ser datos mock. La pantalla se ocultará
          // cuando lleguen las issues reales por WebSocket en processGitHubIssues()

          console.log('🔄 Manteniendo pantalla de carga - esperando issues reales por WebSocket');

          // Actualizar estados internos pero mantener loading visible
          this.setIssuesLoading(false); // Estado interno

          // Mostrar tabla si hay aplicación seleccionada (con loading overlay)
          if (this.aplicacionSeleccionada) {
            this.showIssuesTable = true;
            console.log('👁️ Aplicación seleccionada, mostrando tabla con overlay de carga');
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar issues:', error);

          // Use ErrorHandlerService for professional error handling
          const appError = this.errorHandler.handleError(error, 'Issues - API');

          // Show user-friendly error message
          this.errorHandler.showErrorToast({
            id: appError.id,
            type: 'error',
            title: 'Error cargando issues',
            message: 'No se pudieron cargar las issues desde la API. Esperando datos por WebSocket...',
            duration: 0,
            dismissible: true
          });

          // Establecer estado de error pero mantener pantalla de carga
          this.setIssuesLoading(false, 'Error al cargar issues. Esperando datos por WebSocket...');

          console.log('🔄 Manteniendo pantalla de carga - WebSocket puede traer datos reales');
        }
      });
  }

  /**
   * Get list of applications from service
   * Now uses ApplicationsService for loading applications
   */
  getListAplicaciones(): void {
    console.log('🚀 Componente: Delegando carga de aplicaciones al servicio');

    // Iniciar estado de carga de aplicaciones
    this.setApplicationsLoading(true);

    // Usar el servicio para cargar aplicaciones
    this.applicationsService.loadApplications(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (applications: Application[]) => {
          console.log(`✅ Aplicaciones cargadas desde el servicio: ${applications.length}`);
          console.log('📋 Primeras 3 aplicaciones:', applications.slice(0, 3).map(app => ({ id: app.id, name: app.name })));

          // Show success message for API fallback data
          // Info toast deshabilitado por solicitud del usuario

          // Actualizar lista para compatibilidad con el template
          this.aplicaciones = applications;

          console.log('🎯 Cards de aplicaciones listas para mostrar:', this.aplicaciones.length);

          // Asegurar que NO se muestre la tabla de issues automáticamente
          this.showIssuesTable = false;
          this.aplicacionSeleccionada = null;

          console.log('🏠 Mostrando cards de aplicaciones - tabla oculta');

          // IMPORTANTE: NO ocultar la pantalla de carga aquí
          // porque estas pueden ser datos del servicio. La pantalla se ocultará
          // cuando lleguen las aplicaciones reales por WebSocket

          console.log('🔄 Manteniendo pantalla de carga - esperando aplicaciones reales por WebSocket');

          // Actualizar estados internos pero mantener loading visible
          this.setApplicationsLoading(false); // Estado interno
        },
        error: (error) => {
          console.error('❌ Error al cargar aplicaciones:', error);

          // Use ErrorHandlerService for professional error handling
          const appError = this.errorHandler.handleError(error, 'Aplicaciones - API');

          // Show user-friendly error message
          this.errorHandler.showErrorToast({
            id: appError.id,
            type: 'error',
            title: 'Error cargando aplicaciones',
            message: 'No se pudieron cargar las aplicaciones desde la API. Esperando datos por WebSocket...',
            duration: 0,
            dismissible: true,
            actions: [{
              label: 'Reintentar',
              callback: () => this.getListAplicaciones(),
              style: 'primary'
            }]
          });

          // Establecer estado de error pero mantener pantalla de carga
          this.setApplicationsLoading(false, 'Error al cargar aplicaciones. Esperando datos por WebSocket...');

          console.log('🔄 Manteniendo pantalla de carga - WebSocket puede traer aplicaciones reales');
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
   * Process GitHub Issues received from WebSocket
   * Now uses GitHubIssuesService for processing with professional error handling
   */
  private processGitHubIssues(rawIssues: any[]): void {
    console.log('🔄 Componente: Delegando procesamiento de issues al servicio');

    try {
      // Validate input data
      if (!Array.isArray(rawIssues) || rawIssues.length === 0) {
        console.warn('⚠️ Issues vacías o inválidas recibidas');
        this.errorHandler.showWarningToast(
          'Sin datos de issues',
          'No se recibieron issues válidas del servidor'
        );
        return;
      }

      // Usar el servicio para procesar las issues - el servicio maneja el estado automáticamente
      this.githubIssuesService.processIssues(rawIssues);

      console.log('✅ Issues procesadas y estado actualizado en el servicio');

      // SOLO mostrar la tabla si ya hay una aplicación seleccionada
      if (this.aplicacionSeleccionada) {
        this.showIssuesTable = true;
        // Finalizar estado de carga con UX mejorado
        this.setIssuesLoading(false);

        // Ocultar pantalla de carga de issues
        this.hideIssuesLoading();

        console.log('👁️ Aplicación ya seleccionada, mostrando tabla de issues');
        console.log('✅ Estado de carga finalizado - issues cargadas');

        // Show professional success message
        // Success toast deshabilitado por solicitud del usuario

        // Legacy success message for template compatibility
        // Success banner deshabilitado por solicitud del usuario
      } else {
        console.log('🏠 No hay aplicación seleccionada, manteniendo vista de cards');

        // Still show success for background processing
        // Info toast deshabilitado por solicitud del usuario
      }
    } catch (error) {
      console.error('❌ Error procesando issues:', error);

      // Use ErrorHandlerService for professional error handling
      const appError = this.errorHandler.handleError(error, 'Issues - Procesamiento');

      // Show user-friendly error message
      this.errorHandler.showErrorToast({
        id: appError.id,
        type: 'error',
        title: 'Error procesando issues',
        message: 'Hubo un problema al procesar las issues recibidas del servidor.',
        duration: 0,
        dismissible: true,
        actions: [{
          label: 'Reintentar',
          callback: () => this.getListIssues(),
          style: 'primary'
        }]
      });

      // Ensure loading states are cleared on error
      this.setIssuesLoading(false, 'Error procesando issues');
      this.hideIssuesLoading();
    }
  }

  /**
   * Component cleanup
   */
  ngOnDestroy(): void {
    // Unsubscribe from all observables to prevent memory leaks
    this.destroy$.next(undefined);
    this.destroy$.complete();

    // Clean up specific subscriptions
    if (this.sessionMessagesSub) {
      this.sessionMessagesSub.unsubscribe();
    }

    // Clean up navigation subscription
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }

    console.log('🧹 Componente Issues destruido - suscripciones limpiadas');
  }
}
