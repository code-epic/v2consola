import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable";

import { ApiService, IAPICore, ProcessID } from "@services/apicore/api.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";

import Swal from "sweetalert2";

import { environment } from "environments/environment";

import { WsocketsService } from "@services/websockets/wsockets.service";
import {
  NgbModal,
  NgbActiveModal,
  NgbModalConfig,
} from "@ng-bootstrap/ng-bootstrap";
import { UtilService } from "@services/util/util.service";
import { TaskService } from "@services/apicore/task.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class ListComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI("section-block") sectionBlockUI: NgBlockUI;

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

  public msj:string = "Cargardo!!! por favor espere..."

  // Private

  public xrs:string = ''
  public xstatus:string = ''

  

  public urlEnvironment = environment;

  public ListaAplicaciones = [];
  public tempData = [];
  public rowData = [];

  public lenguaje = [
    { id: 1, name: "PHP" },
    { id: 0, name: "TSC" },
  ];

  public fnx;
  public status = false;

  // public
  public contentHeader: object;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  public origen : string = ''
  public destino : string = ''
  public mensaje : string = ''
  public proyecto: string = ''

  constructor(
    private taskService: TaskService,
    private apiService: ApiService,
    private msjService: WsocketsService,
    private modalService: NgbModal,
    private utilservice: UtilService,
  ) { }

  async ngOnInit() {
    await this.CargarListaAplicaciones();

    // this.sectionBlockUI.start('Loading...');
    // this.sectionBlockUI.stop();

    // content header
    this.contentHeader = {
      headerTitle: "Aplicaciones",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Home",
            isLink: true,
            link: "/home",
          },
          {
            name: "Aplicaciones",
            isLink: false,
          },
          {
            name: "Versiones",
            isLink: false,
          },
        ],
      },
    };
  }

  async ModalExePlay(modal: any, data: any) {
    await this.verLogs(data)
    this.proyecto = data.proyecto
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  async ModalExeStatus(modal: any, data: any) {
    await this.verEstatus(data)
    this.proyecto = data.proyecto
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  async Clonar(app: any) {
    let nameFnx = "Fnx_GitCloneAll";
    let ramas = ''
    app.rama.split(',').forEach(e => {
      ramas+= `"${e}" `
    });
    this.fnx = {
      funcion: nameFnx,
      usuario: app.usuario,
      token: app.clave,
      repositorio: app.repositorio,
      paquete: app.nombre,
      punto_montaje: app.puntoMontaje,
      proyecto: app.proyecto,
      rama: ramas
    };

    // console.log(this.fnx)
    await Swal.fire({
      title: `Va a clonar el proyecto <br> ${app.proyecto} `,
      text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Clonar!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.ExecFnx(this.fnx).subscribe(
          (data) => {
            console.log(data);
            this.pID.id = data.contenido.id;
            this.pID.estatus = true;
            this.msjService.lstpid$.emit(this.pID);
            this.taskService
              .set(data.contenido.id, nameFnx, app.proyecto)
              .then((e) => {
                this.apiService.ConsultarPidRecursivo(
                  data.contenido.id,
                  app.origen + "|" + app.proyecto
                );
              })
              .catch((e) => console.log(e));

            this.xAPI.funcion = "_SYS_U_Aplicaciones";
            this.xAPI.parametros = `${app.identificador},1`;
            this.rowData.push(this.ListaAplicaciones);
            this.apiService.Ejecutar(this.xAPI).subscribe(
              (datax) => {
                this.ListaAplicaciones = [];
                this.CargarListaAplicaciones();
              },
              (error) => {
                console.log(error);
              }
            );
            //this.apiService.ConsultarPidRecursivo(data.contenido.id, this.fnx)
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });
  }



  async verLogs(app: any) {
    this.xrs = this.msj
    let nameFnx = "Fnx_GitLog";
    this.fnx = {
      funcion: nameFnx,
      proyecto: app.proyecto,
    };

    // console.log(this.fnx)
    await this.apiService.ExecFnx(this.fnx).subscribe(
      (data) => {
        setTimeout(() => {
          this.apiService.ExecFnxId(data.contenido.id).subscribe(
            (data) => {
              // console.log(data.rs)
              this.xrs = data.rs
            },
            (error) => {
              console.log(error)
            }
          )
        }, 3000);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  async Pull(app: any) {
    let ramas = ''
    app.rama.split(',').forEach(e => {
      ramas+= `"${e}" `
    });
    let nameFnx = "Fnx_Actualizar";
    this.fnx = {
      funcion: nameFnx,
      proyecto: app.proyecto,
      ramas: ramas
    };

    await Swal.fire({
      title: `Va a actualizar el proyecto <br> ${app.proyecto} `,
      text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Actualizar!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.ExecFnx(this.fnx).subscribe(
          (data) => {
            this.pID.id = data.contenido.id;
            this.pID.estatus = true;
            this.msjService.lstpid$.emit(this.pID);
            let proyecto = `${app.origen}|${app.proyecto}`
            this.taskService
              .set(data.contenido.id, nameFnx, proyecto)
              .then((e) => {
                this.apiService.ConsultarPidRecursivo(
                  data.contenido.id,
                  proyecto
                );
              })
              .catch((e) => console.log(e));
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });
  }


  async Merge(){

    if(this.mensaje == '' || this.destino == ''  || this.origen == '' ){
      this.utilservice.AlertMini('top-end', 'error', 'Debe verificar todos los campos', 3000)
      return false;
    }
    let nameFnx = "Fnx_Merge";

    this.fnx = {
      funcion: nameFnx,
      proyecto: this.proyecto,
      mensaje: this.mensaje,
      origen: this.origen,
      destino: this.destino
    };

    // console.log(this.fnx)

    await Swal.fire({
      title: `Va a fusionar el proyecto <br> ${this.proyecto} `,
      text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Fusionar!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.modalService.dismissAll('Cerrando fusionar');
        this.apiService.ExecFnx(this.fnx).subscribe(
          (data) => {
            this.pID.id = data.contenido.id;
            this.pID.estatus = true;
            this.msjService.lstpid$.emit(this.pID);
            this.taskService
              .set(data.contenido.id, nameFnx, this.proyecto)
              .then((e) => {
                this.apiService.ConsultarPidRecursivo(
                  data.contenido.id,
                  "Fusionando proyecto"
                );
              })
              .catch((e) => console.log(e));
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });

  }


  async verEstatus(app: any) {
    this.xstatus = this.msj
    let nameFnx = "Fnx_GitStatus";
    this.fnx = {
      funcion: nameFnx,
      proyecto: app.proyecto,
    };

    // console.log(this.fnx)
    await this.apiService.ExecFnx(this.fnx).subscribe(
      (data) => {
        setTimeout(() => {
          this.apiService.ExecFnxId(data.contenido.id).subscribe(
            (data) => {
              // console.log(data.rs)
              this.xstatus = data.rs
            },
            (error) => {
              console.log(error)
            }
          )
        }, 3000);
      },
      (error) => {
        console.log(error);
      }
    );
  }



  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.nombre.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterLenguaje(event: any) {
    const val = event.name ? event.name : "";
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.lenguaje.indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = "";
    this.ListaAplicaciones = [];
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.map((e) => {
          this.ListaAplicaciones.push(e);
        });
        this.rowData = this.ListaAplicaciones;
        this.tempData = this.rowData;
      },
      (error) => {
        console.log(error);
      }
    );
  }


  Modal(modal, app: any) {
    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    })
  }
}
