import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { SessionService } from '@services/util/session.service';
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

  constructor(private modalService: NgbModal, private apiService: ApiService, private sessionService: SessionService) {
    // Mock data for applications
    this.lstAplicaciones = [
      { id: 1, name: 'Sistema de Inventario', repository: 'inventory-system', owner: 'empresa' },
      { id: 2, name: 'Portal Web', repository: 'web-portal', owner: 'empresa' },
      { id: 3, name: 'API de Servicios', repository: 'services-api', owner: 'empresa' },
      { id: 4, name: 'Dashboard Analytics', repository: 'analytics-dashboard', owner: 'empresa' }
    ];
  }

  ngOnInit(): void {


    this.userId = this.getUserId();
console.log("llego");
    // Connect to WebSocket with userId
    this.sessionService.connect(this.userId);

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
        } catch (e) {
          console.error('Inner message is not valid JSON:', parsedMsg.message);
          // Si no es JSON, tratarlo como texto plano para compatibilidad
          innerMessage = { mensaje: parsedMsg.message };
        }
      }
    });
    // Content header configuration
    this.contentHeader = {
      headerTitle: 'GitHub Issues',
      actionButton: false,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Inicio',
            isLink: true,
            link: '/'
          },
          {
            name: 'GitHub',
            isLink: false
          },
          {
            name: 'Issues',
            isLink: false
          }
        ]
      }
    };
  }

  /**
   * Select Application
   */
  seleccionarAplicacion(aplicacion: any): void {
    this.aplicacionSeleccionada = aplicacion;
    // Add a small delay to show loading state
    setTimeout(() => {
      this.cargarIssues();
    }, 1000);
  }

  /**
   * Load Issues (Mock data for now)
   */
  cargarIssues(): void {
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


  getListIssues(): Observable<any> {
    const fnx = {
      funcion: "Fnx_DatosServidorGitHub",
      id_cliente: this.userId
    };
  
    return new Observable(observer => {
      this.apiService.ExecFnx(fnx).subscribe(
        (data) => {
         console.log(data);
        },
        (error) => {
          console.log(error);
          observer.error(error);
        }
      );
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

}
