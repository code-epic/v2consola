import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { NgbModule, NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { CoreCommonModule } from "@core/common.module";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable";

import { ApiService, IAPICore } from "@services/apicore/api.service";
import { WsocketsService } from "@services/websockets/wsockets.service";
import { UtilService } from "@services/util/util.service";
import { TaskService } from "@services/apicore/task.service";
import { CompresionService } from "@services/util/compresion.service";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface IActividad {
  fecha: string;
  metodo: string;
  total: number;
}

export interface IUsuarioBitacora {
  actividad: IActividad[];
  id_origen: string;
  login: string;
  nombre: string;
  subtotal_logs: number;
}

export interface IAplicacionBitacora {
  aplicacion: string;
  codigo_app: string;
  conteo_usuarios: number;
  usuarios: IUsuarioBitacora[];
}

export interface ILog {
  fecha: string;
  hash: string;
  segundos: number;
}

export interface IFuncion {
  costo_kb: string;
  ejecuciones: number;
  logs: ILog[];
  nombre_funcion: string;
  v: string;
  ultimaFecha?: string;
}

export interface IMetodoBitacora {
  funciones: IFuncion[];
  metodo: string | null;
  total_invocaciones: number;
}


@Component({
    selector: 'app-binnacle-applications',
    templateUrl: './binnacle-applications.component.html',
    styleUrls: ['./binnacle-applications.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [NgbModalConfig, NgbModal],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgbModule,
        CoreCommonModule,
        CoreDirectivesModule,
        CorePipesModule,
        ContentHeaderComponent
    ]
})
export class BinnacleApplicationsComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
  };

  public msj: string = "Cargardo!!! por favor espere..."

  public xrs: string = ""


  public ListarBitacora = [];
  public tempData = [];
  public rowData = [];

  public ListarBitacoraRegistros: any;
  public tempDataRegistros = [];
  public rowDataRegistros = [];

  // Pagination
  public page = 1;
  public pageSize = 7;

  // Detalle del Log para el Modal
  public detailedLog: any = null;
  public decodedConsulta: string = '';
  public decodedContenido: string = '';

  // Estado de Navegación dentro del Modal
  public selectedActivity: any = null;
  public selectedActivityLogs: any[] = [];

  public searchValue = '';
  public searchRegistrosCtrl = new FormControl('');

  public urlID: Partial<IAplicacionBitacora> = {}

  // public
  public contentHeader: object;
  public basicSelectedOption: number = 7;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  public ObjDetalle: any = {};

  // State for Modal Navigation
  public currentFunctionData: IFuncion | null = null;
  public currentModalTemplate: any = null;
  public selectedLog: any = null;


  constructor(
    private taskService: TaskService,
    private apiService: ApiService,
    private msjService: WsocketsService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private compresionService: CompresionService
  ) { }

  async ngOnInit() {
    // content header

    const datoBase64 = this.route.snapshot.paramMap.get('id');

    if (datoBase64) {
      const datoDecodificado = atob(datoBase64);
      const objetoRecibido: IAplicacionBitacora = JSON.parse(datoDecodificado);
      this.urlID = objetoRecibido;

      // Verificar si existe antes de acceder
      if (!objetoRecibido.aplicacion) {
        this.utilService.AlertMini('top-end', 'error', 'La propiedad aplicacion no existe en el objeto recibido.', 3000)
      }

      console.log(this.urlID.usuarios[0].login);
    }

    // this.urlID.usuarios?.forEach(e => {
    //   this.ListarBitacora.push(e);
    // });

    // this.rowData = this.ListarBitacora;
    // this.tempData = this.rowData;
    this.LoadData();

    this.contentHeader = {
      headerTitle: "Auditoría",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: 'Principal',
            isLink: true,
            link: '/home',
          },
          {
            name: "Auditoria",
            isLink: false,
          },
          {
            name: "Bitacora",
            isLink: true,
            link: "/investigation/binnacle",
          },
          {
            name: this.urlID.aplicacion,
            isLink: false,
          },
        ],
      },
    };

  }

  LoadData() {
    this.xAPI = {} as IAPICore;

    this.xAPI.funcion = "_SYS_CLogPatterns";
    this.xAPI.parametros = this.urlID.usuarios[0].login;
    this.xAPI.valores = {};
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: IMetodoBitacora[]) => {
        const definedMethods: IMetodoBitacora[] = [];
        const undefinedFunctions: IFuncion[] = [];
        let undefinedInvocations = 0;

        if (data && Array.isArray(data)) {
          data.forEach(m => {
            // Calcular log más reciente
            if (m.funciones) {
              m.funciones.forEach(f => {
                if (f.logs && f.logs.length > 0) {
                  // Ordenar por fecha desc para encontrar el último
                  // Asumiendo formato ISO que permite comparación de strings directa, o usando Date
                  const latest = f.logs.reduce((prev, current) => (prev.fecha > current.fecha) ? prev : current);
                  f.ultimaFecha = latest.fecha;
                }
              });
            }

            if (m.metodo && m.metodo.trim() !== '') {
              definedMethods.push(m);
            } else {
              if (m.funciones) {
                undefinedFunctions.push(...m.funciones);
              }
              undefinedInvocations += (m.total_invocaciones || 0);
            }
          });
        }

        if (undefinedFunctions.length > 0) {
          definedMethods.push({
            metodo: 'OTRAS OPERACIONES',
            funciones: undefinedFunctions,
            total_invocaciones: undefinedInvocations
          });
        }

        this.ListarBitacora = definedMethods;
        this.rowData = this.ListarBitacora;
        this.tempData = this.rowData;
      });
  }

  ModalExePlay(modal: any, data: IFuncion) {
    this.currentModalTemplate = modal;
    this.currentFunctionData = data;
    this.selectedActivity = null; // Resetea la vista al abrir el modal
    this.ListarBitacoraRegistros = data.logs.map(log => ({
      ...log,
      formattedDuration: this.formatSeconds(log.segundos)
    }));
    this.rowDataRegistros = [...this.ListarBitacoraRegistros];
    this.tempDataRegistros = [...this.ListarBitacoraRegistros]; // Guardar copia para el filtro
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalVerConsulta(modal: any, log: any) {
    this.detailedLog = log;

    this.decodedConsulta = log.consulta
      ? this.decodificar(log.consulta)
      : 'No hay consulta para mostrar.';

    this.decodedContenido = log.contenido
      ? this.compresionService.descomprimirZip(log.contenido)
      : 'No hay contenido para mostrar.';

    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  /**
   * Muestra los logs de una actividad seleccionada dentro del modal.
   * @param activity La fila de la actividad seleccionada.
   */
  viewActivityLogs(activity: any) {
    this.selectedActivity = activity;
    this.selectedActivityLogs = activity.logs;
  }

  /** Vuelve a la vista de la lista de actividades. */
  goBackToActivities() {
    this.selectedActivity = null;
  }

  /**
   * Devuelve un ícono de Feather apropiado basado en el nombre de la actividad.
   * @param activityName El nombre de la actividad.
   * @returns El nombre del ícono de Feather.
   */
  getIconForActivity(activityName: string): string {
    const name = activityName.toLowerCase();
    if (name.includes('actualiza')) return 'edit-2';
    if (name.includes('crea') || name.includes('inserta')) return 'plus-circle';
    if (name.includes('elimina') || name.includes('borra')) return 'trash-2';
    if (name.includes('login') || name.includes('sesión')) return 'log-in';
    if (name.includes('consulta') || name.includes('lista')) return 'search';
    return 'activity'; // Ícono por defecto
  }


  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.id_usuario.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    // Reset to first page
    this.page = 1;
  }

  filterUpdateRegister(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temps = this.tempDataRegistros.filter(d => {
      return d.nombre.toLowerCase().indexOf(val) !== -1 || !val;
    }); // Corregido de 'usuario' a 'nombre'
    // update the rows
    this.rowDataRegistros = temps;
    // Reset to first page
    this.page = 1;
  }

  /**
   * Formatea la duración en nanosegundos a una unidad legible
   * @param nanoseconds Duración en nanosegundos
   * @returns String formateado con la unidad apropiada
   */
  formatDuration(nanoseconds: number): string {
    if (!nanoseconds || nanoseconds === 0) {
      return '0 ns';
    }

    const seconds = nanoseconds / 1_000_000_000;
    const milliseconds = nanoseconds / 1_000_000;
    const microseconds = nanoseconds / 1_000;

    // Si es mayor o igual a 1 segundo
    if (seconds >= 1) {
      return `${seconds.toFixed(2)} s`;
    }
    // Si es mayor o igual a 1 milisegundo
    else if (milliseconds >= 1) {
      return `${milliseconds.toFixed(2)} ms`;
    }
    // Si es mayor o igual a 1 microsegundo
    else if (microseconds >= 1) {
      return `${microseconds.toFixed(2)} μs`;
    }
    // Menor a 1 microsegundo, mostrar en nanosegundos
    else {
      return `${nanoseconds.toLocaleString('es-ES')} ns`;
    }
  }

  /**
   * Limpia el filtro de búsqueda de registros
   */
  clearSearch(): void {
    this.searchRegistrosCtrl.setValue('');
    this.rowDataRegistros = this.tempDataRegistros;
    this.page = 1;
  }

  /**
   * Copia un texto al portapapeles y muestra una alerta.
   * @param text El texto a copiar.
   */
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.utilService.AlertMini('top-end', 'success', 'Copiado al portapapeles', 1500);
    });
  }

  cerrarModal() {
    this.modalService.dismissAll();
  }

  /**
 * Exporta la bitácora a un documento PDF con un diseño mejorado y profesional.
 * 
 * Normas y Buenas Prácticas Aplicadas:
 * 1.  **Claridad y Legibilidad**: Se utilizan fuentes estándar (Helvetica) y un diseño limpio con espaciado adecuado.
 *     La información se presenta de forma jerárquica y fácil de leer.
 * 2.  **Contenido Esencial (Adaptado de NIST SP 800-53 - AU-3)**: Aunque no se implementa la norma completa,
 *     el reporte incluye información clave recomendada para pistas de auditoría:
 *     - Quién (ID de Usuario)
 *     - Qué (Tipo de evento/actividad)
 *     - Cuándo (Fecha y hora)
 *     - Información adicional (Duración de la operación)
 * 3.  **Integridad de la Información**: Se eliminó la columna HASH a petición, pero se mantiene un formato
 *     consistente para facilitar la revisión manual. En un entorno de alta seguridad, se recomendaría
 *     mantener hashes o firmas digitales para garantizar la no repudiación.
 * 4.  **Metadatos del Reporte**: La portada y el pie de página incluyen metadatos cruciales como el nombre
 *     de la aplicación, la fecha de generación del reporte y la paginación, lo cual es vital para la
 *     gestión de documentos.
 * 5.  **Resumen Ejecutivo**: Se incluye un resumen al final del documento que proporciona una vista rápida
 *     de las métricas clave, útil para análisis gerencial.
 */
  exportarBitacoraPDF(): void {
    if (this.rowData.length === 0) {
      this.utilService.AlertMini('top-end', 'warning', 'No hay datos para exportar.', 2000);
      return;
    }

    // const doc = new jsPDF({
    //   orientation: 'p',
    //   unit: 'pt',
    //   format: 'letter'
    // });

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;



    // ==========================================
    // PÁGINA 1: PORTADA ELEGANTE
    // ==========================================

    // Titulo Principal - Azul Suave
    doc.setFontSize(26);
    doc.setTextColor(100, 181, 246); // Blue 300 (Pastel)
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE BITÁCORA', pageWidth / 2, 80, { align: 'center' });

    // Línea Decorativa Sutil
    doc.setDrawColor(224, 224, 224); // Grey 300
    doc.setLineWidth(0.5);
    doc.line(60, 85, pageWidth - 60, 85);

    // Subtítulo (Nombre del Perfil)
    doc.setFontSize(18);
    doc.setTextColor(97, 97, 97); // Grey 700
    doc.text(this.urlID.aplicacion || 'Aplicación no especificada', pageWidth / 2, 100, { align: 'center' });

    // Detalles Centrados
    doc.setFontSize(12);
    doc.setTextColor(117, 117, 117); // Grey 600
    doc.text('Resumen General de la Aplicación', pageWidth / 2, 180, { align: 'center' });
    doc.text(`Generado el: ${new Date().toLocaleString()}`, pageWidth / 2, 122, { align: 'center' });

    // Información de generación
    // doc.setFontSize(9);
    // doc.setTextColor(189, 189, 189); // Grey 400
    // doc.text(`Generado el: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // ==========================================
    // PÁGINA 2+: TABLA DE LOGS
    // ==========================================
    doc.addPage();

    const tableData = [];
    this.rowData.forEach(user => {
      if (user.actividad && user.actividad.length > 0) {
        user.actividad.forEach(activity => {
          if (activity.logs && activity.logs.length > 0) {
            activity.logs.forEach(log => {
              tableData.push({
                usuario: user.id_usuario,
                actividad: activity.nombre,
                fecha: new Date(log.fecha).toLocaleString('es-VE'),
                duracion: this.formatDuration(log.duracion),
              });
            });
          }
        });
      }
    });

    autoTable(doc, {
      startY: 27,
      head: [['USUARIO', 'ACTIVIDAD', 'FECHA Y HORA', 'DURACIÓN']],
      body: tableData.map(d => [d.usuario, d.actividad, d.fecha, d.duracion]),
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        valign: 'middle',
        lineColor: [238, 238, 238],
        lineWidth: 0.1,
        textColor: [97, 97, 97]
      },

      headStyles: {
        fillColor: [255, 255, 255], // White Header
        textColor: [100, 181, 246], // Blue Text
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0, // No borders on header
        lineColor: [255, 255, 255]
      },

      columnStyles: {
        0: { cellWidth: 0 },
        3: { cellWidth: 40, halign: 'center' }
      },

      didDrawPage: (data) => {
        // Encabezado en cada página de la tabla
        doc.setFontSize(14);
        doc.setTextColor(100, 181, 246);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 181, 246);
        doc.text('Registros detallados de la bitácora', 14, 20);



        // doc.text('Detalle de Actividades y Logs', pageWidth / 2, 40, { align: 'center' });

        // Pie de página
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(189, 189, 189); // Grey 400
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
        doc.text(`Impreso: ${new Date().toLocaleString('es-VE')}`, 40, pageHeight - 20);
      }
    });

    // ==========================================
    // SECCIÓN FINAL: RESUMEN
    // ==========================================
    let finalTableY = (doc as any).lastAutoTable.finalY;
    if (pageHeight - finalTableY < 150) { // Si no hay espacio, agregar nueva página
      doc.addPage();
      finalTableY = 40;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(97, 97, 97); // Grey 700
    doc.text('Resumen del Reporte', 15, finalTableY + 15);

    const totalUsuarios = this.rowData.length;
    const totalActividades = this.rowData.reduce((sum, user) => sum + (user.actividad ? user.actividad.length : 0), 0);
    const totalLogs = tableData.length;

    const summaryText = `
    - Total de Usuarios con Actividad: ${totalUsuarios}
    - Total de Tipos de Actividad Registradas: ${totalActividades}
    - Total de Registros (Logs): ${totalLogs}
    `;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(97, 97, 97); // Grey 700
    doc.text(summaryText, 18, finalTableY + 18);

    const fileName = `Bitacora_${this.urlID.aplicacion || 'Reporte'}.pdf`.replace(/ /g, '_');
    doc.save(fileName);
  }

  formatSeconds(seconds: number): string {
    if (!seconds) return '0 s';
    if (seconds < 0.000001) return `${(seconds * 1000000000).toFixed(0)} ns`;
    if (seconds < 0.001) return `${(seconds * 1000000).toFixed(2)} μs`;
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`;
    return `${seconds.toFixed(2)} s`;
  }

  decodificar(cadena: string): string {
    try {
      return atob(cadena);
    } catch (e) {
      return 'Error al decodificar la cadena';
    }
  }

  openDetail(log: any, modal: any) {
    this.selectedLog = log; // Save context
    const hash = log.hash;
    this.xAPI.funcion = "_SYS_CLogPatternsHash";
    this.xAPI.parametros = hash;
    this.xAPI.valores = {};

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.ObjDetalle = data[0];

          this.decodedConsulta = this.ObjDetalle.consulta ? this.decodificar(this.ObjDetalle.consulta) : '{}';
          try {
            this.decodedConsulta = JSON.stringify(JSON.parse(this.decodedConsulta), null, 2);
          } catch (e) { }

          if (this.ObjDetalle.contenido && this.ObjDetalle.contenido.Data) {
            let encodedData = this.ObjDetalle.contenido.Data.replace(/\s/g, '');
            try {
              const firstPass = atob(encodedData);
              // Check if it's double encoded (starts with "H4s" which is base64 for gzip header)
              if (firstPass.length > 3 && firstPass.substring(0, 3) === 'H4s') {
                encodedData = firstPass;
              }
            } catch (e) { console.error('Decode check failed', e); }

            const unzip = this.compresionService.descomprimirZip(encodedData);
            this.decodedContenido = unzip;

            if (unzip) {
              try {
                this.decodedContenido = JSON.stringify(JSON.parse(unzip), null, 2);
              } catch (e) { }
            } else {
              this.decodedContenido = "Error: No se pudo descomprimir el contenido.";
            }
          } else {
            this.decodedContenido = '{}';
          }

          // Cierra el modal anterior
          this.modalService.dismissAll();

          // Abre el nuevo modal con las opciones solicitadas
          const modalRef = this.modalService.open(modal, {
            size: 'xl',
            centered: true,
            backdrop: false,
            keyboard: false,
            windowClass: 'fondo-modal'
          });

          // Al cerrar, reabrir el anterior
          modalRef.result.then(() => {
            this.reopenPrevious();
          }, () => {
            this.reopenPrevious();
          });
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  reopenPrevious() {
    if (this.currentModalTemplate && this.currentFunctionData) {
      this.ModalExePlay(this.currentModalTemplate, this.currentFunctionData);
    }
  }


}
