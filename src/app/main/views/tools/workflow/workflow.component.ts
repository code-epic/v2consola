import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ApiService, IAPICore, WkfEstado, WkfEstatus, wkfRed, wkfTransicion } from '@services/apicore/api.service';
import { ComunicacionesService } from '@services/comunicaciones/comunicaciones.service';
import { Wdefinicion, WorkflowService } from '@services/workflow/workflow.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;


  public contentHeader: object;

  //  Interface de APICORE
  public xAPI : IAPICore = {
    funcion: '',
    relacional: false,
    concurrencia : false,
    retorna : false,
    migrar : false,
    parametros: '',
    modulo : '',
    valores : {},
    logs : false,
    cache: 0,
    estatus: false
  };

    //  Interface de WKF-ESTADOS
    public wkfEstado : WkfEstado = {
      wkf: 0,
      nombre: '',
      descripcion: '',
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
    public wkfTransicion : wkfTransicion = {
      idw: 0,
      funcion: undefined,
      parametro: ''
    }

    // Interface Red
    public wkfRed : wkfRed = {
      idw: 0,
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
      tipo: undefined,
      estatus: undefined
    }
  
   //  Lista de Niveles de Estatus
  public niveles = [
      { id: "1", descripcion: 'SUPERIOR' },
      { id: "0", descripcion: 'SISTEMA' },
      { id: "2", descripcion: 'SUBSISTEMA' },
  ]
  // Lista de Tipos de Arquitectura
  public tipos = [
    { id: "1", descripcion: 'DOCUMENTOS' },
    { id: "0", descripcion: 'SISTEMA' },
    { id: "2", descripcion: 'SERVIDORES' },
  ]
  public lstOrden = [1,2,3,4,5,6,7,8,9,10]
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
  public tempData = [];
  public rowData = [];
  public ListaTransiciones = []
  public rowDataTransiciones = []
  public tempDataTransiciones = []
  public ListaRed = []
  public rowDataRed = []
  public tempDataRed = []

  public rowTipologia = [
    {id:1, name:'Acción'},
    {id:2, name:'Área'}
  ]
  public rowStatus = [
    {id:1, name:'Activo'},
    {id:0, name:'Inactivo'}
  ]
  
  public showWKF: boolean = false
  public estado = undefined
  public orden = undefined
  public xidW: number = 0
  public sectionConsultar : string = ''
  public estatus = undefined
  public aplicacion : string = undefined
  public xdrivers: string = undefined
  public xmodulo :  string = undefined
  public drivers: any
  public nombre  :  string = ''
  public descripcion  :  string = ''
  public isBtnSalvar : boolean = true
  public isDisabledInput : boolean = false
  public isButtonVisibleSalvar : boolean = false
  public isButtonVisibleUpdate : boolean = false
  
  constructor(
    private apiService : ApiService,
    private comunicacionesService: ComunicacionesService,
    private wkf : WorkflowService
  ) { }
  

  ngOnInit(): void {
    this.wkf.msjText$.subscribe(e => {
      if ( e == 'CLEAN') this.rowEstado = []
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
            name: 'Home',
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
    };

  }

  //  Carga la Lista de las Funciones
  async CargarListaFunciones(){
    this.xAPI.funcion = "SSB_LFunciones";
    this.xAPI.parametros = ''
    this.ListaFunciones = []
     await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.map(e => {
          this.ListaFunciones.push(e);
        });
      },
      (error) => {
        console.log(error)
      }
    ) 
  }

  // Carga la Lista de las Apliaciones
  async lstAplicaciones(){
    // console.info('llego lista aplicaciones')
    this.xAPI.funcion = "SEC_CAplicaciones";
    this.xAPI.valores = null;
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstApps = data.Cuerpo
      },
      (error) => {
        console.error(error)
      }
    )
  }

  // Lista los Modulos 
  selModulo() : void {
    this.xAPI.funcion = "LstModulos";
    this.xAPI.parametros = this.aplicacion;
    this.dataModulo = [];
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {          
          this.dataModulo.push({ id: e.id, name: e.nomb  })
        });             
      },
      (error) => {
        console.log(error)
      }
    )
  }

  //  Consula la Red y la Carga
  consultarRed(){
    this.xAPI.funcion = 'WKF_CDefinicion'
    let app = this.aplicacion.split('|')
    this.xAPI.parametros = app[0]
    this.apiService.hash =  ':' + app[1]
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.isBtnSalvar = false
        if (data.Cuerpo != undefined ) {
          if (data.Cuerpo.length == 0 ) return
          this.showWKF = true
          this.wkf.msjText$.emit( data.Cuerpo[0].wkf)
          let obj = data.Cuerpo[0]
          this.isBtnSalvar = false
          this.isDisabledInput = true
          this.isButtonVisibleSalvar = true
          this.isButtonVisibleUpdate = true
          this.nombre = obj.nomb
          this.xdrivers = obj.driver
          this.descripcion = obj.obse
        }
      },
      (err) => {
        console.error(err)
      }
    )
  }

  // Carga la lista de los Drivers
  async CargarDrivers() {
    this.xAPI.funcion = "LESBDrivers";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.drivers = data.filter(e => {         
           return e.driver.indexOf('mysql') == 0          
        });
      },
      (error) => { console.log(error) }
    )
  }

  // Limpiar los Registros de la Interface de Registrar WorkFlow
  limpiarRegistroWKF(){
    this.isBtnSalvar = true
    this.isDisabledInput = false
    this.isButtonVisibleSalvar = false
    this.isButtonVisibleUpdate = false
    this.nombre = ''
    this.descripcion = ''
    this.aplicacion = undefined
    this.xmodulo = undefined
    this.xdrivers = undefined
    this.showWKF = false
  }

  //  Salva el registro del WorkFlow
  salvar(){
    var ObjSalvar = {
      'idap' : this.aplicacion,
      'idmo' : this.xmodulo,
      'nomb' : this.nombre,
      'obse' : this.descripcion,
    }
    this.Definicion.push(ObjSalvar)
    this.xAPI.funcion = 'Wk_IDefinicion'
    this.xAPI.valores = JSON.stringify(ObjSalvar)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data.msj)
      },
      (err) => {
        console.error(err)
      }
    )
  }


  Guardar(): any {
    this.xAPI.funcion = 'WKF_IEstados'
    this.wkfEstado.wkf = this.xidW
    this.wkfEstado.estatus = parseInt(this.estatus)
    this.xAPI.valores = JSON.stringify(this.wkfEstado)
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
    this.xAPI.funcion = "WKF_IEstatus"
    this.wkfEstatus.estado = parseInt(this.estado)
    this.wkfEstatus.estatus = this.estatus
    this.wkfEstatus.orden = parseInt(this.orden)
    this.xAPI.valores = JSON.stringify(this.wkfEstatus)
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
      text: `El ${title} ha sido creado con exito (#" ${ id } ") `,
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
    this.xAPI.funcion = 'WKF_CEstados'
    this.xAPI.parametros = idw
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowEstado = data.Cuerpo
        window.sessionStorage.setItem('estados', JSON.stringify(this.rowEstado));
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarEstados() {
    this.wkfEstado = {
      wkf: 0,
      nombre: '',
      descripcion: '',
      estatus: 0
    }
    this.estatus = undefined
    this.rowEstado = []
    this.wkf.msjText$.emit(this.xidW.toString())
     this.lstEstados(this.xidW.toString())
  }

  lstEstatus(): any {
    this.rowEstatus = []
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = this.estado
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
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusRedV.push(e)
        });
      },
      (err) => {
        console.error(err)
      }
    )
  }
  lstEstatusRedF(event): any {
    this.rowEstatusRedF = []
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusRedF.push(e)
        });
      },
      (err) => {
        console.error(err)
      }
    )
  }
  lstEstatusRedDF(event): any {
    this.rowEstatusDF = []
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusDF.push(e)
        });
      },
      (err) => {
        console.error(err)
      }
    )
  }

  lstTranscion(e :any): any {
    this.ListaTransiciones = []
    this.xAPI.funcion = "WKF_RTransicion"
    this.xAPI.parametros = e
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
          data.Cuerpo.map(e => {
            this.ListaTransiciones.push(e)
          });
          this.rowDataTransiciones = this.ListaTransiciones;
          this.tempDataTransiciones = this.rowDataTransiciones;
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarEstatus() {
    this.wkfEstatus = {
      nombre: "",
      descripcion: "",
      estatus: 0,
      estado: 0,
      orden: 0,
    }
    this.orden = undefined
    this.rowEstatus = []
    //this.wkf.msjText$.emit(this.xidW.toString())
    // this.lstEstados(this.xidW.toString())
  }

  EliminarEstatus(estatus : any){
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

  GuardarTransaccion(){
    this.wkfTransicion.idw = this.xidW
    this.xAPI.funcion = "WKF_ITransicion"
    this.xAPI.valores = JSON.stringify(this.wkfTransicion)
    this.rowDataTransiciones = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj,'Transición')
        this.lstTranscion(this.xidW.toString())
        this.limpiarTransicion()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarTransicion(){
    this.wkfTransicion = {
      idw: 0,
      funcion: '',
      parametro: ''
    }
  }

  lstRed(e :any): any {
    this.ListaRed = []
    this.xAPI.funcion = "WKF_RRed"
    this.xAPI.parametros = e
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
          data.Cuerpo.map(e => {
            this.ListaRed.push(e)
          });
          this.rowDataRed = this.ListaRed;
          this.tempDataRed = this.rowDataRed;
      },
      (err) => {
        console.error(err)
      }
    )
  }

  GuardarRed(){
    this.wkfRed.idw = this.xidW
    this.xAPI.funcion = "WKF_IRed"
    this.xAPI.valores = JSON.stringify(this.wkfRed)
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

  limpiarRed(){
    this.wkfRed = {
      idw: 0,
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
      tipo: undefined,
      estatus: undefined

    }
  }

}
