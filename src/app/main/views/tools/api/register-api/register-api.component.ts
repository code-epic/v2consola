import { Component, OnInit, ViewChildren, QueryList } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
} from "@angular/forms";
import { ApiService, IAPI, IAPICore } from "@services/apicore/api.service";
import { UtilService } from "@services/util/util.service";
import Stepper from "bs-stepper";
import { environment } from "environments/environment";

import { AES } from "crypto-js";
const clave =
  "5412892DF0D2919B04ADD29EDEFABA30E30F6D7F5A62A9B84AD46BDE23B25491";
import { enc } from "crypto-js";

import { CoreDirectivesModule } from "@core/directives/directives";
import { CodemirrorModule, CodemirrorComponent } from "@ctrl/ngx-codemirror";
import { NgSelectModule } from "@ng-select/ng-select";
import { ContentHeaderComponent } from "app/layout/components/content-header/content-header.component";

@Component({
  selector: "app-register-api",
  templateUrl: "./register-api.component.html",
  styleUrls: ["./register-api.component.scss"],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CoreDirectivesModule,
    CodemirrorModule,
    NgSelectModule,
    ContentHeaderComponent,
  ],
})
export class RegisterApiComponent implements OnInit {
  @ViewChildren(CodemirrorComponent) codemirrors: QueryList<CodemirrorComponent>;

  // public
  public contentHeader: object;
  public ruta: string = environment.apiUrl + environment.API + environment.Hash;
  public ListaAplicaciones;

  public driversID = "";

