import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
<<<<<<< HEAD
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { InstallService, SSB_IAplicacion } from '@services/applications/install.service';
import JSONFormatter from 'json-formatter-js';
import Stepper from 'bs-stepper';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ComunicacionesService } from '@services/comunicaciones/comunicaciones.service';
import { UtilService } from '@services/util/util.service';

=======
import { NgbModal, NgbModalConfig,NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import JSONFormatter from 'json-formatter-js';
import Stepper from 'bs-stepper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
>>>>>>> 25736f7 (Modulo de Aplicaciones - Instalar)

@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss'],
<<<<<<< HEAD
  encapsulation: ViewEncapsulation.None
=======
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' },providers: [NgbModalConfig, NgbModal]
>>>>>>> 25736f7 (Modulo de Aplicaciones - Instalar)
})



export class InstallComponent implements OnInit {

<<<<<<< HEAD

  hosts = []

  public selectBasic = [
    { name: 'UK' },
    { name: 'USA' },
    { name: 'Spain' },
    { name: 'France' },
    { name: 'Italy' },
    { name: 'Australia' }
  ];

  public selectMulti = [{ name: 'English' }, { name: 'French' }, { name: 'Spanish' }];
  public selectMultiSelected;

  public contentHeader: object;
  public ApliVar;
  public TipoVar;
  public SerVar;
  public SysVar;
  public RepoVar;
  public UsuVar;
  public PassVar;
  public MonVar;
  public BdatoVar;
  public VersionVar;
  public LenVar;
  public DescripcionVar;
  public AplicacionVar;
  public TDFirstNameVar;
  public TDLastNameVar;
  public twitterVar;
  public facebookVar;
  public googleVar;
  public linkedinVar;
  public landmarkVar;
  public addressVar;

  public mtipo;
  public mservidor;
  public msistema;
  public mrepo;
  public musuario;
  public mpassword;
  public mmontaje;
  public mbdatos;
  public mversion;
  public mlenguaje;

  nombreapp: string = ''
  xnombreapi: string = ''
  xnombrecon: string = ''
  funcion: string = ''
  xparametroapi: string = ''

  dataApp = []
  rowData = []
  keyword = 'name'

  public iApp: SSB_IAplicacion = {
    identificador: 0,
    basedatos: undefined,
    lenguaje: undefined,
    nombre: '',
    observacion: '',
    clave: '',
    puntoMontaje: '',
    origen: undefined,
    repositorio: '',
    sistema: undefined,
    tipo: undefined,
    usuario: '',
    creador: '',
    version: '0.0.1'
  }

  public xAPI: IAPICore = {
    id: '',
    funcion: '',
    relacional: false,
    concurrencia: false,
    retorna: false,
    migrar: false,
    parametros: '',
    modulo: '',
    valores: null,
    logs: false,
    cache: 0,
    estatus: false
  };

  public tipos = [
    { id: "1", descripcion: 'PRE-INSTALADA' },
    { id: "2", descripcion: 'INSTALAR' },
    { id: "3", descripcion: 'REPOSITORIO' },
  ]

  public sistemasOperativos = [
    { id: "WINNDOWS", descripcion: 'WINDOWS' },
    { id: "LINUX", descripcion: 'LINUX' },
    { id: "MACOS", descripcion: 'MACOS' },
  ]

  public basesDatos = [
    { id: "POSTGRES", descripcion: 'POSTGRES' },
    { id: "MYSQL", descripcion: 'MYSQL' },
    { id: "MARIADB", descripcion: 'MARIADB' },
    { id: "SQLSERVER", descripcion: 'SQLSERVER' },
    { id: "ORACLE", descripcion: 'ORACLE' },
    { id: "SYBASE", descripcion: 'SYBASE' },
    { id: "INFORMIX", descripcion: 'INFORMIX' },
    { id: "MONGODB", descripcion: 'MONGODB' },
    { id: "RETHINKDB", descripcion: 'RETHINKDB' },
    { id: "SQLSERVER", descripcion: 'SQLSERVER' },
    { id: "FIREBASE", descripcion: 'FIREBASE' },
  ]

