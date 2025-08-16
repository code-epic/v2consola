import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core"
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable"

import {
  ApiService,
  IAPICore,
  ProcessID,
  RestoreAPI,
} from "@services/apicore/api.service"
import { BlockUI, NgBlockUI } from "ng-block-ui"

import { WsocketsService } from "@services/websockets/wsockets.service"
import {
  NgbModal,
  NgbModalConfig,
} from "@ng-bootstrap/ng-bootstrap"
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms"
import { UtilService } from "@services/util/util.service"
import { IFunciones } from "@services/tools/functions.service"
import Swal from "sweetalert2"
import { environment } from "environments/environment"
import { TaskService } from "@services/apicore/task.service"
import { env } from "process"

@Component({
  selector: "app-functions",
  templateUrl: "./functions.component.html",
  styleUrls: ["./functions.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal],
})
export class FunctionsComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent
  @BlockUI() blockUI: NgBlockUI
  @BlockUI("section-block") sectionBlockUI: NgBlockUI

  public codeMirrorOptions: any = {
    theme: "material",
    mode: "text/x-sh",
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: [
      "CodeMirror-linenumbers",
      "CodeMirror-foldgutter",
      "CodeMirror-lint-markers",
    ],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: true,
  };

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

  public existe: boolean = false
  public fecha = new Date().toISOString()
  public Fnx: IFunciones = {
    id: "",
    tipo: "S",
    nombre: "",
    version: "0.0.1",
    lenguaje: "S",
    categoria: "S",
    retorno: "S",
    codigo: "",
    descripcion: "",
    parametros: "",
    fecha: this.fecha,
    tiempo: "",
    estatus: 0,
  }
  public FnxAux: IFunciones = {
    id: "",
    tipo: "S",
    nombre: "",
    version: "0.0.1",
    lenguaje: "S",
    categoria: "S",
    retorno: "S",
    codigo: "",
    descripcion: "",
    parametros: "",
    fecha: this.fecha,
    tiempo: "",
    estatus: 0,
  }

  public divTiempo: boolean = false

  // Private
  public lbd = "Base de Datos"
  public count
  public isReload = false

  public showBaseDatos = false
  public showPuente = false

  public ListaFunciones = []
  public tempData = []
  public rowData = []

  public driver = undefined
  public drivers = []
  public hosts = []

  public tipo = [
    { id: 1, name: "LOGICA" },
    { id: 2, name: "MATEMATICAS" },
    { id: 3, name: "BASEDATOS" },
  ]
  public estatus = [
    { id: 0, name: "INACTIVO", disabled: false },
    { id: 1, name: "ACTIVO", disabled: false },
    { id: 2, name: "EJECUTANDOSE", disabled: true },
    { id: 3, name: "FINALIZADO", disabled: true },
    { id: 4, name: "ZOMBIE", disabled: true },
  ]
  public lenguaje = [
    { id: 1, name: "PHP", descripcion: "PHP +7" },
    { id: 2, name: "PYTHON", descripcion: "PYTHON" },
    { id: 3, name: "RUST", descripcion: "RUST" },
    { id: 4, name: "BASH", descripcion: "SCRIPT BASH" },
    { id: 5, name: "SHELL", descripcion: "SHELL COMMANDS" },
    { id: 6, name: "NJS", descripcion: "NODE JS" },
    { id: 7, name: "GO", descripcion: "GOLANG" },
    { id: 8, name: "C++", descripcion: "C++" },
    { id: 9, name: "RDN", descripcion: "REGLAS DE NEGOCIOS" },
  ]
  public categoria = [
    { id: 1, name: "EXEC", descripcion: "EJECUCION" },
    { id: 2, name: "PROGRAM", descripcion: "TAREA PROGRAMADA" },
    { id: 3, name: "ESCALAR", descripcion: "ESCALABILIDAD" },
  ]
  public retorno = [
    { id: 1, name: "BOOL", descripcion: "LOGICO" },
    { id: 2, name: "STRING", descripcion: "CADENA" },
    { id: 3, name: "ARRAY", descripcion: "ARREGLO" },
    { id: 4, name: "OBJECT", descripcion: "OBJETO" },
    { id: 5, name: "FILE", descripcion: "ARCHIVO" },
    { id: 6, name: "NULL", descripcion: "NULL" },
  ]

  public obj

  public btnCategoria

  // public
  public mac
  public data: any
  public xrs = ""
  public host = ""
  public submitted = false
  public loginForm: UntypedFormGroup
  public contentHeader: object
  public selected = []
  public kitchenSinkRows: any
  public basicSelectedOption: number = 10
  public ColumnMode = ColumnMode
  public SelectionType = SelectionType

  public xRestore: RestoreAPI = {
    nombre: "",
    ruta: "",
    pass: "",
    basedatos: "",
    coleccion: "",
    funcion: "",
    user: "",
    file_name: "",
  }
  public IExport = {
    usuario: "",
    clave: "",
  }
  public ListaAplicaciones
  public fnx
  public driversAPP

  public pID: ProcessID = {
    id: "",
    estatus: false,
    mensaje: "",
    segundos: "",
    contenido: "",
  }

  public llave: string
  public hashcontrol: string
  public archivos = []


  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,
    private msjService: WsocketsService,
     private taskService: TaskService,
  ) {}

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls
  }

  async ngOnInit() {
    this.llave = this.utilservice.GenerarUnicId()
    this.hashcontrol = btoa("XING" + this.llave)
    
    await this.CargarListaFunciones()
    this.CargarListaAplicaciones()

    this.loginForm = this._formBuilder.group({
      id: [this.utilservice.GenerarUnicId(), [Validators.required]],
      tipo: [undefined, [Validators.required]],
      nombre: [""],
      version: [this.Fnx.version, [Validators.required]],
      estatus: [undefined, [Validators.required]],
      lenguaje: [undefined, [Validators.required]],
      categoria: [undefined, [Validators.required]],
      retorno: [undefined, [Validators.required]],
      descripcion: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      tiempo: [""],
      fecha: [this.Fnx.fecha],
    })

    this.contentHeader = {
      headerTitle: "Herramientas",
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
            name: "Herramientas",
            isLink: false,
          },
          {
            name: "Funciones",
            isLink: false,
          },
        ],
      },
    }
  }

  validarVersion() {
    let version = this.Fnx.version.split(".")
    let mayor = parseInt(version[0])
    let menor = parseInt(version[1])
    let menor_aux = parseInt(version[2])
    const _fnx = this.Fnx
    const _aux = this.FnxAux
    if (
      _fnx.retorno != _aux.retorno ||
      _fnx.lenguaje != _aux.lenguaje ||
      _fnx.nombre != _aux.nombre
    ) {
      mayor = parseInt(version[0]) + 1
    }
    if (_fnx.tipo != _aux.tipo || _fnx.categoria != _aux.categoria) {
      menor = parseInt(version[1]) + 1
    }
    if (_fnx.descripcion != _aux.descripcion || _fnx.codigo != _aux.codigo) {
      menor_aux = parseInt(version[2]) + 1
    }
    return mayor + "." + menor + "." + menor_aux
  }

  clickRefresh(event) {
    this.codeMirrorOptions = {
      theme: "material",
      mode: "text/x-sh",
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: [
        "CodeMirror-linenumbers",
        "CodeMirror-foldgutter",
        "CodeMirror-lint-markers",
      ],
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true,
      indentUnit: 2,
      tabSize: 2,
      height: "80px",
      indentWithTabs: true,
    }
  }

  cambiarModo(): string {
    var idioma = "text/x-idn"
    switch (this.loginForm.value.lenguaje) {
      case "GO":
        idioma = "text/x-go"
        break
      case "PHP":
        idioma = "text/x-php"
        break
      case "SHELL":
        idioma = "text/x-sh"
        break
      case "BASH":
        idioma = "text/x-sh"
        break
      case "PYTHON":
        idioma = "text/x-python"
        break
      case "RUST":
        idioma = "text/x-rustsrc"
        break
      case "RDN":
        idioma = "text/x-idn"
        break
    }
    this.codeMirrorOptions.mode = idioma
    console.log("edicion")
    return idioma
  }

  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase()
    const temp = this.tempData.filter(function (d) {
      return d.nombre.toLowerCase().indexOf(val) !== -1 || !val
    })
    this.rowData = temp
    this.count = this.rowData.length
    this.table.offset = 0
  }

  filterStatus(event: any) {
    const val = event.id ? event.id : ""
    const temp = this.tempData.filter(function (d) {
      return d.estatus.indexOf(val) !== -1 || !val
    })
    this.rowData = temp
    this.count = this.rowData.length
    this.table.offset = 0
  }

  LimpiarForm() {
    this.loginForm = this._formBuilder.group({
      id: ["", [Validators.required]],
      tipo: [undefined, [Validators.required]],
      nombre: ["", [Validators.required]],
      version: ["0.0.1", [Validators.required]],
      estatus: [undefined, [Validators.required]],
      lenguaje: [undefined, [Validators.required]],
      categoria: [undefined, [Validators.required]],
      retorno: [undefined, [Validators.required]],
      descripcion: ["", [Validators.required]],
      codigo: ["", [Validators.required]],
      tiempo: [""],
      fecha: [this.Fnx.fecha],
    })
  }

  async CargarListaFunciones() {
    this.xAPI.funcion = environment.functions.LISTAR_FUNCIONES
    this.xAPI.parametros = ""
    this.xAPI.valores = ""
    this.ListaFunciones = []
    this.count = 0
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.map((e) => {
          this.ListaFunciones.push(e)
        })
        this.rowData = this.ListaFunciones
        this.count = this.rowData.length
        this.tempData = this.rowData
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ModalEdit(modal, data) {
    this.clickRefresh(0)
    this.existe = false
    this.btnCategoria = data.categoria
    this.loginForm = this._formBuilder.group({
      id: [data.id, [Validators.required]],
      tipo: [data.tipo, [Validators.required]],
      nombre: [data.nombre],
      version: [data.version, [Validators.required]],
      estatus: [data.estatus, [Validators.required]],
      lenguaje: [data.lenguaje, [Validators.required]],
      categoria: [data.categoria, [Validators.required]],
      retorno: [data.retorno, [Validators.required]],
      descripcion: [data.descripcion, [Validators.required]],
      codigo: [data.codigo, [Validators.required]],
      tiempo: [data.tiempo],
      fecha: [this.loginForm.value.fecha],
    })
    this.modalService.open(modal, {
      centered: true,
      size: "xl",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    })
  }

  ModalAdd(modal) {
    this.LimpiarForm()
    this.modalService.open(modal, {
      centered: true,
      size: "xl",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    })
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES
    this.xAPI.parametros = ""
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaAplicaciones = data.Cuerpo.map((e) => {
          e.name = e.nombre + " : " + e.VERSION
          return e
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  GuardarFuncion() {
    this.submitted = true
    console.log(this.loginForm.get('categoria')?.value)
    if (this.loginForm.invalid) {
      return
    } else {
      this.loginForm.value.version = this.existe
        ? this.validarVersion()
        : this.loginForm.value.version
      var obj = {
        coleccion: "sys-function",
        objeto: this.loginForm.value,
        donde: `{\"id\":\"${this.loginForm.value.id}\"}`,
        driver: "MGDBA",
        upsert: true,
      }
      this.rowData.push(this.ListaFunciones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          console.log(this.loginForm.get('categoria')?.value)

          if (this.loginForm.get('categoria')?.value === 'PROGRAM') {
            this.ejecutarCrontab()
          } 
          
          this.ListaFunciones = []
          this.CargarListaFunciones()
          this.modalService.dismissAll("Close")
          this.utilservice.AlertMini(
            "top-end",
            "success",
            `Tu (Función) ha sido registrada codigo: ${data.UpsertedID}`,
            3000
          )
          this.LimpiarForm()
        },
        (error) => {
          this.utilservice.AlertMini(
            "top-end",
            "error",
            "Error al Guardadar los Datos",
            3000
          )
        }
      )
    }
  }

  SeleccionarPrograma() {
    this.divTiempo = false
    switch (this.btnCategoria) {
      case "PROGRAM":
        this.divTiempo = true
        break

      default:
        break
    }
  }

  openHelp(modal: any) {
    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    })
  }

  ModalExePlay(modal: any, data: any) {
    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    })
  }

  ModalConfig(modal: any, data: any) {
    this.btnCategoria = data.categoria
    this.loginForm = this._formBuilder.group({
      id: [data.id, [Validators.required]],
      tipo: [data.tipo, [Validators.required]],
      nombre: [data.nombre],
      version: [data.version, [Validators.required]],
      estatus: [data.estatus, [Validators.required]],
      lenguaje: [data.lenguaje, [Validators.required]],
      categoria: [data.categoria, [Validators.required]],
      retorno: [data.retorno, [Validators.required]],
      descripcion: [data.descripcion, [Validators.required]],
      codigo: [data.codigo, [Validators.required]],
      tiempo: [data.tiempo],
      fecha: [this.loginForm.value.fecha],
    })
    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    })
  }

  Editarfuncion() {
    this.loginForm.value.version = this.existe
      ? this.validarVersion()
      : this.loginForm.value.version
    this.submitted = true
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        coleccion: "sys-function",
        objeto: this.loginForm.value,
        donde: `{\"id\":\"${this.loginForm.value.id}\"}`,
        driver: "MGDBA",
        upsert: true,
      };
      this.rowData.push(this.ListaFunciones);
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          console.log(this.loginForm.get('categoria')?.value)

          if (this.loginForm.get('categoria')?.value === 'PROGRAM') {
            this.ejecutarCrontab()
          } 
          this.ListaFunciones = [];
          this.CargarListaFunciones();
          this.modalService.dismissAll("Close");
          this.utilservice.AlertMini(
            "top-end",
            "success",
            `Tu (Función) ha sido actualizada`,
            3000
          );
          this.LimpiarForm();
        },
        (error) => {
          this.utilservice.AlertMini(
            "top-end",
            "error",
            "Error al Guardadar los Datos",
            3000
          );
          // console.log(error)
        }
      );
    }
  }

  ModalExportarArchivo(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: "sm",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    });
  }

  ModalSubirArchivo(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: false,
      windowClass: "fondo-modal",
    });
  }

  async ExportFunciones() {
    let nameFnx = environment.functions.EXPORTAR_FUNCIONES
    this.fnx = {
      funcion: nameFnx,
      basedatos: environment.BD,
      user: this.IExport.usuario,
      pass: this.IExport.clave,
      driver: environment.colecciones.SYS_FNX_NAME,
      file_name: environment.colecciones.SYS_FNX_NAME,
    }
    await Swal.fire({
      title: `Va a descargar la coleccion de Funciones `,
      text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Descargar!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.ExecFnx(this.fnx).subscribe(
          (data) => {
            // console.log(data)
            this.pID.id = data.contenido.id
            this.pID.estatus = true
            this.msjService.lstpid$.emit(this.pID)
            this.modalService.dismissAll()
            this.taskService
              .set(data.contenido.id, nameFnx, "Descargando funciones")
              .then((e) => {
                this.apiService.ConsultarPidRecursivo(
                  data.contenido.id,
                  "Descargando funciones"
                )
              })
              .catch((e) => console.log(e))
          },
          (error) => {
            console.log(error)
          }
        )
      }
    })
  }


  fileSelected(e) {
    this.archivos.push(e.target.files[0])
  }

  async SubirArchivo(e) {
    console.log(document.getElementById('identificador') )
    var frm = new FormData(document.forms.namedItem("forma"))
    try {
      await this.apiService.EnviarArchivos(frm).subscribe(
        (data) => {
         this.ValoresMasivos()
         
        }
      )
    } catch (error) {
      console.error(error)
    }

  }


  ValoresMasivos() {
    let cargaMasiva = {
      codigo: this.llave,
      ruta: this.hashcontrol,
      nombre: this.archivos[0].name,
      funcion: "SetPath",
      inicio: this.utilservice.FechaActual(0),
      fin: this.utilservice.FechaActual(0),
      tipo: 'ZIP',
      sistema: 'CORE',
      contenido: 'Importar Funciones',
      cantidad: 0,
      estatus: 0,
      usuario: environment.Hash,
    };


    this.xAPI.funcion = environment.functions.INSERT_FILE_PATH;
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(cargaMasiva);
    
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.ObtenerNombreArchivo()
          document.forms.namedItem("forma").reset();
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end', 'success', 'Archivo Subido Exitosamente', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'El archivo no pudo ser subido, por favor verifica e intente de nuevo', 3000)
        }
      },
      (errot) => {
        console.log(errot);
        this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
      }
    );
  }

  ObtenerNombreArchivo() {
    this.xAPI.funcion = environment.functions.OBTENER_NOMBRE_ARCHIVO;
    this.xAPI.parametros = this.llave;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.Cuerpo.length > 0) {
          this.xRestore.nombre = data.Cuerpo[0].nomb
          this.xRestore.ruta = data.Cuerpo[0].ruta
          this.xRestore.pass = this.IExport.clave
          this.xRestore.user = this.IExport.usuario
          this.xRestore.file_name = environment.colecciones.SYS_FNX_NAME
          this.xRestore.basedatos = environment.driver.DATA_BASE
          this.xRestore.coleccion = environment.colecciones.SYS_FNX_NAME
          this.ejecutarFuncion()
        }
      },
      (errot) => {
        console.log(errot);
        this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
      }
    )
  }

  ejecutarFuncion() {
    let nameFnx = 'Restaurar Funciones'
    this.xRestore.funcion = environment.functions.RESTAURAR_FUNCIONES
    this.apiService.ExecFnx(this.xRestore).subscribe(
      (data) => {
        // console.log(data);
        this.pID.id = data.contenido.id;
        this.pID.estatus = true;
        this.msjService.lstpid$.emit(this.pID);
        this.modalService.dismissAll()
        this.taskService
          .set(data.contenido.id, nameFnx, 'Restaurando funciones')
          .then((e) => {
            this.apiService.ConsultarPidRecursivo(
              data.contenido.id,
              'Restaurando funciones'
            );
          })
          .catch((e) => console.log(e));
       
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ejecutarCrontab(){
    let fnx = JSON.stringify(this.loginForm.value)

    this.apiService.ExecCrontab(fnx).subscribe(
      (data) => {
        console.log(data);
       
      },
      (error) => {
        console.log(error);
      }
    );
  }


}