  public drivers: any;

  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
  };

  public apiUpdate: IAPICore = {
    funcion: "",
    entorno: "",
  };

  public codeJson: any = {
    theme: "idea",
    mode: "application/ld+json",
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
  };

  public codeSQL: any = {
    theme: "idea",
    mode: "text/x-sql",
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
  };

  public xAPIDB: IAPI = {
    puertohttp: 8012,
    puertohttps: 2286,
    tipo: "",
    distribucion: 0,
    aplicacion: "",
    funcion: "",
    version: "0.0.1",
    categoria: "",
    funcionalidad: "",
    parametros: "",
    descripcion: "",
    metodo: "",
    relacional: false,
    coleccion: "",
    valores: "",
    consumidores: 100,
    cache: 0,
    logs: false,
    concurrencia: false,
    inclusionjwt: false,
    retorna: false,
    prioridad: "0",
    entorno: "desarrollo",
    accion: false,
    estatus: true,
    ruta: "",
    entradas: "",
    query: "",
    alias: "",
    driver: undefined,
    tiempoduracion: 20,
    tipoduracion: 0,
    bitacora: 0,
    respaldo: 0,
    puente: "",
    fecha: new Date().toISOString(),
  };

  public xAPIAux: IAPICore = {
    puertohttp: undefined,
    puertohttps: undefined,
    tipo: undefined,
    distribucion: 0,
    aplicacion: undefined,
    funcion: "",
    version: "0.0.1",
    categoria: undefined,
    funcionalidad: undefined,
    parametros: "",
    descripcion: "",
    metodo: undefined,
    relacional: undefined,
    coleccion: "",
    valores: undefined,
    consumidores: 100,
    cache: 0,
    logs: false,
    concurrencia: false,
    retorna: false,
    prioridad: "0",
    entorno: "desarrollo",
    accion: false,
    estatus: true,
    ruta: "",
    entradas: "",
    query: "",
    alias: "",
    driver: undefined,
    tiempoduracion: 20,
    tipoduracion: 0,
    fecha: "",
  };

  public existe: boolean = false;

  public duracion = [
    { id: 0, name: "Segundos" },
    { id: 1, name: "Minutos" },
    { id: 2, name: "Horas" },
  ];

  public http = [
    { id: 8012, name: "8012" },
    { id: 8013, name: "8013" },
  ];
  public https = [
    { id: 2286, name: "2286" },
    { id: 2385, name: "2385" },
  ];

  public estatus = [
    { id: true, name: "ACTIVA" },
    { id: false, name: "INACTIVA" },
  ];

  public tipo = [
    { id: "CODIGO", name: "GENERAR CODIGO" },
    { id: "LOGICA", name: "LOGICA DE NEGOCIO" },
    { id: "CONSULTA", name: "CONSULTA SLQ / NOSQL" },
    { id: "INTERFAZ", name: "INTERFAZ" },
    { id: "ARCHIVO", name: "ARCHIVO" },
  ];

  public lsttipodato = [
    { id: "boo", name: "LOGICO" },
    { id: "string", name: "CADENA" },
    { id: "date", name: "FECHA" },
    { id: "int", name: "ENTERO" },
    { id: "dbl", name: "DOBLE" },
    { id: "sql", name: "SQL" },
    { id: "cencrypt", name: "FICHERO CIFRADO" },
    { id: "orcdt", name: "F./HORA ORACLE" },
  ];

  public categoria = [
    { id: "CORE", name: "CORE" },
    { id: "APLICACIONES", name: "APLICACIONES" },
  ];

  public LstDistribucion = [
    { id: 1, name: "COMPARTIDA" },
    { id: 0, name: "PRIVADA" },
  ];

  public LstDecision = [
    { id: 1, name: "SI" },
    { id: 0, name: "NO" },
  ];

  public funcionalidad = [
    { id: "LOGICA", name: "LOGICA" },
    { id: "FINANCIERA", name: "FINANCIERA" },
    { id: "ARITMETICA", name: "ARITMETICA" },
    { id: "INGENIERIA", name: "INGENIERIA" },
    { id: "ESTADISTICA", name: "ESTADISTICA" },
    { id: "SISTEMA", name: "SISTEMA" },
  ];

  public cache = [
    { id: 0, name: "NINGUNO" },
    { id: 1, name: "INCLUSIVO" },
    { id: 2, name: "EXCLUSIVO" },
  ];

  public logs = [
    { id: true, name: "SI" },
    { id: false, name: "NO" },
  ];

  public concurrente = [
    { id: true, name: "SI" },
    { id: false, name: "NO" },
  ];

  public retorno = [
    { id: true, name: "SI" },
    { id: false, name: "NO" },
  ];

  public inclusionjwt = [
    { id: true, name: "SI" },
    { id: false, name: "NO" },
  ];

  public hsf = [
    { id: true, name: "SI" },
    { id: false, name: "NO" },
  ];

  public retorn = [
    { id: 1, name: "BOOL", descripcion: "LOGICO" },
    { id: 2, name: "STRING", descripcion: "CADENA" },
    { id: 3, name: "ARRAY", descripcion: "ARREGLO" },
    { id: 4, name: "OBJECT", descripcion: "OBJETO" },
    { id: 5, name: "FILE", descripcion: "ARCHIVO" },
    { id: 6, name: "NULL", descripcion: "NULL" },
  ];

  public prioridad = [
    { id: "0", name: "BAJA" },
    { id: "1", name: "MEDIA" },
    { id: "2", name: "ALTA" },
  ];

  public entorno = [
    { id: "desarrollo", name: "DESARROLLO" },
    { id: "calidad", name: "CALIDAD" },
    { id: "produccion", name: "PRODUCCION" },
  ];

  public funciones = [
    { id: "SUM", name: "SUMA" },
    { id: "PROM", name: "PROMEDIO" },
  ];

  public waf = [
    { id: true, name: "SI" },
    { id: false, name: "NO" },
  ];

  public lstcondicion = [
    { id: "AND", name: "AND" },
    { id: "OR", name: "OR" },
    { id: "IN", name: "IN" },
  ];

  public metodo = [
    { id: "INSERTAR", name: "INSERTAR" },
    { id: "CONSULTAR", name: "CONSULTAR" },
    { id: "ACTUALIZAR", name: "ACTUALIZAR" },
    { id: "ELIMINAR", name: "ELIMINAR" },
  ];

  public relacional = [
    { id: true, name: "SI" },
    { id: false, name: "NO" },
  ];

  public btnInterfaz = true;

  public dataModulo = [];

  public DisabledNoSql = false;

  public lstDml: any = [];
  public dataCampo = [];
  public xcondicion: boolean = true;

  public Xmetodo;

  public DisabledTipoDato = true;

  public campo = undefined;
  public alias = "";
  public tipodato = undefined;
  public tabla = undefined;
  public xdml = undefined;
  public defecto = "";
  public condicion = "";

  public getURL;

  public IEntrada = []; //Detalles de la entrada

  public DML: any = ["$values", "$set", "$where"];
  //Listado general de entradas
  public IEntradas = {
    $values: [],
    $set: [],
    $where: [],
  };

  public rutaURL = "";
  public urlControl = "";
  public driversAPP = "";
  public url = "";

  Dml: any = [
    { id: "$values", nombre: "VALUES", tipo: "INSERTAR" },
    { id: "$set", nombre: "SET", tipo: "ACTUALIZAR" },
    { id: "$where", nombre: "WHERE", tipo: "ACTUALIZAR" },
    { id: "$where", nombre: "WHERE", tipo: "ELIMINAR" },
  ];

  // --- Reactive FormControls ---
  puertohttpCtrl = new FormControl(8012, Validators.required);
  puertohttpsCtrl = new FormControl(2286, Validators.required);
  tipoCtrl = new FormControl("", Validators.required);
  distribucionCtrl = new FormControl(0, Validators.required);
  aplicacionCtrl = new FormControl("", Validators.required);
  funcionCtrl = new FormControl("", Validators.required);
  versionCtrl = new FormControl({ value: "0.0.1", disabled: true });
  driverCtrl = new FormControl(undefined);
  categoriaCtrl = new FormControl("", Validators.required);
  funcionalidadCtrl = new FormControl("", Validators.required);
  descripcionCtrl = new FormControl("", Validators.required);
  puenteCtrl = new FormControl("");
  metodoCtrl = new FormControl("");
  relacionalCtrl = new FormControl(false);
  coleccionCtrl = new FormControl("");
  entradasCtrl = new FormControl("");
  queryCtrl = new FormControl("");
  consumidoresCtrl = new FormControl(100, Validators.required);
  cacheCtrl = new FormControl(0);
  logsCtrl = new FormControl(false);
  concurrenciaCtrl = new FormControl(false);
  retornaCtrl = new FormControl(false);
  tiempoduracionCtrl = new FormControl(20);
  tipoduracionCtrl = new FormControl(0);
  prioridadCtrl = new FormControl("0");
  entornoCtrl = new FormControl("desarrollo");
  accionCtrl = new FormControl(false);
  estatusCtrl = new FormControl(true);
  bitacoraCtrl = new FormControl(0);
  respaldoCtrl = new FormControl(0);
  inclusionjwtCtrl = new FormControl(false);
  hsfCtrl = new FormControl(false);
  tablaCtrl = new FormControl(undefined);
  xdmlCtrl = new FormControl({ value: undefined, disabled: true });
  defectoCtrl = new FormControl("");
  condicionCtrl = new FormControl({ value: "", disabled: true });
  campoCtrl = new FormControl(undefined);
  aliasCtrl = new FormControl("");
  tipodatoCtrl = new FormControl(undefined);
  funcionalidadSelectCtrl = new FormControl("");

  constructor(
    private rutaActiva: ActivatedRoute,
    private apiService: ApiService,
    private utilservice: UtilService,
    private router: Router,
  ) {}

  private horizontalWizardStepper: Stepper;

  horizontalWizardStepperNext(data) {
    if (data.form.valid === true) {
      this.horizontalWizardStepper.next();
    }
  }

  horizontalWizardStepperPrevious() {
    this.horizontalWizardStepper.previous();
  }

  async ngOnInit() {
    this.CargarDrivers();

    this.CargarListaAplicaciones();
    this.rutaURL = this.rutaActiva.snapshot.params.id;
    this.urlControl = this.rutaActiva.snapshot.params.ruta;
    let url = "";

    if (this.urlControl != undefined) {
      let valor = atob(this.urlControl).split("|");
      this.driversAPP = valor[0];
      this.url = valor[1];
      url = "/" + this.url;
    }

    this.LeerAPI(this.rutaURL);

    this.getURL = this.rutaActiva.snapshot.url[2].path;
    let funcion = this.rutaActiva.snapshot.url[3].path;

    this.horizontalWizardStepper = new Stepper(
      document.querySelector("#stepper1"),
      {},
    );

    // [Auto-Refresh CodeMirror] Escuchamos el cambio de paso del stepper
    // para refrescar los editores cuando se vuelvan visibles en el Paso 2
    document
      .querySelector("#stepper1")
      .addEventListener("shown.bs-stepper", (event: any) => {
        // El paso de configuración de código suele ser el índice 1 (Paso 2)
        if (event.detail.to === 1) {
          setTimeout(() => {
            this.clickRefresh(null); // Esto fuerza la redibujada de ngx-codemirror
          }, 100); // Delay necesario para esperar que la animación del stepper finalice
        }
      });

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
            name: "Aplicaciones",
            isLink: true,
            link: "/tools/applications",
          },
          {
            name: "Api",
            isLink: true,
            link: "/tools/applications/" + this.url,
          },
          {
            name: "Detalle",
            isLink: true,
            link: "/tools/applications/api-list/" + this.urlControl,
          },
          {
            name: funcion,
            isLink: funcion != "Registrar" ? true : false,
            link:
              "/tools/applications/api-details/" +
              funcion +
              "/" +
              this.urlControl,
          },
          {
            name: "Control",
            isLink: false,
          },
        ],
      },
    };

    // Reactive forms: valueChanges subscriptions for ngModelChange handlers
    this.tipoCtrl.valueChanges.subscribe((v) => this.onTipo(v));
    this.driverCtrl.valueChanges.subscribe((v) => {
      if (v) this.selDataBase(v);
    });
    this.metodoCtrl.valueChanges.subscribe((v) => {
      if (v) this.onMetodo(v);
    });
    this.relacionalCtrl.valueChanges.subscribe((v) => this.clickRelacional(v));
    this.tablaCtrl.valueChanges.subscribe((v) => {
      if (v) this.selectEventModulo(v);
    });
    this.xdmlCtrl.valueChanges.subscribe((v) => {
      if (v) this.onDml(v);
    });
    this.entradasCtrl.valueChanges.subscribe((v) => this.setEditorContent(v));
    this.queryCtrl.valueChanges.subscribe((v) => this.setEditorContent(v));
  }

  CargarDrivers() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_DRIVERS;
    this.drivers = [];
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (datax) => {
        this.drivers = datax.map((e) => {
          e.name = e.descripcion + " - " + "(" + e.basedatos + ")";
          return e;
        });
        this.drivers.push({
          id: "MGDBA",
          name: "Sandra Server MongoDB (MGDBA)",
          driver: "mongodb",
        });
        // console.log(this.drivers)
      },
      (error) => {
        console.log(error);
      },
    );
  }

  // --- Reactive forms helpers ---
  syncToModel() {
    this.xAPIDB.puertohttp = this.puertohttpCtrl.value;
    this.xAPIDB.puertohttps = this.puertohttpsCtrl.value;
    this.xAPIDB.tipo = this.tipoCtrl.value;
    this.xAPIDB.distribucion = this.distribucionCtrl.value;
    this.xAPIDB.aplicacion = this.aplicacionCtrl.value;
    this.xAPIDB.funcion = this.funcionCtrl.value;
    this.xAPIDB.version = this.versionCtrl.value;
    this.xAPIDB.driver = this.driverCtrl.value;
    this.xAPIDB.categoria = this.categoriaCtrl.value;
    this.xAPIDB.funcionalidad = this.funcionalidadCtrl.value;
    this.xAPIDB.descripcion = this.descripcionCtrl.value;
    this.xAPIDB.puente = this.puenteCtrl.value;
    this.xAPIDB.metodo = this.metodoCtrl.value;
    this.xAPIDB.relacional = this.relacionalCtrl.value;
    this.xAPIDB.coleccion = this.coleccionCtrl.value;
    this.xAPIDB.entradas = this.entradasCtrl.value;
    this.xAPIDB.query = this.queryCtrl.value;
    this.xAPIDB.consumidores = this.consumidoresCtrl.value;
    this.xAPIDB.cache = this.cacheCtrl.value;
    this.xAPIDB.logs = this.logsCtrl.value;
    this.xAPIDB.concurrencia = this.concurrenciaCtrl.value;
    this.xAPIDB.retorna = this.retornaCtrl.value;
    this.xAPIDB.tiempoduracion = this.tiempoduracionCtrl.value;
    this.xAPIDB.tipoduracion = this.tipoduracionCtrl.value;
    this.xAPIDB.prioridad = this.prioridadCtrl.value;
    this.xAPIDB.entorno = this.entornoCtrl.value;
    this.xAPIDB.accion = this.accionCtrl.value;
    this.xAPIDB.estatus = this.estatusCtrl.value;
    this.xAPIDB.bitacora = this.bitacoraCtrl.value;
    this.xAPIDB.respaldo = this.respaldoCtrl.value;
    this.xAPIDB.inclusionjwt = this.inclusionjwtCtrl.value;
    this.xAPIDB.hsf = this.hsfCtrl.value;
  }

  syncFromModel(data: IAPI) {
    this.puertohttpCtrl.setValue(data.puertohttp, { emitEvent: false });
    this.puertohttpsCtrl.setValue(data.puertohttps, { emitEvent: false });
    this.tipoCtrl.setValue(data.tipo, { emitEvent: false });
    this.distribucionCtrl.setValue(data.distribucion, { emitEvent: false });
    this.aplicacionCtrl.setValue(data.aplicacion, { emitEvent: false });
    this.funcionCtrl.setValue(data.funcion, { emitEvent: false });
    this.versionCtrl.setValue(data.version, { emitEvent: false });
    this.driverCtrl.setValue(data.driver, { emitEvent: false });
    this.categoriaCtrl.setValue(data.categoria, { emitEvent: false });
    this.funcionalidadCtrl.setValue(data.funcionalidad, { emitEvent: false });
    this.descripcionCtrl.setValue(data.descripcion, { emitEvent: false });
    this.puenteCtrl.setValue(data.puente, { emitEvent: false });
    this.metodoCtrl.setValue(data.metodo, { emitEvent: false });
    this.relacionalCtrl.setValue(data.relacional, { emitEvent: false });
    this.coleccionCtrl.setValue(data.coleccion, { emitEvent: false });
    this.entradasCtrl.setValue(data.entradas, { emitEvent: false });
    this.queryCtrl.setValue(data.query, { emitEvent: false });
    this.consumidoresCtrl.setValue(data.consumidores, { emitEvent: false });
    this.cacheCtrl.setValue(data.cache, { emitEvent: false });
    this.logsCtrl.setValue(data.logs, { emitEvent: false });
    this.concurrenciaCtrl.setValue(data.concurrencia, { emitEvent: false });
    this.retornaCtrl.setValue(data.retorna, { emitEvent: false });
    this.tiempoduracionCtrl.setValue(data.tiempoduracion, { emitEvent: false });
    this.tipoduracionCtrl.setValue(data.tipoduracion, { emitEvent: false });
    this.prioridadCtrl.setValue(data.prioridad, { emitEvent: false });
    this.entornoCtrl.setValue(data.entorno, { emitEvent: false });
    this.accionCtrl.setValue(data.accion, { emitEvent: false });
    this.estatusCtrl.setValue(data.estatus, { emitEvent: false });
    this.bitacoraCtrl.setValue(data.bitacora, { emitEvent: false });
    this.respaldoCtrl.setValue(data.respaldo, { emitEvent: false });
    this.inclusionjwtCtrl.setValue(data.inclusionjwt, { emitEvent: false });
    if (data.hsf != null) this.hsfCtrl.setValue(data.hsf, { emitEvent: false });
  }

  RegistrarAPI() {
    this.syncToModel();
    this.xAPIDB.puertohttp = parseInt(this.xAPIDB.puertohttp.toString());
    this.xAPIDB.puertohttps = parseInt(this.xAPIDB.puertohttps.toString());
    var obj = {
      coleccion: "apicore",
      objeto: this.xAPIDB,
      donde: `{\"funcion\":\"${this.xAPIDB.funcion}\"}`,
      driver: "MGDBA",
      upsert: true,
    };

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        this.router.navigate([
          `tools/applications/api-list/${this.urlControl}`,
        ]);
        this.utilservice.AlertMini(
          "top-end",
          "success",
          `Tu (API) ha sido registrada codigo: ${data.UpsertedID}`,
          3000,
        );
      },
      (error) => {
        this.utilservice.AlertMini(
          "top-end",
          "error",
          "Error al Guardadar API",
          3000,
        );
      },
    );
  }

  LeerAPI(funcion: string) {
    this.existe = true;
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_APIS_ID;
    this.xAPI.parametros = funcion;
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.length > 0) {
          this.xAPIDB = data[0];
          this.xAPIAux = data[0];
        }
        this.syncFromModel(this.xAPIDB);
        this.onTipo(this.xAPIDB.tipo);
        this.xAPIDB.version = this.existe
          ? this.validarVersion()
          : this.xAPI.version;
        this.syncToModel();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  async UpdateAPI(funcion: string, entorno: string) {
    this.syncToModel();
    this.xAPIDB.puertohttp = parseInt(this.xAPIDB.puertohttp.toString());
    this.xAPIDB.puertohttps = parseInt(this.xAPIDB.puertohttps.toString());
    this.apiUpdate.entorno = entorno;
    this.apiUpdate.funcion = funcion;
    let jsonG = {
      coleccion: "apicore",
      relacional: false,
      tipo: "INSERTAR",
      entorno: entorno,
      valores: this.xAPIDB,
    };
    let sApi = "crud";
    this.xAPI = {};
    // console.log(jsonG)
    // console.log(this.xAPIDB)
    await this.apiService.Guardar(jsonG, sApi).subscribe(
      (data) => {
        this.router.navigate([
          `tools/applications/api-details/${this.rutaURL}/${this.urlControl}`,
        ]);
        this.utilservice.AlertMini(
          "top-end",
          "success",
          `Tu (API) ha sido actualizada`,
          3000,
        );
      },
      (errot) => {
        this.utilservice.AlertMini(
          "top-end",
          "error",
          "Fallo la conexión, con el API",
          3000,
        );
      },
    );
  }

  validarVersion() {
    let version = this.xAPIDB.version.split(".");
    let mayor = parseInt(version[0]);
    let menor = parseInt(version[1]);
    let menor_aux = parseInt(version[2]);
    const _api = this.xAPIDB;
    const _aux = this.xAPIAux;

    if (
      _api.tipo != _aux.tipo ||
      _api.driver != _aux.driver ||
      _api.concurrencia != _aux.concurrencia ||
      _api.entradas != _aux.entradas ||
      _api.query != _aux.query
    ) {
      mayor = parseInt(version[0]) + 1;
    }
    if (
      _api.logs != _aux.logs ||
      _api.cache != _aux.cache ||
      _api.prioridad != _aux.prioridad ||
      _api.accion != _aux.accion
    ) {
      menor = parseInt(version[1]) + 1;
    }
    if (
      _api.descripcion != _aux.descripcion ||
      _api.categoria != _aux.categoria
    ) {
      menor_aux = parseInt(version[2]) + 1;
    }
    // console.log(_api)
    // console.log(_aux)
    // console.log(mayor + '.' + menor + '.' + menor_aux)
    return mayor + "." + menor + "." + menor_aux;
  }

  onTipo(e) {
    switch (e) {
      case "CODIGO":
        // this.divCodigofuente = ''
        // this.divArchivosng = ''
        this.btnInterfaz = true;
        break;
      case "ARCHIVO":
        this.btnInterfaz = true;

        break;
      case "LOGICA":
        // this.divCodigofuente = ''
        // this.divArchivosng = ''
        this.btnInterfaz = true;
        break;
      case "CONSULTA":
        // this.divConsultang = ''
        // this.clickRefresh(0)
        this.btnInterfaz = true;
        break;
      case "INTERFAZ":
        this.btnInterfaz = false;
        break;

      default:
        break;
    }
  }

  selDataBase(valor: any): void {
    this.driversID = valor.id;
    this.xAPI.parametros = valor.basedatos;
    this.dataModulo = [];
    this.xAPI.funcion = "";

    switch (valor.driver) {
      case "mysql8":
        this.xAPI.funcion = "_SYS_MYSQL";
        break;
      case "mariadb":
        this.xAPI.funcion = "_SYS_MYSQL";
        break;
      case "postgres13":
        this.xAPI.funcion = "_SYS_POSTGRES";
        break;
      case "postgres96":
        this.xAPI.funcion = "_SYS_POSTGRES";
        break;
      case "mongodb":
        break;
      case "puenteurl":
        break;
      case "sqlserver17":
        break;
      case "oracle19c":
        break;

      default:
        break;
    }

    if (this.xAPI.funcion != "") {
      this.apiService.Ejecutar(this.xAPI).subscribe(
        (data) => {
          let i = 0;
          this.dataModulo = data.Cuerpo.map((e) => {
            i++;
            return { id: e.tabla, name: e.tabla, definicion: e.definicion };
          });
        },
        (error) => {
          console.log(error);
        },
      );
    }
  }

  setEditorContent(event) {
    //console.log(event)
  }

  clickRefresh(event) {
    this.codeJson = {
      theme: "idea",
      mode: "application/ld+json",
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
    };

    this.codeSQL = {
      theme: "idea",
      mode: "text/x-sql",
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
    };

    if (this.codemirrors) {
      this.codemirrors.forEach((cm) => {
        if (cm.codeMirror) {
          cm.codeMirror.refresh();
        }
      });
    }
  }

  clickRelacional(valor: any) {
    if (valor == true) {
      this.DisabledNoSql = true;
      this.coleccionCtrl.disable({ emitEvent: false });
    } else {
      this.DisabledNoSql = false;
      this.coleccionCtrl.enable({ emitEvent: false });
    }
  }

  /**
   * Tabla
   * @param item
   */
  selectEventModulo(item) {
    this.dataCampo = [];
    let i = 0;
    let campos = [];
    campos = JSON.parse(item.definicion);
    campos.map((e) => {
      this.dataCampo.push({ id: e.col, name: e.col, tipo: e.tp, pos: i });
      i++;
    });
  }

  /**
   * Eliminar un campo de los elementos de las columnas de las tablas
   * @param name
   */
  eliminarCampoModulo(name) {
    let aux = this.dataCampo.filter((e) => {
      return e.name != name;
    });
    this.dataCampo = aux;
  }

  onMetodo(ev) {
    this.lstDml = [];
    this.Dml.map((e) => {
      if (ev != "CONSULTAR") {
        this.DisabledTipoDato = false;
        this.xdmlCtrl.enable({ emitEvent: false });
      } else {
        this.DisabledTipoDato = true;
        this.xdmlCtrl.disable({ emitEvent: false });
      }
      if (e.tipo == ev) {
        this.lstDml.push(e);
      }
    });
  }

  onDml(ev) {
    this.xcondicion = true;
    this.condicionCtrl.disable({ emitEvent: false });
    if (ev == "$where") {
      this.xcondicion = false;
      this.condicionCtrl.enable({ emitEvent: false });
    }
  }

  async CargarListaAplicaciones() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES;
    this.xAPI.parametros = "";
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaAplicaciones = data.Cuerpo.map((e) => {
          e.name = e.nombre + " : " + e.VERSION;
          return e;
        });
      },
      (error) => {
        console.log(error);
      },
    );
  }

  //agregarEntrada a los elementos de la interfaz de una API
  async agregarEntrada() {
    if (this.xdmlCtrl.value == "") {
      this.utilservice.AlertMini(
        "top-end",
        "warning",
        "Debe registrar todos los campos requeridos seleccione el campo VALUES",
        3000,
      );
      return;
    }

    if (this.campoCtrl.value == "" || this.tipodatoCtrl.value == "") {
      this.utilservice.AlertMini(
        "top-end",
        "warning",
        "Debe registrar todos los campos requeridos; nombre, alias, tipo de dato",
        3000,
      );

      return;
    }
    var e = {
      campo: this.campoCtrl.value,
      defecto: this.defectoCtrl.value,
      alias:
        this.aliasCtrl.value == ""
          ? this.campoCtrl.value
          : this.aliasCtrl.value,
      tipo: this.tipodatoCtrl.value,
    };
    console.log(this.xdmlCtrl.value);
    this.IEntradas[this.xdmlCtrl.value].push(e);

    var blAct = await this.selEntradas().then((e) => {
      return e;
    });
    this.Xmetodo = this.metodoCtrl.value;
    if (this.Xmetodo.name == "ACTUALIZAR" && blAct != true) {
      this.utilservice.AlertMini(
        "top-end",
        "warning",
        "Es recomendable agragar un parametro para actualizar WHERE",
        3000,
      );
    }
    this.entradasCtrl.setValue(JSON.stringify(this.IEntrada, null, "\t"));

    this.selMetodo(this.metodoCtrl.value);
    this.clickRefresh(0);
    this.eliminarCampoModulo(this.campoCtrl.value);
    this.tipodatoCtrl.setValue("");
    this.campoCtrl.setValue("");
    this.aliasCtrl.setValue("");
    this.defectoCtrl.setValue("");
  }

  async selEntradas(): Promise<boolean> {
    var blAct = false; //Actualizar
    var cond = undefined;
    this.IEntrada = [];

    await this.DML.forEach((e) => {
      if (this.IEntradas[e].length > 0) {
        if (e == "WHERE") {
          cond = this.condicionCtrl.value;
          blAct = true;
        }
        this.IEntrada.push({
          dml: e,
          condicion: cond,
          entradas: this.IEntradas[e],
        });
      }
    });

    return blAct;
  }

  selMetodo(metodo) {
    switch (metodo) {
      case "INSERTAR":
        this.queryCtrl.setValue(
          `INSERT INTO ${this.tablaCtrl.value?.name} $exec`,
        );
        break;
      case "ACTUALIZAR":
        this.queryCtrl.setValue(`UPDATE ${this.tablaCtrl.value?.name} $exec`);
        break;
      case "DELETE":
        this.queryCtrl.setValue(
          `DELETE FROM ${this.tablaCtrl.value?.name} $exec`,
        );
        break;
      default:
        this.queryCtrl.setValue(`SELECT * FROM `);
        break;
    }
  }
}