  public lenguaje = [
    { id: "PHP", descripcion: 'PHP' },
    { id: "J2EE", descripcion: 'JAVA J2EE' },
    { id: "HCJS", descripcion: 'HTML / CSS3 / JAVASCRIPT' },
    { id: "TSC", descripcion: 'ANGULAR' },
    { id: "VBA", descripcion: 'VISUAL BASIC' },
    { id: "VBN", descripcion: 'VISUAL STUDIO .NET' },
    { id: "GO", descripcion: 'GOLANG' },
    { id: "PYC", descripcion: 'PYTHON' },
    { id: "C++", descripcion: 'C++' },
    { id: "C", descripcion: 'C' },
  ]

  public showAppA: boolean = true
  public showAppB: boolean = false


  public nameApp = undefined

  public showInput: boolean = false


  onSubmit() {
    alert('Submitted!!');
    return false;
  }
  // private
  private horizontalWizardStepper: Stepper;
  private verticalWizardStepper: Stepper;
  private modernWizardStepper: Stepper;
  private modernVerticalWizardStepper: Stepper;
  private bsStepper;

  /**
   * Horizontal Wizard Stepper Next
   *
   * @param data
   */
  horizontalWizardStepperNext(data) {
    if (data.form.valid === true) {
      this.guardarAplicacion();
      this.horizontalWizardStepper.next();
    }
  }
  /**
   * Horizontal Wizard Stepper Previous
   */
  horizontalWizardStepperPrevious() {
    this.horizontalWizardStepper.previous();
  }

  public ListaConexiones = []


  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private config: NgSelectConfig,
    private utilservice: UtilService,
    private comunicacionesService: ComunicacionesService,
    private comunicacionesServices: ComunicacionesService,
  ) { }

  async ngOnInit() {
    await this.ListarIP();
    await this.CargarListaConexiones();
    await this.lstAplicaciones();
    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});

=======
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public tipos = [
    {id:'1', name: 'PRE-INSTALADA'},
    {id:'2', name: 'INSTALAR'},
    {id:'3', name: 'REPOSITORIO'},
  ]

  public contentHeader: object;
  public developer = []
  public quality = []
  public production = []

  public shopSidebarToggle = false;
  public shopSidebarReset = false;
  public gridViewRef = false;
  public products;
  public wishlist;
  public cartList;
  public page = 1;
  public pageSize = 9;
  public searchText = '';
  private horizontalWizardStepper: Stepper;
  closeResult: string = ''

  codeTypeJs = ''
  data: any;
  xentorno: string = ''
  resultado: any;
  xresultado: any;
  xparametro: string = ''
  valores: string = ''



  xAPI: IAPICore;

  constructor(
    private apiService : ApiService,
    private modalService: NgbModal,
    private ws : WsocketsService,
    private config: NgSelectConfig,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,

  ) {
    this.config.notFoundText = 'Custom not found';
      this.config.appendTo = 'body';
      this.config.bindValue = 'value';
  }

      
    /**
   * Update to List View
   */
     listView() {
      this.gridViewRef = false;
    }
  
    /**
     * Update to Grid View
     */
    gridView() {
      this.gridViewRef = true;
    }

      /**
   * Sort Product
   */
  sortProduct(sortParam) {
    // this._ecommerceService.sortProduct(sortParam);
    console.info(sortParam);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  codeMOEsquemaJson: any = {
      theme: 'idea',
      mode: 'application/ld+json',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true,
      autofocus: true
  };

  codeJson: any = {
    theme: 'idea',
    mode: 'text/typescript',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true
  };

  clickRefresh(e) {
    this.codeJson = {
      theme: 'idea',
      mode: 'text/typescript',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      autoCloseBrackets: true,
      matchBrackets: true,
      lint: true
    }
  }

  /* activarFormulario(content, item) {
    console.log(item);
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      scrollable: true
    }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      var api = item.entorno == "produccion" ? "/v1/" : "/devel/"
    this.xentorno = api + "api/crud:" + item.id;
    this.data = item
    if (item.entradas != undefined) {
      this.codeTypeJs = this.apiService.GenerarCodigo(item.entradas, item.funcion, this.xentorno)
      this.clickRefresh(0)
    }
  }


  RegistrarAPI(content) {
    console.log(content);
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      scrollable: true
    }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }


  async ListarApis() {
    this.developer = []
    this.quality = []
    this.production = []
    await this.apiService.Listar().subscribe(
      (data) => {
        data.forEach(e => {
          switch (e.entorno) {
            case "desarrollo":
              this.developer.push(e)
              break;
              case "calidad":
                this.quality.push(e)
                break;
                case "produccion":
                  this.production.push(e)
                  break;
                  default:
                    break;
                  }
                });
                
      },
      (error) => {
        console.error(error)
      }
    );
  }

  async ejecutarApi() {

    this.xAPI = this.data;
    this.xAPI.parametros = this.xparametro
    this.xAPI.valores = this.valores
    console.log(this.xAPI);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        const formatter = new JSONFormatter(data);
        document.getElementById("xrs").appendChild(formatter.render());
      },
      (error) => {
        this.resultado = error;
      }
    )
  } */

  ngOnInit(): void {
    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});
    // this.ListarApis()
    this.products = this.developer;
