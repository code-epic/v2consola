import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable";

import { ApiService, IAPICore } from "@services/apicore/api.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";


import { WsocketsService } from "@services/websockets/wsockets.service";
import {
  NgbModal,
  NgbModalConfig,
} from "@ng-bootstrap/ng-bootstrap";
import { UtilService } from "@services/util/util.service";
import { TaskService } from "@services/apicore/task.service";
import { ActivatedRoute } from "@angular/router";

interface MiObjeto {
  aplicacion?: string
  funciones?: []
  totalFunciones?: string
}

@Component({
  selector: 'app-binnacle-applications',
  templateUrl: './binnacle-applications.component.html',
  styleUrls: ['./binnacle-applications.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class BinnacleApplicationsComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI("section-block") sectionBlockUI: NgBlockUI;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
  };

  public msj: string = "Cargardo!!! por favor espere..."

  public xrs: string = ""


  public ListarBitacora = [];
  public tempData = [];
  public rowData = [];

  public ListarBitacoraRegistros = [];
  public tempDataRegistros = [];
  public rowDataRegistros = [];


  public urlID : MiObjeto = {}

  // public
  public contentHeader: object;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  constructor(
    private taskService: TaskService,
    private apiService: ApiService,
    private msjService: WsocketsService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private utilService: UtilService
  ) { }

  async ngOnInit() {
    const datoBase64 = this.route.snapshot.paramMap.get('id');
    if (datoBase64) {
      const datoDecodificado = atob(datoBase64);
      const objetoRecibido: MiObjeto = JSON.parse(datoDecodificado);
      this.urlID = objetoRecibido;
      console.log(objetoRecibido);
      
      // Verificar si existe antes de acceder
      if (objetoRecibido.aplicacion) {
        console.log(objetoRecibido.aplicacion);
      } else {
        this.utilService.AlertMini('top-end', 'error','La propiedad aplicacion no existe en el objeto recibido.',3000)
      }
    }

    this.urlID.funciones.forEach(e => {
      this.ListarBitacora.push(e);
    });
    this.rowData = this.ListarBitacora;
    this.tempData = this.rowData;


    // content header
    this.contentHeader = {
      headerTitle: "Investigación",
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
            name: "Bitacora",
            isLink: false,
          },
          {
            name: this.urlID.aplicacion,
            isLink: false,
          },
        ],
      },
    };
  }

  async ModalExePlay(modal: any, data: any) {
    data.registros.forEach(e => {
      this.ListarBitacoraRegistros.push(e)
    });
    this.rowDataRegistros = this.ListarBitacoraRegistros
    this.tempDataRegistros = this.tempDataRegistros
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalVerConsulta(modal: any, data: any) {
    this.xrs = this.msj
    setTimeout(() => {
      this.xrs = data.consulta ? data.consulta : 'No hay registros...';
    }, 1000);
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.funcion.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterUpdateRegister(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temps = this.tempDataRegistros.filter(function (d) {
      return d.usuario.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowDataRegistros = temps;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  cerrarModal() {
      this.modalService.dismissAll(); 
  }


}

