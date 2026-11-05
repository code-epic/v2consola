import { Component, OnInit, ViewChild, ViewEncapsulation, signal, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable";

import { ApiService, IAPICore, ProcessID } from "@services/apicore/api.service";
import Swal from "sweetalert2";

import { environment } from "environments/environment";

import { WsocketsService } from "@services/websockets/wsockets.service";
import {
  NgbModal,
  NgbActiveModal,
  NgbModalConfig,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { UtilService } from "@services/util/util.service";
import { TaskService } from "@services/apicore/task.service";
import { CoreCommonModule } from "@core/common.module";
import { CoreDirectivesModule } from "@core/directives/directives";
import { CorePipesModule } from "@core/pipes/pipes.module";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

@Component({
    selector: "app-list",
    templateUrl: "./list.component.html",
    styleUrls: ["./list.component.scss"],
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
        ContentHeaderComponent,
        NgSelectModule,
        NgxDatatableModule
    ]
})
export class ListComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    relacional: false,
    concurrencia: false,
    protocolo: "",
    ruta: "",
    retorna: false,
    migrar: false,
    modulo: "",
    valores: {},
    coleccion: "",
    http: 0,
    https: 0,
    consumidores: 0,
    puertohttp: 0,
    puertohttps: 0,
    driver: "",
    query: "",
    metodo: "",
    tipo: "",
    prioridad: "",
    entorno: "",
    logs: false,
  };

  public pID: ProcessID = {
    id: "",
    estatus: false,
    mensaje: "",
    segundos: "",
    contenido: "",
  };

  public msj: string = "Cargardo!!! por favor espere..."

  // Private

  public xrs: SafeHtml | string = ''
  public xstatus: SafeHtml | string = ''



  public urlEnvironment = environment;

  public ListaAplicaciones = [];
  public tempData = [];

  public rowData = [];

  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }
  public lenguaje = [
    { id: 0, name: "Todos los Lenguajes" },
    { id: 1, name: "PHP" },
    { id: 2, name: "TSC" },
  ];

  public fnx;
  public status = false;

  // Estado adicional para UX
  public selectedApp: any = null;
  public selectedRamas: string[] = [];
  public selectedLenguaje: string = null;
  public selectedStatusFilter: string = 'all'; // 'all' | 'clonadas' | 'sin-clonar'
  public isLogsLoading: boolean = false;
  public isStatusLoading: boolean = false;

  // Getters para KPIs
  get totalApps(): number {
    return this.ListaAplicaciones ? this.ListaAplicaciones.length : 0;
  }

  get totalClonadas(): number {
    return this.ListaAplicaciones ? this.ListaAplicaciones.filter(a => a.status == '1').length : 0;
  }

  get totalPendientes(): number {
    return this.ListaAplicaciones ? this.ListaAplicaciones.filter(a => a.status == '0').length : 0;
  }

  // public
  public contentHeader: object;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  searchValueCtrl = new FormControl('')
  origenCtrl = new FormControl('')
  destinoCtrl = new FormControl('')
  mensajeCtrl = new FormControl('')
  public searchValue: string = ''
  public origen: string = ''
  public destino: string = ''
  public mensaje: string = ''
  public proyecto: string = ''

  constructor(
    private taskService: TaskService,
    private apiService: ApiService,
    private msjService: WsocketsService,
    private modalService: NgbModal,
    private utilservice: UtilService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) { }

  cleanLogHtml(raw: string): SafeHtml {
    if (!raw) return this.sanitizer.bypassSecurityTrustHtml('');
    let cleaned = raw
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
      .replace(/body\s*\{[^}]*\}/gi, '');
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }

  async ngOnInit() {
    await this.CargarListaAplicaciones();

    // content header
    this.contentHeader = {
      headerTitle: "Aplicaciones",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Principal",
            isLink: true,
            link: "/home",
          },
          {
            name: "Aplicaciones",
            isLink: false,
          },
          {
            name: "Listar Versiones",
            isLink: false,
          },
        ],
      },
    };
  }

  async ModalExePlay(modal: any, data: any) {
    this.selectedApp = data;
    this.proyecto = data.proyecto;
    this.verLogs(data);
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: true,
      windowClass: 'fondo-modal modal-terminal-developer',
    });
  }

  async ModalExeStatus(modal: any, data: any) {
    this.selectedApp = data;
    this.proyecto = data.proyecto;
    this.verEstatus(data);
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: true,
      windowClass: 'fondo-modal modal-terminal-developer',
    });
  }

  async Clonar(app: any) {
    let nameFnx = "Fnx_GitCloneAll";
    let ramas = '';
    if (app.rama) {
      app.rama.split(',').forEach(e => {
        if (e && e.trim()) ramas += `"${e.trim()}" `;
      });
    }
    this.fnx = {
      funcion: nameFnx,
      usuario: app.usuario,
      token: app.clave,
      repositorio: app.repositorio,
      paquete: app.nombre,
      punto_montaje: app.puntoMontaje,
      proyecto: app.proyecto,
      rama: ramas,
      servidor: app.origen
    };

    await Swal.fire({
      title: `Clonar Repositorio`,
      html: `¿Está seguro de clonar el proyecto <b>${app.proyecto}</b> en el servidor local?<br><small class="text-muted">Servidor: ${app.origen} | Ramas: ${app.rama || 'Todas'}</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, clonar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.ExecFnx(this.fnx).subscribe({
          next: (data) => {
            if (data?.contenido?.id) {
              this.pID.id = data.contenido.id;
              this.pID.estatus = true;
              this.msjService.lstpid$.emit(this.pID);
              this.taskService
                .set(data.contenido.id, nameFnx, app.proyecto)
                .then(() => {
                  this.apiService.ConsultarPidRecursivo(
                    data.contenido.id,
                    app.origen + "|" + app.proyecto
                  );
                })
                .catch((e) => console.error(e));
            }

            this.xAPI.funcion = "_SYS_U_Aplicaciones";
            this.xAPI.parametros = `${app.identificador},1`;
            this.apiService.Ejecutar(this.xAPI).subscribe({
              next: () => {
                this.utilservice.AlertMini('top-end', 'success', 'Clonación iniciada con éxito', 3000);
                this.CargarListaAplicaciones();
              },
              error: (err) => console.error(err)
            });
          },
          error: (error) => {
            console.error(error);
            this.utilservice.AlertMini('top-end', 'error', 'Error al solicitar la clonación', 3000);
          }
        });
      }
    });
  }

  async verLogs(app: any) {
    this.isLogsLoading = true;
    this.xrs = this.sanitizer.bypassSecurityTrustHtml(
      '<div class="py-4 text-center"><span class="spinner-border spinner-border-sm text-primary mr-2"></span><span class="text-slate font-small-2">Consultando historial de commits y logs...</span></div>'
    );
    this.cdr.detectChanges();

    let nameFnx = "Fnx_GitLog";
    this.fnx = {
      funcion: nameFnx,
      proyecto: app.proyecto,
    };

    this.apiService.ExecFnx(this.fnx).subscribe({
      next: (data) => {
        setTimeout(() => {
          if (data?.contenido?.id) {
            this.apiService.ExecFnxId(data.contenido.id).subscribe({
              next: (dataRes) => {
                this.xrs = this.cleanLogHtml(dataRes?.rs || '<div class="alert alert-light p-3 text-center text-muted">No se recibieron registros de log.</div>');
                this.isLogsLoading = false;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error(err);
                this.xrs = this.sanitizer.bypassSecurityTrustHtml('<div class="alert alert-danger p-3 text-center">Error al obtener el historial de logs.</div>');
                this.isLogsLoading = false;
                this.cdr.detectChanges();
              }
            });
          } else {
            this.isLogsLoading = false;
            this.cdr.detectChanges();
          }
        }, 1500);
      },
      error: (error) => {
        console.error(error);
        this.xrs = this.sanitizer.bypassSecurityTrustHtml('<div class="alert alert-danger p-3 text-center">Error al solicitar logs en el servidor.</div>');
        this.isLogsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  async Pull(app: any) {
    let ramas = '';
    if (app.rama) {
      app.rama.split(',').forEach(e => {
        if (e && e.trim()) ramas += `"${e.trim()}" `;
      });
    }
    let nameFnx = "Fnx_Actualizar";
    this.fnx = {
      funcion: nameFnx,
      proyecto: app.proyecto,
      ramas: ramas
    };

    await Swal.fire({
      title: `Actualizar Proyecto`,
      html: `Se descargarán los últimos cambios para <b>${app.proyecto}</b>.<br><small class="text-muted">Ramas a actualizar: ${app.rama || 'Todas'}</small>`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.ExecFnx(this.fnx).subscribe({
          next: (data) => {
            if (data?.contenido?.id) {
              this.pID.id = data.contenido.id;
              this.pID.estatus = true;
              this.msjService.lstpid$.emit(this.pID);
              let proyecto = `${app.origen}|${app.proyecto}`;
              this.taskService
                .set(data.contenido.id, nameFnx, proyecto)
                .then(() => {
                  this.apiService.ConsultarPidRecursivo(
                    data.contenido.id,
                    proyecto
                  );
                  this.utilservice.AlertMini('top-end', 'success', 'Actualización enviada a ejecución', 3000);
                })
                .catch((e) => console.error(e));
            }
          },
          error: (error) => {
            console.error(error);
            this.utilservice.AlertMini('top-end', 'error', 'Error al solicitar actualización', 3000);
          }
        });
      }
    });
  }

  async Merge() {
    if (!this.mensajeCtrl.value || !this.destinoCtrl.value || !this.origenCtrl.value) {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe indicar rama origen, destino y comentario', 3000);
      return false;
    }
    if (this.origenCtrl.value.trim() === this.destinoCtrl.value.trim()) {
      this.utilservice.AlertMini('top-end', 'warning', 'La rama origen y destino deben ser distintas', 3000);
      return false;
    }

    let nameFnx = "Fnx_Merge";
    this.fnx = {
      funcion: nameFnx,
      proyecto: this.proyecto,
      mensaje: this.mensajeCtrl.value.trim(),
      origen: this.origenCtrl.value.trim(),
      destino: this.destinoCtrl.value.trim()
    };

    await Swal.fire({
      title: `Confirmar Fusión Git`,
      html: `¿Está seguro de fusionar <code>${this.origenCtrl.value}</code> &rarr; <code>${this.destinoCtrl.value}</code> en <b>${this.proyecto}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, fusionar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.modalService.dismissAll('Cerrando fusionar');
        this.apiService.ExecFnx(this.fnx).subscribe({
          next: (data) => {
            if (data?.contenido?.id) {
              this.pID.id = data.contenido.id;
              this.pID.estatus = true;
              this.msjService.lstpid$.emit(this.pID);
              this.taskService
                .set(data.contenido.id, nameFnx, this.proyecto)
                .then(() => {
                  this.apiService.ConsultarPidRecursivo(
                    data.contenido.id,
                    "Fusionando proyecto"
                  );
                  this.utilservice.AlertMini('top-end', 'success', 'Fusión de ramas en curso', 3000);
                })
                .catch((e) => console.error(e));
            }
          },
          error: (error) => {
            console.error(error);
            this.utilservice.AlertMini('top-end', 'error', 'Error al ejecutar fusión', 3000);
          }
        });
      }
    });
  }

  async verEstatus(app: any) {
    this.isStatusLoading = true;
    this.xstatus = this.sanitizer.bypassSecurityTrustHtml(
      '<div class="py-4 text-center"><span class="spinner-border spinner-border-sm text-info mr-2"></span><span class="text-slate font-small-2">Consultando estado del repositorio local...</span></div>'
    );
    this.cdr.detectChanges();

    let nameFnx = "Fnx_GitStatus";
    this.fnx = {
      funcion: nameFnx,
      proyecto: app.proyecto,
    };

    this.apiService.ExecFnx(this.fnx).subscribe({
      next: (data) => {
        setTimeout(() => {
          if (data?.contenido?.id) {
            this.apiService.ExecFnxId(data.contenido.id).subscribe({
              next: (dataRes) => {
                this.xstatus = this.cleanLogHtml(dataRes?.rs || '<div class="alert alert-light p-3 text-center text-muted">Árbol de trabajo limpio o sin cambios pendientes.</div>');
                this.isStatusLoading = false;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error(err);
                this.xstatus = this.sanitizer.bypassSecurityTrustHtml('<div class="alert alert-danger p-3 text-center">Error al obtener estatus git.</div>');
                this.isStatusLoading = false;
                this.cdr.detectChanges();
              }
            });
          } else {
            this.isStatusLoading = false;
            this.cdr.detectChanges();
          }
        }, 1500);
      },
      error: (error) => {
        console.error(error);
        this.xstatus = this.sanitizer.bypassSecurityTrustHtml('<div class="alert alert-danger p-3 text-center">Error al consultar estatus del repositorio.</div>');
        this.isStatusLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyCombinedFilters() {
    const searchVal = (this.searchValueCtrl.value || '').toLowerCase().trim();
    const langVal = (this.selectedLenguaje && this.selectedLenguaje !== 'Todos los Lenguajes') 
      ? this.selectedLenguaje.toLowerCase() 
      : '';
    const statusVal = this.selectedStatusFilter;

    this.rowData = this.tempData.filter(d => {
      const matchSearch = !searchVal || 
        (d.nombre && d.nombre.toLowerCase().includes(searchVal)) ||
        (d.proyecto && d.proyecto.toLowerCase().includes(searchVal)) ||
        (d.rama && d.rama.toLowerCase().includes(searchVal)) ||
        (d.origen && d.origen.toLowerCase().includes(searchVal));

      const matchLang = !langVal || (d.lenguaje && d.lenguaje.toLowerCase() === langVal);

      let matchStatus = true;
      if (statusVal === 'clonadas') {
        matchStatus = d.status == '1';
      } else if (statusVal === 'sin-clonar') {
        matchStatus = d.status == '0';
      }

      return matchSearch && matchLang && matchStatus;
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  filterUpdate(event: any) {
    this.applyCombinedFilters();
  }

  clearSearch() {
    this.searchValueCtrl.setValue('');
    this.applyCombinedFilters();
  }

  filterLenguaje(event: any) {
    this.selectedLenguaje = event?.name || null;
    this.applyCombinedFilters();
  }

  setStatusFilter(status: string) {
    this.selectedStatusFilter = status;
    this.applyCombinedFilters();
  }

  verTodos() {
    this.searchValueCtrl.setValue('');
    this.selectedLenguaje = null;
    this.selectedStatusFilter = 'all';
    this.rowData = [...this.tempData];
    if (this.table) {
      this.table.offset = 0;
    }
    this.utilservice.AlertMini('top-end', 'info', 'Mostrando todas las aplicaciones', 1500);
  }

  recargar() {
    this.CargarListaAplicaciones();
    this.utilservice.AlertMini('top-end', 'info', 'Actualizando lista de aplicaciones...', 1500);
  }

  selectOrigenRama(rama: string) {
    this.origenCtrl.setValue(rama);
    this.updateDefaultCommitMessage();
  }

  selectDestinoRama(rama: string) {
    this.destinoCtrl.setValue(rama);
    this.updateDefaultCommitMessage();
  }

  swapRamas() {
    const orig = this.origenCtrl.value;
    const dest = this.destinoCtrl.value;
    this.origenCtrl.setValue(dest);
    this.destinoCtrl.setValue(orig);
    this.updateDefaultCommitMessage();
  }

  updateDefaultCommitMessage() {
    const o = this.origenCtrl.value || 'rama';
    const d = this.destinoCtrl.value || 'destino';
    this.mensajeCtrl.setValue(`Merge ${o} en ${d}`);
  }

  copyTerminalContent(content: any) {
    if (!content) return;
    const raw = typeof content === 'string' ? content : (content?.changingThisBreaksApplicationSecurity || '');
    const tempEl = document.createElement('div');
    tempEl.innerHTML = raw;
    const text = tempEl.textContent || tempEl.innerText || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.utilservice.AlertMini('top-end', 'success', 'Copiado al portapapeles', 2000);
      }).catch(() => {
        this.utilservice.AlertMini('top-end', 'info', 'Seleccione el texto para copiar', 2000);
      });
    }
  }

  CargarListaAplicaciones() {
    this._isLoading.set(true);
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = "";
    this.ListaAplicaciones = [];
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.ListaAplicaciones = data?.Cuerpo || [];
        this.rowData = [...this.ListaAplicaciones];
        this.tempData = [...this.ListaAplicaciones];

        // Extraer lenguajes únicos dinámicamente
        const dynamicLanguages = Array.from(
          new Set(this.ListaAplicaciones.map(a => a.lenguaje).filter(Boolean))
        ).map((lang, idx) => ({ id: idx + 1, name: String(lang) }));

        this.lenguaje = [
          { id: 0, name: "Todos los Lenguajes" },
          ...dynamicLanguages
        ];

        this.applyCombinedFilters();
        this._isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this._isLoading.set(false);
      }
    });
  }

  Modal(modal: any, app: any) {
    this.selectedApp = app;
    this.proyecto = app.proyecto;
    this.selectedRamas = app.rama 
      ? app.rama.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0)
      : [];

    if (this.selectedRamas.length >= 2) {
      this.origenCtrl.setValue(this.selectedRamas[1]);
      this.destinoCtrl.setValue(this.selectedRamas[0]);
    } else if (this.selectedRamas.length === 1) {
      this.origenCtrl.setValue(this.selectedRamas[0]);
      this.destinoCtrl.setValue('');
    } else {
      this.origenCtrl.setValue('');
      this.destinoCtrl.setValue('');
    }
    this.updateDefaultCommitMessage();

    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "fondo-modal modal-merge-enhanced",
    });
  }

  exportToPdf() {
    this.utilservice.AlertMini('top-end', 'info', 'Exportando a PDF...', 2000);
    console.log('Exporting to PDF:', this.rowData);
  }
}