>>>>>>> 25736f7 (Modulo de Aplicaciones - Instalar)

    this.contentHeader = {
      headerTitle: 'Aplicaciones',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
<<<<<<< HEAD
            name: 'Registrar',
=======
            name: 'Instalar',
>>>>>>> 25736f7 (Modulo de Aplicaciones - Instalar)
            isLink: false
          }
        ]
      }
    }
<<<<<<< HEAD

  }

  async ListarIP() {
    await this.comunicacionesServices.Listar().subscribe(
      async (data) => {
        await data.map(e => {
          this.hosts.push(e)
        });
        this.hosts.push({ id: 'SERVIDOR', host: 'github', descripcion: '@GITHUB' }, { id: 'SERVIDOR', host: 'gitlab', descripcion: '@GITLAB' })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async guardarAplicacion() {

    this.xAPI.funcion = "SSB_IAplicacion"
    this.iApp.llave = this.iApp.nombre + '.sse'
    this.xAPI.valores = JSON.stringify(this.iApp)
    if (this.iApp.identificador != null) this.xAPI.funcion = "SSB_UAplicacion"
    console.log(this.xAPI)
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          var msj = "Actualizado"
          if (this.xAPI.funcion == "SSB_IAplicacion") {
            this.iApp.identificador = data.msj;
            var msj = "Agregado"
          }
          this.utilservice.AlertMini('top-end', 'success', 'Se ha ' + msj + ' el registro con exito', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! Algo salio mal!', 3000)
        }
      },
      (error) => {
        this.utilservice.AlertMini('top-end', 'error', 'Oops! Algo salio mal!', 3000)
        console.log(error)
      }
    )
  }

  selectEventModulo() {
    // console.log(this.iApp.identificador)
    // console.log(this.iApp.nombre)
    /* this.iApp.identificador = this.iApp.identificador; */
    this.nombreapp = this.iApp.nombre;
    this.consultarAplicacion()
  }

  modalFile(modal: any) {
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  async CargarListaConexiones() {
    this.xAPI.funcion = "LESBDrivers";
    this.xAPI.parametros = ''
    this.ListaConexiones = []
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaConexiones = data.map(e => {
          e.name = `(${e.driver}) - ${e.descripcion}`
          return e
        });
      },
      (error) => {
        console.log(error)
      }
    )
  }

  selectEventModuloo(e) {
    if (e == null) {
      this.showAppA = false
      this.showAppB = true
    } else {
      this.showAppA = true
      this.showAppB = false
    }
    this.iApp.identificador = e
    this.consultarAplicacion()
  }

  async consultarAplicacion() {

    if (this.iApp.identificador == null) return false

    this.xAPI.funcion = "SEC_CAplicacion" //Consultar Aplicacion del sistema 
    this.xAPI.parametros = this.iApp.identificador.toString()
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        var xapp: SSB_IAplicacion
        xapp = data.Cuerpo[0]
        this.iApp = xapp;
      },
      (error) => {
        console.log(error)
      }
    )
  }

  CapturarSeleccion(event: any) {
    if (event == 2) {
      this.showInput = true
    } else {
      this.showInput = false
    }
  }

  async lstAplicaciones() {
    this.xAPI.funcion = "_SYS_LstAplicaciones";
    this.xAPI.valores = null;
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.dataApp = await data.Cuerpo.map(e => {
          e.name = `${e.nombre} | ${e.VERSION}`
          this.nameApp = e.name
          return e
        });
        this.dataApp.push({ aplicacion: 'Crear Nuevo', name: ' Crear Nuevo' })
      },
      (error) => {
        console.log(error)
      }
    )
  }

}
=======
  }
  }
>>>>>>> 25736f7 (Modulo de Aplicaciones - Instalar)
