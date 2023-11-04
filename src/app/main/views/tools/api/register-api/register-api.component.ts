import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, IAPI, IAPICore } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import Stepper from 'bs-stepper';
import { environment } from 'environments/environment';

import { AES } from 'crypto-js';
const clave = '5412892DF0D2919B04ADD29EDEFABA30E30F6D7F5A62A9B84AD46BDE23B25491';
import { enc } from 'crypto-js';


@Component({
  selector: 'app-register-api',
  templateUrl: './register-api.component.html',
  styleUrls: ['./register-api.component.scss']
})
export class RegisterApiComponent implements OnInit {

  // public
  public contentHeader: object;


  public ruta: string = environment.apiUrl + environment.API + environment.Hash
  public ListaAplicaciones

  public driversAPP

  public drivers: any

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public apiUpdate: IAPICore = {
    funcion: '',
    entorno: ''
  }

  public codeJson: any = {
    theme: 'idea',
    mode: 'application/ld+json',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true
  };

  public codeSQL: any = {
    theme: 'idea',
    mode: 'text/x-sql',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true
  };


  public xAPIDB: IAPI = {
    http: undefined,
    https: undefined,
    tipo: undefined,
    distribucion: undefined,
    aplicacion: undefined,
    funcion: '',
    version: '0.0.1',
    categoria: undefined,
    funcionalidad: undefined,
    parametros: '',
    descripcion: '',
    metodo: undefined,
    relacional: undefined,
    coleccion: '',
    valores: undefined,
    consumidores: 100,
    cache: 0,
    logs: false,
    concurrencia: false,
    retorna: false,
    prioridad: '0',
    entorno: 'desarrollo',
    accion: false,
    estatus: true,
    ruta: '',
    entradas: '',
    query: '',
    alias: '',
    driver: undefined,
    id: '',
    tiempoduracion: '20',
    tipoduracion: 0
  }

  public xAPIAux: IAPICore

  public existe: boolean = false


  public duracion = [
    { id: 0, name: 'Segundos' },
    { id: 1, name: 'Minutos' },
    { id: 2, name: 'Horas' }
  ]


  public http = [
    { id: '8012', name: '8012' },
    { id: '8013', name: '8013' }
  ]
  public https = [
    { id: '2286', name: '2286' },
    { id: '2385', name: '2385' }
  ]

  public estatus = [
    { id: true, name: 'ACTIVA' },
    { id: false, name: 'INACTIVA' }
  ]

  public tipo = [
    { id: 'CODIGO', name: 'GENERAR CODIGO' },
    { id: 'LOGICA', name: 'LOGICA DE NEGOCIO' },
    { id: 'CONSULTA', name: 'CONSULTA SLQ / NOSQL' },
    { id: 'INTERFAZ', name: 'INTERFAZ' },
    { id: 'ARCHIVO', name: 'ARCHIVO' }
  ]

  public lsttipodato = [
    { id: 'boo', name: 'LOGICO' },
    { id: 'string', name: 'CADENA' },
    { id: 'date', name: 'FECHA' },
    { id: 'int', name: 'ENTERO' },
    { id: 'dbl', name: 'DOBLE' },
    { id: 'sql', name: 'SQL' },
    { id: 'cencrypt', name: 'FICHERO CIFRADO' },
    { id: 'orcdt', name: 'F./HORA ORACLE' }
  ]

  public categoria = [
    { id: 'CORE', name: 'CORE' },
    { id: 'APLICACIONES', name: 'APLICACIONES' },
  ]

  public distribucion = [
    { id: 'COMPARTIDA', name: 'COMPARTIDA' },
    { id: 'PRIVADA', name: 'PRIVADA' },
  ]


  public funcionalidad = [
    { id: 'LOGICA', name: 'LOGICA' },
    { id: 'FINANCIERA', name: 'FINANCIERA' },
    { id: 'ARITMETICA', name: 'ARITMETICA' },
    { id: 'INGENIERIA', name: 'INGENIERIA' },
    { id: 'ESTADISTICA', name: 'ESTADISTICA' },
    { id: 'SISTEMA', name: 'SISTEMA' },
  ]

  public cache = [
    { id: 0, name: 'NINGUNO' },
    { id: 1, name: 'INCLUSIVO' },
    { id: 2, name: 'EXCLUSIVO' },
  ]

  public logs = [
    { id: true, name: 'SI' },
    { id: false, name: 'NO' },
  ]

  public concurrente = [
    { id: true, name: 'SI' },
    { id: false, name: 'NO' },
  ]

  public retorno = [
    { id: true, name: 'SI' },
    { id: false, name: 'NO' },
  ]

