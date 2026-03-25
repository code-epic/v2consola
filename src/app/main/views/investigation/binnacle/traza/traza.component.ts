import { Component, OnInit, ViewEncapsulation, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";
import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

  // Pagination
  public page: number = 1;
  public pageSize: number = 10; // Aumentado para mejor visualización
  public searchText: string = ''; // Texto de búsqueda

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

  get filteredLogs() {
    if (!this.searchText) return this.logs;
    const search = this.searchText.toLowerCase();
    return this.logs.filter(log =>
      (log.accion?.toLowerCase().includes(search)) ||
      (log.documento?.toLowerCase().includes(search)) ||
      (log.hash?.toLowerCase().includes(search))
    );
  }

  formatDuration(ns: number) {
    if (!ns || ns === 0) return '0.000';
    // Si el número es mayor a 1 millón, asumimos que son nanosegundos/microsegundos
    if (ns > 1000000) return (ns / 1000000000).toFixed(3);
    return ns.toFixed(3);
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

    const worksheet = XLSX.utils.json_to_sheet(this.logs.map(log => ({
      Fecha: this.formatDate(log.fecha?.$date || log.fecha),
      Metodo: log.metodo,
      Segundos: log.segundos,
      Hash: log.hash
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Traza');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, `Traza_${this.selectedUser.nombre}_${new Date().getTime()}`);
  }

  exportPDF() {
    if (this.logs.length === 0) return;

    const doc = new jspdf.jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Reporte de Traza de Actividad', 14, 22);
    doc.setFontSize(11);
    doc.text(`Usuario: ${this.selectedUser.nombre} (${this.selectedUser.login})`, 14, 30);
    doc.text(`Aplicación: ${this.appData.nombre}`, 14, 36);
    doc.text(`Fecha de Generación: ${new Date().toLocaleString()}`, 14, 42);

    const tableData = this.logs.map(log => [
      this.formatDate(log.fecha?.$date || log.fecha),
      log.metodo,
      log.segundos.toFixed(3) + 's',
      log.hash.substring(0, 15) + '...'
    ]);

    (doc as any).autoTable({
      startY: 50,
      head: [['Fecha', 'Método', 'Duración', 'Hash']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [115, 103, 240] }
    });

    doc.save(`Traza_${this.selectedUser.nombre}.pdf`);
  }

  private formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, fileName + '.xlsx');
  }
}
