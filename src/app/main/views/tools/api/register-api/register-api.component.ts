import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { ComunicationsService } from '@services/networks/comunications.service';
import Stepper from 'bs-stepper';

@Component({
  selector: 'app-register-api',
  templateUrl: './register-api.component.html',
  styleUrls: ['./register-api.component.scss']
})
export class RegisterApiComponent implements OnInit {

    // public
    public contentHeader: object;
    public TDNameVar;
    public TDEmailVar;
    public TDFirstNameVar;
    public TDLastNameVar;
    public twitterVar;
    public facebookVar;
    public googleVar;
    public linkedinVar;
    public landmarkVar;
    public addressVar;

  
  public ListaAplicaciones
  
  public driversAPP

  public drivers: any

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia: undefined,
    protocolo: '',
    ruta: '',
    version: '0.0.1',
    retorna: undefined,
    migrar: false,
    modulo: '',
    valores: {},
    coleccion: '',
    http: undefined,
    https: undefined,
    consumidores: 0,
    puertohttp: 0,
    puertohttps: 0,
    driver: '0',
    query: '',
    metodo: undefined,
    tipo: undefined,
    totalizar: 'S',
    prioridad: undefined,
    entorno: 'desarrollo',
    logs: undefined,
    accion: undefined,
    cache: undefined,
    estatus: false,
    categoria: undefined,
    funcionalidad: undefined,
    entradas: '',
    salidas: '',
    autor: '',
    fecha: '',
    prefijo: undefined,
    distribucion: undefined
  };

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

  public xAPIDB: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public duracion = [
    {id: 0, name:'Segundos'},
    {id: 1, name:'Minutos'},
    {id: 2, name:'Horas'}
  ]
  

  public http = [
    {id: 8012, name:'8012'},
    {id: 8013, name:'8013'}
  ]
  public https = [
    {id: 2286, name:'2286'},
    {id: 2385, name:'2385'}
  ]

  public estatus = [
    {id: true, name:'ACTIVA'},
    {id: false, name:'INACTIVA'}
  ]

  public tipo = [
    {id: 'CODIGO', name:'GENERAR CODIGO'},
    {id: 'LOGICA', name:'LOGICA DE NEGOCIO'},
    {id: 'CONSULTA', name:'CONSULTA SLQ / NOSQL'},
    {id: 'INTERFAZ', name:'INTERFAZ'},
    {id: 'ARCHIVO', name:'ARCHIVO'}
  ]

  public categoria = [
    {id: 'CORE', name:'CORE'},
    {id: 'APLICACIONES', name:'APLICACIONES'},
  ]

  public distribucion = [
    {id: 'COMPARTIDA', name:'COMPARTIDA'},
    {id: 'PRIVADA', name:'PRIVADA'},
  ]


  public funcionalidad = [
    {id: 'LOGICA', name:'LOGICA'},
    {id: 'FINANCIERA', name:'FINANCIERA'},
    {id: 'ARITMETICA', name:'ARITMETICA'},
    {id: 'INGENIERIA', name:'INGENIERIA'},
    {id: 'ESTADISTICA', name:'ESTADISTICA'},
    {id: 'SISTEMA', name:'SISTEMA'},
  ]

  public cache = [
    {id: 0, name:'NINGUNO'},
    {id: 1, name:'INCLUSIVO'},
    {id: 2, name:'EXCLUSIVO'},
  ]

  public logs = [
    {id: true, name:'SI'},
    {id: false, name:'NO'},
  ]

  public concurrente = [
    {id: true, name:'SI'},
    {id: false, name:'NO'},
  ]

  public retorno = [
    {id: true, name:'SI'},
    {id: false, name:'NO'},
  ]

  public retorn = [
    {id:1, name: 'BOOL', descripcion: 'LOGICO'},
    {id:2, name: 'STRING', descripcion: 'CADENA'},
    {id:3, name: 'ARRAY', descripcion: 'ARREGLO'},
    {id:4, name: 'OBJECT', descripcion: 'OBJETO'},
    {id:5, name: 'FILE', descripcion: 'ARCHIVO'},
    {id:6, name: 'NULL', descripcion: 'NULL'},
  ]

  public prioridad = [
    {id: 0, name:'BAJA'},
    {id: 1, name:'MEDIA'},
    {id: 2, name:'ALTA'},
  ]

  public entorno = [
    {id: 'desarrollo', name:'DESARROLLO'},
    {id: 'calidad', name:'CALIDAD'},
    {id: 'produccion', name:'PRODUCCION'},
  ]

  public funciones = [
    {id: 'SUM', name:'SUMA'},
    {id: 'PROM', name:'PROMEDIO'},
  ]
  


  public waf = [
    {id: true, name:'SI'},
    {id: false, name:'NO'},
  ]

  public metodo = [
    {id: 'INSERTAR', name:'INSERTAR'},
    {id: 'CONSULTAR', name:'CONSULTAR'},
    {id: 'ACTUALIZAR', name:'ACTUALIZAR'},
    {id: 'ELIMINAR', name:'ELIMINAR'},
  ]


  public relacional = [
    {id: true, name:'SI'},
    {id: false, name:'NO'},
  ]

  public tabla: any = ''

  public dataModulo = []

  constructor(
    private rutaActiva: ActivatedRoute,
    private comunicacionesService: ComunicationsService,
    private apiService: ApiService,
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


  ngOnInit(): void {

    this.CargarDrivers()

    this.CargarListaAplicaciones()

    this.driversAPP = this.rutaActiva.snapshot.params.id

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
            name: 'Lista APIS',
            isLink: true,
            link: `/tools/api-list/${this.driversAPP}`
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
              e.name = e.descripcion +' - '+'('+ e.basedatos+')'
              // this.drivers.push(e)
              return e
            });
          },
          (error) => { console.log(error) }
        )
  }

  RegistrarAPI(){
    console.log(this.xAPI)
  }

  consultarBDDriver() {
    let bd = ''
    this.drivers.map(e => {
      if (this.xAPI.driver == e.id) {
        bd = e.basedatos
        return
      }
    });
    return bd
  }

  selDataBase(): void {
    this.xAPIDB.funcion = "_SYS_MYSQL";
    this.xAPIDB.parametros = this.consultarBDDriver();
    this.dataModulo = [];
    this.apiService.Ejecutar(this.xAPIDB).subscribe(
      (data) => {
        console.log(data)
        let i = 0
        data.Cuerpo.forEach(e => {
          i++
          this.dataModulo.push({ id: e.tabla, name: e.tabla, definicion: e.definicion })
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

}
