import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { SessionService } from '@services/util/session.service';

// Interface for GitHub Issues
export interface Issue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  body: string;
  user: { login: string };
}
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
// Cargar issues del servicio al inicializar
this.getListIssues();
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
          
          // Procesar si es respuesta de GitHub Issues
          if (innerMessage && Array.isArray(innerMessage)) {
            console.log('🎯 Issues recibidas del servidor:', innerMessage.length);
            this.processGitHubIssues(innerMessage);
          } else if (innerMessage && innerMessage.issues && Array.isArray(innerMessage.issues)) {
            console.log('🎯 Issues recibidas del servidor:', innerMessage.issues.length);
            this.processGitHubIssues(innerMessage.issues);
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
              console.log('🎯 Issues extraídas del mensaje:', jsonMatch.length);
              this.processGitHubIssues(jsonMatch);
            } else if (jsonMatch.issues && Array.isArray(jsonMatch.issues)) {
              console.log('🎯 Issues extraídas del mensaje:', jsonMatch.issues.length);
              this.processGitHubIssues(jsonMatch.issues);
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
    // Mostrar la tabla inmediatamente si ya hay datos del servicio
    if (this.issuesData.length > 0) {
      this.showIssuesTable = true;
    } else {
      // Si no hay datos, cargar del servicio
      this.getListIssues();
    }
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
    console.log('🚀 INICIANDO getListIssues()');
    console.log('📋 userId:', this.userId);
    console.log('📊 issuesData actual length:', this.issuesData.length);
    
    const fnx = {
      funcion: "Fnx_DatosServidorGitHub",
      id_cliente: this.userId
    };
    console.log('📤 Enviando al servicio:', fnx);
 
    this.apiService.ExecFnx(fnx).subscribe(
      (data) => {
        console.log('Respuesta del servicio:', data);
        
        // Verificar si la respuesta contiene datos válidos
        if (data && Array.isArray(data)) {
          console.log('🎯 Issues recibidas del servicio (array directo):', data.length);
          this.processGitHubIssues(data);
        } else if (data && data.issues && Array.isArray(data.issues)) {
          console.log('🎯 Issues recibidas del servicio (data.issues):', data.issues.length);
          this.processGitHubIssues(data.issues);
        } else if (data && data.contenido && Array.isArray(data.contenido)) {
          console.log('🎯 Issues recibidas del servicio (data.contenido):', data.contenido.length);
          this.processGitHubIssues(data.contenido);
        } else if (data && data.contenido && data.contenido.issues && Array.isArray(data.contenido.issues)) {
          console.log('🎯 Issues recibidas del servicio (data.contenido.issues):', data.contenido.issues.length);
          this.processGitHubIssues(data.contenido.issues);
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
              this.processGitHubIssues(contenido.issues);
              return;
            } else if (contenido.data && Array.isArray(contenido.data)) {
              console.log('🎯 Issues encontradas en contenido.data:', contenido.data.length);
              this.processGitHubIssues(contenido.data);
              return;
            } else if (contenido.result && Array.isArray(contenido.result)) {
              console.log('🎯 Issues encontradas en contenido.result:', contenido.result.length);
              this.processGitHubIssues(contenido.result);
              return;
            }
          }
          
          // Mantener datos mock si no hay respuesta válida
          this.cargarIssues();
        }
      },
      (error) => {
        console.error('❌ Error al obtener issues del servicio:', error);
        // En caso de error, cargar datos mock como fallback
        this.cargarIssues();
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
   * Extract labels from module information
   */
  private extractLabels(moduleInfo: string): string[] {
    if (!moduleInfo) return [];
    
    const labels: string[] = [];
    
    // Extraer módulo principal
    const parts = moduleInfo.split(' - ');
    if (parts.length > 0) {
      labels.push(parts[0].trim().toLowerCase());
    }
    
    // Agregar submódulo si existe
    if (parts.length > 1) {
      labels.push(parts[1].trim().toLowerCase());
    }
    
    return labels.slice(0, 3); // Máximo 3 labels
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
        // Buscar un array JSON usando regex más específico
        // Buscar desde [ hasta ] que contenga objetos con "number", "title", etc.
        const jsonMatch = message.match(/\[\s*\{[\s\S]*?"number"[\s\S]*?\}\s*\]/g);
        if (jsonMatch && jsonMatch.length > 0) {
          console.log('✅ JSON extraído con regex, parseando...');
          const extractedJson = jsonMatch[0];
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
   */
  private processGitHubIssues(rawIssues: any[]): void {
    console.log('🔄 Procesando issues recibidas:', rawIssues);
    
    const processedIssues: Issue[] = [];
    
    rawIssues.forEach((rawIssue, index) => {
      try {
        // Extraer información adicional del body para la tabla
        const bodyText = rawIssue.body || rawIssue.description || '';
        const moduleMatch = bodyText.match(/\*\*Módulo - Funcionalidad\*\*\s*([^\n]+)/i);
        const reportedByMatch = bodyText.match(/\*\*Reportado\*\*\s*([^\n]+)/i);
        const typeMatch = bodyText.match(/\*\*Tipo de Hallazgo\*\*\s*([^\n]+)/i);
        const priorityMatch = bodyText.match(/\*\*Prioridad\*\*\s*([^\n]+)/i);
        
        // Mapear los datos recibidos a la interfaz Issue con campos adicionales para la tabla
        const issue: any = {
          // Campos de la interfaz Issue
          number: rawIssue.number || index + 1,
          title: rawIssue.title || 'Sin título',
          state: (rawIssue.state === 'open' || rawIssue.state === 'closed') ? rawIssue.state : 'open',
          body: bodyText,
          user: {
            login: rawIssue.user?.login || rawIssue.author || 'usuario-desconocido'
          },
          // Campos adicionales para la tabla
          id: rawIssue.number || index + 1,
          tipo: this.mapIssueType(typeMatch?.[1] || 'Solicitud del usuario'),
          priority: this.mapPriority(priorityMatch?.[1] || 'medium'),
          assignee: rawIssue.assignee?.login || null,
          author: rawIssue.user?.login || 'externosandra',
          labels: this.extractLabels(moduleMatch?.[1] || 'General'),
          created_at: new Date().toISOString(), // Gitea no envía fecha, usar actual
          updated_at: new Date().toISOString(),
          comments: Math.floor(Math.random() * 5), // Simular comentarios
          milestone: null
        };
        
        processedIssues.push(issue);
        
        // Mostrar cada issue en consola con formato legible
        console.log(`📋 Issue #${issue.number}:`, {
          título: issue.title,
          estado: issue.state,
          autor: issue.user.login,
          descripción: issue.body.substring(0, 100) + (issue.body.length > 100 ? '...' : '')
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
    
    // Actualizar los datos del componente con las issues reales
    console.log('🔄 ANTES de actualizar issuesData. Length actual:', this.issuesData.length);
    this.issuesData = processedIssues;
    console.log('✅ DESPUÉS de actualizar issuesData. Nuevo length:', this.issuesData.length);
    console.log('📋 Primeras 3 issues procesadas:', this.issuesData.slice(0, 3).map(i => ({id: i.id, title: i.title})));
    
    // Mostrar la tabla automáticamente cuando se reciben las issues
    this.showIssuesTable = true;
    console.log('👁️ showIssuesTable establecido a:', this.showIssuesTable);
    
    // Simular que se seleccionó una aplicación para mostrar la tabla correctamente
    if (!this.aplicacionSeleccionada) {
      this.aplicacionSeleccionada = {
        id: 1,
        name: 'Fideicomiso - Code Epic',
        repository: 'fideicomiso',
        owner: 'code-epic'
      };
      console.log('🏢 aplicacionSeleccionada establecida:', this.aplicacionSeleccionada.name);
    }
  }

}
