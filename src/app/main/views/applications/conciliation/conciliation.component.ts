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
  selector: 'app-conciliation',
  templateUrl: './conciliation.component.html',
  styleUrls: ['./conciliation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class ConciliationComponent implements OnInit {

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
    ) {}
  
    async ngOnInit() {
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
              name: "Conciliación",
              isLink: false,
            },
          ],
        },
      };
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
  

  }
  