  public retorn = [
    { id: 1, name: 'BOOL', descripcion: 'LOGICO' },
    { id: 2, name: 'STRING', descripcion: 'CADENA' },
    { id: 3, name: 'ARRAY', descripcion: 'ARREGLO' },
    { id: 4, name: 'OBJECT', descripcion: 'OBJETO' },
    { id: 5, name: 'FILE', descripcion: 'ARCHIVO' },
    { id: 6, name: 'NULL', descripcion: 'NULL' },
  ]

  public prioridad = [
    { id: '0', name: 'BAJA' },
    { id: '1', name: 'MEDIA' },
    { id: '2', name: 'ALTA' },
  ]

  public entorno = [
    { id: 'desarrollo', name: 'DESARROLLO' },
    { id: 'calidad', name: 'CALIDAD' },
    { id: 'produccion', name: 'PRODUCCION' },
  ]

  public funciones = [
    { id: 'SUM', name: 'SUMA' },
    { id: 'PROM', name: 'PROMEDIO' },
  ]


  public waf = [
    { id: true, name: 'SI' },
    { id: false, name: 'NO' },
  ]

  public lstcondicion = [
    { id: 'AND', name: 'AND' },
    { id: 'OR', name: 'OR' },
    { id: 'IN', name: 'IN' },
  ]

  public metodo = [
    { id: 'INSERTAR', name: 'INSERTAR' },
    { id: 'CONSULTAR', name: 'CONSULTAR' },
    { id: 'ACTUALIZAR', name: 'ACTUALIZAR' },
    { id: 'ELIMINAR', name: 'ELIMINAR' },
  ]

  public relacional = [
    { id: true, name: 'SI' },
    { id: false, name: 'NO' },
  ]


  public dataModulo = []

  public DisabledNoSql = false

  public lstDml: any = []
  public dataCampo = []
  public xcondicion: boolean = true

  public Xmetodo

  public DisabledTipoDato = true

  public campo = undefined
  public alias = ''
  public tipodato = undefined
  public tabla = undefined
  public xdml = undefined
  public defecto = ''
  public condicion = ''


  public getURL

  public IEntrada = [] //Detalles de la entrada

  public DML: any = ["$values", "$set", "$where"]
  //Listado general de entradas
  public IEntradas = {
    "$values": [],
    "$set": [],
    "$where": []
  }

  public rutaURL


  Dml: any = [
    { "id": "$values", "nombre": "VALUES", "tipo": "INSERTAR" },
    { "id": "$set", "nombre": "SET", "tipo": "ACTUALIZAR" },
    { "id": "$where", "nombre": "WHERE", "tipo": "ACTUALIZAR" },
    { "id": "$where", "nombre": "WHERE", "tipo": "ELIMINAR" },
  ]

  constructor(
    private rutaActiva: ActivatedRoute,
    private apiService: ApiService,
    private utilservice : UtilService,
    private router: Router,
  ) { }

  private horizontalWizardStepper: Stepper;

  /**
   * Horizontal Wizard Stepper Next
   *
   * @param data
   */
  horizontalWizardStepperNext(data) {
    if (data.form.valid === true) {
      this.horizontalWizardStepper.next();
    }
  }
  /**
   * Horizontal Wizard Stepper Previous
   */
  horizontalWizardStepperPrevious() {
    this.horizontalWizardStepper.previous();
  }


