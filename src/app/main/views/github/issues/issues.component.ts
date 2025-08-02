import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  public loadingIssues$: Observable<boolean>;
  public errorIssues$: Observable<string | null>;
  
  public applications$: Observable<Application[]>;
  public loadingApplications$: Observable<boolean>;
  public errorApplications$: Observable<string | null>;

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
          
          // Establecer estado de error pero mantener pantalla de carga
          // Las issues reales pueden llegar por WebSocket aún después del error de API
          this.setIssuesLoading(false, 'Error al cargar issues. Esperando datos por WebSocket...');
          
          console.log('🔄 Manteniendo pantalla de carga - WebSocket puede traer datos reales');
          
          // En caso de error, el servicio ya maneja el fallback automáticamente
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
          
          // Actualizar lista para compatibilidad con el template
          this.aplicaciones = applications;
          
          console.log('🎯 Cards de aplicaciones listas para mostrar:', this.aplicaciones.length);
          
          // Asegurar que NO se muestre la tabla de issues automáticamente
          this.showIssuesTable = false;
          this.aplicacionSeleccionada = null;
          
          console.log('🏠 Mostrando cards de aplicaciones - tabla oculta');
          
          // Finalizar carga de aplicaciones con éxito
          this.setApplicationsLoading(false);
          
          // Ocultar pantalla de carga bloqueante y mostrar contenido
          this.hideApplicationsLoading();
          
          // Completar carga inicial
          this.setInitialLoadingComplete();
        },
        error: (error) => {
          console.error('❌ Error al cargar aplicaciones:', error);
          
          // Finalizar carga con error
          this.setApplicationsLoading(false, 'Error al cargar aplicaciones. Se mostrarán datos de ejemplo.');
          
          // Ocultar pantalla de carga aunque haya error
          this.hideApplicationsLoading();
          
          // Completar carga inicial aunque haya error
          this.setInitialLoadingComplete();
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
      // Finalizar estado de carga con UX mejorado
      this.setIssuesLoading(false);
      
      // Ocultar pantalla de carga de issues
      this.hideIssuesLoading();
      
      console.log('👁️ Aplicación ya seleccionada, mostrando tabla de issues');
      console.log('✅ Estado de carga finalizado - issues cargadas');
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage = true;
      this.successMessage = `${rawIssues.length} issues cargadas exitosamente`;
      this.hideSuccessMessage();
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
