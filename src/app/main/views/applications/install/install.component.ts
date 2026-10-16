import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';

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
import Swal from 'sweetalert2';
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
  public isLoadingApp: boolean = false;
  public isConsultingApp: boolean = false;
  public selectedAppInfo: any = null;

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
  public nameAppCtrl = new FormControl<any>(null)
  public iAppNombreCtrl = new FormControl('', Validators.required)
  public iAppProyectoCtrl = new FormControl('', Validators.required)
  public iAppRamaCtrl = new FormControl('', Validators.required)
  public iAppTipoCtrl = new FormControl<any>(null, [Validators.required])
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
    private mensajeService: MensajeService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    await this.ListarHostname();
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
        this.bDescarga = fx.estatus
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error)
      }
    )
  }

  async ListarHostname() {
    this.comunicacionesService.Listar().subscribe({
      next: (data) => {
        const repoHosts = [
          { id: 'REPOSITORIO', host: 'github.com', descripcion: '@GITHUB' },
          { id: 'REPOSITORIO', host: 'gitlab.com', descripcion: '@GITLAB' },
          { id: 'REPOSITORIO', host: 'code-epic.io', descripcion: '@GITEA' }
        ];
        this.hosts = [...(data || []), ...repoHosts];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error listando hosts/comunicaciones:', error);
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }


  CargarDrivers() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_DRIVERS_APLICACION;
    this.xAPI.parametros = this.iApp.nombre || '';
    this.drivers = [];
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (datax) => {
        if (Array.isArray(datax)) {
          this.drivers = datax.map((e) => {
            e.name = this.seleccionarTipoDriver(e.driver) + ": " + e.descripcion + " (" + e.basedatos + ")";
            return e;
          });
          // Si ya había un driver seleccionado, re-sincronizar el objeto
          if (this.driver) {
            const currentId = this.driver?.id ?? this.driver;
            const found = this.drivers.find(d => d.id === currentId);
            if (found) {
              this.driver = found;
              this.driverCtrl.setValue(found, { emitEvent: false });
            }
          } else if (this.drivers.length === 1) {
            this.onDriverChange(this.drivers[0]);
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar drivers:', error);
      }
    });
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
      default:
        return id || 'Database Driver'
    }
  }

  onDriverChange(selected: any): void {
    this.driver = selected;
    this.driverCtrl.setValue(selected);
    this.CambiarVisibilidadDriver(selected);
    if (this.isDriverSelected() && this.selectedFile && !this.isUploading) {
      this.bRestaurar = false;
    } else {
      this.bRestaurar = true;
    }
    this.cdr.detectChanges();
  }

  CambiarVisibilidadDriver(e?: any) {
    const d = this.driver || this.driverCtrl.value;
    const driverType = d?.driver || (typeof d === 'string' ? d : '');
    if (driverType === 'puenteurl') {
      this.showBaseDatos = false;
      this.showPuente = true;
    } else {
      this.showBaseDatos = true;
      this.showPuente = false;
    }
    if (driverType === 'oracle19c') {
      this.lbd = 'Oracle_SID';
    } else {
      this.lbd = 'Base de Datos';
    }
    if (!d) {
      this.showBaseDatos = false;
      this.showPuente = false;
    }
  }

  getDriverBadgeClass(driverType: string): string {
    const d = (driverType || '').toLowerCase();
    if (d.includes('mongo')) return 'badge-light-success';
    if (d.includes('mysql')) return 'badge-light-info';
    if (d.includes('postgres')) return 'badge-light-primary';
    if (d.includes('oracle')) return 'badge-light-danger';
    return 'badge-light-secondary';
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


  async guardarAplicacion() {
    this.syncAppFromFormControls()
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.INSERTAR_APLICACION;
    this.iApp.llave = this.iApp.nombre + '.sse'
    this.xAPI.valores = JSON.stringify(this.iApp)
    if (this.iApp.identificador != null && this.iApp.identificador !== ('NEW' as any)) {
      this.xAPI.funcion = "SSB_UAplicacion"
    }
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          var msj = "Actualizado"
          if (this.xAPI.funcion == environment.functions.INSERTAR_APLICACION) {
            this.iApp.identificador = data.msj;
            var msj = "Agregado"
          }
          this.utilservice.AlertMini('top-end', 'success', 'Se ha ' + msj + ' el registro con éxito', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! Algo salió mal!', 3000)
        }
      },
      (error) => {
        this.utilservice.AlertMini('top-end', 'error', 'Oops! Algo salió mal!', 3000)
        console.log(error)
      }
    )
  }

  selectEventModulo(event?: any) {
    this.iApp.nombre = this.iAppNombreCtrl.value?.trim() || '';
    this.nombreapp = this.iApp.nombre;
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

  setModoRegistro(modo: 'existente' | 'nueva') {
    if (modo === 'nueva') {
      this.showAppA = false;
      this.showAppB = true;
      this.resetearFormularioNuevaApp();
    } else {
      this.showAppA = true;
      this.showAppB = false;
    }
    this.cdr.detectChanges();
  }

  limpiarSeleccion() {
    this.resetearFormularioNuevaApp();
    this.showAppA = true;
    this.showAppB = false;
    this.cdr.detectChanges();
  }

  resetearFormularioNuevaApp() {
    this.iApp = {
      identificador: undefined,
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
      rama: 'main'
    };
    this.selectedAppInfo = null;
    this.nameApp = undefined;
    this.nameAppCtrl.reset('');
    this.iAppNombreCtrl.reset('');
    this.iAppProyectoCtrl.reset('');
    this.iAppRamaCtrl.setValue('main');
    this.iAppTipoCtrl.reset(null);
    this.iAppOrigenCtrl.reset('');
    this.iAppSistemaCtrl.reset('');
    this.iAppRepositorioCtrl.reset('');
    this.iAppUsuarioCtrl.reset('');
    this.iAppClaveCtrl.reset('');
    this.iAppPuntoMontajeCtrl.reset('');
    this.iAppBasedatosCtrl.reset('');
    this.iAppVersionCtrl.setValue('0.0.1');
    this.iAppLenguajeCtrl.reset('');
    this.iAppObservacionCtrl.reset('');
    this.showInput = false;
  }

  selectEventModuloo(e: any) {
    if (e == null || e === undefined) {
      this.limpiarSeleccion();
      return;
    }

    if (e === 'NEW' || (typeof e === 'object' && e?.identificador === 'NEW')) {
      this.setModoRegistro('nueva');
      return;
    }

    const selectedId = typeof e === 'object' ? (e.identificador ?? e.id) : e;
    this.showAppA = true;
    this.showAppB = false;
    this.iApp.identificador = selectedId;
    this.selectedAppInfo = this.dataApp.find(item => item.identificador == selectedId) || null;
    this.consultarAplicacion();
  }

  async consultarAplicacion() {
    if (this.iApp.identificador == null || this.iApp.identificador === ('NEW' as any)) return false;

    this.isConsultingApp = true;
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.CONSULTAR_APLICACION;
    this.xAPI.parametros = this.iApp.identificador.toString();
    this.xAPI.valores = '';

    await this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.isConsultingApp = false;
        if (data && data.Cuerpo && data.Cuerpo.length > 0) {
          const xapp: SSB_IAplicacion = data.Cuerpo[0];
          const selectedId = this.iApp.identificador;
          this.iApp = {
            ...xapp,
            identificador: xapp.identificador ?? selectedId,
            version: xapp.version || (xapp as any).VERSION || '0.0.1',
            nombre: xapp.nombre || '',
            proyecto: xapp.proyecto || '',
            rama: xapp.rama || '',
            observacion: xapp.observacion || (xapp as any).descripcion || ''
          };
          this.selectedAppInfo = this.dataApp.find(item => item.identificador == selectedId) || {
            nombre: this.iApp.nombre,
            VERSION: this.iApp.version,
            identificador: selectedId
          };
          this.syncFormControlsFromApp();
          this.CargarDrivers();
          this.cdr.detectChanges();
          this.utilservice.AlertMini('top-end', 'success', `Aplicación "${this.iApp.nombre}" cargada con éxito`, 2000);
        } else {
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isConsultingApp = false;
        this.cdr.detectChanges();
        console.error('Error al consultar aplicación:', error);
        this.utilservice.AlertMini('top-end', 'error', 'No se pudo cargar la información de la aplicación', 3500);
      }
    });
  }

  CapturarSeleccion(event: any) {
    if (event == 2 || event == '2') {
      this.showInput = true;
    } else {
      this.showInput = false;
    }
  }

  async lstAplicaciones() {
    this.isLoadingApp = true;
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES;
    this.xAPI.valores = null;
    await this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.isLoadingApp = false;
        if (data && data.Cuerpo) {
          this.dataApp = data.Cuerpo.map((e: any) => {
            const versionStr = e.VERSION || e.version || '';
            e.identificador = e.identificador ?? e.id;
            e.name = versionStr ? `${e.nombre} | ${versionStr}` : e.nombre;
            return e;
          });

          this.dataApp.push({
            identificador: 'NEW',
            nombre: '+ Registrar Nueva Aplicación',
            name: '+ Registrar Nueva Aplicación',
            isActionNew: true
          });

          this.ListaAplicaciones = data.Cuerpo.map((e: any) => {
            e.name = e.nombre + ' : ' + (e.VERSION || e.version || '');
            return e;
          });
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingApp = false;
        this.cdr.detectChanges();
        console.error('Error cargando lista de aplicaciones:', error);
      }
    });
  }






  /**
   * Determina si se ha seleccionado un driver de base de datos válido.
   */
  isDriverSelected(): boolean {
    const d = this.driver || this.driverCtrl.value;
    const driverId = d?.id ?? (typeof d === 'string' ? d : undefined);
    return !!driverId && String(driverId).trim() !== '';
  }

  /**
   * Abre el selector de archivos solo si hay un driver seleccionado.
   */
  triggerFileInput(fileInput: HTMLInputElement): void {
    if (!this.isDriverSelected()) {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe seleccionar un driver de base de datos antes de subir un script.', 4000);
      return;
    }
    if (!this.selectedFile) {
      fileInput.click();
    }
  }

  /**
   * Maneja la selección de un archivo desde el input.
   * @param event Evento del input file.
   */
  onFileSelected(event: any): void {
    if (!this.isDriverSelected()) {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe seleccionar un driver de base de datos antes de subir un script.', 4000);
      if (event?.target) event.target.value = '';
      return;
    }
    const file: File = event.target.files?.[0];
    if (file) {
      this.handleFile(file);
    }
    if (event.target.files && event.target.files[0]) {
      this.archivos.push(event.target.files[0]);
    }
  }

  /**
   * Maneja el evento de arrastrar un archivo sobre la zona.
   * @param event DragEvent
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isDriverSelected()) {
      this.isDragOver = false;
      return;
    }
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

    if (!this.isDriverSelected()) {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe seleccionar un driver de base de datos antes de subir un script.', 4000);
      return;
    }

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
    if (!this.isDriverSelected()) {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe seleccionar un driver de base de datos antes de subir un script.', 4000);
      return;
    }

    // 1. Validar tipo de archivo (.sql, .zip, .dump)
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.sql') && !lowerName.endsWith('.zip') && !lowerName.endsWith('.dump')) {
      this.utilservice.AlertMini('top-end', 'error', 'Formato no permitido. Solo archivos .sql, .zip o .dump', 4000);
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
    this.bRestaurar = true; // Deshabilitado mientras se carga/procesa
    this.cdr.detectChanges();

    // 4. Mostrar cargando con animación y habilitar botón al culminar
    this.simulateUpload();
  }

  /**
   * Elimina el archivo seleccionado y resetea el estado.
   * @param event Evento del clic para detener la propagación.
   */
  removeFile(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.fileSize = '';
    this.isUploading = false;
    this.uploadProgress = 0;
    this.bRestaurar = true;
    this.archivos = [];
    this.cdr.detectChanges();
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
   * Simula y renderiza el progreso de la subida del archivo activando detección de cambios.
   */
  private simulateUpload(): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    this.bRestaurar = true;
    this.cdr.detectChanges();

    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        this.uploadProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          this.isUploading = false;
          this.bRestaurar = false; // ¡Habilita el botón de restaurar!
          this.cdr.detectChanges();
          this.utilservice.AlertMini('top-end', 'success', `Archivo "${this.selectedFile?.name}" cargado y listo para restaurar`, 3000);
        }, 350);
      }
      this.cdr.detectChanges();
    }, 70);
  }


  async ProcesarDB() {
    if (this.selectedFile == null) {
      this.utilservice.AlertMini('top-end', 'error', 'Por favor, selecciona un archivo .sql para procesar.', 4000);
      return;
    }

    const selectedDriver = this.driver || this.driverCtrl.value;
    const driverId = selectedDriver?.id ?? (typeof selectedDriver === 'string' ? selectedDriver : undefined);
    if (!driverId) {
      this.utilservice.AlertMini('top-end', 'error', 'Debe seleccionar un driver de base de datos.', 4000);
      return;
    }

    const dbName = selectedDriver?.basedatos || this.iApp.basedatos || 'Base de Datos Principal';
    const driverDesc = selectedDriver?.descripcion || selectedDriver?.driver || 'Driver';

    const confirmResult = await Swal.fire({
      title: '¿Reemplazar Base de Datos Completa?',
      html: `
        <div class="text-left font-small-3 p-1">
          <p class="text-danger font-weight-bolder mb-1">
            ⚠️ ¡ATENCIÓN! Esta operación es destructiva e irreversible.
          </p>
          <p class="text-dark mb-1">
            ¿Está seguro de que desea <strong>sobrescribir o reemplazar por completo</strong> la base de datos de esta aplicación?
          </p>
          <div class="p-1 mb-1 rounded" style="background: #f8fafc; border: 1px solid #e2e8f0;">
            <div class="mb-50"><strong>Base de datos objetivo:</strong> <span class="badge badge-light-primary">${dbName}</span></div>
            <div class="mb-50"><strong>Motor / Driver:</strong> ${driverDesc} (${driverId})</div>
            <div><strong>Script a restaurar:</strong> <code class="text-primary font-weight-bold">${this.selectedFile.name}</code></div>
          </div>
          <small class="text-muted d-block">
            Se eliminarán o sustituirán todas las tablas y datos actuales de la base de datos con la información del archivo suministrado.
          </small>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Reemplazar y Restaurar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ea5455',
      cancelButtonColor: '#82868b',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-outline-secondary mr-1'
      },
      buttonsStyling: false
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    const formElement = document.forms.namedItem("forma") as HTMLFormElement;
    if (!formElement) {
      console.error('No se encontró el formulario con el nombre "forma".');
      return;
    }
    const frm = new FormData(formElement);
    frm.append("archivos", this.selectedFile!, this.selectedFile!.name);
    frm.append("identificador", btoa(this.iApp.nombre + '|' + this.iApp.version));
    frm.append("return", 'true');

    this.fileService.EnviarArchivosProgress(frm).subscribe({
      next: (event) => {
        if (event.state === 'LOADING') {
          this.mensajeService.progreso$.emit({
            from: 'file-upload',
            type: 'progress',
            loaded: event.loaded,
            total: event.total,
            progress: event.progress
          });
        } else if (event.state === 'DONE') {
          this.mensajeService.progreso$.emit({
            from: 'file-upload',
            type: 'finished',
            message: 'Archivo subido con éxito.'
          });
          this.utilservice.AlertMini('top-end', 'success', `El archivo ${this.selectedFile.name} subio correctamente`, 2000);
          formElement.reset();
          const body = event.body;
          setTimeout(() => {
            this.RealizarRestore(body);
          }, 1500);

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
        });
      },
      complete: () => {
        console.log('Subida de archivo completada.');
      }
    });
  }

  RealizarRestore(body: any) {
    const Hash = body.msj.split('|')[1];
    const Archivo = body.contenido[0].split('|')[1];
    const selectedDriver = this.driver || this.driverCtrl.value;
    const driverId = selectedDriver?.id ?? (typeof selectedDriver === 'string' ? selectedDriver : undefined);

    // Disparar barra de progreso en el vertical menu de la sidebar
    this.mensajeService.progreso$.emit({
      from: 'exec-pipe',
      type: 'restore',
      message: { percentage: 0, total: 100 }
    });

    const restore = {
      "id": localStorage.getItem('userId'),
      "driver": driverId,
      "hash": Hash,
      "file": Archivo
    };
    this.apiService.ExecRestore(restore).subscribe({
      next: (data) => {
        // el websocket informará el progreso
      },
      error: (error) => {
        console.error('Error al restaurar:', error);
        this.utilservice.AlertMini('top-end', 'error', 'Error al ejecutar restauración.', 4000);
      }
    });
  }

  syncFormControlsFromApp(): void {
    const matched = this.dataApp.find(a => a.identificador == this.iApp.identificador);
    if (matched) {
      this.nameAppCtrl.setValue(matched.identificador, { emitEvent: false });
      this.nameApp = matched.name;
    } else {
      this.nameAppCtrl.setValue(this.iApp.identificador, { emitEvent: false });
    }

    this.iAppNombreCtrl.setValue(this.iApp.nombre ?? '');
    this.iAppProyectoCtrl.setValue(this.iApp.proyecto ?? '');
    this.iAppRamaCtrl.setValue(this.iApp.rama ?? 'main');

    const tipoVal = this.iApp.tipo != null ? String(this.iApp.tipo) : null;
    this.iAppTipoCtrl.setValue(tipoVal);
    this.CapturarSeleccion(tipoVal);

    this.iAppOrigenCtrl.setValue(this.iApp.origen ?? '');
    this.iAppSistemaCtrl.setValue(this.iApp.sistema ?? '');
    this.iAppRepositorioCtrl.setValue(this.iApp.repositorio ?? '');
    this.iAppUsuarioCtrl.setValue(this.iApp.usuario ?? '');
    this.iAppClaveCtrl.setValue(this.iApp.clave ?? '');
    this.iAppPuntoMontajeCtrl.setValue(this.iApp.puntoMontaje ?? '');
    this.iAppBasedatosCtrl.setValue(this.iApp.basedatos ?? '');
    this.iAppVersionCtrl.setValue(this.iApp.version ?? '0.0.1');
    this.iAppLenguajeCtrl.setValue(this.iApp.lenguaje ?? '');
    this.iAppObservacionCtrl.setValue(this.iApp.observacion ?? '');
    this.driverCtrl.setValue(this.driver ?? '');
  }

  syncAppFromFormControls(): void {
    if (this.showAppB) {
      this.iApp.identificador = undefined;
      this.iApp.nombre = this.iAppNombreCtrl.value?.trim() || '';
      this.nameApp = this.iApp.nombre;
    } else {
      this.iApp.nombre = this.iAppNombreCtrl.value || this.iApp.nombre;
    }
    this.iApp.proyecto = this.iAppProyectoCtrl.value ?? '';
    this.iApp.rama = this.iAppRamaCtrl.value ?? '';
    this.iApp.tipo = this.iAppTipoCtrl.value ? Number(this.iAppTipoCtrl.value) : undefined;
    this.iApp.origen = this.iAppOrigenCtrl.value ?? '';
    this.iAppSistemaCtrl.setValue(this.iAppSistemaCtrl.value ?? '');
    this.iApp.sistema = this.iAppSistemaCtrl.value ?? '';
    this.iApp.repositorio = this.iAppRepositorioCtrl.value ?? '';
    this.iApp.usuario = this.iAppUsuarioCtrl.value ?? '';
    this.iApp.clave = this.iAppClaveCtrl.value ?? '';
    this.iApp.puntoMontaje = this.iAppPuntoMontajeCtrl.value ?? '';
    this.iApp.basedatos = this.iAppBasedatosCtrl.value ?? '';
    this.iApp.version = this.iAppVersionCtrl.value ?? '0.0.1';
    this.iApp.lenguaje = this.iAppLenguajeCtrl.value ?? '';
    this.iApp.observacion = this.iAppObservacionCtrl.value ?? '';
    this.driver = this.driverCtrl.value;
  }

  backupDatabase() {
    const selectedDriver = this.driver || this.driverCtrl.value;
    const driverId = selectedDriver?.id ?? (typeof selectedDriver === 'string' ? selectedDriver : undefined);

    if (!driverId) {
      this.utilservice.AlertMini('top-end', 'error', 'Debe seleccionar un driver de base de datos para realizar el backup.', 4000);
      return;
    }

    this.bDescarga = false;

    // Levantar de inmediato el indicador de progreso en el vertical-menu (sidebar)
    this.mensajeService.progreso$.emit({
      from: 'exec-pipe',
      type: 'progress',
      message: { bytes: 0, speed: 0 }
    });

    const dump = {
      "id": localStorage.getItem('userId'),
      "driver": driverId,
    };

    this.apiService.ExecBackup(dump).subscribe({
      next: (data) => {
        // Sandra enviará los chunks de progreso por WebSocket
      },
      error: (error) => {
        console.error('Error al ejecutar backup:', error);
        this.bDescarga = true;
        this.utilservice.AlertMini('top-end', 'error', 'Error al solicitar el respaldo de la base de datos.', 4000);
        this.cdr.detectChanges();
      }
    });
  }


}
