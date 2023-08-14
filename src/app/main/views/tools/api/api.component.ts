import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore } from '@services/apicore/api.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';


import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ComunicationsService } from '@services/networks/comunications.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})

export class ApiComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public xAPI : IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia : false,
    protocolo: '',
    ruta : '',
    retorna : false,
    migrar : false,
    modulo : '',
    valores : {},
    coleccion : '',
    http : 0,
    https : 0,
    consumidores : 0,
    puertohttp : 0,
    puertohttps : 0,
    driver : '',
    query : '',
    metodo : '',
    tipo : '',
    prioridad : '',
    entorno: '',
    logs : false
  };


  public searchValue = ''

  public developer
  public quality
  public production

  // Private
  public count
 
  public ListaApis = []
  public tempData = [];
  public rowData = [];

  public sDispositivo

  public driver = []

  public status = [
    {id:true, name: 'ACTIVO'},
    {id:false, name: 'INACTIVO'},
  ]


  // public
  public mac
  public data : any
  public xrs = ''
  public host = ''
  public submitted = false;
  public loginForm: UntypedFormGroup;
  public contentHeader: object;
  public selected = [];
  public kitchenSinkRows: any;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;


  constructor(
    private comunicacionesService : ComunicationsService,
    private apiService : ApiService,
    private modalService: NgbModal,
    private ws : WsocketsService,
    private config: NgSelectConfig,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,
  ) {
  }

    // convenience getter for easy access to form fields
    get f() {
      return this.loginForm.controls;
    }


  async ngOnInit() {
    await this.ListarApis('desarrollo')

    this.loginForm = this._formBuilder.group({
      host: ['', [Validators.required]],
      mac: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      id: ['', [Validators.required]],
      tipo: [undefined],
      estatus: [undefined],
    });
    
     // content header
     this.contentHeader = {
      headerTitle: 'Herramientas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/home'
          },
          {
            name: 'Herramientas',
            isLink: false
          },
          {
            name: 'Api Rest',
            isLink: false
          }
        ]
      }
    };
  }

  async ListarApis(t : string) {
    this.developer = []
    this.quality = []
    this.production = []
    await this.apiService.Listar().subscribe(
      (data) => {
        // this.ListaApis.push(data);
        // this.rowData = data;
        // this.count = this.rowData.length
        // this.tempData = this.rowData;      
        data.forEach(e => {
          switch (e.entorno) {
            case t:
              this.developer.push(e)
              this.rowData = this.developer;
              this.count = this.rowData.length
              this.tempData = this.rowData;            
              break;
              case t:
                this.quality.push(e)
                this.rowData = this.quality;
                this.count = this.rowData.length
                this.tempData = this.rowData;              
                break;
                case t:
                 this.production.push(e)
                  this.rowData = this.production;
                  this.count = this.rowData.length
                  this.tempData = this.rowData;                
                  break;
                  default:
                    break;
                  }
                });       
      },
      (error) => {
        console.error(error)
      }
    );
  }

  Capturar(event){ // Capturar que tipo de API quiero ver
    switch (event) {
      case 'desarrollo':
        this.ListarApis('desarrollo')           
        break;
        case 'calidad':
          this.ListarApis('calidad')                
          break;
          case 'produccion':
            this.ListarApis('produccion')                
            break;
            default:
              this.ListarApis('desarrollo')       
              break;
            } 
  }

  rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.funcion.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterStatus(event: any) {
    const val = event.id ? event.id : '';
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.estatus.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  LimpiarForm(){
    this.loginForm = this._formBuilder.group({
      host: ['', [Validators.required]],
      mac: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      id: ['', [Validators.required]],
      tipo: [undefined],
      estatus: [undefined],
    });
  }

  async CargarLista(){
    this.xAPI.funcion = "_SYS_LstComunicaciones";
    this.xAPI.parametros = ''
    this.ListaApis = []
    this.count = 0
     await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
          this.ListaApis.push(data);
              this.rowData = data;
              this.count = this.rowData.length
              this.tempData = this.rowData;
      },
      (error) => {
        console.log(error)
      }
    ) 
  }

  ModalEdit(modal, data){
    this.loginForm = this._formBuilder.group({
      host: [data.host, [Validators.required]],
      mac: [data.mac, [Validators.required]],
      descripcion: [data.descripcion, [Validators.required]],
      id: [data.id, [Validators.required]],
      tipo: [data.tipo],
      estatus: [data.estatus],
    });
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalEscaneo(modal, data){
    this.data = data
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

   async ScanRed(){
     await this.comunicacionesService.ScanNmap(this.data.host).subscribe(
      (data)=>{
        console.log(data)
        this.xrs = data.msj
      },
      (error)=>{
        this.utilservice.AlertMini('top-end','error','Error al generar Nmap',3000)
        console.error(error)
      }
    )
  }

  async ScanRedMac(){
    await this.comunicacionesService.ScanMac(this.host).subscribe(
      (data)=>{ 
        this.mac = data.msj
      },
      (error)=>{
        this.utilservice.AlertMini('top-end','error','Error al escanear red',3000)
        console.error(error)
      }
    )
    
  }


  ModalAdd(modal){
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  GuardarDispositivo(){
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        "coleccion": "sys-conection",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this.rowData.push(this.ListaApis)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaApis = []
          this.CargarLista()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success',`Tu (Comunicacion) ha sido registrada codigo: ${data.UpsertedID}`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
          // console.log(error)
        }
      )

    }
  }

  EditarDispositivo(){
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        "coleccion": "sys-conection",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this.rowData.push(this.ListaApis)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaApis = []
          this.CargarLista()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success',`Tu (Comunicacion) ha sido actualizada`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
          // console.log(error)
        }
      )

    }
  }

}
