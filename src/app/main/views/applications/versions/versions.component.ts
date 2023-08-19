import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore } from '@services/apicore/api.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import Swal from 'sweetalert2';


import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ComunicationsService } from '@services/networks/comunications.service';
import { ConexionesService } from '@services/networks/connections.service';
import { LoginService } from '@services/seguridad/login.service';
import { AuthInterceptorService } from '@services/seguridad/auth-interceptor.service';
import { error } from 'console';

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class VersionsComponent implements OnInit {

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
 
  public ListaAplicaciones = []
  public tempData = [];
  public rowData = [];

  public driver = undefined
  public drivers = []
  public hosts = []

  public lenguaje = [
    {id:1, name: 'PHP'},
    {id:0, name: 'TSC'},
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
    private interceptor : AuthInterceptorService,
    private loginService: LoginService,
    private comunicacionesService : ComunicationsService,
    private apiService : ApiService,
    private modalService: NgbModal,
    private conexionesService : ConexionesService,
    private msjService : WsocketsService,
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
    await this.CargarListaAplicaciones()


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
      headerTitle: 'Aplicaciones',
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
            name: 'Aplicaciones',
            isLink: false
          },
          {
            name: 'Versiones',
            isLink: false
          }
        ]
      }
    };
  }




  
  Pid(){
    this.msjService.lstpid$.emit(false)
  }

  async Clonar(data : any){
    let fnx = {
      'funcion': 'Fnx_Clonar',
      'usuario': data.usuario,
      'token': data.clave,
      'repositorio': data.repositorio,
      'paquete': data.nombre,
      'punto_montaje': data.puntoMontaje
    }
    // console.log(fnx)
   await Swal.fire({
      title: `Va a clonar el proyecto <br> ${data.nombre} `,
      text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Clonar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.msjService.lstpid$.emit(true)
        this.apiService.ExecFnx(fnx).subscribe(
          (data) => {
            console.log(data)
            this.apiService.ConsultarPidRecursivo(data.contenido.id)
          },
          (error) => {
            console.log(error)
          }
        )
      }
    })
  }


  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.nombre.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterLenguaje(event: any) {
    const val = event.name ? event.name: '';
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.lenguaje.indexOf(val) !== -1 || !val;
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

  async CargarListaAplicaciones(){
    this.xAPI.funcion = "LstAplicaciones";
    this.xAPI.parametros = ''
    this.ListaAplicaciones = []
    this.count = 0
     await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.map(e => {
          this.ListaAplicaciones.push(e);
        });
        this.rowData = this.ListaAplicaciones;
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
      this.rowData.push(this.ListaAplicaciones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaAplicaciones = []
          this.CargarListaAplicaciones()
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
        "coleccion": "ys-drivers",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this.rowData.push(this.ListaAplicaciones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaAplicaciones = []
          this.CargarListaAplicaciones()
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
