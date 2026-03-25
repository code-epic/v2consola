import { Component, OnInit, ViewEncapsulation, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { environment } from "environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
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
  encapsulation: ViewEncapsulation.None
})
export class EventComponent implements OnInit {

  public contentHeader: any;
  public searchText: string = '';
  public usuarios: any[] = [];
  public selectedUser: any = null;
  public ListarBitacora: IMetodoBitacora[] = [];
  public currentStep: number = 1;

  // Modal State
  public rowDataRegistros: any[] = [];
  public searchRegistros: string = '';
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
    this.ListarBitacora = [];
    this.xAPI.funcion = "_SYS_CLogPatterns";
    this.xAPI.parametros = login;

    try {
      // Uso de postStream para mejor rendimiento en datasets grandes
      await this.apiService.postStream<IMetodoBitacora>('crudstream', this.xAPI, (row) => {
        this.zone.run(() => {
          // Procesamiento de metadatos de la fila en tiempo real
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
          // Ordenar por volumen de invocaciones para mantener jerarquía
          this.ListarBitacora.sort((a, b) => b.total_invocaciones - a.total_invocaciones);
        });
      });
    } catch (error) {
      console.error('[EventComponent] Stream Error:', error);
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

  async openDetail(log: any, modal: any) {
    this.selectedLog = log;
    this.xAPI.funcion = "_SYS_CLogPatternsHash";
    this.xAPI.parametros = log.hash;

    try {
      // También usamos postStream aquí para mantener consistencia arquitectónica
      await this.apiService.postStream<any>('crudstream', this.xAPI, (row) => {
        this.zone.run(() => {
          this.ObjDetalle = row;
          this.decodedConsulta = this.ObjDetalle.consulta ? this.decodificar(this.ObjDetalle.consulta) : '{}';
          try { this.decodedConsulta = JSON.stringify(JSON.parse(this.decodedConsulta), null, 2); } catch (e) { }

          if (this.ObjDetalle.contenido && this.ObjDetalle.contenido.Data) {
            let encodedData = this.ObjDetalle.contenido.Data.replace(/\s/g, '');
            const unzip = this.compresionService.descomprimirZip(encodedData);
            this.decodedContenido = unzip;
            try { this.decodedContenido = JSON.stringify(JSON.parse(unzip), null, 2); } catch (e) { }
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
        });
      });
    } catch (error) {
      console.error('[EventComponent] Detail Stream Error:', error);
    }
  }

  reopenPrevious() {
    if (this.currentModalTemplate && this.currentFunctionData) {
      this.ModalExePlay(this.currentModalTemplate, this.currentFunctionData);
    }
  }

  formatSeconds(seconds: number): string {
    if (!seconds) return '0 s';
    if (seconds < 0.001) return `${(seconds * 1000000).toFixed(2)} μs`;
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`;
    return `${seconds.toFixed(2)} s`;
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
