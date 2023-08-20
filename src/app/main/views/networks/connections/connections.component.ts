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
import { ConexionesService } from '@services/networks/connections.service';


@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class ConnectionsComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
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


  // Private
  public lbd = 'Base de Datos'
  public count
  public isReload = false;

  public showBaseDatos = false
  public showPuente = false
  private _unsubscribeAll: Subject<any>;
 
  public ListaConexiones = []
  public tempData = [];
  public rowData = [];

  public driver = undefined
  public drivers = []
  public hosts = []

  public status = [
    {id:true, name: 'ACTIVO'},
    {id:false, name: 'INACTIVO'},
  ]
  public protocolo = [
    {id:1, name: 'HTTP'},
    {id:2, name: 'HTTPS'},
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
    private conexionesService : ConexionesService,
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
    await this.CargarDrivers()
    await this.ListarHostname()
    await this.CargarListaConexiones()


    this.loginForm = this._formBuilder.group({
      id: ['', [Validators.required]],
      usuario: ['',[Validators.required]],
      basedatos: ['', [Validators.required]],
      url: [''],
      estatus: [undefined, [Validators.required]],
      driver: [undefined, [Validators.required]],
      clave: ['',[Validators.required]],
      protocolo: [''],
      host: [undefined, [Validators.required]],
      puerto: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
    });

    // this.sectionBlockUI.start('Loading...');
    // this.sectionBlockUI.stop();
    
     // content header
     this.contentHeader = {
      headerTitle: 'Conexiones',
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
            name: 'Redes',
            isLink: false
          },
          {
            name: 'Conexiones',
            isLink: false
          }
        ]
      }
    };
  }



  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.descripcion.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterDriver(event: any) {
    const val = event ? event.id.toLowerCase() : '';
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.driver.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async CargarDrivers(){
    await this.comunicacionesService.ListarDrivers().subscribe(
      (data) => {
        this.drivers = data
      },
      (error) => {
        console.error(error)
      }
    )
  }

  LimpiarForm(){
    this.loginForm = this._formBuilder.group({
      usuario: ['', [Validators.required]],
      identificador: ['', [Validators.required]],
      basedatos: ['', [Validators.required]],
      url: ['', [Validators.required]],
      estatus: ['', [Validators.required]],
      driver: ['', [Validators.required]],
      clave: ['', [Validators.required]],
      host: ['', [Validators.required]],
      puerto: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
    });
  }

  async CargarListaConexiones(){
    this.xAPI.funcion = "LESBDrivers";
    this.xAPI.parametros = ''
    this.ListaConexiones = []
    this.count = 0
     await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaConexiones.push(data);
        this.rowData = data;
        this.count = this.rowData.length
        this.tempData = this.rowData;
      },
      (error) => {
        console.log(error)
      }
    ) 
  }

  async ListarHostname(){
    await this.comunicacionesService.Listar().subscribe(
      (data) => {
        this.hosts = data
      },
      (error) => {
        console.log(error)
      }
    )
  }

  CambiarVisibilidadDriver(){
    if (this.driver == "puenteurl") {
      this.showBaseDatos = false
      this.showPuente = true      
    } else {
      this.showBaseDatos = true
      this.showPuente = false      
    } if (this.driver === 'oracle19c') {
      this.lbd = "Oracle_SID"
    } else {
      this.lbd = "Base de Datos"
    } if(this.driver == null){
      this.showBaseDatos = false
      this.showPuente = false      
    }
  }

  ModalEdit(modal, data){
    this.driver = data.driver
    this.loginForm = this._formBuilder.group({
      id: [data.id, [Validators.required]],
      usuario: [data.usuario,[Validators.required]],
      basedatos: [data.basedatos, [Validators.required]],
      url: [data.url],
      estatus: [data.estatus, [Validators.required]],
      driver: [data.driver, [Validators.required]],
      clave: [data.clave,[Validators.required]],
      protocolo: [data.protocolo],
      host: [data.host, [Validators.required]],
      puerto: [data.puerto, [Validators.required]],
      descripcion: [data.descripcion, [Validators.required]],
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

  async EvaluarConexion(){
    if(this.loginForm.value.basedatos == undefined || this.loginForm.value.clave == undefined || this.loginForm.value.basedatos === "" || this.loginForm.value.clave === ""){
      this.utilservice.AlertMini('top-end','warning','Debe introducir los datos para establecer la conexión',3000)
      return false;
    }
    await this.conexionesService.EvaluarConexion(this.loginForm.value, 'evaluarconexion').subscribe(
      (data)=>{
        this.utilservice.AlertMini('top-end','success',data.msj,3000)
      },
      (errot)=>{
        this.utilservice.AlertMini('top-end','error','Error al momento de realizar la conexión, verifique e intente nuevamente',3000)
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

  GuardarConexion(){
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        "coleccion": "sys-drivers",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this.rowData.push(this.ListaConexiones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaConexiones = []
          this.CargarListaConexiones()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success',`Tu (Conexión) ha sido registrada codigo: ${data.UpsertedID}`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
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
        "coleccion": "sys-drivers",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this.rowData.push(this.ListaConexiones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaConexiones = []
          this.CargarListaConexiones()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success',`Tu (Conexión) ha sido actualizada`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
          // console.log(error)
        }
      )

    }
  }

}
