import { Component, OnInit, ViewEncapsulation, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { NgbModule, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CoreCommonModule } from "@core/common.module";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";
import { CompresionService } from "@services/util/compresion.service";
import { UtilService } from "@services/util/util.service";
import * as jspdf from 'jspdf';
import 'jspdf-autotable';

export interface ILog {
  fecha: string;
  hash: string;
  segundos: number;
  formattedDuration?: string;
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
    selector: 'app-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.scss'],
    encapsulation: ViewEncapsulation.None,
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
export class EventComponent implements OnInit {

  public contentHeader: any;
  
  // Pagination for Users
  public userPage: number = 1;
  public userPageSize: number = 25;

  searchTextCtrl = new FormControl('');
  get searchText() { return this.searchTextCtrl.value; }
  public usuarios: any[] = [];
  public selectedUser: any = null;
  public ListarBitacora: IMetodoBitacora[] = [];
  public currentStep: number = 1;
  public loading: boolean = false;
  public totalInvocations: number = 0;
  public totalFunctions: number = 0;
  public actionStats: any[] = [];
  public sreMetrics: any = {
    avgLatency: 0,
    maxLatency: 0,
    criticalCount: 0
  };

  // Modal State
  public rowDataRegistros: any[] = [];
  searchRegistrosCtrl = new FormControl('');
  get searchRegistros() { return this.searchRegistrosCtrl.value; }
  public selectedLog: any = null;
  public decodedConsulta: string = '';
  public decodedContenido: string = '';
  public ObjDetalle: any = {};
  public currentFunctionData: IFuncion | null = null;
  private currentModalTemplate: any = null;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
    id: '',
    aplicacion: '',
    version: '',
  }

  public appData: any = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private modalService: NgbModal,
    private utilService: UtilService,
    private compresionService: CompresionService,
    private zone: NgZone // Inyectado para detección de cambios en streaming
  ) { }

  ngOnInit(): void {
    this.searchTextCtrl.valueChanges.subscribe(() => {
      this.userPage = 1;
    });
    this.route.params.subscribe(params => {
      const appIdEncoded = params['id'];
      if (appIdEncoded) {
        try {
          this.appData = JSON.parse(atob(appIdEncoded));
        } catch (e) {
          console.error('[EventComponent] Error decodificando appId:', e);
          this.appData = { id: appIdEncoded, nombre: appIdEncoded };
        }
        this.cargarUsuarios();
      }
    });

    this.contentHeader = {
      headerTitle: 'Investigación de Eventos',
      actionButton: true,
      breadcrumb: [
        { name: 'Inicio', link: '/' },
        { name: 'Binnacle', link: '/investigation/binnacle' },
        { name: 'Eventos', isCurrent: true }
      ]
    };
  }

  cargarUsuarios() {
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_USUARIO;
    this.xAPI.parametros = this.appData.id;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any[]) => {
        if (!data) return;
        this.usuarios = data;
      },
      (error) => console.error(error)
    )
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.cargarEventos(user.login || user.usuario || user.cedula);
    this.currentStep = 2;
  }

  get filteredUsers() {
    if (!this.searchText) return this.usuarios;
    const search = this.searchText.toLowerCase();
    return this.usuarios.filter(user =>
      (user.nombre?.toLowerCase().includes(search)) ||
      (user.login?.toLowerCase().includes(search)) ||
      (user.perfil?.toLowerCase().includes(search))
    );
  }

  async cargarEventos(login: string) {
    this.loading = true;
    this.totalInvocations = 0;
    this.totalFunctions = 0;
    this.ListarBitacora = [];
    this.xAPI.funcion = "_SYS_CLogPatterns";
    this.xAPI.parametros = login;

    try {
      // Uso de postStream para mejor rendimiento en datasets grandes
      await this.apiService.postStream<IMetodoBitacora>('crudstream', this.xAPI, (row) => {
        this.zone.run(() => {
          // Procesamiento de metadatos de la fila en tiempo real
          console.log("row.init");
          console.log(row);
          console.log("row.end");
          if (row.funciones) {
            row.funciones.forEach(f => {
              if (f.logs && f.logs.length > 0) {
                // Encontrar log más reciente para mostrar "Última actividad"
                const latest = f.logs.reduce((prev, curr) => (prev.fecha > curr.fecha) ? prev : curr);
                f.ultimaFecha = latest.fecha;
              }
            });
          }

          // Clasificación on-the-fly de operaciones huérfanas
          if (!row.metodo || row.metodo.trim() === '') {
            row.metodo = 'OTRAS OPERACIONES';
          }

          this.ListarBitacora.push(row);
          // Actualización de contadores globales para análisis
          this.totalInvocations += row.total_invocaciones;
          this.totalFunctions += row.funciones ? row.funciones.length : 0;

          // Ordenar por volumen de invocaciones para mantener jerarquía
          this.ListarBitacora.sort((a, b) => b.total_invocaciones - a.total_invocaciones);
        });
      });
    } catch (error) {
      console.error('[EventComponent] Stream Error:', error);
    } finally {
      this.loading = false;
      this.actualizarEstadisticas();
    }
  }

  actualizarEstadisticas() {
    let statsMap = new Map<string, number>();
    let total = 0;
    let totalLatencia = 0;
    let countLatencia = 0;
    let maxLat = 0;
    let criticals = 0;

    this.ListarBitacora.forEach(metodo => {
      const nombreMetodo = metodo.metodo || 'OTROS';
      statsMap.set(nombreMetodo, (statsMap.get(nombreMetodo) || 0) + metodo.total_invocaciones);
      total += metodo.total_invocaciones;

      metodo.funciones.forEach(f => {
        f.logs.forEach(l => {
          // Filtrado SRE: Ignorar valores sospechosos (> 1000s) que suelen ser timestamps o errores de red
          const latencia = (l.segundos && typeof l.segundos === 'number' && l.segundos < 1000) ? l.segundos : 0;
          if (latencia > 0) {
            totalLatencia += latencia;
            countLatencia++;
            if (latencia > maxLat) maxLat = latencia;
            if (latencia > 2) criticals++; 
          }
        });
      });
    });

    this.actionStats = Array.from(statsMap.entries()).map(([name, count]) => ({
      name,
      count,
      percent: total > 0 ? (count / total) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    this.sreMetrics = {
      avgLatency: countLatencia > 0 ? (totalLatencia / countLatencia) : 0,
      maxLatency: maxLat,
      criticalCount: criticals
    };
  }

  exportCSV() {
    const dataToExport: any[] = [];
    this.ListarBitacora.forEach(m => {
      m.funciones.forEach(f => {
        f.logs.forEach(l => {
          dataToExport.push({
            'Método': m.metodo,
            'Función': f.nombre_funcion,
            'Versión': f.v,
            'Fecha': l.fecha,
            'Latencia (s)': l.segundos,
            'Hash': l.hash
          });
        });
      });
    });

    const filename = `Reporte_Eventos_${this.selectedUser?.nombre || 'User'}_${new Date().getTime()}.csv`;
    this.downloadCSV(dataToExport, filename);
  }

  downloadCSV(data: any[], filename: string) {
    if (data.length === 0) return;
    const separator = ';';
    const keys = Object.keys(data[0]);
    const csvContent = keys.join(separator) + '\n' +
      data.map(row => keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell.toString().replace(/"/g, '""');
        return cell.search(/("|,|\n)/g) >= 0 ? `"${cell}"` : cell;
      }).join(separator)).join('\n');

    // Adaptación para Sandra Sandbox Bridge
    const csvBase64 = btoa(unescape(encodeURIComponent("\ufeff" + csvContent)));
    const csvDataUri = `data:text/csv;base64,${csvBase64}`;

    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_CSV',
        payload: {
          fileName: filename,
          data: csvDataUri
        }
      }, '*');
    } else {
      // Fallback para cuando no corre dentro de Sandra
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  exportPDF() {
    const doc = new jspdf.jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Portada
    doc.setFontSize(22);
    doc.setTextColor(115, 103, 240); // Indigo
    doc.text('REPORTE DE AUDITORÍA SRE', pageWidth / 2, 50, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Análisis de Patrones: ${this.selectedUser?.nombre}`, pageWidth / 2, 65, { align: 'center' });
    doc.text(`Identificador: ${this.selectedUser?.login}`, pageWidth / 2, 72, { align: 'center' });

    // Métricas Resumen
    doc.setFontSize(12);
    doc.text('RESUMEN DE RENDIMIENTO', 20, 100);
    doc.setFontSize(10);
    doc.text(`- Invocaciones Totales: ${this.totalInvocations}`, 25, 110);
    doc.text(`- Latencia Promedio: ${this.formatSeconds(this.sreMetrics.avgLatency)}`, 25, 117);
    doc.text(`- Latencia Máxima: ${this.formatSeconds(this.sreMetrics.maxLatency)}`, 25, 124);
    doc.text(`- Eventos Críticos (>2s): ${this.sreMetrics.criticalCount}`, 25, 131);

    // Tabla de Funciones
    const tableData: any[] = [];
    this.ListarBitacora.forEach(m => {
      m.funciones.forEach(f => {
        tableData.push([m.metodo, f.nombre_funcion, f.ejecuciones, f.v]);
      });
    });

    (doc as any).autoTable({
      startY: 150,
      head: [['MÉTODO', 'FUNCIÓN', 'EJECUCIONES', 'VER']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [115, 103, 240] }
    });

    const fileName = `Auditoria_SRE_${this.selectedUser?.nombre || 'User'}.pdf`.replace(/ /g, '_');

    // Sandbox Bridge Download
    const pdfDataUri = doc.output('datauristring');
    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_PDF',
        payload: {
          fileName: fileName,
          data: pdfDataUri
        }
      }, '*');
    } else {
      doc.save(fileName);
    }
  }

  ModalExePlay(modal: any, data: IFuncion) {
    this.currentModalTemplate = modal;
    this.currentFunctionData = data;
    this.rowDataRegistros = data.logs.map(log => ({
      ...log,
      formattedDuration: this.formatSeconds(log.segundos)
    }));

    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal'
    });
  }

  openDetail(log: any, modal: any) {
    this.selectedLog = log;
    this.xAPI.funcion = "_SYS_CLogPatternsHash";
    this.xAPI.parametros = log.hash;

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any) => {
        console.log("data.init")
        console.log(data)
        console.log("data.end")
        if (!data) return;
        this.ObjDetalle = Array.isArray(data) ? data[0] : data;

        // Decodificar Consulta (Input)
        this.decodedConsulta = this.ObjDetalle.consulta ? this.decodificar(this.ObjDetalle.consulta) : '{}';
        try {
          this.decodedConsulta = JSON.stringify(JSON.parse(this.decodedConsulta), null, 2);
        } catch (e) { }

        // Decodificar y Descomprimir Contenido (Output)
        if (this.ObjDetalle.contenido && this.ObjDetalle.contenido.Data) {
          let encodedData = this.ObjDetalle.contenido.Data.replace(/\s/g, '');
          
          try {
            const firstPass = atob(encodedData);
            // Verificación de doble codificación (H4s es el inicio de un GZIP en Base64)
            if (firstPass.length > 3 && firstPass.substring(0, 3) === 'H4s') {
              encodedData = firstPass;
            }
          } catch (e) { }

          const unzip = this.compresionService.descomprimirZip(encodedData);
          console.log("[EventComponent] Unzip success:", !!unzip, "Length:", unzip?.length);
          this.decodedContenido = unzip;

          if (unzip) {
            try {
              this.decodedContenido = JSON.stringify(JSON.parse(unzip), null, 2);
            } catch (e) { 
               console.warn("[EventComponent] JSON parse failed for unzip content");
            }
          } else {
            this.decodedContenido = "Error: No se pudo descomprimir el contenido.";
          }
        } else {
          this.decodedContenido = '{}';
        }

        this.modalService.dismissAll();
        const modalRef = this.modalService.open(modal, {
          size: 'xl',
          centered: true,
          backdrop: false,
          keyboard: false,
          windowClass: 'fondo-modal'
        });

        modalRef.result.then(() => this.reopenPrevious(), () => this.reopenPrevious());
      },
      (error) => console.error('[EventComponent] Detail Error:', error)
    );
  }

  reopenPrevious() {
    if (this.currentModalTemplate && this.currentFunctionData) {
      this.ModalExePlay(this.currentModalTemplate, this.currentFunctionData);
    }
  }

  formatSeconds(seconds: number): string {
    if (seconds === undefined || seconds === null) return '0.00ms';
    if (seconds < 0.000001) return (seconds * 1000000).toFixed(2) + 'μs';
    if (seconds < 0.001) return (seconds * 1000).toFixed(2) + 'ms';
    if (seconds < 1) return (seconds * 1000).toFixed(2) + 'ms';
    return seconds.toFixed(2) + 's';
  }

  decodificar(cadena: string): string {
    try { return atob(cadena); } catch (e) { return 'Error de decodificación'; }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.utilService.AlertMini('top-end', 'success', 'Copiado', 1000);
    });
  }

  goToStep(step: number) {
    this.currentStep = step;
  }
}
