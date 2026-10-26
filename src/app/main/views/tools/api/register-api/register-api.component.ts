import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from "@angular/core";
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
import Swal from "sweetalert2";

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

  // --- Validación de existencia de función ---
  public isVerificandoFuncion: boolean = false;
  public isFuncionDisponible: boolean = false;
  public mensajeErrorFuncion: string = "";
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
  columnaConsultaCtrl = new FormControl("");
  parametrosCtrl = new FormControl("");

  constructor(
    private rutaActiva: ActivatedRoute,
    private apiService: ApiService,
    private utilservice: UtilService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  private horizontalWizardStepper: Stepper;

  horizontalWizardStepperNext(data) {
    if (data.form.valid === true) {
      if (this.getURL !== "update-api" && !this.isFuncionDisponible) {
        this.utilservice.AlertMini(
          "top-end",
          "warning",
          "Debe validar que la función esté disponible antes de continuar",
          4000,
        );
        return;
      }
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
    if (this.getURL === "update-api") {
      this.funcionCtrl.disable();
    }
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
    this.aplicacionCtrl.valueChanges.subscribe((v: any) => {
      if (v) {
        this.xAPIDB.aplicacion = typeof v === "object" && v !== null ? (v.nombre || v.name || v.identificador || "") : v;
      }
    });
    this.funcionCtrl.valueChanges.subscribe(() => {
      this.isFuncionDisponible = false;
      this.mensajeErrorFuncion = "";
    });
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
        if (!this.drivers.some((e) => e.id === "MGDBA")) {
          this.drivers.push({
            id: "MGDBA",
            name: "Sandra Server MongoDB (MGDBA)",
            driver: "mongodb",
          });
        }
        if (this.driverCtrl.value) {
          this.selDataBase(this.driverCtrl.value);
        }
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
    const appCtrlVal: any = this.aplicacionCtrl.value;
    const appVal = typeof appCtrlVal === "object" && appCtrlVal !== null
      ? (appCtrlVal.nombre || appCtrlVal.name || appCtrlVal.identificador || "")
      : (appCtrlVal || "");
    this.xAPIDB.aplicacion = appVal;
    this.xAPIDB.funcion = this.funcionCtrl.value || this.rutaURL || this.xAPIDB.funcion;
    this.xAPIDB.version = this.versionCtrl.value;

    // Conexión / driver: garantizamos que sea siempre el ID como string, no un objeto
    const dVal = this.driverCtrl.value;
    this.xAPIDB.driver = typeof dVal === 'object' && dVal !== null ? (dVal.id || '') : (dVal || '');

    this.xAPIDB.categoria = this.categoriaCtrl.value;
    this.xAPIDB.funcionalidad = this.funcionalidadCtrl.value;
    this.xAPIDB.descripcion = this.descripcionCtrl.value;
    this.xAPIDB.puente = this.puenteCtrl.value;
    this.xAPIDB.metodo = this.metodoCtrl.value;
    this.xAPIDB.relacional = this.relacionalCtrl.value;
    this.xAPIDB.coleccion = this.coleccionCtrl.value;
    this.xAPIDB.entradas = this.entradasCtrl.value;
    this.xAPIDB.query = this.queryCtrl.value;
    this.xAPIDB.parametros = this.parametrosCtrl.value;
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

    // Normalizar aplicacion inicial asegurando compatibilidad con string u objeto y fallback a la URL
    const appVal = typeof data.aplicacion === "object" && data.aplicacion !== null
      ? ((data.aplicacion as any).nombre || (data.aplicacion as any).name || (data.aplicacion as any).identificador || (data.aplicacion as any).id || "")
      : (data.aplicacion || this.url || "");
    this.aplicacionCtrl.setValue(appVal, { emitEvent: false });
    this.xAPIDB.aplicacion = appVal;

    this.funcionCtrl.setValue(data.funcion, { emitEvent: false });
    if (this.getURL === "update-api") {
      this.funcionCtrl.disable({ emitEvent: false });
      this.isFuncionDisponible = true;
    }
    this.versionCtrl.setValue(data.version, { emitEvent: false });

    // Normalizar driver en caso de que venga como objeto desde BD o string
    const driverId = typeof data.driver === 'object' && data.driver !== null
      ? (data.driver as any).id
      : (data.driver || '');
    this.driverCtrl.setValue(driverId, { emitEvent: false });
    if (driverId) {
      this.selDataBase(driverId);
    }

    this.categoriaCtrl.setValue(data.categoria, { emitEvent: false });
    this.funcionalidadCtrl.setValue(data.funcionalidad, { emitEvent: false });
    this.descripcionCtrl.setValue(data.descripcion, { emitEvent: false });
    this.puenteCtrl.setValue(data.puente, { emitEvent: false });
    this.metodoCtrl.setValue(data.metodo, { emitEvent: false });
    this.relacionalCtrl.setValue(data.relacional, { emitEvent: false });
    this.coleccionCtrl.setValue(data.coleccion, { emitEvent: false });
    this.entradasCtrl.setValue(data.entradas, { emitEvent: false });
    this.queryCtrl.setValue(data.query, { emitEvent: false });
    this.parametrosCtrl.setValue(data.parametros || '', { emitEvent: false });
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
    if (this.getURL !== "update-api" && !this.isFuncionDisponible) {
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "No se puede registrar: la función no ha sido validada o ya existe en el sistema",
        4500,
      );
      return;
    }
    this.syncToModel();
    // Asegurar que driver siempre sea string
    if (typeof this.xAPIDB.driver === 'object' && this.xAPIDB.driver !== null) {
      this.xAPIDB.driver = (this.xAPIDB.driver as any).id || '';
    }
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

          // Normalizar aplicacion inicial si viene vacía usando la url de la ruta
          const appIni = typeof this.xAPIDB.aplicacion === "object" && this.xAPIDB.aplicacion !== null
            ? ((this.xAPIDB.aplicacion as any).nombre || (this.xAPIDB.aplicacion as any).name || (this.xAPIDB.aplicacion as any).identificador || "")
            : (this.xAPIDB.aplicacion || this.url || "");
          this.xAPIDB.aplicacion = appIni;

          // Clon profundo para mantener el estado original de la BD para comparaciones
          this.xAPIAux = JSON.parse(JSON.stringify(this.xAPIDB));
        }
        this.syncFromModel(this.xAPIDB);
        this.onTipo(this.xAPIDB.tipo);
        this.xAPIDB.version = this.xAPIDB.version || "0.0.1";
        this.versionCtrl.setValue(this.xAPIDB.version, { emitEvent: false });
        this.syncToModel();
        this.resolverAplicacion();
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  async UpdateAPI(funcion: string, entorno: string) {
    this.syncToModel();

    // Evaluar y calcular la nueva versión antes de enviar la petición
    const nuevaVersion = this.validarVersion();
    this.xAPIDB.version = nuevaVersion;
    this.versionCtrl.setValue(nuevaVersion, { emitEvent: false });

    // Asegurar que driver siempre sea string
    if (typeof this.xAPIDB.driver === 'object' && this.xAPIDB.driver !== null) {
      this.xAPIDB.driver = (this.xAPIDB.driver as any).id || '';
    }
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
          `Tu (API) ha sido actualizada a la versión ${this.xAPIDB.version}`,
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

  onBlurFuncion() {
    if (this.funcionCtrl.value && !this.isFuncionDisponible && !this.isVerificandoFuncion && this.getURL !== "update-api") {
      this.validarExistenciaFuncion();
    }
  }

  onKeydownFuncion(event: KeyboardEvent) {
    if (event.key === "Tab") {
      if (!event.shiftKey) {
        event.preventDefault();
        this.validarExistenciaFuncion(true);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      this.validarExistenciaFuncion(false);
    }
  }

  validarExistenciaFuncion(desdeTab: boolean = false) {
    const nombre = (this.funcionCtrl.value || "").trim();
    if (!nombre) {
      this.isFuncionDisponible = false;
      this.utilservice.AlertMini(
        "top-end",
        "warning",
        "Por favor ingrese el nombre de la función a validar",
        3000,
      );
      setTimeout(() => {
        const funcionEl = document.getElementById("funcion") as HTMLElement;
        if (funcionEl) funcionEl.focus();
      }, 50);
      return;
    }

    // Si estamos en update-api y no se modificó el nombre original
    if (
      this.getURL === "update-api" &&
      this.rutaURL &&
      nombre.toLowerCase() === this.rutaURL.trim().toLowerCase()
    ) {
      this.isFuncionDisponible = true;
      if (desdeTab) {
        setTimeout(() => {
          const driverInput =
            (document.querySelector("#driver input") as HTMLElement) ||
            (document.querySelector("#driver .ng-input input") as HTMLElement) ||
            (document.querySelector("#driver") as HTMLElement);
          if (driverInput) {
            driverInput.focus();
          }
        }, 50);
      }
      return;
    }

    this.isVerificandoFuncion = true;
    this.isFuncionDisponible = false;

    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.CONSULTAR_EXISTENCIA_APICORE;
    this.xAPI.parametros = nombre;
    this.xAPI.valores = "";

    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data: any) => {
        this.isVerificandoFuncion = false;
        let lista: any[] = [];
        if (Array.isArray(data)) {
          lista = data;
        } else if (data?.Cuerpo) {
          if (Array.isArray(data.Cuerpo)) {
            lista = data.Cuerpo;
          } else if (typeof data.Cuerpo === "string") {
            try {
              const parsed = JSON.parse(data.Cuerpo);
              lista = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              lista = [];
            }
          } else if (typeof data.Cuerpo === "object") {
            lista = [data.Cuerpo];
          }
        } else if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data);
            lista = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            lista = [];
          }
        } else if (typeof data === "object" && data !== null) {
          if (data.funcion || data.Funcion || data.aplicacion || data.Aplicacion) {
            lista = [data];
          }
        }

        // Si la consulta retornó registros, significa que la función YA EXISTE en BD
        const yaExiste = Array.isArray(lista) && lista.length > 0;

        if (yaExiste) {
          const item = lista[0] || {};
          const app = item.aplicacion || item.Aplicacion || item.app || "consola";
          const driver = item.driver || item.Driver || "MGDBA";
          const fnName = item.funcion || item.Funcion || nombre;
          const autor = item.autor || item.Autor || item.usuario || item.Usuario || item.user || item.creador || "";
          const desc = item.descripcion || item.Descripcion || "";

          let fechaFormateada = "";
          if (item.fecha || item.Fecha) {
            try {
              const d = new Date(item.fecha || item.Fecha);
              if (!isNaN(d.getTime())) {
                fechaFormateada = d.toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } else {
                fechaFormateada = (item.fecha || item.Fecha).toString();
              }
            } catch (e) {
              fechaFormateada = (item.fecha || item.Fecha).toString();
            }
          }

          // Si estamos en update-api y corresponde a la misma API que estamos editando
          if (
            this.getURL === "update-api" &&
            (fnName || "").toString().trim().toLowerCase() ===
              (this.rutaURL || "").trim().toLowerCase()
          ) {
            this.isFuncionDisponible = true;
            this.mensajeErrorFuncion = "";
            if (desdeTab) {
              setTimeout(() => {
                const driverInput =
                  (document.querySelector("#driver input") as HTMLElement) ||
                  (document.querySelector("#driver .ng-input input") as HTMLElement) ||
                  (document.querySelector("#driver") as HTMLElement);
                if (driverInput) {
                  driverInput.focus();
                }
              }, 50);
            }
            return;
          }

          // SI YA EXISTE: NO LA DEJA REGISTRAR Y LIMPIA LA CAJA
          this.isFuncionDisponible = false;
          this.mensajeErrorFuncion = `La función "${fnName}" ya existe en "${app}" (${driver})`;

          // Toast elegante estructurado con Swal
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            showConfirmButton: false,
            timer: 7000,
            timerProgressBar: true,
            background: "#ffffff",
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
            html: `
              <div style="text-align: left; font-family: inherit; font-size: 0.84rem; line-height: 1.45; color: #374151;">
                <div style="font-size: 0.92rem; font-weight: 700; color: #b45309; margin-bottom: 5px;">
                  ⚠️ Función Ya Registrada
                </div>
                <div style="margin-bottom: 4px;">
                  <strong style="color: #4b5563;">Función:</strong>
                  <code style="background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 0.83rem;">${fnName}</code>
                </div>
                <div style="margin-bottom: 3px; font-size: 0.80rem; color: #4b5563;">
                  <strong>Aplicación:</strong> <span style="color: #7c3aed; font-weight: 600;">${app}</span> &nbsp;|&nbsp; 
                  <strong>Driver:</strong> <span style="color: #0284c7; font-weight: 600;">${driver}</span>
                </div>
                ${autor ? `<div style="margin-bottom: 3px; font-size: 0.79rem; color: #6b7280;"><strong>Autor:</strong> ${autor}</div>` : ""}
                ${fechaFormateada ? `<div style="margin-bottom: 3px; font-size: 0.79rem; color: #6b7280;"><strong>Fecha:</strong> ${fechaFormateada}</div>` : ""}
                ${desc ? `<div style="margin-top: 5px; font-size: 0.78rem; color: #4b5563; background: #fefce8; border-left: 3px solid #eab308; padding: 4px 8px; border-radius: 3px; font-style: italic;">"${desc}"</div>` : ""}
              </div>
            `,
          });

          this.funcionCtrl.setValue("");
          this.funcionCtrl.setErrors({ yaExiste: true });

          // Como no se puede registrar y se limpió el campo, devolvemos el foco al campo función
          setTimeout(() => {
            const funcionEl = document.getElementById("funcion") as HTMLInputElement;
            if (funcionEl) {
              funcionEl.focus();
            }
          }, 60);
        } else {
          // NO EXISTE EN BD -> DISPONIBLE: quitar cargando y colocar en verde la caja sin mensaje toast
          this.isFuncionDisponible = true;
          this.mensajeErrorFuncion = "";
          this.funcionCtrl.setErrors(null);

          // Si venía navegando con Tab, ahora que está disponible saltamos directamente a Conexión
          if (desdeTab) {
            setTimeout(() => {
              const driverInput =
                (document.querySelector("#driver input") as HTMLElement) ||
                (document.querySelector("#driver .ng-input input") as HTMLElement) ||
                (document.querySelector("#driver") as HTMLElement);
              if (driverInput) {
                driverInput.focus();
              }
            }, 60);
          }
        }
      },
      error: (error: any) => {
        this.isVerificandoFuncion = false;
        console.error("Error al validar existencia de función:", error);
        this.utilservice.AlertMini(
          "top-end",
          "error",
          "Error al verificar la función en el servidor",
          3000,
        );
      },
    });
  }

  validarVersion(): string {
    const _api = this.xAPIDB || ({} as any);
    const _aux = this.xAPIAux || ({} as any);

    // Helpers de normalización para comparaciones seguras de tipo
    const num = (v: any): number => {
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    };
    const bool = (v: any): boolean => {
      return v === true || v === "true" || v === 1 || v === "1";
    };
    const str = (v: any): string => {
      if (v == null) return "";
      if (typeof v === "object") {
        return (v.nombre || v.name || v.id || v.identificador || JSON.stringify(v)).trim();
      }
      return String(v).trim();
    };

    // 1. Mayor, Primera cifra (X):
    // Puertos HTTP o HTTPS, Drivers, Consultas y Método, Relacional, Esquema (entradas),
    // Colección en caso de ser NOSQL, distribución, Aplicación, Entorno, Tipo, Puente
    const cambioMayor =
      num(_api.puertohttp) !== num(_aux.puertohttp) ||
      num(_api.puertohttps) !== num(_aux.puertohttps) ||
      str(_api.driver) !== str(_aux.driver) ||
      str(_api.query) !== str(_aux.query) ||
      str(_api.metodo) !== str(_aux.metodo) ||
      bool(_api.relacional) !== bool(_aux.relacional) ||
      str(_api.entradas) !== str(_aux.entradas) ||
      str(_api.coleccion) !== str(_aux.coleccion) ||
      num(_api.distribucion) !== num(_aux.distribucion) ||
      str(_api.aplicacion).toLowerCase() !== str(_aux.aplicacion).toLowerCase() ||
      str(_api.entorno).toLowerCase() !== str(_aux.entorno).toLowerCase() ||
      str(_api.tipo) !== str(_aux.tipo) ||
      str(_api.puente) !== str(_aux.puente);

    // 2. Menor, Segunda cifra (Y):
    // Consumidores, Cache, Logs, Concurrente, Retorno, Tiempo de Duración, Tipo Duración,
    // Prioridad, Aplicar Waf (acción), Bitácora, Respaldo, Estatus, Inclusión JWT, HSF
    const cambioMenor =
      num(_api.consumidores) !== num(_aux.consumidores) ||
      num(_api.cache) !== num(_aux.cache) ||
      bool(_api.logs) !== bool(_aux.logs) ||
      bool(_api.concurrencia) !== bool(_aux.concurrencia) ||
      bool(_api.retorna) !== bool(_aux.retorna) ||
      num(_api.tiempoduracion) !== num(_aux.tiempoduracion) ||
      num(_api.tipoduracion) !== num(_aux.tipoduracion) ||
      str(_api.prioridad) !== str(_aux.prioridad) ||
      bool(_api.accion) !== bool(_aux.accion) ||
      num(_api.bitacora) !== num(_aux.bitacora) ||
      num(_api.respaldo) !== num(_aux.respaldo) ||
      bool(_api.estatus) !== bool(_aux.estatus) ||
      bool(_api.inclusionjwt) !== bool(_aux.inclusionjwt) ||
      bool(_api.hsf) !== bool(_aux.hsf);

    // 3. Revisión, Tercera cifra (Z):
    // Descripción, Categoría, Funcionalidad, Parámetros
    const cambioRevision =
      str(_api.descripcion) !== str(_aux.descripcion) ||
      str(_api.categoria) !== str(_aux.categoria) ||
      str(_api.funcionalidad) !== str(_aux.funcionalidad) ||
      str(_api.parametros) !== str(_aux.parametros);

    // Extraer base de versión original guardada en BD
    const baseVersion = (_aux.version || _api.version || "0.0.1").toString();
    const versionParts = baseVersion.split(".");
    let mayor = parseInt(versionParts[0], 10);
    let menor = parseInt(versionParts[1], 10);
    let revision = parseInt(versionParts[2], 10);

    if (isNaN(mayor)) mayor = 0;
    if (isNaN(menor)) menor = 0;
    if (isNaN(revision)) revision = 1;

    // Regla de versiones X.Y.Z:
    if (cambioMayor) {
      // Cambio en Mayor (X): se incrementa X, Y y Z se reinician a 0
      mayor = mayor + 1;
      menor = 0;
      revision = 0;
    } else if (cambioMenor) {
      // Sin cambio en Mayor, cambio en Menor (Y): se incrementa Y, Z se reinicia a 0
      menor = menor + 1;
      revision = 0;
    } else if (cambioRevision) {
      // Sin cambio en Mayor ni Menor, cambio en Revisión (Z): se incrementa Z
      revision = revision + 1;
    }

    return `${mayor}.${menor}.${revision}`;
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
    let driverObj: any;
    if (typeof valor === 'object' && valor !== null) {
      driverObj = valor;
      this.driversID = valor.id;
    } else {
      this.driversID = valor;
      driverObj = this.drivers?.find((d) => d.id === valor);
    }

    if (!driverObj) {
      return;
    }

    this.xAPI.parametros = driverObj.basedatos;
    this.dataModulo = [];
    this.xAPI.funcion = "";

    switch (driverObj.driver) {
      case "mysql8":
      case "mariadb":
        this.xAPI.funcion = "_SYS_MYSQL";
        break;
      case "postgres13":
      case "postgres96":
        this.xAPI.funcion = "_SYS_POSTGRES";
        break;
      case "mongodb":
      case "puenteurl":
      case "sqlserver17":
      case "oracle19c":
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
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        if (data && data.Cuerpo) {
          this.ListaAplicaciones = data.Cuerpo.map((e: any) => {
            const nombreApp = e.nombre || e.name || e.identificador || e.id || "";
            const versionApp = e.VERSION || e.version || "";
            e.nombre = nombreApp;
            e.name = versionApp ? `${nombreApp} : ${versionApp}` : nombreApp;
            return e;
          });
          this.resolverAplicacion();
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  resolverAplicacion() {
    if (!this.ListaAplicaciones || this.ListaAplicaciones.length === 0) return;

    let targetApp = (this.aplicacionCtrl.value || this.xAPIDB?.aplicacion || this.url || "").toString().trim();
    if (typeof targetApp === "object" && targetApp !== null) {
      targetApp = ((targetApp as any).nombre || (targetApp as any).name || (targetApp as any).identificador || "").toString().trim();
    }
    if (!targetApp) return;

    // Buscar coincidencia exacta o case-insensitive por nombre, identificador o id
    const match = this.ListaAplicaciones.find((item: any) => {
      const nom = (item.nombre || "").toLowerCase();
      const ident = (item.identificador || "").toLowerCase();
      const id = (item.id || "").toLowerCase();
      const target = targetApp.toLowerCase();
      return nom === target || ident === target || id === target;
    });

    if (match) {
      this.aplicacionCtrl.setValue(match.nombre, { emitEvent: false });
      this.xAPIDB.aplicacion = match.nombre;
    } else {
      // Si la aplicación no está en la lista pero existe en BD o URL, agregarla para que ng-select la muestre siempre
      this.ListaAplicaciones = [
        ...this.ListaAplicaciones,
        {
          nombre: targetApp,
          name: targetApp,
          identificador: targetApp,
        },
      ];
      this.aplicacionCtrl.setValue(targetApp, { emitEvent: false });
      this.xAPIDB.aplicacion = targetApp;
    }
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
