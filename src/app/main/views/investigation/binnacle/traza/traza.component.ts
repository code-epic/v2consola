import { Component, OnInit, ViewEncapsulation, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";
import * as jspdf from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-traza',
  templateUrl: './traza.component.html',
  styleUrls: ['./traza.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TrazaComponent implements OnInit {

  public contentHeader: any;
  public usuarios: any[] = [];
  public selectedUser: any = null;
  public logs: any[] = [];
  public loadingLogs = false; // Estado para el progress bar sutil
  public currentStep: number = 1;

  // Pagination for Logs
  public page: number = 1;
  public pageSize: number = 10;

  // Pagination for Users
  public userPage: number = 1;
  public userPageSize: number = 25; // 25 cards per page

  private _searchText: string = '';
  public get searchText(): string {
    return this._searchText;
  }
  public set searchText(value: string) {
    this._searchText = value;
    this.userPage = 1; // Reset to first page on search
    this.page = 1;     // Reset log page as well
  }

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
    private zone: NgZone // Importante para streaming
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const appIdEncoded = params['id'];
      if (appIdEncoded) {
        try {
          this.appData = JSON.parse(atob(appIdEncoded));
          console.log('[TrazaComponent] AppData Decodificada:', this.appData);
        } catch (e) {
          console.error('[TrazaComponent] Error decodificando appId:', e);
          this.appData = { id: appIdEncoded, nombre: appIdEncoded }; // Fallback
        }
        this.cargarUsuarios();
      }
    });

    this.contentHeader = {
      headerTitle: 'Investigación de Traza',
      actionButton: true,
      breadcrumb: [
        {
          name: 'Inicio',
          link: '/'
        },
        {
          name: 'Binnacle',
          link: '/investigation/binnacle'
        },
        {
          name: 'Traza',
          isCurrent: true
        }
      ]
    };
  }

  cargarUsuarios() {
    console.log(this.appData);
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_USUARIO;
    this.xAPI.parametros = this.appData.id;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data: any[]) => {
        if (!data) return;
        console.log(data);
        this.usuarios = data;
      },
      (error) => {
        console.error(error);
      }
    )
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.cargarLogs(user.login || user.usuario || user.cedula);
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

  get filteredLogs() {
    if (!this.searchText) return this.logs;
    const search = this.searchText.toLowerCase();
    return this.logs.filter(log =>
      (log.accion?.toLowerCase().includes(search)) ||
      (log.metodo?.toLowerCase().includes(search)) ||
      (log.documento?.toLowerCase().includes(search)) ||
      (log.hash?.toLowerCase().includes(search)) ||
      (log.login?.toLowerCase().includes(search))
    );
  }

  formatDuration(ns: number) {
    if (!ns || ns === 0) return '0.000';
    // Si el número es mayor a 1 millón, asumimos que son nanosegundos/microsegundos
    if (ns > 1000000) return (ns / 1000000000).toFixed(3);
    return ns.toFixed(3);
  }

  get actionStats() {
    const stats: { [key: string]: number } = {};
    if (this.logs.length === 0) return [];

    this.logs.forEach(log => {
      const acc = log.accion || log.metodo || 'OTRO';
      stats[acc] = (stats[acc] || 0) + 1;
    });

    const total = this.logs.length;
    return Object.entries(stats)
      .map(([name, count]) => ({
        name,
        count,
        percent: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Solo las top 5 acciones para el gráfico
  }

  async cargarLogs(login: string) {
    this.logs = []; // Limpiar para carga progresiva
    this.loadingLogs = true; // El set inicial suele detectarse bien

    try {
      this.xAPI.funcion = environment.functions.CONSULTAR_APPS_USUARIO_LOGS;
      this.xAPI.parametros = `${login}`;

      console.log('[TrazaComponent] Inciando stream para:', login);

      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        // Ejecutamos dentro de la zona para que Angular detecte los cambios de streaming
        this.zone.run(() => {
          this.logs.push(row);
        });
      });

    } catch (error) {
      console.error('[TrazaComponent] Error cargando logs:', error);
    } finally {
      // Forzamos el fin también en la zona
      this.zone.run(() => {
        this.loadingLogs = false;
      });
    }
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  exportCSV() {
    if (this.logs.length === 0) return;

    const dataToExport = this.logs.map(log => ({
      'Fecha y Hora': this.formatDate(log.fecha?.$date || log.fecha),
      'Acción': log.accion.toUpperCase() || '---',
      'Duración (s)': this.formatDuration(log.Duracion?.segundos || log.segundos || 0),
      'Documento': log.documento.toUpperCase() || '---'
    }));

    const filename = `Traza_${this.selectedUser.nombre || 'Auditoria'}_${new Date().getTime()}.csv`;
    this.downloadCSV(dataToExport, filename);
  }

  downloadCSV(data: any[], filename: string) {
    if (data.length === 0) return;
    const separator = ';';
    const keys = Object.keys(data[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      data.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

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
    if (this.logs.length === 0) return;

    const doc = new jspdf.jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // ==========================================
    // PAGINA 1: PORTADA
    // ==========================================

    // Titulo Principal - Azul Suave
    doc.setFontSize(26);
    doc.setTextColor(100, 181, 246); // Blue 300 (Pastel)
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE TRAZA', pageWidth / 2, 80, { align: 'center' });

    // Línea Decorativa Sutil
    doc.setDrawColor(224, 224, 224); // Grey 300
    doc.setLineWidth(0.5);
    doc.line(60, 85, pageWidth - 60, 85);

    // Subtítulo (Nombre del Usuario)
    doc.setFontSize(18);
    doc.setTextColor(97, 97, 97); // Grey 700
    doc.text((this.selectedUser?.nombre || 'Usuario Desconocido').toUpperCase(), pageWidth / 2, 100, { align: 'center' });

    // Detalles Centrados
    doc.setFontSize(12);
    doc.setTextColor(117, 117, 117); // Grey 600
    doc.text(`Identificador: ${this.selectedUser?.login || 'N/A'}`, pageWidth / 2, 115, { align: 'center' });
    doc.text(`Aplicación Origen: ${this.appData?.nombre || 'N/A'}`, pageWidth / 2, 122, { align: 'center' });

    // Nota Informativa
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(158, 158, 158); // Grey 500
    const note = `Este reporte contiene la traza de actividad detallada con un total de ${this.logs.length} registros auditados.`;
    const splitNote = doc.splitTextToSize(note, pageWidth - 80);
    doc.text(splitNote, pageWidth / 2, 140, { align: 'center' });

    // ==========================================
    // SECCIÓN DE MÉTRICAS SRE (NUEVA)
    // ==========================================
    
    // Cálculo de métricas
    let totalLatencia = 0;
    let countLatencia = 0;
    this.logs.forEach(l => {
      const seg = l.Duracion?.segundos || l.segundos || 0;
      const latencia = (seg && typeof seg === 'number' && seg < 1000) ? seg : 0;
      if (latencia > 0) {
        totalLatencia += latencia;
        countLatencia++;
      }
    });
    const avgLatency = countLatencia > 0 ? (totalLatencia / countLatencia) : 0;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 181, 246); // Mismo azul pastel del título
    doc.text('ANÁLISIS DE RENDIMIENTO', pageWidth / 2, 165, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(97, 97, 97);
    doc.text(`Latencia Media: ${this.formatDuration(avgLatency)}s`, pageWidth / 2, 175, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(180, 180, 180);
    const metricsNote = "Métricas Limpias: La latencia media ahora es precisa, ignorando los ruidos de datos que veíamos anteriormente.";
    const splitMetricsNote = doc.splitTextToSize(metricsNote, pageWidth - 100);
    doc.text(splitMetricsNote, pageWidth / 2, 185, { align: 'center' });

    // Fecha en el pie de la primera página
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(189, 189, 189); // Grey 400
    doc.text(`Generado el: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // ==========================================
    // PAGINA 2+: TABLA DE ACTIVIDAD
    // ==========================================
    doc.addPage();

    // Encabezado P2
    doc.setFontSize(14);
    doc.setTextColor(100, 181, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Actividad', 14, 20);

    const tableData = this.logs.map(log => [
      this.formatDate(log.fecha?.$date || log.fecha),
      log.accion.toUpperCase() || log.metodo.toUpperCase() || '---',
      this.formatDuration(log.Duracion?.segundos || log.segundos || 0) + 's',
      log.documento.toUpperCase() || '---'
    ]);

    (doc as any).autoTable({
      startY: 25,
      head: [['FECHA Y HORA', 'ACCIÓN', 'DURACIÓN', 'DOCUMENTO']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        valign: 'middle',
        lineColor: [238, 238, 238],
        lineWidth: 0.1,
        textColor: [97, 97, 97]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 181, 246],
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0,
        lineColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });

    // Paginación Minimalista
    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(200);
      doc.text(`${i} / ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }

    const fileName = `Traza_${this.selectedUser.nombre || 'Auditoria'}.pdf`.replace(/ /g, '_');

    // Sandbox Bridge Download
    const pdfDataUri = doc.output('datauristring');
    if (window.parent) {
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

  private formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }

}
