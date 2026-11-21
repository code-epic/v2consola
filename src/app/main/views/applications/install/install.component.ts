import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

export class InstallComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject<void>();
  private _backupTimer: any = null;
  public isRestoring: boolean = false;
  public restoreProgress: number = 0;
  public operationMode: 'idle' | 'backup' | 'restore' = 'idle';
  public backupPhase: 'idle' | 'connecting' | 'dumping' | 'packaging' | 'completed' = 'idle';
  public backupBytesText: string = '0 KB';
  public backupSpeedText: string = 'Canal cifrado listo';
  public backupStatusLabel: string = 'Inicializando motor de respaldo Sandra...';
  public backupElapsedSeconds: number = 0;
  public backupFileName: string = '';

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
    { id: "POSTGRES", descripcion: 'POSTGRESQL', motor: 'Relational SQL', icon: 'assets/images/icons/db/postgres.svg', matteClass: 'db-matte-postgres' },
    { id: "MYSQL", descripcion: 'MYSQL', motor: 'Relational SQL', icon: 'assets/images/icons/db/mysql.svg', matteClass: 'db-matte-mysql' },
    { id: "MARIADB", descripcion: 'MARIADB', motor: 'Relational SQL', icon: 'assets/images/icons/db/mariadb.svg', matteClass: 'db-matte-mariadb' },
    { id: "MONGODB", descripcion: 'MONGODB', motor: 'NoSQL Document', icon: 'assets/images/icons/db/mongodb.svg', matteClass: 'db-matte-mongodb' },
    { id: "COUCHDB", descripcion: 'COUCHDB', motor: 'NoSQL Document', icon: 'assets/images/icons/db/couchdb.svg', matteClass: 'db-matte-couchdb' },
    { id: "RETHINKDB", descripcion: 'RETHINKDB', motor: 'NoSQL Realtime', icon: 'assets/images/icons/db/rethinkdb.svg', matteClass: 'db-matte-rethinkdb' },
    { id: "SQLSERVER", descripcion: 'SQL SERVER', motor: 'Enterprise SQL', icon: 'assets/images/icons/db/sqlserver.svg', matteClass: 'db-matte-sqlserver' },
    { id: "ORACLE", descripcion: 'ORACLE', motor: 'Enterprise SQL', icon: 'assets/images/icons/db/database.svg', matteClass: 'db-matte-neutral' },
    { id: "SYBASE", descripcion: 'SYBASE', motor: 'Enterprise SQL', icon: 'assets/images/icons/db/database.svg', matteClass: 'db-matte-neutral' },
    { id: "INFORMIX", descripcion: 'INFORMIX', motor: 'Enterprise SQL', icon: 'assets/images/icons/db/database.svg', matteClass: 'db-matte-neutral' },
    { id: "FIREBASE", descripcion: 'FIREBASE', motor: 'Cloud NoSQL', icon: 'assets/images/icons/db/database.svg', matteClass: 'db-matte-neutral' },
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

    this.mensajeService.progreso$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((prog) => {
        if (!prog || (this.bDescarga && !this.isRestoring)) return;

        if (prog.from === 'exec-pipe') {
          if (prog.message?.error) {
            this.finalizarCicloRespaldo(false);
            return;
          }

          if (prog.type === 'progress' && !this.bDescarga) {
            const bytes = Number(prog.message?.bytes || 0);
            const speed = Number(prog.message?.speed || 0);
            if (bytes > 0) {
              this.backupPhase = 'dumping';
              this.backupBytesText = this.formatBytes(bytes);
              this.backupSpeedText = speed > 0 ? `${this.formatBytes(speed)}/s` : 'Extrayendo bloques...';
              this.backupStatusLabel = 'Extrayendo esquema y bloques de datos...';
            } else {
              this.backupPhase = 'connecting';
              this.backupStatusLabel = 'Conectando y preparando volcado seguro...';
            }
            this.cdr.detectChanges();
          } else if (prog.type === 'dump_finished' && !this.bDescarga) {
            this.backupPhase = 'packaging';
            this.backupFileName = prog.message?.file || '';
            this.backupStatusLabel = 'Empaquetando respaldo y sincronizando descarga única...';
            this.cdr.detectChanges();
          } else if (prog.type === 'restore' && this.isRestoring) {
            const pct = this.formatPercentage(prog.message?.percentage ?? 0);
            this.restoreProgress = pct;
            this.backupPhase = 'packaging';
            this.backupBytesText = `${pct}% restaurado`;
            this.backupSpeedText = 'Inyectando bloques SQL';
            this.backupStatusLabel = pct > 0
              ? `Inyectando estructura y registros en el motor (${pct}%)...`
              : 'Ejecutando restauración transaccional en el motor...';
            this.cdr.detectChanges();
          } else if (prog.type === 'restore_finished' && this.isRestoring) {
            this.restoreProgress = 100;
            this.backupPhase = 'completed';
            this.backupBytesText = '100% completado';
            this.backupSpeedText = 'Base sincronizada';
            this.backupStatusLabel = 'Restauración de base de datos completada con éxito';
            this.cdr.detectChanges();
          }
        }
      });

    this.mensajeService.finalizacion$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (fx) => {
          if ((!this.bDescarga || this.isRestoring) && fx?.estatus) {
            this.backupPhase = 'completed';
            this.backupStatusLabel = this.isRestoring
              ? 'Base de datos restaurada y sincronizada correctamente'
              : 'Respaldo verificado y descargado correctamente';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.finalizarCicloRespaldo(true);
            }, 850);
          } else if (fx?.estatus !== undefined) {
            this.bDescarga = fx.estatus;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  ngOnDestroy(): void {
    this.detenerTimerRespaldo();
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  private iniciarTimerRespaldo(): void {
    this.detenerTimerRespaldo();
    this.backupElapsedSeconds = 0;
    this._backupTimer = setInterval(() => {
      this.backupElapsedSeconds++;
      this.cdr.detectChanges();
    }, 1000);
  }

  private detenerTimerRespaldo(): void {
    if (this._backupTimer) {
      clearInterval(this._backupTimer);
      this._backupTimer = null;
    }
  }

  private finalizarCicloRespaldo(exito: boolean): void {
    const wasRestore = this.isRestoring || this.operationMode === 'restore';
    this.detenerTimerRespaldo();
    this.bDescarga = true;
    this.isRestoring = false;
    this.restoreProgress = 0;
    this.operationMode = 'idle';
    this.backupPhase = 'idle';
    if (exito) {
      const msg = wasRestore
        ? 'Ciclo de restauración de base de datos completado con éxito'
        : 'Ciclo de respaldo y descarga completado con éxito';
      this.utilservice.AlertMini('top-end', 'success', msg, 3000);
    }
    this.cdr.detectChanges();
  }

  async ListarHostname() {
    const repoHosts = [
      { id: 'REPOSITORIO', host: 'github.com', descripcion: '@GITHUB' },
      { id: 'REPOSITORIO', host: 'gitlab.com', descripcion: '@GITLAB' },
      { id: 'REPOSITORIO', host: 'code-epic.io', descripcion: '@GITEA' }
    ];

    this.comunicacionesService.Listar().subscribe({
      next: (data) => {
        this.hosts = [...(Array.isArray(data) ? data : []), ...repoHosts];
        this.cdr.detectChanges();
      },
      error: () => {
        // Respaldo mediante ApiService (_SYS_LstComunicaciones, igual que networks/communications)
        const xAPI: IAPICore = {
          funcion: '_SYS_LstComunicaciones',
          parametros: '',
          valores: {},
        };
        this.apiService.Ejecutar(xAPI).subscribe({
          next: (fallbackData: any) => {
            const list = Array.isArray(fallbackData)
              ? fallbackData
              : Array.isArray(fallbackData?.Cuerpo)
                ? fallbackData.Cuerpo
                : [];
            this.hosts = [...list, ...repoHosts];
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error listando hosts/comunicaciones:', err);
            this.hosts = [...repoHosts];
            this.cdr.detectChanges();
          }
        });
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

  getDbIcon(engine: string): string {
    const d = (engine || '').toLowerCase();
    if (d.includes('mariadb')) return 'assets/images/icons/db/mariadb.svg';
    if (d.includes('mysql')) return 'assets/images/icons/db/mysql.svg';
    if (d.includes('postgres') || d.includes('pgsql')) return 'assets/images/icons/db/postgres.svg';
    if (d.includes('mongo')) return 'assets/images/icons/db/mongodb.svg';
    if (d.includes('couch')) return 'assets/images/icons/db/couchdb.svg';
    if (d.includes('rethink')) return 'assets/images/icons/db/rethinkdb.svg';
    if (d.includes('sqlserver') || d.includes('mssql')) return 'assets/images/icons/db/sqlserver.svg';
    return 'assets/images/icons/db/database.svg';
  }

  getDriverBadgeClass(driverType: string): string {
    const d = (driverType || '').toLowerCase();
    if (d.includes('mariadb')) return 'db-matte-mariadb';
    if (d.includes('mysql')) return 'db-matte-mysql';
    if (d.includes('postgres') || d.includes('pgsql')) return 'db-matte-postgres';
    if (d.includes('mongo')) return 'db-matte-mongodb';
    if (d.includes('couch')) return 'db-matte-couchdb';
    if (d.includes('rethink')) return 'db-matte-rethinkdb';
    if (d.includes('sqlserver') || d.includes('mssql')) return 'db-matte-sqlserver';
    return 'db-matte-neutral';
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
  public formatPercentage(value: any): number {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return 0;
    return parseFloat(num.toFixed(3));
  }

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
    const fileToUpload = this.selectedFile!;
    const fileToUploadSize = this.fileSize || this.formatBytes(fileToUpload.size);
    const frm = new FormData(formElement);
    frm.append("archivos", fileToUpload, fileToUpload.name);
    frm.append("identificador", btoa(this.iApp.nombre + '|' + this.iApp.version));
    frm.append("return", 'true');

    // Activar modo Restauración con la animación digital de Sandra y ocultar Crear Respaldo
    this.isRestoring = true;
    this.operationMode = 'restore';
    this.restoreProgress = 0;
    this.backupPhase = 'connecting';
    this.backupFileName = fileToUpload.name;
    this.backupBytesText = `0% de ${fileToUploadSize}`;
    this.backupSpeedText = 'Subiendo script...';
    this.backupStatusLabel = `Transfiriendo script "${fileToUpload.name}" al núcleo Sandra...`;
    this.iniciarTimerRespaldo();
    this.cdr.detectChanges();

    this.fileService.EnviarArchivosProgress(frm).subscribe({
      next: (event) => {
        if (event.state === 'LOADING') {
          const pct = this.formatPercentage(event.progress || 0);
          this.restoreProgress = pct;
          this.backupPhase = 'connecting';
          this.backupBytesText = `${this.formatBytes(event.loaded)} / ${this.formatBytes(event.total)}`;
          this.backupSpeedText = `${pct}% transferido`;
          this.backupStatusLabel = pct < 99
            ? `Subiendo script "${fileToUpload.name}" (${pct}%)...`
            : 'Verificando integridad del paquete en servidor...';
          this.cdr.detectChanges();

          this.mensajeService.progreso$.emit({
            from: 'file-upload',
            type: 'progress',
            loaded: event.loaded,
            total: event.total,
            progress: event.progress
          });
        } else if (event.state === 'DONE') {
          this.backupPhase = 'dumping';
          this.backupBytesText = fileToUploadSize;
          this.backupSpeedText = 'Hash verificado';
          this.backupStatusLabel = 'Script verificado. Preparando inyección en motor de base de datos...';
          this.cdr.detectChanges();

          this.mensajeService.progreso$.emit({
            from: 'file-upload',
            type: 'finished',
            message: 'Archivo subido con éxito.'
          });
          formElement?.reset();
          const body = event.body;
          this.removeFile(new MouseEvent('click'));
          setTimeout(() => {
            this.RealizarRestore(body);
          }, 800);
        }
      },
      error: (err) => {
        console.error('Error al subir el archivo:', err);
        this.finalizarCicloRespaldo(false);
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
    if (!body?.msj || !body?.contenido?.[0]) {
      this.finalizarCicloRespaldo(false);
      this.utilservice.AlertMini('top-end', 'error', 'Respuesta de archivo inválida para restaurar.', 4000);
      return;
    }
    const Hash = body.msj.split('|')[1];
    const Archivo = body.contenido[0].split('|')[1];
    const selectedDriver = this.driver || this.driverCtrl.value;
    const driverId = selectedDriver?.id ?? (typeof selectedDriver === 'string' ? selectedDriver : undefined);

    this.backupPhase = 'packaging';
    this.backupSpeedText = 'Inyectando bloques SQL';
    this.backupStatusLabel = 'Ejecutando restauración transaccional en la base de datos...';
    this.cdr.detectChanges();

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
      next: () => {
        // el websocket informará el progreso
      },
      error: (error) => {
        console.error('Error al restaurar:', error);
        this.finalizarCicloRespaldo(false);
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
    if (!this.bDescarga || this.isRestoring) {
      return;
    }

    const selectedDriver = this.driver || this.driverCtrl.value;
    const driverId = selectedDriver?.id ?? (typeof selectedDriver === 'string' ? selectedDriver : undefined);

    if (!driverId) {
      this.utilservice.AlertMini('top-end', 'error', 'Debe seleccionar un driver de base de datos para realizar el backup.', 4000);
      return;
    }

    this.bDescarga = false;
    this.operationMode = 'backup';
    this.backupPhase = 'connecting';
    this.backupBytesText = '0 KB';
    this.backupSpeedText = 'Canal cifrado activo';
    this.backupFileName = '';
    this.backupStatusLabel = 'Inicializando motor de respaldo Sandra...';
    this.iniciarTimerRespaldo();
    this.cdr.detectChanges();

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
      next: () => {
        // Sandra enviará los chunks de progreso por WebSocket
        if (this.backupPhase === 'connecting') {
          this.backupPhase = 'dumping';
          this.backupStatusLabel = 'Extrayendo esquema y bloques de datos...';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al ejecutar backup:', error);
        this.finalizarCicloRespaldo(false);
        this.utilservice.AlertMini('top-end', 'error', 'Error al solicitar el respaldo de la base de datos.', 4000);
      }
    });
  }


}
