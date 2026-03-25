import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";
import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventComponent implements OnInit {

  public contentHeader: any;
  public searchText: string = '';
  public usuarios: any[] = [];
  public selectedUser: any = null;
  public events: any[] = [];
  public currentStep: number = 1;

  // Pagination
  public page: number = 1;
  public pageSize: number = 10;

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
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
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

  async cargarEventos(login: string) {
    this.events = [];
    this.xAPI.funcion = environment.functions.CONSULTAR_APPS_USUARIO_LOGS; // Reutilizando log para eventos por ahora
    this.xAPI.parametros = login;
    
    try {
      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        this.events.push(row);
      });
    } catch (error) {
      console.error('[EventComponent] Error cargando eventos:', error);
    }
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  exportCSV() {
    if (this.events.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(this.events);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, `Eventos_${this.selectedUser.nombre}`);
  }

  exportPDF() {
    if (this.events.length === 0) return;
    const doc = new jspdf.jsPDF();
    doc.text('Reporte de Eventos', 14, 20);
    doc.save(`Eventos_${this.selectedUser.nombre}.pdf`);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, fileName + '.xlsx');
  }
}
