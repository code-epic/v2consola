import { Component, OnInit, ViewChild, Output, EventEmitter, signal } from '@angular/core'
import { ApiService, IAPICore, WkfDescripcionRed, WkfEstado, WkfEstatus, WkfFrom, WkfZRed, wkfRed, wkfTransicion } from '@services/apicore/api.service'
import { ComunicacionesService } from '@services/comunicaciones/comunicaciones.service'
import { UtilService } from '@services/util/util.service'
import { Wdefinicion, WorkflowService } from '@services/workflow/workflow.service'
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable'
import Swal from 'sweetalert2'
import Stepper from 'bs-stepper'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CoreDirectivesModule,
        CorePipesModule,
        NgbModule,
        NgxDatatableModule,
        NgSelectModule,
        ContentHeaderComponent,
    ]
})
export class WorkflowComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent

  private horizontalWizardStepper: Stepper;

  public contentHeader: object

  //  Interface de APICORE
  public xAPI: IAPICore = {
    funcion: '',
    relacional: false,
    concurrencia: false,
    retorna: false,
    migrar: false,
    parametros: '',
    modulo: '',
    valores: {},
    logs: false,
    cache: 0,
    estatus: false
  }

  //  Interface de WKF-ESTADOS
  public wkfEstado: WkfEstado = {
    wkf: 0,
    nombre: '',
    descripcion: '',
    estatus: 0
  }

  public wkfForm: WkfFrom = {
    wkf: 0,
    nombre: '',
    descripcion: '',
    tipo: '',
    data: 0,
    origen: '',
    file: '',
    listado: '',
    estatus: 0
  }

  //  Interface WKF-ESTATUS
  public wkfEstatus: WkfEstatus = {
    nombre: "",
    descripcion: "",
    estatus: 0,
    estado: 0,
    orden: 0,
  }

  // Interface Transición
  public wkfTransicion: wkfTransicion = {
    idw: 0,
    funcion: undefined,
    parametro: ''
  }

  // Interface Red
  public wkfRed: wkfRed = {
    idred: 0,
    estadoOrigen: undefined,
    estatusOrigen: undefined,
    transicionVerdadero: undefined,
    estadoDestinoVerdadero: undefined,
    estatusDestinoVerdadero: undefined,
    estadoDestinoFalso: undefined,
    estatusDestinoFalso: undefined,
    transicionFalsa: undefined,
    descripcion: '',
    usuario: '',
    nombre: '',
    estatus: undefined
  }

  public DescripcionRed: WkfDescripcionRed = {
    nombre: '',
    descripcion: '',
    tipo: 0,
    estatus: 0
  }

  public ZRed: WkfZRed = {
    idred: 0,
    idw: 0
  }

  //  Lista de Niveles de Estatus
  public niveles = [
    { id: "1", descripcion: 'SUPERIOR' },
    { id: "0", descripcion: 'SISTEMA' },
    { id: "2", descripcion: 'SUBSISTEMA' },
  ]
  // Lista de Tipos de Arquitectura

  public xtipo = ''
  public lstTipo = [
    { id: "0", descripcion: 'TEXTO' },
    { id: "1", descripcion: 'LISTA' },
    { id: "2", descripcion: 'ARCHIVO' },
    { id: "3", descripcion: 'SERVICIO' },
    { id: "4", descripcion: 'OBSERVACIONES' },
    { id: "5", descripcion: 'IMAGEN' },
    { id: "6", descripcion: 'FECHA' },
  ]

  public xdatos_val: boolean = false
  public xdatos_api: boolean = false
  public xdatos_archivo: boolean = false
  public xdatos_defecto: boolean = false

  public xdatos = ''
  public xorigen = ''
  public lstDatos = [
    { id: "0", descripcion: 'ARCHIVO DE TEXTO' },
    { id: "1", descripcion: 'API REST-FULL' },
    { id: "1", descripcion: 'DATOS POR DEFECTO' },
  ]

  public lstAPI = []

  public tipos = [
    { id: "1", descripcion: 'DOCUMENTOS' },
    { id: "0", descripcion: 'SISTEMA' },
    { id: "2", descripcion: 'SERVIDORES' },
  ]
  public lstOrden = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  public lstApps = []
  public dataModulo = []
  public Definicion = []
  public rowEstado: []
  public rowEstadoDF = []
  public rowEstatusDF = []
  public rowEstatus: []
  public rowEstatusRedV = []
  public rowEstatusRedF = []
  public ListaFunciones = []
  public tempData = []
  public rowForm = []
  public rowData = []
  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }
  public ListaTransiciones = []
  public rowDataTransiciones = []
  public tempDataTransiciones = []
  public ListaRed = []
  public rowDataRed = []
  public tempDataRed = []

  public rowTipologia = [
    { id: 1, name: 'Acción' },
    { id: 2, name: 'Área' }
  ]
  public rowStatus = [
    { id: 1, name: 'Activo' },
    { id: 0, name: 'Inactivo' }
  ]

  public showWKF: boolean = false
  public estado = undefined
  public orden = undefined
  public xidW: number = 0
  public sectionConsultar: string = ''
  public estatus = undefined
  public aplicacion: string = undefined
  public xdrivers: string = undefined
  public xmodulo: string = undefined
  public drivers: any
  public nombre: string = ''
  public descripcion: string = ''
  public isBtnSalvar: boolean = true
  public isDisabledInput: boolean = false
  public isButtonVisibleSalvar: boolean = false
  public isButtonVisibleUpdate: boolean = false

  aplicacionCtrl = new FormControl(undefined)
  xmoduloCtrl = new FormControl(undefined)
  xdriversCtrl = new FormControl(undefined)
  nombreCtrl = new FormControl('')
  descripcionCtrl = new FormControl('')
  xtipoCtrl = new FormControl('')
  xdatosCtrl = new FormControl('')
  xorigenCtrl = new FormControl('')
  estatusCtrl = new FormControl(undefined)
  estadoCtrl = new FormControl(undefined)
  ordenCtrl = new FormControl(undefined)

  // FormControls migrados desde ngModel
  wkfFormNombreCtrl = new FormControl('')
  wkfFormDescripcionCtrl = new FormControl('')
  wkfEstadoNombreCtrl = new FormControl('')
  wkfEstadoDescripcionCtrl = new FormControl('')
  wkfEstatusNombreCtrl = new FormControl('')
  wkfEstatusDescripcionCtrl = new FormControl('')
  wkfTransicionFuncionCtrl = new FormControl(undefined)
  wkfTransicionParametroCtrl = new FormControl('')
  descripcionRedNombreCtrl = new FormControl('')
  descripcionRedTipoCtrl = new FormControl(0)
  descripcionRedEstatusCtrl = new FormControl(0)
  descripcionRedDescripcionCtrl = new FormControl('')
  wkfRedEstadoOrigenCtrl = new FormControl(undefined)
  wkfRedEstatusOrigenCtrl = new FormControl(undefined)
  wkfRedTransicionVCtrl = new FormControl(undefined)
  wkfRedEstadoDestVCtrl = new FormControl(undefined)
  wkfRedEstatusDestVCtrl = new FormControl(undefined)
  wkfRedEstadoDestFCtrl = new FormControl(undefined)
  wkfRedEstatusDestFCtrl = new FormControl(undefined)
  wkfRedTransicionFCtrl = new FormControl(undefined)

  constructor(
    private utilservice: UtilService,
    private apiService: ApiService,
    private comunicacionesService: ComunicacionesService,
    private wkf: WorkflowService,
    private modalService: NgbModal,
  ) { }


  ngOnInit(): void {
    this.wkf.msjText$.subscribe(e => {
      if (e == 'CLEAN') this.rowEstado = []
      this.lstEstados(e)
      this.lstTranscion(e)
      this.lstRed(e)
      this.xidW = parseInt(e)
    })
    this.lstAplicaciones()
    this.CargarDrivers()
    this.CargarListaFunciones()

    // content header
    this.contentHeader = {
      headerTitle: 'Herramientas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Principal',
            isLink: true,
            link: '/home'
          },
          {
            name: 'Herramientas',
            isLink: false
          },
          {
            name: 'WorkFlow',
            isLink: false
          }
        ]
      }
    }

  }

  //  Carga la Lista de las Funciones
  async CargarListaFunciones() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "SSB_LFunciones"
    this.xAPI.parametros = ''
    this.ListaFunciones = []
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.map(e => {
          this.ListaFunciones.push(e)
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  // Carga la Lista de las Apliaciones
  async lstAplicaciones() {
    this.lstApps = []
    // console.info('llego lista aplicaciones')
    this.xAPI.funcion = "SEC_CAplicaciones"
    this.xAPI.parametros = ''
    this.xAPI.valores = null
    this._isLoading.set(true);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstApps = data.Cuerpo
        this._isLoading.set(false);
      },
      (error) => {
        console.error(error)
        this._isLoading.set(false);
      }
    )
  }

  private syncDisabledState() {
    const action = this.isDisabledInput ? 'disable' : 'enable'
    this.aplicacionCtrl[action]()
    this.xdriversCtrl[action]()
    this.nombreCtrl[action]()
    this.descripcionCtrl[action]()
  }

  // Lista los Modulos 
  selModulo(): void {
    let app = this.aplicacionCtrl.value.split('|')
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "LstModulos"
    this.xAPI.parametros = app[0]
    this.dataModulo = []


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.dataModulo.push({ id: e.id, name: e.nomb })
        })
      },
      (error) => {
        console.error(error)
      }
    )
  }

  selTipo(): void {
    this.visibleFalse()
    if (this.xtipoCtrl.value == "1") {
      this.xdatos_val = true
    }
    if (this.xdatos_val) this.xdatosCtrl.enable(); else this.xdatosCtrl.disable()
  }

  visibleFalse() {
    this.xdatos_val = false
    this.xdatos_api = false
    this.xdatos_archivo = false
    this.xdatos_defecto = false
    this.xdatosCtrl.disable()
    this.xorigenCtrl.disable()
  }

  selOrigen(): void {
    this.xdatos_api = false
    this.xdatos_archivo = false
    this.xdatos_defecto = false
    switch (this.xdatosCtrl.value) {
      case "1":
        this.xdatos_api = true
        break;

      default:
        break;
    }
    if (this.xdatos_api) this.xorigenCtrl.enable(); else this.xorigenCtrl.disable()
  }
  //  Consula la Red y la Carga
  consultarRed() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = 'WKF_CDefinicion'
    let app = this.aplicacionCtrl.value.split('|')
    this.xAPI.parametros = app[0]
    this.apiService.hash =  app[1]
    console.log(this.apiService.hash)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.isBtnSalvar = false
        if (data.Cuerpo != undefined) {
          if (data.Cuerpo.length == 0) return
          this.showWKF = true
          this.wkf.msjText$.emit(data.Cuerpo[0].wkf)
          let obj = data.Cuerpo[0]
          this.isBtnSalvar = false
          this.isDisabledInput = true
          this.syncDisabledState()
          this.isButtonVisibleSalvar = true
          this.isButtonVisibleUpdate = true
          this.nombreCtrl.setValue(obj.nomb)
          this.xdriversCtrl.setValue(obj.driver)
          this.descripcionCtrl.setValue(obj.obse)
        }
      },
      (err) => {
        console.error(err)
      }
    )
  }

  // Carga la lista de los Drivers
  async CargarDrivers() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "LESBDrivers"
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.drivers = data.filter(e => {
          return e.driver.indexOf('mysql') == 0
        })
      },
      (error) => { console.log(error) }
    )
  }

  // Limpiar los Registros de la Interface de Registrar WorkFlow
  limpiarRegistroWKF() {
    this.isBtnSalvar = true
    this.isDisabledInput = false
    this.syncDisabledState()
    this.isButtonVisibleSalvar = false
    this.isButtonVisibleUpdate = false
    this.nombreCtrl.setValue('')
    this.descripcionCtrl.setValue('')
    this.aplicacionCtrl.setValue(undefined)
    this.xmoduloCtrl.setValue(undefined)
    this.xdriversCtrl.setValue(undefined)
    this.showWKF = false
  }

  //  Salva el registro del WorkFlow
  salvar() {
    var ObjSalvar = {
      'aplicacion': parseInt(this.aplicacionCtrl.value.split('|')[0]),
      'modulo': parseInt(this.xmoduloCtrl.value),
      'nombre': this.nombreCtrl.value,
      'descripcion': this.descripcionCtrl.value,
      'driver': this.xdriversCtrl.value
    }
    this.Definicion.push(ObjSalvar)
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = 'WKF_IDefinicion'
    this.xAPI.valores = JSON.stringify(ObjSalvar)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.utilservice.AlertMini('top-end', 'success', 'WorkFlow Creado Exitosamente', 3000)
          this.aplicacionCtrl.setValue(undefined)
          this.xmoduloCtrl.setValue(undefined)
          this.nombreCtrl.setValue('')
          this.descripcionCtrl.setValue('')
          this.xdriversCtrl.setValue(undefined)
          this.lstAplicaciones()
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops, Algo salio mal!', 3000)
        }
      },
      (err) => {
        console.error(err)
      }
    )
  }


  Guardar(): any {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = 'WKF_IEstados'
    const estado = {
      wkf: this.xidW,
      nombre: this.wkfEstadoNombreCtrl.value,
      descripcion: this.wkfEstadoDescripcionCtrl.value,
      estatus: parseInt(this.estatusCtrl.value)
    }
    this.xAPI.valores = JSON.stringify(estado)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj, 'Estado')
        this.lstEstados(this.xidW.toString())
        this.limpiarEstados()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  GuardarEstatus(): any {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_IEstatus"
    const estatus = {
      nombre: this.wkfEstatusNombreCtrl.value,
      descripcion: this.wkfEstatusDescripcionCtrl.value,
      estado: parseInt(this.estadoCtrl.value),
      estatus: this.estatusCtrl.value,
      orden: parseInt(this.ordenCtrl.value)
    }
    this.xAPI.valores = JSON.stringify(estatus)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj, 'Estatus')
        this.lstEstatus()
        this.limpiarEstatus()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  Ok(id: any, title: string) {
    Swal.fire({
      title: `Creando ${title} del Workflow`,
      text: `El ${title} ha sido creado con exito (#" ${id} ") `,
      icon: "info",
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar / Continuar",
      cancelButtonText: "No",
    }).then((result) => {
      if (!result.isConfirmed) return
    })
  }

  lstEstados(idw: string): any {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = 'WKF_CEstados'
    this.xAPI.parametros = idw
    this.xAPI.valores = {}
    console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowEstado = data.Cuerpo
        window.sessionStorage.setItem('estados', JSON.stringify(this.rowEstado))
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarEstados() {
    this.wkfEstadoNombreCtrl.setValue('')
    this.wkfEstadoDescripcionCtrl.setValue('')
    this.estatusCtrl.setValue(undefined)
    this.rowEstado = []
    this.wkf.msjText$.emit(this.xidW.toString())
    this.lstEstados(this.xidW.toString())
  }

  lstEstatus(): any {
    this.rowEstatus = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = this.estadoCtrl.value
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowEstatus = data.Cuerpo
      },
      (err) => {
        console.error(err)
      }
    )
  }

  lstEstatusRedV(event): any {
    this.rowEstatusRedV = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusRedV.push(e)
        })
      },
      (err) => {
        console.error(err)
      }
    )
  }
  lstEstatusRedF(event): any {
    this.rowEstatusRedF = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusRedF.push(e)
        })
      },
      (err) => {
        console.error(err)
      }
    )
  }
  lstEstatusRedDF(event): any {
    this.rowEstatusDF = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusDF.push(e)
        })
      },
      (err) => {
        console.error(err)
      }
    )
  }

  lstTranscion(e: any): any {
    this.ListaTransiciones = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_RTransicion"
    this.xAPI.parametros = e
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.map(e => {
          this.ListaTransiciones.push(e)
        })
        this.rowDataTransiciones = this.ListaTransiciones
        this.tempDataTransiciones = this.rowDataTransiciones
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarEstatus() {
    this.wkfEstatusNombreCtrl.setValue('')
    this.wkfEstatusDescripcionCtrl.setValue('')
    this.ordenCtrl.setValue(undefined)
    this.rowEstatus = []
  }

  abrirModal(modalPrimary) {
    this.modalService.open(modalPrimary, {
      centered: true,
      windowClass: 'modal modal-primary',
      size: 'lg',
      backdrop: false
    });
  }

  onCloseClick(event: Event) {
    this.modalService.dismissAll();
  }

  EliminarEstatus(estatus: any) {
    Swal.fire({
      title: "Esta seguro?",
      html: `Eliminar el estatus <font><strong>${estatus.nomb}</strong></font> ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return
    })
  }

  GuardarTransaccion() {
    const transicion = {
      idw: this.xidW,
      funcion: this.wkfTransicionFuncionCtrl.value,
      parametro: this.wkfTransicionParametroCtrl.value
    }
    this.xAPI.funcion = "WKF_ITransicion"
    this.xAPI.valores = JSON.stringify(transicion)
    this.rowDataTransiciones = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj, 'Transición')
        this.lstTranscion(this.xidW.toString())
        this.limpiarTransicion()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarTransicion() {
    this.wkfTransicionFuncionCtrl.setValue(undefined)
    this.wkfTransicionParametroCtrl.setValue('')
  }

  lstRed(e: any): any {
    this.ListaRed = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CMapaRed"
    this.xAPI.parametros = e
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        data.Cuerpo.map(e => {
          this.ListaRed.push(e)
        })
        this.rowDataRed = this.ListaRed
        this.tempDataRed = this.rowDataRed
      },
      (err) => {
        console.error(err)
      }
    )
  }

  GuardarRed() {
    const red = {
      idred: this.xidW,
      estadoOrigen: this.wkfRedEstadoOrigenCtrl.value,
      estatusOrigen: this.wkfRedEstatusOrigenCtrl.value,
      transicionVerdadero: this.wkfRedTransicionVCtrl.value,
      estadoDestinoVerdadero: this.wkfRedEstadoDestVCtrl.value,
      estatusDestinoVerdadero: this.wkfRedEstatusDestVCtrl.value,
      estadoDestinoFalso: this.wkfRedEstadoDestFCtrl.value,
      estatusDestinoFalso: this.wkfRedEstatusDestFCtrl.value,
      transicionFalsa: this.wkfRedTransicionFCtrl.value
    }
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_IRed"
    this.xAPI.valores = JSON.stringify(red)
    this.rowDataRed = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj, 'Red')
        this.lstRed(this.xidW.toString())
        this.limpiarRed()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarRed() {
    this.wkfRedEstadoOrigenCtrl.setValue(undefined)
    this.wkfRedEstatusOrigenCtrl.setValue(undefined)
    this.wkfRedTransicionVCtrl.setValue(undefined)
    this.wkfRedEstadoDestVCtrl.setValue(undefined)
    this.wkfRedEstatusDestVCtrl.setValue(undefined)
    this.wkfRedEstadoDestFCtrl.setValue(undefined)
    this.wkfRedEstatusDestFCtrl.setValue(undefined)
    this.wkfRedTransicionFCtrl.setValue(undefined)
  }


  salvarRed() {
    console.log(this.DescripcionRed)
  }

  addItemForm() {
    const item: WkfFrom = {
      wkf: this.xidW,
      nombre: this.wkfFormNombreCtrl.value,
      descripcion: this.wkfFormDescripcionCtrl.value,
      tipo: this.xtipoCtrl.value,
      data: parseInt(this.xdatosCtrl.value),
      origen: this.xorigenCtrl.value,
      file: '',
      listado: '',
      estatus: 1
    }
    this.rowForm.push(item)
    this.wkfFormNombreCtrl.setValue('')
    this.wkfFormDescripcionCtrl.setValue('')
    this.xtipoCtrl.setValue('')
    this.xdatosCtrl.setValue('')
    this.xorigenCtrl.setValue('')
  }


}
