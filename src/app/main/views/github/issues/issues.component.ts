import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { SessionService } from '@services/util/session.service';
import { GitHubIssuesService } from '@services/github/github-issues.service';
import { Issue } from '@services/github/interfaces/issue.interface';
@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent implements OnInit {

  // Content Header
  public contentHeader: object;
  private sessionMessagesSub: Subscription | undefined;
  private sessionStatusSub: Subscription | undefined;
  // Data
  public lstAplicaciones: any[] = [];
  public aplicacionSeleccionada: any = null;
  public issuesData: any[] = [];
  public searchValue: string = '';
  public basicSelectedOption: number = 10;
  public showIssuesTable: boolean = false;
  public selectedIssue: any = null;
  public showDetailView: boolean = false;
  userId: string = '';

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
    private githubIssuesService: GitHubIssuesService
  ) {
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
            if (firstItem && this.isApplicationData(firstItem)) {
              console.log('🏢 Aplicaciones recibidas por WebSocket:', innerMessage.length);
              console.log('🔄 Reemplazando datos mock con datos reales del WebSocket');
              this.processAplicaciones(innerMessage);
            } else {
              console.log('🎯 Issues recibidas del servidor:', innerMessage.length);
              this.processGitHubIssues(innerMessage);
            }
          } else if (innerMessage && innerMessage.issues && Array.isArray(innerMessage.issues)) {
            console.log('🎯 Issues recibidas del servidor:', innerMessage.issues.length);
            this.processGitHubIssues(innerMessage.issues);
          } else if (innerMessage && innerMessage.aplicaciones && Array.isArray(innerMessage.aplicaciones)) {
            console.log('🏢 Aplicaciones recibidas por WebSocket:', innerMessage.aplicaciones.length);
            this.processAplicaciones(innerMessage.aplicaciones);
          } else {
            console.log('📄 Mensaje del servidor:', innerMessage);
          }
          
        } catch (e) {
          console.error('Inner message is not valid JSON:', parsedMsg.message);
          
          // Intentar extraer JSON de un mensaje mixto (texto + JSON)
          const jsonMatch = this.extractJSONFromMessage(parsedMsg.message);
          if (jsonMatch) {
            console.log('🔧 JSON extraído de mensaje mixto');
            if (Array.isArray(jsonMatch)) {
              // Detectar si son aplicaciones o issues también en el JSON extraído
              const firstItem = jsonMatch[0];
              if (firstItem && this.isApplicationData(firstItem)) {
                console.log('🏢 Aplicaciones extraídas del mensaje:', jsonMatch.length);
                this.processAplicaciones(jsonMatch);
              } else {
                console.log('🎯 Issues extraídas del mensaje:', jsonMatch.length);
                this.processGitHubIssues(jsonMatch);
              }
            } else if (jsonMatch.issues && Array.isArray(jsonMatch.issues)) {
              console.log('🎯 Issues extraídas del mensaje:', jsonMatch.issues.length);
              this.processGitHubIssues(jsonMatch.issues);
            } else if (jsonMatch.aplicaciones && Array.isArray(jsonMatch.aplicaciones)) {
              console.log('🏢 Aplicaciones extraídas del mensaje:', jsonMatch.aplicaciones.length);
              this.processAplicaciones(jsonMatch.aplicaciones);
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
    this.aplicacionSeleccionada = aplicacion;
    
    // Mostrar estado de carga
    this.loadingIssues = true;
    this.errorLoadingIssues = false;
    this.showIssuesTable = true; // Mostrar la tabla inmediatamente con loading
    
    // Limpiar issues anteriores
    this.issuesData = [];
    
    console.log('🚀 Cargando issues para la aplicación seleccionada...');
    console.log('⏳ Estado de carga activado');
    
    // Cargar issues
    this.getListIssues();
  }

  /**
   * Load Issues (Mock data for now)
   */
  cargarIssues(): void {
    console.log('⚠️ cargarIssues() llamado - NO debería sobrescribir datos reales');
    console.log('📊 issuesData.length actual antes de cargarIssues:', this.issuesData.length);
    
    // TEMPORALMENTE COMENTADO para evitar sobrescribir datos reales
    // Solo cargar mock si NO hay datos del servicio
    if (this.issuesData.length === 0) {
      console.log('📝 Cargando datos mock como fallback');
      // Mock issues data - More realistic and complete
    this.issuesData = [
      {
        id: 1,
        title: 'Error en el login de usuarios - Validación de credenciales falla',
        description: 'Los usuarios no pueden iniciar sesión cuando ingresan credenciales válidas. El sistema devuelve error 401 incluso con datos correctos.',
        state: 'open',
        priority: 'high',
        assignee: 'Juan Pérez',
        assignee_avatar: '',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-20'),
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
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-18'),
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
        created_at: new Date('2024-01-05'),
        updated_at: new Date('2024-01-15'),
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
        created_at: new Date('2024-01-12'),
        updated_at: new Date('2024-01-19'),
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
        created_at: new Date('2024-01-08'),
        updated_at: new Date('2024-01-22'),
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
        created_at: new Date('2024-01-14'),
        updated_at: new Date('2024-01-21'),
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
        created_at: new Date('2024-01-03'),
        updated_at: new Date('2024-01-17'),
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
        created_at: new Date('2024-01-16'),
        updated_at: new Date('2024-01-16'),
        labels: ['infrastructure', 'backup', 'automation'],
        comments: 2,
        milestone: 'v2.1.0',
        author: 'Elena Vargas',
        tipo: 'Task'
      }
    ];
    
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
    this.issuesData = [];
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
    
    // Usar el servicio para cargar las issues
    this.githubIssuesService.loadIssues(this.userId).subscribe({
      next: (issues) => {
        console.log('✅ Issues cargadas desde el servicio:', issues.length);
        
        // Actualizar los datos del componente
        this.issuesData = issues;
        
        // Actualizar estados de carga
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
   */
  getListAplicaciones(): void {
    console.log('🚀 INICIANDO getListAplicaciones()');
    console.log('📋 userId:', this.userId);
    console.log('📊 aplicaciones actual length:', this.aplicaciones.length);
    
    // Establecer estado de carga
    this.loadingAplicaciones = true;
    this.errorLoadingAplicaciones = false;
    
    const fnx = {
      funcion: "Fnx_ListaAplicacionGitea",
      id_cliente: this.userId
    };
    console.log('📤 Enviando al servicio:', fnx);
    console.log('aaaaaaaaaaaaaaaaaaa');
    this.apiService.ExecFnx(fnx).subscribe(
      (data) => {
        console.log('Respuesta del servicio aplicaciones:', data);
        
        // Verificar si la respuesta contiene datos válidos
        if (data && Array.isArray(data)) {
          console.log('🎯 Aplicaciones recibidas del servicio (array directo):', data.length);
          this.processAplicaciones(data);
        } else if (data && data.contenido) {
          // El contenido puede ser un array o un objeto con un array
          if (Array.isArray(data.contenido)) {
            console.log('🎯 Aplicaciones recibidas del servicio (data.contenido array):', data.contenido.length);
            this.processAplicaciones(data.contenido);
          } else if (data.contenido.aplicaciones && Array.isArray(data.contenido.aplicaciones)) {
            console.log('🎯 Aplicaciones recibidas del servicio (data.contenido.aplicaciones):', data.contenido.aplicaciones.length);
            this.processAplicaciones(data.contenido.aplicaciones);
          } else {
            console.log('🔍 Contenido del servicio:', data.contenido);
            // Si contenido no es array, intentar extraer las aplicaciones
            const keys = Object.keys(data.contenido || {});
            console.log('🔍 Claves en contenido:', keys);
            
            // Buscar la primera clave que contenga un array
            for (const key of keys) {
              if (Array.isArray(data.contenido[key])) {
                console.log(`🎯 Aplicaciones encontradas en data.contenido.${key}:`, data.contenido[key].length);
                this.processAplicaciones(data.contenido[key]);
                return;
              }
            }
            
            console.warn('⚠️ No se encontraron aplicaciones en el contenido');
            this.loadMockAplicaciones();
          }
        } else if (data && data.data && Array.isArray(data.data)) {
          console.log('🎯 Aplicaciones recibidas del servicio (data.data):', data.data.length);
          this.processAplicaciones(data.data);
        } else {
          console.warn('⚠️ Respuesta del servicio no contiene aplicaciones válidas:', data);
          console.log('🔍 Estructura de la respuesta:', Object.keys(data || {}));
          
          // Cargar datos mock como fallback
          this.loadMockAplicaciones();
        }
        
        // Finalizar estado de carga
        this.loadingAplicaciones = false;
      },
      (error) => {
        console.log('errooooooor muestro datos mockkkkkkkk');
        console.error('❌ Error al obtener aplicaciones del servicio:', error);
        
        // En caso de error, cargar datos mock como fallback
        this.loadMockAplicaciones();
        
        // Intentar obtener aplicaciones por WebSocket como último recurso
        console.log('🔌 Intentando obtener aplicaciones por WebSocket...');
        this.requestApplicationsViaWebSocket();
        
        // Establecer estado de error
        this.loadingAplicaciones = false;
        this.errorLoadingAplicaciones = true;
      }
    );
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
   * Process applications received from service
   */
  private processAplicaciones(rawAplicaciones: any[]): void {
    console.log('🔄 Procesando aplicaciones recibidas:', rawAplicaciones);
    
    // Crear nombres más amigables para mostrar en las cards
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
    
    const processedAplicaciones = rawAplicaciones.map(app => ({
      id: app.id,
      name: friendlyNames[app.name] || app.name, // Usar nombre amigable si existe
      repository: app.name, // usar name como repository
      owner: app.full_name ? app.full_name.split('/')[0] : 'code-epic', // extraer owner de full_name
      full_name: app.full_name
    }));
    
    console.log('✅ Aplicaciones procesadas:', processedAplicaciones.length);
    console.log('📋 Primeras 3 aplicaciones:', processedAplicaciones.slice(0, 3));
    
    // Actualizar AMBAS listas para asegurar compatibilidad con el template
    this.aplicaciones = processedAplicaciones;
    this.lstAplicaciones = processedAplicaciones; // Esta es la que usa el template para las cards
    
    console.log('🎯 Cards de aplicaciones listas para mostrar:', this.lstAplicaciones.length);
    
    // Asegurar que NO se muestre la tabla de issues automáticamente
    this.showIssuesTable = false;
    this.aplicacionSeleccionada = null;
    
    console.log('🏠 Mostrando cards de aplicaciones - tabla oculta');
  }

  /**
   * Load mock applications data as fallback
   */
  private loadMockAplicaciones(): void {
    console.log('📏 Cargando datos mock de aplicaciones como fallback');
    
    const mockData = [
      { id: 1, name: 'Fideicomiso - Code Epic', repository: 'fideicomiso', owner: 'code-epic', full_name: 'code-epic/fideicomiso' },
      { id: 2, name: 'Sistema de Inventario', repository: 'inventario', owner: 'code-epic', full_name: 'code-epic/inventario' },
      { id: 3, name: 'Gestión de Documentos', repository: 'gdoc', owner: 'code-epic', full_name: 'code-epic/gdoc' },
      { id: 4, name: 'Nómina Empresarial', repository: 'nomina', owner: 'code-epic', full_name: 'code-epic/nomina' },
      { id: 5, name: 'Sandra CLI', repository: 'sandra_cli', owner: 'code-epic', full_name: 'code-epic/sandra_cli' },
      { id: 6, name: 'V2 Consola', repository: 'v2consola', owner: 'code-epic', full_name: 'code-epic/v2consola' }
    ];
    
    // Actualizar AMBAS listas como hace processAplicaciones
    this.aplicaciones = mockData;
    this.lstAplicaciones = mockData; // Esta es la que usa el template para las cards
    
    console.log('🏠 Cards mock cargadas, esperando datos reales del WebSocket...');
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
   * Extract JSON from mixed text/JSON messages
   */
  private extractJSONFromMessage(message: string): any | null {
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
   * Process GitHub Issues received from WebSocket
   * Now uses GitHubIssuesService for processing
   */
  private processGitHubIssues(rawIssues: any[]): void {
    console.log('🔄 Componente: Delegando procesamiento de issues al servicio');
    
    // Usar el servicio para procesar las issues
    const processedIssues = this.githubIssuesService.processIssues(rawIssues);
    
    // Actualizar los datos del componente con las issues procesadas
    console.log('🔄 ANTES de actualizar issuesData. Length actual:', this.issuesData.length);
    this.issuesData = processedIssues;
    console.log('✅ DESPUÉS de actualizar issuesData. Nuevo length:', this.issuesData.length);
    console.log('📋 Primeras 3 issues procesadas:', this.issuesData.slice(0, 3).map(i => ({id: i.id, title: i.title, priority: i.priority})));
    
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

}
