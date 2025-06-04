import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ColumnMode, DatatableComponent, SelectionType, } from "@swimlane/ngx-datatable";
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { PdfService } from '@services/pdf/pdf.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class UserListComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia: false,
    protocolo: '',
    ruta: '',
    retorna: false,
    migrar: false,
    modulo: '',
    valores: {},
    coleccion: '',
    http: 0,
    https: 0,
    consumidores: 0,
    puertohttp: 0,
    puertohttps: 0,
    driver: '',
    query: '',
    metodo: '',
    tipo: '',
    prioridad: '',
    entorno: '',
    logs: false
  };

  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;


  public contentHeader: object;
  public count: number = 0;
  public tempData = []
  public rowData = []


  constructor(
    private apiService: ApiService,
    private pdf: PdfService,
  ) { }

  async ngOnInit() {

    await this.listarUsuarios();

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
            name: "Seguridad",
            isLink: false,
          },
          {
            name: "Lista de Usuarios",
            isLink: false,
          },
        ],
      },
    };
  }

  async listarUsuarios() {
    this.xAPI.funcion = "_SYS_LstUsuarios";
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowData = data;
        this.tempData = this.rowData;
        this.count = this.rowData.length
      },
      (error) => {
        console.log(error)
      }
    )
  }

  filterUpdate(event: any) {
    const val = event.target.value ? event.target.value.toLowerCase() : '';
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.login.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length;
    // Whenever the filter changes, always go back to the first page
    if (this.table) {
      this.table.offset = 0;
    }
  }

  EliminarUser(event: any){
    console.log(event)
  }

    ListadoUsers() {
    this.pdf.ListadoDeUsers(this.rowData)
  }

}