  async ngOnInit() {

    this.CargarDrivers()

    this.CargarListaAplicaciones()

    
    this.driversAPP = AES.decrypt(this.rutaActiva.snapshot.params.id, clave).toString(enc.Utf8)
    this.rutaURL = this.rutaActiva.snapshot.params.id
    
    this.LeerAPI(this.rutaActiva.snapshot.params.id)
    
    this.getURL = this.rutaActiva.snapshot.url[1].path

    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});

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
            name: 'API REST',
            isLink: true,
            link: '/tools/api'
          },
          {
            name: 'LISTA APIS',
            isLink: true,
            link: `/tools/api-list/${this.rutaURL}`
          },
          {
            name: this.driversAPP,
            isLink: false
          },
        ]
      }
    };
  }

  async CargarDrivers() {
    this.xAPI.funcion = "LESBDrivers";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (datax) => {
        this.drivers = datax.map(e => {
          e.name = e.descripcion + ' - ' + '(' + e.basedatos + ')'
          // this.drivers.push(e)
          return e
        });
      },
      (error) => { console.log(error) }
    )
  }

  RegistrarAPI() {
    this.xAPIDB.driver = this.driversAPP
    var obj = {
      "coleccion": "apicore",
      "objeto": this.xAPIDB,
      "donde": `{\"id\":\"${this.xAPIDB.id}\"}`,
      "driver": "MGDBA",
      "upsert": true
    }
    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.router.navigate([`tools/api-list/${this.rutaURL}`]);
        this.utilservice.AlertMini('top-end','success',`Tu (API) ha sido registrada codigo: ${data.UpsertedID}`,3000)
      }, (error) => {
        this.utilservice.AlertMini('top-end','error','Error al Guardadar API',3000)
      }
    )
  }

  LeerAPI(funcion){
    this.existe = true
    this.xAPI.funcion = "_SYS_R_ListarApisID";
    this.xAPI.parametros = funcion
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.xAPIDB = data[0];
        }
        this.onTipo(this.xAPIDB.tipo);
        this.xAPIDB.version = this.existe ? this.validarVersion() : this.xAPI.version;
      },
      (error) => {
        console.log(error);
      }
    )
  }

 async UpdateAPI(funcion: string, entorno: string){
    var obj = {
      "coleccion": "apicore",
      "objeto": this.xAPIDB,
      "donde": `{\"funcion\":\"${this.xAPIDB.funcion}\"}`,
      "driver": "MGDBA",
      "upsert": true
    }
   await this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        console.log(data)
        // this.router.navigate([`tools/api-details/${this.rutaURL}`]);
        this.utilservice.AlertMini('top-end','success',`Tu (API) ha sido actualizada`,3000)
      }, (error) => {
        this.utilservice.AlertMini('top-end','error','Error al Guardadar API',3000)
      }
    )
  //   this.apiUpdate.entorno = entorno
  //   this.apiUpdate.funcion = funcion
  //   let jsonG = {
  //     "coleccion": "apicore",
  //     "relacional": false,
  //     "tipo": 'ACTUALIZAR',
  //     "entorno": entorno,
  //     "valores": this.xAPIDB
  //   };
  //   let sApi = 'crud';
  //   this.xAPI = {}
  //  await  this.apiService.Guardar(jsonG, sApi).subscribe(
  //     (data) => {
  //       console.log(data)
  //       this.router.navigate([`tools/api-list/${this.rutaURL}`]);
  //       this.utilservice.AlertMini('top-end', 'success', `Tu (API) ha sido actualizada`, 3000)
  //     },
  //     (errot) => {
  //       this.utilservice.AlertMini('top-end', 'error', 'Fallo la conexión, con el API', 3000)
  //     }
  //   )
  }


  validarVersion() {
    let version = this.xAPIDB.version.split('.')
    let mayor = parseInt(version[0])
    let menor = parseInt(version[1])
    let menor_aux = parseInt(version[2])
    const _api = this.xAPIDB
    const _aux = this.xAPIAux
    if (_api.tipo != _aux.tipo || _api.driver != _aux.driver ||
      _api.concurrencia != _aux.concurrencia || _api.entradas != _aux.entradas ||
      _api.query != _aux.query) {
      mayor = parseInt(version[0]) + 1
    }
    if (_api.logs != _aux.logs || _api.cache != _aux.cache || _api.prioridad != _aux.prioridad || _api.accion != _aux.accion) {
      menor = parseInt(version[1]) + 1
    }
    if (_api.descripcion != _aux.descripcion || _api.categoria != _aux.categoria) {
      menor_aux = parseInt(version[2]) + 1
    }
    console.log(_api)
    console.log(_aux)
    console.log(mayor + '.' + menor + '.' + menor_aux)
    return mayor + '.' + menor + '.' + menor_aux
  }


  onTipo(e) {
    console.log(e)
    // this._divInit()
    switch (this.xAPIDB.tipo) {
      case 'CODIGO':
        // this.divCodigofuente = ''
        // this.divArchivosng = ''
        break;
      case 'ARCHIVO':

        break;
      case 'LOGICA':
        // this.divCodigofuente = ''
        // this.divArchivosng = ''
        break;
      case 'CONSULTA':
        // this.divConsultang = ''
        // this.clickRefresh(0)
        break;
      case 'INTERFAZ':

        break;

      default:

        break;
    }
  }

  selDataBase(valor: any): void {
    this.xAPIDB.driver = valor.id
    this.xAPI.parametros = valor.basedatos;
    this.dataModulo = [];
    switch (valor.driver) {
      case 'mysql8':
        this.xAPI.funcion = "_SYS_MYSQL";
        break;
        case 'mariadb':
        this.xAPI.funcion = "_SYS_MYSQL";
        break;
        case 'postgres13':
          this.xAPI.funcion = "_SYS_POSTGRES";
          break;
        case 'postgres96':
          this.xAPI.funcion = "_SYS_POSTGRES";
        break;
        case 'mongodb':

        break;
        case 'puenteurl':

        break;
        case 'sqlserver17':

        break;
        case 'oracle19c':

        break;
    
      default:
        break;
    }
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        let i = 0
        this.dataModulo = data.Cuerpo.map(e => {
          i++
          return { id: e.tabla, name: e.tabla, definicion: e.definicion }
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }

  setEditorContent(event) {
    //console.log(event)
  }

  clickRefresh(event) {
    this.codeJson = {
      theme: 'idea',
      mode: 'application/ld+json',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true
    }

    this.codeSQL = {
      theme: 'idea',
      mode: 'text/x-sql',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true
    }

  }

  clickRelacional(valor: any) {
    if (valor == true) {
      this.DisabledNoSql = true
    } else {
      this.DisabledNoSql = false
    }
  }

  /**
 * Tabla
 * @param item 
 */
  selectEventModulo(item) {
    this.dataCampo = []
    let i = 0
    let campos = []
    campos = JSON.parse(item.definicion)
    campos.map(e => {
      this.dataCampo.push({ id: e.col, name: e.col, tipo: e.tp, pos: i })
      i++
    });
  }

  /**
   * Eliminar un campo de los elementos de las columnas de las tablas
   * @param name 
   */
  eliminarCampoModulo(name) {
    let aux = this.dataCampo.filter(e => {
      return e.name != name
    });
    this.dataCampo = aux
  }

  onMetodo(ev) {
    this.lstDml = []
    this.Dml.map(e => {
      if(ev != 'CONSULTAR'){
        this.DisabledTipoDato = false
      } else {
        this.DisabledTipoDato = true
      }
      if (e.tipo == ev) {
        this.lstDml.push(e)
      }
    });
  }

  onDml(ev) {
    this.xcondicion = true
    if (ev == "$where") {
      this.xcondicion = false
    }
  }

  async CargarListaAplicaciones() {
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.parametros = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaAplicaciones = data.Cuerpo.map(e => {
          e.name = e.nombre + ' : ' + e.VERSION
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }


  //agregarEntrada a los elementos de la interfaz de una API
  async agregarEntrada() {

    if (this.xdml == "") {
      this.utilservice.AlertMini('top-end','warning','Debe registrar todos los campos requeridos seleccione el campo VALUES',3000)
      return
    }

    if (this.campo == "" || this.tipodato == "") {
      this.utilservice.AlertMini('top-end','warning','Debe registrar todos los campos requeridos; nombre, alias, tipo de dato',3000)

      return
    }
    var e = {
      campo: this.campo,
      defecto: this.defecto,
      alias: this.alias == "" ? this.campo : this.alias,
      tipo: this.tipodato
    }
    console.log(this.xdml)
    this.IEntradas[this.xdml].push(e)

    var blAct = await this.selEntradas().then(e => { return e })
    this.Xmetodo = this.xAPIDB.metodo
    if (this.Xmetodo.name == "ACTUALIZAR" && blAct != true) {
      this.utilservice.AlertMini('top-end','warning','Es recomendable agragar un parametro para actualizar WHERE',3000)
    }
    this.xAPIDB.entradas = JSON.stringify(this.IEntrada, null, '\t')

    this.selMetodo(this.xAPIDB.metodo)
    this.clickRefresh(0)
    this.eliminarCampoModulo(this.campo)
    this.tipodato = ''
    this.campo = ''
    this.alias = ''
    this.defecto = ''
  }

  async selEntradas(): Promise<boolean> {
    var blAct = false //Actualizar
    var cond = undefined
    this.IEntrada = []

    await this.DML.forEach(e => {
      if (this.IEntradas[e].length > 0) {
        if (e == "WHERE") {
          cond = this.condicion
          blAct = true
        }
        this.IEntrada.push({
          "dml": e,
          "condicion": cond,
          "entradas": this.IEntradas[e],
        })
      }
    })

    return blAct


  }

  selMetodo(metodo) {
    switch (metodo) {
      case "INSERTAR":
        this.xAPIDB.query = `INSERT INTO ${this.tabla.name} $exec`
        break;
      case "ACTUALIZAR":
        this.xAPIDB.query = `UPDATE ${this.tabla.name} $exec`
        break;
      case "DELETE":
        this.xAPIDB.query = `DELETE FROM ${this.tabla.name} $exec`
        break;
      default:
        this.xAPIDB.query = `SELECT * FROM `
        break;
    }
  }


}
