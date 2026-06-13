import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';

import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SSB_IAplicacion } from '@services/applications/install.service';
import Stepper from 'bs-stepper';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { ComunicacionesService } from '@services/comunicaciones/comunicaciones.service';
import { UtilService } from '@services/util/util.service';
import { environment } from 'environments/environment';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FileService } from '@services/apicore/file.service';
import { MensajeService } from '@services/util/mensaje.service';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';

@Component({
    selector: 'app-install',
    templateUrl: './install.component.html',
    styleUrls: ['./install.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NgSelectModule,
    CoreCommonModule,
    CoreDirectivesModule,
    CorePipesModule,
    ContentHeaderComponent
]
})



export class InstallComponent implements OnInit {


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
    version: '0.0.1',
    proyecto: '',
    rama: ''
  }

  // Reactive Form Controls
  public nameAppCtrl = new FormControl('')
  public iAppNombreCtrl = new FormControl('', Validators.required)
  public iAppProyectoCtrl = new FormControl('', Validators.required)
  public iAppRamaCtrl = new FormControl('', Validators.required)
  public iAppTipoCtrl = new FormControl<number | null>(null, [Validators.required])
  public iAppOrigenCtrl = new FormControl('', Validators.required)
  public iAppSistemaCtrl = new FormControl('', Validators.required)
  public iAppRepositorioCtrl = new FormControl('', Validators.required)
  public iAppUsuarioCtrl = new FormControl('', Validators.required)
  public iAppClaveCtrl = new FormControl('')
  public iAppPuntoMontajeCtrl = new FormControl('')
  public iAppBasedatosCtrl = new FormControl('', Validators.required)
  public iAppVersionCtrl = new FormControl('', Validators.required)
  public iAppLenguajeCtrl = new FormControl('', Validators.required)
  public iAppObservacionCtrl = new FormControl('', Validators.required)
  public driverCtrl = new FormControl('', Validators.required)

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

  public passwordTextType: boolean = false;

  private horizontalWizardStepper: Stepper;
  public driver: any = undefined
  public drivers = []
  public host = ''
  public descripcion = ''
  public identificador = ''
  public estatus: any = null
  public app_relacionada: any = null

  public showBaseDatos = false
  public showPuente = false
  public lbd = 'Base de Datos'
  public status = [
    { id: true, name: 'ACTIVO' },
    { id: false, name: 'INACTIVO' },
  ]


  public ListaConexiones = []
  public loginForm: UntypedFormGroup;
  public submitted = false;
  public ListaAplicaciones = []

  // Propiedades para el manejo del archivo
  public selectedFile: File | null = null;
  public fileSize: string = '';
  public isUploading: boolean = false;
  public uploadProgress: number = 0;
  public isDragOver: boolean = false;

  public hash = ''
  public archivos = []
  public bDescarga = true
  public bRestaurar = true



  constructor(
    private apiService: ApiService,
    private fileService: FileService,
    private modalService: NgbModal,
    private config: NgSelectConfig,
    private utilservice: UtilService,
    private comunicacionesService: ComunicacionesService,
    private comunicacionesServices: ComunicacionesService,
    private mensajeService: MensajeService
  ) { }

  async ngOnInit() {
    await this.ListarIP();
    await this.ListarHostname();
    // await this.CargarDrivers();
    await this.CargarListaConexiones();
    await this.lstAplicaciones();
    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});


    this.contentHeader = {
      headerTitle: 'Aplicaciones',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Principal',
            isLink: true,
            link: '/'
          },
          {
            name: "Aplicaciones",
            isLink: false,
          },
          {
            name: 'Registrar',
            isLink: false
          }
        ]
      }
    }

    this.mensajeService.finalizacion$.subscribe(
      (fx) => {
        // console.log(fx)
        this.bDescarga = fx.estatus
      },
      (error) => {
        console.log(error)
      }
    )



  }

  async ListarHostname() {
    await this.comunicacionesService.Listar().subscribe(
      (data) => {
        this.hosts = data
      },
      (error) => {
        console.log(error)
      }
    )
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }


  CargarDrivers() {
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_DRIVERS_APLICACION
    this.xAPI.parametros = this.iApp.nombre
    this.drivers = [];
    // console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (datax) => {
        this.drivers = datax.map((e) => {


          e.name = this.seleccionarTipoDriver(e.driver) + ": " +e.descripcion + " - " + "(" + e.basedatos + ")";
          return e;

        });
        // if(this.iApp.nombre === 'consola'){
        //   this.drivers.push({
        //     id: "MGDBA",
        //     name: "Sandra Server MongoDB (MGDBA)",
        //     driver: "mongodb",
        //   });
        // }
        // console.log(this.drivers)
      },
      (error) => {
        console.log(error);
      }
    );
  }

  seleccionarTipoDriver(id: string): string {
    switch (id) {
      case 'mysql6':
        return 'MySQL Database'
      case 'mysql8':
        return 'MySQL Database'
      case 'mongodb':
        return 'Mongo Database'
      case 'postgres96':
        return 'Postgres 9.6'
      case 'postgres13':
        return 'Postgres 13'
      case 'oracle19c':
        return 'Oracle 19c'
    }
  }

  CambiarVisibilidadDriver(e: any) {
    if (this.driver == "puenteurl") {
      this.showBaseDatos = false
      this.showPuente = true
    } else {
      this.showBaseDatos = true
      this.showPuente = false
    } if (this.driver === 'oracle19c') {
      this.lbd = "Oracle_SID"
    } else {
      this.lbd = "Base de Datos"
    } if (this.driver == null) {
      this.showBaseDatos = false
      this.showPuente = false
    }
  }

  onSubmit() {
    alert('Submitted!!');
    return false;
  }
  // private

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

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


  async ListarIP() {
    await this.comunicacionesServices.Listar().subscribe(
      async (data) => {
        await data.map(e => {
          this.hosts.push(e)
        });
        this.hosts.push({ id: 'REPOSITORIO', host: 'github.com', descripcion: '@GITHUB' },
          { id: 'REPOSITORIO', host: 'gitlab.com', descripcion: '@GITLAB' },
          { id: 'REPOSITORIO', host: 'code-epic.io', descripcion: '@GITEA' })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async guardarAplicacion() {
    this.syncAppFromFormControls()
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.INSERTAR_APLICACION;
    this.iApp.llave = this.iApp.nombre + '.sse'
    this.xAPI.valores = JSON.stringify(this.iApp)
    if (this.iApp.identificador != null) this.xAPI.funcion = "SSB_UAplicacion"
    // console.log(this.xAPI)
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          var msj = "Actualizado"
          if (this.xAPI.funcion == environment.functions.INSERTAR_APLICACION) {
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
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_DRIVERS;
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

    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.CONSULTAR_APLICACION //Consultar Aplicacion del sistema 
    this.xAPI.parametros = this.iApp.identificador.toString()
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        var xapp: SSB_IAplicacion
        xapp = data.Cuerpo[0]
        this.iApp = xapp;
        this.syncFormControlsFromApp()
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
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES;
    this.xAPI.valores = null;
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        this.dataApp = await data.Cuerpo.map(e => {
          e.name = `${e.nombre} | ${e.VERSION}`
          this.nameApp = e.name
          return e
        });
        this.dataApp.push({ aplicacion: 'Crear Nuevo', name: ' Crear Nuevo' })

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






  // ... dentro de tu clase del componente

  /**
   * Maneja la selección de un archivo desde el input.
   * @param event Evento del input file.
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
    this.archivos.push(event.target.files[0])

  }

  /**
   * Maneja el evento de arrastrar un archivo sobre la zona.
   * @param event DragEvent
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Maneja el evento de cuando un archivo arrastrado sale de la zona.
   * @param event DragEvent
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Maneja el evento de soltar un archivo en la zona.
   * @param event DragEvent
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Procesa y valida el archivo seleccionado o soltado.
   * @param file El archivo a procesar.
   */
  private handleFile(file: File): void {
    // 1. Validar tipo de archivo (.sql)
    if (!file.name.toLowerCase().endsWith('.sql') && !file.name.toLowerCase().endsWith('.zip') && !file.name.toLowerCase().endsWith('.dump')) {
      this.utilservice.AlertMini('top-end', 'error', 'Por favor, solo archivos .sql, .zip', 4000);
      return;
    }

    // 2. Validar tamaño del archivo (máximo 1.2GB)
    const maxSizeInBytes = 1200 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.utilservice.AlertMini('top-end', 'error', 'El archivo no puede superar los 1.2 GB.', 4000);
      return;
    }

    // 3. Si es válido, actualizar el estado del componente
    this.selectedFile = file;
    this.fileSize = this.formatBytes(file.size);

    // Aquí llamarías a tu servicio para subir el archivo.
    // Para demostración, simulamos la subida.
    this.simulateUpload();
  }

  /**
   * Elimina el archivo seleccionado y resetea el estado.
   * @param event Evento del clic para detener la propagación.
   */
  removeFile(event: MouseEvent): void {
    event.stopPropagation(); // Evita que se abra el diálogo de archivo al hacer clic en el botón de eliminar.
    this.selectedFile = null;
    this.fileSize = '';
    this.isUploading = false;
    this.uploadProgress = 0;
    // Opcional: Resetea el valor del input para poder seleccionar el mismo archivo de nuevo.
    // @ViewChild('fileInput') fileInput: ElementRef;
    // this.fileInput.nativeElement.value = '';
  }

  /**
   * Formatea los bytes a un tamaño legible (KB, MB, GB).
   * @param bytes El número de bytes.
   * @param decimals El número de decimales.
   */
  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Simula el progreso de una subida de archivo para la demostración visual.
   */
  private simulateUpload(): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        this.uploadProgress = 100;
        clearInterval(interval);
        // Mantiene el estado de "completado" por un momento antes de ocultar la barra.
        setTimeout(() => {
          this.isUploading = false
          this.bRestaurar = false
        }, 500);
      }
    }, 200);
  }


  ProcesarDB() {

    if (this.selectedFile == null) {
      this.utilservice.AlertMini('top-end', 'error', 'Por favor, selecciona un archivo .sql para procesar.', 4000);
      return;
    }

      if (this.driver == undefined) {
      this.utilservice.AlertMini('top-end', 'error', 'Debe seleccionar un driver de base de datos.', 4000);
      return;
    }


    const formElement = document.forms.namedItem("forma") as HTMLFormElement;
    if (!formElement) {
      console.error('No se encontró el formulario con el nombre "forma".');
      return;
    }
    const frm = new FormData(formElement);
    frm.append("archivos", this.selectedFile!, this.selectedFile!.name);
    frm.append("identificador", btoa(this.iApp.nombre + '|' + this.iApp.version))
    frm.append("return", 'true')



    this.fileService.EnviarArchivosProgress(frm).subscribe({
      next: (event) => {
        if (event.state === 'LOADING') {
          this.mensajeService.progreso$.emit({
            from: 'file-upload',
            type: 'progress',
            loaded: event.loaded,
            total: event.total,
            progress: event.progress
          })
        } else if (event.state === 'DONE') {
          this.mensajeService.progreso$.emit({
            from: 'file-upload',
            type: 'finished',
            message: 'Archivo subido con éxito.'
          })
          this.utilservice.AlertMini('top-end', 'success', `El archivo ${this.selectedFile.name} subio correctamente`, 2000);
          formElement.reset();
          let body = event.body
          setTimeout(() => {
            this.RealizarRestore(body)
          }, 3000);


          this.removeFile(new MouseEvent('click'));
        }
      },
      error: (err) => {
        console.error('Error al subir el archivo:', err);
        this.utilservice.AlertMini('top-end', 'error', 'Ocurrió un error al subir el archivo.', 5000);
        this.mensajeService.progreso$.emit({
          from: 'file-upload',
          type: 'finished',
          message: 'Error en la subida.'
        })
      },
      complete: () => {

        console.log('Subida de archivo completada.');
      }
    });
  }



  RealizarRestore(body: any) {
    let Hash = body.msj.split('|')[1]
    let Archivo = body.contenido[0].split('|')[1]

    let restore = {
      "id": localStorage.getItem('userId'),
      "driver": this.driver.id,
      "hash": Hash,
      "file": Archivo
    }
    this.apiService.ExecRestore(restore).subscribe(
      (data) => {
        //el websocket supera los siguientes procesos
      },
      (error) => {
        console.log(error)
      }
    )


  }

  syncFormControlsFromApp(): void {
    this.nameAppCtrl.setValue(this.nameApp ?? '')
    this.iAppNombreCtrl.setValue(this.iApp.nombre ?? '')
    this.iAppProyectoCtrl.setValue(this.iApp.proyecto ?? '')
    this.iAppRamaCtrl.setValue(this.iApp.rama ?? '')
    this.iAppTipoCtrl.setValue(this.iApp.tipo ?? null)
    this.iAppOrigenCtrl.setValue(this.iApp.origen ?? '')
    this.iAppSistemaCtrl.setValue(this.iApp.sistema ?? '')
    this.iAppRepositorioCtrl.setValue(this.iApp.repositorio ?? '')
    this.iAppUsuarioCtrl.setValue(this.iApp.usuario ?? '')
    this.iAppClaveCtrl.setValue(this.iApp.clave ?? '')
    this.iAppPuntoMontajeCtrl.setValue(this.iApp.puntoMontaje ?? '')
    this.iAppBasedatosCtrl.setValue(this.iApp.basedatos ?? '')
    this.iAppVersionCtrl.setValue(this.iApp.version ?? '')
    this.iAppLenguajeCtrl.setValue(this.iApp.lenguaje ?? '')
    this.iAppObservacionCtrl.setValue(this.iApp.observacion ?? '')
    this.driverCtrl.setValue(this.driver ?? '')
  }

  syncAppFromFormControls(): void {
    this.nameApp = this.nameAppCtrl.value
    this.iApp.nombre = this.iAppNombreCtrl.value
    this.iApp.proyecto = this.iAppProyectoCtrl.value
    this.iApp.rama = this.iAppRamaCtrl.value
    this.iApp.tipo = this.iAppTipoCtrl.value ?? undefined
    this.iApp.origen = this.iAppOrigenCtrl.value
    this.iApp.sistema = this.iAppSistemaCtrl.value
    this.iApp.repositorio = this.iAppRepositorioCtrl.value
    this.iApp.usuario = this.iAppUsuarioCtrl.value
    this.iApp.clave = this.iAppClaveCtrl.value
    this.iApp.puntoMontaje = this.iAppPuntoMontajeCtrl.value
    this.iApp.basedatos = this.iAppBasedatosCtrl.value
    this.iApp.version = this.iAppVersionCtrl.value
    this.iApp.lenguaje = this.iAppLenguajeCtrl.value
    this.iApp.observacion = this.iAppObservacionCtrl.value
    this.driver = this.driverCtrl.value
  }

  backupDatabase() {
    if (this.driver == undefined) {
      this.utilservice.AlertMini('top-end', 'error', 'Debe seleccionar un driver de base de datos para realizar el backup.', 4000);
      return;
    }

    this.bDescarga = false

    let dump = {
      "id": localStorage.getItem('userId'),
      "driver": this.driver.id,
    }
    this.apiService.ExecBackup(dump).subscribe(
      (data) => {
        //el websocket supera los siguientes procesos
      },
      (error) => {
        console.log(error)
      }
    )

  }


}
