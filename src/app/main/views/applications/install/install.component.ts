import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { InstallService, SSB_IAplicacion } from '@services/applications/install.service';
import JSONFormatter from 'json-formatter-js';
import Stepper from 'bs-stepper';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ComunicacionesService } from '@services/comunicaciones/comunicaciones.service';
//import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss'],
  encapsulation: ViewEncapsulation.None
})



export class InstallComponent implements OnInit {


  hosts     = []

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

  nombreapp     : string  = ''
  xnombreapi    : string  = ''
  xnombrecon    : string  = ''
  funcion       : string  = ''
  xparametroapi : string  = ''

  dataApp     = []
  rowData     = []
  keyword     = 'name'

  public iApp : SSB_IAplicacion = {
    identificador : 0,
    basedatos: '0',
    lenguaje: '0',
    nombre: '',
    observacion: '',
    clave: '',
    puntoMontaje: '',
    origen: '0',
    repositorio: '',
    sistema: '0',
    tipo: 0,
    usuario: '',
    creador: '',
    version: '0.0.1'
  }

  public xAPI : IAPICore = {
    id            : '',
    funcion       : '',
    relacional    : false,
    concurrencia  : false,
    retorna       : false,
    migrar        : false,
    parametros    : '',
    modulo        : '',
    valores       : null,
    logs          : false,
    cache         : 0,
    estatus       : false
  };

  public tipos = [
    { id: "0", descripcion: 'SELECCIONE' },
    { id: "1", descripcion: 'PRE-INSTALADA' },
    { id: "2", descripcion: 'INSTALAR' },
    { id: "3", descripcion: 'REPOSITORIO' },
  ]

  public sistemasOperativos = [
    { id: "0", descripcion: 'SELECCIONE' },
    { id: "WINNDOWS", descripcion: 'WINDOWS' },
    { id: "LINUX", descripcion: 'LINUX' },
    { id: "MACOS", descripcion: 'MACOS' },
  ]

  public basesDatos = [
    { id: "0", descripcion: 'SELECCIONE' },
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
    { id: "0", descripcion: 'SELECCIONE' },
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


public nameApp


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

  /**
   * Vertical Wizard Stepper Next
   */
  verticalWizardNext() {
    this.verticalWizardStepper.next();
  }
  /**
   * Vertical Wizard Stepper Previous
   */
  verticalWizardPrevious() {
    this.verticalWizardStepper.previous();
  }
  /**
   * Modern Horizontal Wizard Stepper Next
   */
  modernHorizontalNext() {
    this.modernWizardStepper.next();
  }
  /**
   * Modern Horizontal Wizard Stepper Previous
   */
  modernHorizontalPrevious() {
    this.modernWizardStepper.previous();
  }
  /**
   * Modern Vertical Wizard Stepper Next
   */
  modernVerticalNext() {
    this.modernVerticalWizardStepper.next();
  }
  /**
   * Modern Vertical Wizard Stepper Previous
   */
  modernVerticalPrevious() {
    this.modernVerticalWizardStepper.previous();
  }

  async ListarIP(){
    
    await this.comunicacionesServices.Listar().subscribe(
      (data) => {

        this.hosts = data
      },
      (error) => {
        console.log(error)
      }
    )
  }

  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private config: NgSelectConfig,
    //private configmodul: NgSelectModule,
    private comunicacionesServices : ComunicacionesService,
  ) { }

  ngOnInit(): void {
    this.ListarIP();
    this.lstAplicaciones();
    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});

    /*  this.verticalWizardStepper = new Stepper(document.querySelector('#stepper2'), {
      linear: false,
      animation: true
    });

    this.modernWizardStepper = new Stepper(document.querySelector('#stepper3'), {
      linear: false,
      animation: true
    });

    this.modernVerticalWizardStepper = new Stepper(document.querySelector('#stepper4'), {
      linear: false,
      animation: true
    });

    this.bsStepper = document.querySelectorAll('.bs-stepper'); */
     
   /*  this.products = this.developer; */

 /*    this.contentHeader = {
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
            name: 'Instalar',
            isLink: false
          }
        ]
      }
    } */
  

  }

  async guardarAplicacion(){
    console.log("Llego a guardar")
    this.xAPI.funcion = "SSB_IAplicacion" 
    this.xAPI.valores = JSON.stringify(this.iApp) 
    console.log(this.xAPI.valores)
    if(this.iApp.identificador != 0) this.xAPI.funcion = "SSB_UAplicacion"
     
    

    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        var msj = "Actualizado"
        if(this.xAPI.funcion == "SSB_IAplicacion") {
          this.iApp.identificador = data.msj;
          var msj = "Agregado"
        }

        /* this.toastrService.success(
          'Se ha ' + msj + ' el registro con exito ',
          `CodeEpic Middleware`
        ); */
      },
      (error) => {
        console.log(error)
      }
    )
   

  }

  selectEventModulo(){
    console.log("select llegoooooooooo")
    console.log(this.iApp.identificador)
    console.log(this.iApp.nombre)
    /* this.iApp.identificador = this.iApp.identificador; */
    //this.nombreapp = this.iApp.nombre;
    this.consultarAplicacion()    
  }

  async consultarAplicacion(){
    console.log("llego consultarAplicacion")
    this.xAPI.funcion = "SEC_CAplicacion" //Consultar Aplicacion del sistema 
    this.xAPI.parametros =  this.iApp.identificador.toString()
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        console.log(this.xAPI.parametros)
        var xapp : SSB_IAplicacion
        xapp = data.Cuerpo[0]
        console.log(xapp)
        this.iApp = xapp;

      },
      (error) => {
        console.log(error)
      }
    )
  }

  async lstAplicaciones(){
    this.xAPI.funcion = "LstAplicaciones";
    this.xAPI.valores = null;
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => { 
        this.dataApp = data.Cuerpo.map(e => {  
          e.name = `${e.nombre} | ${e.version}`   
          this.nameApp = e.name 
          return e
        });      
      },
      (error) => {
        console.log(error)
      }
    )
  }
  
  }