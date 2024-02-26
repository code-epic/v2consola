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
import { LoginService } from '@services/seguridad/login.service';
import { AuthInterceptorService } from '@services/seguridad/auth-interceptor.service';
import { IFunciones } from '@services/tools/functions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-functions',
  templateUrl: './functions.component.html',
  styleUrls: ['./functions.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class FunctionsComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public codeMirrorOptions: any = {
    theme: 'material',
    mode: 'text/x-sh',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: true
  };


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


  public existe: boolean = false
  public fecha = new Date().toISOString()
  public Fnx: IFunciones = {
    id: '',
    tipo: 'S',
    nombre: '',
    version: '0.0.1',
    lenguaje: 'S',
    categoria: 'S',
    retorno: 'S',
    codigo: '',
    descripcion: '',
    parametros: '',
    fecha: this.fecha,
    tiempo: '',
    estatus: 0
  }
  public FnxAux: IFunciones = {
    id: '',
    tipo: 'S',
    nombre: '',
    version: '0.0.1',
    lenguaje: 'S',
    categoria: 'S',
    retorno: 'S',
    codigo: '',
    descripcion: '',
    parametros: '',
    fecha: this.fecha,
    tiempo: '',
    estatus: 0
  }

  public divTiempo: boolean = false

  // Private
  public lbd = 'Base de Datos'
  public count
  public isReload = false;

  public showBaseDatos = false
  public showPuente = false
  private _unsubscribeAll: Subject<any>;
 
  public ListaFunciones = []
  public tempData = [];
  public rowData = [];

  public driver = undefined
  public drivers = []
  public hosts = []

  public tipo = [
    {id:1, name: 'LOGICA'},
    {id:2, name: 'MATEMATICAS'},
    {id:3, name: 'BASEDATOS'},
  ]
  public estatus = [
    {id:0, name: 'INACTIVO', disabled: false},
    {id:1, name: 'ACTIVO', disabled: false},
    {id:2, name: 'EJECUTANDOSE', disabled: true},
    {id:3, name: 'FINALIZADO', disabled: true},
    {id:4, name: 'ZOMBIE', disabled: true},
  ]
  public lenguaje = [
    {id:1, name: 'PHP', descripcion: 'PHP +7'},
    {id:2, name: 'PYTHON', descripcion: 'PYTHON'},
    {id:3, name: 'RUST', descripcion: 'RUST'},
    {id:4, name: 'BASH', descripcion: 'SCRIPT BASH'},
    {id:5, name: 'SHELL', descripcion: 'SHELL COMMANDS'},
    {id:6, name: 'NJS', descripcion: 'NODE JS'},
    {id:7, name: 'GO', descripcion: 'GOLANG'},
    {id:8, name: 'C++', descripcion: 'C++'},
    {id:9, name: 'RDN', descripcion: 'REGLAS DE NEGOCIOS'},
  ]
  public categoria = [
    {id:1, name: 'EXEC', descripcion: 'EJECUCION'},
    {id:2, name: 'PROGRAM', descripcion: 'TAREA PROGRAMADA'},
    {id:3, name: 'ESCALAR', descripcion: 'ESCALABILIDAD'},
  ]
  public retorno = [
    {id:1, name: 'BOOL', descripcion: 'LOGICO'},
    {id:2, name: 'STRING', descripcion: 'CADENA'},
    {id:3, name: 'ARRAY', descripcion: 'ARREGLO'},
    {id:4, name: 'OBJECT', descripcion: 'OBJETO'},
    {id:5, name: 'FILE', descripcion: 'ARCHIVO'},
    {id:6, name: 'NULL', descripcion: 'NULL'},
  ]

  public obj;

  public btnCategoria

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

  public ListaAplicaciones

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
    await this.CargarListaFunciones()
    this.CargarListaAplicaciones()
    // this.Fnx.id = this.utilservice.GenerarUnicId()
    // this.loginForm.value.id = 'csdcddcd'


    this.loginForm = this._formBuilder.group({
      id: [this.utilservice.GenerarUnicId(), [Validators.required]],
      tipo: [undefined,[Validators.required]],
      nombre: [''],
      version: [this.Fnx.version,[Validators.required]],
      estatus: [undefined, [Validators.required]],
      lenguaje: [undefined, [Validators.required]],
      categoria: [undefined,[Validators.required]],
      retorno: [undefined,[Validators.required]],
      descripcion: ['',[Validators.required]],
      codigo: ['',[Validators.required]],
      tiempo: [''],
      fecha: [this.Fnx.fecha],
    });

    // this.sectionBlockUI.start('Loading...');
    // this.sectionBlockUI.stop();
    
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
            name: 'Funciones',
            isLink: false
          }
        ]
      }
    };
  }


  validarVersion() {
    let version = this.Fnx.version.split('.')
    let mayor = parseInt(version[0])
    let menor = parseInt(version[1])
    let menor_aux = parseInt(version[2])
    const _fnx = this.Fnx
    const _aux = this.FnxAux
    if (_fnx.retorno != _aux.retorno || _fnx.lenguaje != _aux.lenguaje || _fnx.nombre != _aux.nombre) {
      mayor = parseInt(version[0]) + 1
    }
    if (_fnx.tipo != _aux.tipo || _fnx.categoria != _aux.categoria) {
      menor = parseInt(version[1]) + 1
    }
    if (_fnx.descripcion != _aux.descripcion || _fnx.codigo != _aux.codigo) {
      menor_aux = parseInt(version[2]) + 1
    }
    return mayor + '.' + menor + '.' + menor_aux
  }

  clickRefresh(event) {
    this.codeMirrorOptions = {
      theme: 'material',
      mode: 'text/x-sh',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true,
      indentUnit: 2,
      tabSize: 2,
      height: '80px',
      indentWithTabs: true
    }
  }


  cambiarModo(): string {
    var idioma = 'text/x-idn'
    switch (this.loginForm.value.lenguaje) {
      case "GO":
        idioma = 'text/x-go'
        break;
      case "PHP":
        idioma = 'text/x-php'
        break;
      case "SHELL":
        idioma = 'text/x-sh'
        break;
      case "BASH":
        idioma = 'text/x-sh'
        break;
      case "PYTHON":
        idioma = 'text/x-python'
        break;
      case "RUST":
        idioma = 'text/x-rustsrc'
        break;
      case "RDN":
        idioma = 'text/x-idn'
        break;
    }
    this.codeMirrorOptions.mode = idioma
    console.log('edicion')
    return idioma
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

  filterStatus(event: any) {
    const val = event.id ? event.id : '';
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.estatus.indexOf(val) !== -1 || !val;
    });    
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  LimpiarForm(){
    this.loginForm = this._formBuilder.group({
      id: ['', [Validators.required]],
      tipo: [undefined,[Validators.required]],
      nombre: ['',[Validators.required]],
      version: ['0.0.1',[Validators.required]],
      estatus: [undefined, [Validators.required]],
      lenguaje: [undefined, [Validators.required]],
      categoria: [undefined,[Validators.required]],
      retorno: [undefined,[Validators.required]],
      descripcion: ['',[Validators.required]],
      codigo: ['',[Validators.required]],
      tiempo: [''],
      fecha: [this.Fnx.fecha],
    });
  }

  async CargarListaFunciones(){
    this.xAPI.funcion = "SSB_LFunciones";
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.ListaFunciones = []
    this.count = 0
     await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.log(data)
        data.map(e => {
          this.ListaFunciones.push(e);
        });
        this.rowData = this.ListaFunciones;
        this.count = this.rowData.length
        this.tempData = this.rowData;
      },
      (error) => {
        console.log(error)
      }
    ) 
  }


  ModalEdit(modal, data){
    console.log("Iniciando proceso...")
    this.clickRefresh(0)
    this.existe = false
    this.btnCategoria = data.categoria
    this.loginForm = this._formBuilder.group({
      id: [data.id, [Validators.required]],
      tipo: [data.tipo,[Validators.required]],
      nombre: [data.nombre],
      version: [data.version,[Validators.required]],
      estatus: [data.estatus, [Validators.required]],
      lenguaje: [data.lenguaje, [Validators.required]],
      categoria: [data.categoria,[Validators.required]],
      retorno: [data.retorno,[Validators.required]],
      descripcion: [data.descripcion,[Validators.required]],
      codigo: [data.codigo,[Validators.required]],
      tiempo: [data.tiempo],
      fecha: [this.loginForm.value.fecha],
    });
    this.modalService.open(modal,{
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  ModalAdd(modal){
    this.modalService.open(modal,{
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaAplicaciones = data.Cuerpo.map(e => {
          e.name = e.nombre+' : '+e.VERSION
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }


  GuardarFuncion(){
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      this.loginForm.value.version = this.existe ? this.validarVersion() : this.loginForm.value.version
      var obj = {
        "coleccion": "sys-function",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this.rowData.push(this.ListaFunciones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaFunciones = []
          this.CargarListaFunciones()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success',`Tu (Función) ha sido registrada codigo: ${data.UpsertedID}`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
        }
      )
    }
  }

  SeleccionarPrograma() {
    this.divTiempo = false
    switch (this.btnCategoria) {
      case "PROGRAM":
        this.divTiempo = true
        break;

      default:
        break;
    }
  }

  openHelp(modal: any) {
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalExePlay(modal: any, data: any){
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }qqq


  ModalConfig(modal: any, data: any) {
    this.btnCategoria = data.categoria
    this.loginForm = this._formBuilder.group({
      id: [data.id, [Validators.required]],
      tipo: [data.tipo,[Validators.required]],
      nombre: [data.nombre],
      version: [data.version,[Validators.required]],
      estatus: [data.estatus, [Validators.required]],
      lenguaje: [data.lenguaje, [Validators.required]],
      categoria: [data.categoria,[Validators.required]],
      retorno: [data.retorno,[Validators.required]],
      descripcion: [data.descripcion,[Validators.required]],
      codigo: [data.codigo,[Validators.required]],
      tiempo: [data.tiempo],
      fecha: [this.loginForm.value.fecha],
    });
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });

  }



  Editarfuncion(){
    this.loginForm.value.version = this.existe ? this.validarVersion() : this.loginForm.value.version
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        "coleccion": "sys-function",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this.rowData.push(this.ListaFunciones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaFunciones = []
          this.CargarListaFunciones()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success',`Tu (Función) ha sido actualizada`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
          // console.log(error)
        }
      )
    }
  }

}
