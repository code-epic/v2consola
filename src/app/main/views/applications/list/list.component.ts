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

  // Private

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

  constructor(
    private taskService: TaskService,
    private apiService: ApiService,
    private msjService: WsocketsService,
    private utilservice: UtilService
  ) {}

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

  async Clonar(app: any) {
    let nameFnx = "Fnx_Clonar";
    this.fnx = {
      funcion: nameFnx,
      usuario: app.usuario,
      token: app.clave,
      repositorio: app.repositorio,
      paquete: app.nombre,
      punto_montaje: app.puntoMontaje,
    };
    await Swal.fire({
      title: `Va a clonar el proyecto <br> ${app.nombre} `,
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
              .set(data.contenido.id, nameFnx, app.nombre)
              .then((e) => {
                this.apiService.ConsultarPidRecursivo(
                  data.contenido.id,
                  app.nombre
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

  inserCommitDB(lst){
    console.log(lst)
    let obj = {
      "usuario": "panel",
      "task": lst,
      "fecha": new Date()
    }
    let cl = {
      'coleccion': 'user-task',
      'driver': 'MGDBA',
      'objeto': obj,
      'donde': '{"id":"panel"}',
      'upsert': true
    }

    this.apiService.ExecColeccion(cl).subscribe(
      x => {
        console.log('cone ', x)
        // this.taskService.clear().then(
        //   xdata => {

        //   }
        // )
      },
      e => {
        console.error(e)
      }

    );
  }

  async Pull(app: any) {
    let nameFnx = "Fnx_Actualizar";
    this.fnx = {
      funcion: nameFnx,
      repositorio: app.repositorio,
    };
    let lstApp = []
    await this.taskService.keys().then(
      async lst => {
        let cnt = lst.length;
        for (let i = 0; i < cnt; i++) {
          const e = lst[i];
          this.taskService.get(e).then(
            data => {
              console.log(data)
              lstApp.push(data)
              if(i == cnt-1) this.inserCommitDB(lstApp)
            }
          )
          
        }
      
       
        
      }
    )
    
   
    // await Swal.fire({
    //   title: `Va a actualizar el proyecto <br> ${app.repositorio} `,
    //   text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonText: "Cancelar",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Si, Actualizar!",
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.apiService.ExecFnx(this.fnx).subscribe(
    //       (data) => {
    //         this.pID.id = data.contenido.id;
    //         this.pID.estatus = true;
    //         this.msjService.lstpid$.emit(this.pID);
    //         this.taskService
    //           .set(data.contenido.id, nameFnx, app.repositorio)
    //           .then((e) => {
    //             this.apiService.ConsultarPidRecursivo(
    //               data.contenido.id,
    //               app.repositorio
    //             );
    //           })
    //           .catch((e) => console.log(e));
    //       },
    //       (error) => {
    //         console.log(error);
    //       }
    //     );
    //   }
    // });
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
}
