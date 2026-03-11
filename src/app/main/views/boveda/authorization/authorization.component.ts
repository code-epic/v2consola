import { Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import * as feather from 'feather-icons';
import Swal from 'sweetalert2';

export interface Authorization {
  _id?: { $oid: string };
  authid: string;
  key: string;
  user: string;
  aplication: string;
  name: string;
  id: string;
  cargo: string;
  tiempo: string; // "YYYY-MM-DD HH:mm:ss"
  funcion?: string;
  parametros?: any;
  elapsedTime?: string;
  isWarning?: boolean;
}

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class AuthorizationComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public contentHeader: any;
  public ColumnMode = ColumnMode;
  public rowData: Authorization[] = [];
  public tempData: Authorization[] = [];
  public basicSelectedOption: number = 10;
  public searchValue: string = '';
  public selectedApplication: string = '';
  public applicationsList: string[] = [];

  public selectedAuth: Authorization | null = null;

  private timer: any;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {}
  };


  constructor(private modalService: NgbModal, private apiService: ApiService) { }

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Autorizaciones',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Inicio', isLink: true, link: '/' },
          { name: 'Boveda', isLink: true, link: '/' },
          { name: 'Autorizaciones', isLink: false }
        ]
      }
    };

    this.LoadAuthorization();
    this.startTimer();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      feather.replace();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  loadMockData(data: Authorization[]) {
    // Datos de ejemplo basados en el modelo proporcionado
    this.rowData = data;
    this.tempData = [...this.rowData];
    this.extractApplications();
    this.applyFilters();
  }


  LoadAuthorization() {
    // Asumo que tienes una función similar a la de profile.component.ts
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_AUTHORIZATIONS // O la función que corresponda
    this.xAPI.parametros = '';
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        this.loadMockData(data);
      },
      (error) => {
        console.error('Error al cargar perfiles', error);
      }
    );
  }


  extractApplications() {
    this.applicationsList = Array.from(new Set(this.tempData.map(item => item.aplication))).sort();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.updateCounters();
      this.applyFilters(); // Re-aplicar filtros para mantener la vista consistente
    }, 1000);
  }

  updateCounters() {
    const now = new Date().getTime();
    this.tempData.forEach(auth => {
      const startTime = new Date(auth.tiempo.replace(' ', 'T')).getTime();
      const diff = now - startTime;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      auth.elapsedTime = `${minutes}m ${seconds}s`;
      auth.isWarning = minutes >= 10;
    });
    // Trigger change detection for feather icons in potential pagination updates
    setTimeout(() => {
      feather.replace();
    }, 0);
  }

  filterUpdate(event: any) {
    this.searchValue = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterByApplication() {
    this.applyFilters();
  }

  applyFilters() {
    const val = this.searchValue;
    const app = this.selectedApplication;

    const filtered = this.tempData.filter(d => {
      const matchSearch = !val ||
        (d.name.toLowerCase().includes(val) ||
          d.user.toLowerCase().includes(val) ||
          d.id.toLowerCase().includes(val) ||
          (d.funcion && d.funcion.toLowerCase().includes(val)));

      const matchApp = !app || d.aplication === app;

      return matchSearch && matchApp;
    });

    this.rowData = [...filtered];
  }

  getRowClass = (row: Authorization) => {
    return {
      'row-warning': row.isWarning
    };
  }

  approve(row: Authorization) {
    Swal.fire({
      title: 'Aprobar Autorización',
      text: `¿Desea aprobar la solicitud de ${row.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Aprobar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-soft-success py-1 px-2',
        cancelButton: 'btn btn-soft-secondary ml-1 py-1 px-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.rowData = this.rowData.filter(item => item.authid !== row.authid);
        Swal.fire({
          title: '¡Aprobado!',
          text: 'La autorización ha sido procesada.',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-soft-success' }
        });
      }
    });
  }

  reject(row: Authorization) {
    Swal.fire({
      title: 'Rechazar Autorización',
      text: `¿Desea rechazar la solicitud de ${row.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Rechazar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-soft-danger py-1 px-2',
        cancelButton: 'btn btn-soft-secondary ml-1 py-1 px-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.rowData = this.rowData.filter(item => item.authid !== row.authid);
        Swal.fire({
          title: 'Rechazado',
          text: 'La solicitud ha sido descartada.',
          icon: 'info',
          customClass: { confirmButton: 'btn btn-soft-dark' }
        });
      }
    });
  }

  viewDetails(auth: Authorization, content: any) {
    this.selectedAuth = auth;
    this.modalService.open(content, {
      centered: true, size: 'lg',
      windowClass: 'fondo-modal',
      backdrop: false,
      keyboard: false
    });
  }

  formatJson(json: any): string {
    if (typeof json === 'string') return json;
    return JSON.stringify(json, null, 2);
  }

  isJson(val: any): boolean {
    return typeof val === 'object' && val !== null;
  }
}
