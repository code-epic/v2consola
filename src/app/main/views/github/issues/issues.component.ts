import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { SessionService } from '@services/util/session.service';
import { GitHubIssuesService } from '@services/github/github-issues.service';
import { ApplicationsService } from '@services/github/applications.service';
import { ErrorHandlerService } from '@services/github/error-handler.service';
import { IssueStatusService, IssueStatusChangeResponse } from '@services/github/issue-status.service';
import { Issue } from '@services/github/interfaces/issue.interface';
import { Application } from '@services/github/interfaces/application.interface';
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

  // Reactive observables from services (initialized in constructor)
  public issues$: Observable<Issue[]>;
  public loadingIssues$: Observable<boolean>;
  public errorIssues$: Observable<string | null>;
  
  public applications$: Observable<Application[]>;
  public loadingApplications$: Observable<boolean>;
  public errorApplications$: Observable<string | null>;
  
  // Error and connection state observables (initialized in constructor)
  public errors$: Observable<any>;
  public connectionState$: Observable<any>;
  public toastNotifications$: Observable<any>;

  // Datatable
  public ColumnMode = ColumnMode;

  // Local state for template compatibility (updated by observables)
  public aplicaciones: Application[] = [];
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

  constructor(
    private modalService: NgbModal, 
    private apiService: ApiService, 
    private sessionService: SessionService,
    private githubIssuesService: GitHubIssuesService,
    private applicationsService: ApplicationsService,
    private errorHandler: ErrorHandlerService,
    private issueStatusService: IssueStatusService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize reactive observables from services
    this.issues$ = this.githubIssuesService.issues$;
    this.loadingIssues$ = this.githubIssuesService.loading$;
    this.errorIssues$ = this.githubIssuesService.error$;
    
    // Initialize applications observables
    this.applications$ = this.applicationsService.applications$;
    this.loadingApplications$ = this.applicationsService.loading$;
    this.errorApplications$ = this.applicationsService.error$;
    
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
      // Trigger change detection for OnPush
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.userId = this.getUserId();
    console.log("Iniciando componente Issues");
    
    // Mostrar pantalla de carga bloqueante desde el inicio
    this.showApplicationsLoading();
    
    // Connect to WebSocket with userId
    this.sessionService.connect(this.userId);
    
    // Actualizar mensaje de carga
    this.updateLoadingMessage('Estableciendo conexión...', 'Conectando con WebSocket');
    
    // Esperar 2 segundos para que se establezca la conexión WebSocket antes de cargar aplicaciones
    setTimeout(() => {
      this.updateLoadingMessage('Cargando aplicaciones...', 'Obteniendo lista de repositorios');
      console.log('🔌 Conexión WebSocket establecida, cargando aplicaciones...');
      this.getListAplicaciones();
    }, 2000);
    
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
    this.errorHandler.showInfoToast(
      `${action.charAt(0).toUpperCase() + action.slice(1)}ando issue`,
      `Procesando cambio de estatus para issue #${issue.id}...`
    );

    this.issueStatusService.changeIssueStatus(issue.id, this.userId, open).subscribe({
      next: (response: IssueStatusChangeResponse) => {
        console.log('✅ Estatus cambiado exitosamente:', response);
        
        // Mostrar toast de éxito
        this.errorHandler.showSuccessToast(
          'Estatus actualizado',
          `Issue #${issue.id} ${open ? 'reabierta' : 'cerrada'} exitosamente`
        );

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
        this.showSuccessMessage = true;
        this.successMessage = `${this.aplicaciones.length} aplicaciones cargadas exitosamente`;
        this.hideSuccessMessage();
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
          if (issues.length > 0) {
            this.errorHandler.showInfoToast(
              'Datos de respaldo cargados',
              `${issues.length} issues cargadas desde cache. Esperando datos actualizados...`
            );
          }
          
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
          console.log('📋 Primeras 3 aplicaciones:', applications.slice(0, 3).map(app => ({id: app.id, name: app.name})));
          
          // Show success message for API fallback data
          if (applications.length > 0) {
            this.errorHandler.showInfoToast(
              'Aplicaciones de respaldo cargadas',
              `${applications.length} aplicaciones cargadas desde cache. Esperando datos actualizados...`
            );
          }
          
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
        this.errorHandler.showSuccessToast(
          'Issues cargadas exitosamente',
          `${rawIssues.length} issues de ${this.aplicacionSeleccionada.name} cargadas desde el servidor`
        );
        
        // Legacy success message for template compatibility
        this.showSuccessMessage = true;
        this.successMessage = `${rawIssues.length} issues cargadas exitosamente`;
        this.hideSuccessMessage();
      } else {
        console.log('🏠 No hay aplicación seleccionada, manteniendo vista de cards');
        
        // Still show success for background processing
        this.errorHandler.showInfoToast(
          'Issues procesadas',
          `${rawIssues.length} issues procesadas y almacenadas en cache`
        );
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
