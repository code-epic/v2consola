import { Component, OnInit, ViewChild, ViewEncapsulation, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType, NgxDatatableModule } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore } from '@services/apicore/api.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ComunicationsService } from '@services/networks/comunications.service';
import { ConexionesService } from '@services/networks/connections.service';
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import { environment } from 'environments/environment';


@Component({
    selector: 'app-connections',
    templateUrl: './connections.component.html',
    styleUrls: ['./connections.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [NgbModalConfig, NgbModal],
    standalone: true,
    imports: [
        CoreCommonModule,
        RouterModule,
        NgbModule,
        ContentHeaderComponent,
        NgxDatatableModule,
        NgSelectModule
    ]
})
export class ConnectionsComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia: false,
    protocolo: '',
    ruta: '',
    retorna: false,
    migrar: false,
    modulo: '',
    valores: {},
    coleccion: '',
    http: 0,
    https: 0,
    consumidores: 0,
    puertohttp: 0,
    puertohttps: 0,
    driver: '',
    query: '',
    metodo: '',
    tipo: '',
    prioridad: '',
    entorno: '',
    logs: false
  };


  // Private
  public lbd = 'Base de Datos'
  private _count = signal<any>(undefined);
  get count() { return this._count(); }
  public isReload = false;

  public showBaseDatos = false
  public showPuente = false
  private _unsubscribeAll: Subject<any>;

  searchValueCtrl = new FormControl('')
  basicSelectedOptionCtrl = new FormControl(10)
  xrsCtrl = new FormControl({value: '', disabled: true})

  public searchValue: string = ''
  private _ListaConexiones = signal<any[]>([]);
  get ListaConexiones() { return this._ListaConexiones(); }
  private _tempData = signal<any[]>([]);
  get tempData() { return this._tempData(); }
  private _rowData = signal<any[]>([]);
  get rowData() { return this._rowData(); }
  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }

  public driver = undefined
  public drivers = []
  public hosts = []

  public status = [
    { id: true, name: 'ACTIVO' },
    { id: false, name: 'INACTIVO' },
  ]
  public protocolo = [
    { id: 1, name: 'HTTP' },
    { id: 2, name: 'HTTPS' },
  ]


  // public
  public mac
  public data: any
  public xrs = ''
  public host = ''
  public submitted = false;
  public loginForm: UntypedFormGroup;
  public contentHeader: object;
  public selected = [];
  public kitchenSinkRows: any;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  private _ListaAplicaciones = signal<any>(undefined);
  get ListaAplicaciones() { return this._ListaAplicaciones(); }

  public passwordTextType: boolean = false;

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }


  constructor(
    private comunicacionesService: ComunicationsService,
    private apiService: ApiService,
    private modalService: NgbModal,
    private conexionesService: ConexionesService,
    private ws: WsocketsService,
    private config: NgSelectConfig,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,
  ) {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }


  async ngOnInit() {
    await this.CargarDrivers()
    await this.ListarHostname()
    await this.CargarListaConexiones()
    await this.CargarListaAplicaciones()


    this.loginForm = this._formBuilder.group({
      id: ['', [Validators.required]],
      usuario: ['', [Validators.required]],
      basedatos: ['', [Validators.required]],
      url: [''],
      estatus: [undefined, [Validators.required]],
      driver: [undefined, [Validators.required]],
      clave: ['', [Validators.required]],
      protocolo: [''],
      host: [undefined, [Validators.required]],
      aplicacion: [''],
      puerto: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
    });

    this.loginForm.get('driver')!.valueChanges.subscribe(val =>
      this.CambiarVisibilidadDriver(val)
    );

    // content header
    this.contentHeader = {
      headerTitle: 'Conexiones',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Principal',
            isLink: true,
            link: '/home'
          },
          {
            name: 'Redes',
            isLink: false
          },
          {
            name: 'Conexiones',
            isLink: false
          }
        ]
      }
    };
  }



  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this._tempData().filter(function (d) {
      return d.descripcion.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this._rowData.set(temp);
    this._count.set(this._rowData().length)
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterDriver(event: any) {
    const val = event ? event.id.toLowerCase() : '';
    // filter our data
    const temp = this._tempData().filter(function (d) {
      return d.driver.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this._rowData.set(temp);
    this._count.set(this._rowData().length)
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async CargarDrivers() {
    await this.comunicacionesService.ListarDrivers().subscribe(
      (data) => {
        this.drivers = data
      },
      (error) => {
        console.error(error)
      }
    )
  }

  LimpiarForm() {
    this.loginForm = this._formBuilder.group({
      usuario: ['', [Validators.required]],
      identificador: ['', [Validators.required]],
      basedatos: ['', [Validators.required]],
      url: ['', [Validators.required]],
      estatus: ['', [Validators.required]],
      driver: ['', [Validators.required]],
      clave: ['', [Validators.required]],
      host: ['', [Validators.required]],
      puerto: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
    });
  }

  async CargarListaConexiones() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_DRIVERS;
    this.xAPI.parametros = ''
    this._ListaConexiones.set([])
    this._count.set(0)
    this._isLoading.set(true);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this._rowData.set(data);
        this._tempData.set(this._rowData());
        this._count.set(this._rowData().length)
        this._isLoading.set(false);
      },
      (error) => {
        console.log(error)
        this._isLoading.set(false);
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

  CambiarVisibilidadDriver(e: any) {
    if (e == "puenteurl") {
      this.showBaseDatos = false
      this.showPuente = true
    } else {
      this.showBaseDatos = true
      this.showPuente = false
    } if (e === 'oracle19c') {
      this.lbd = "Oracle_SID"
    } else {
      this.lbd = "Base de Datos"
    } if (e == null) {
      this.showBaseDatos = false
      this.showPuente = false
    }
  }

  ModalEdit(modal, data) {
    this.loginForm = this._formBuilder.group({
      id: [data.id, [Validators.required]],
      usuario: [data.usuario, [Validators.required]],
      basedatos: [data.basedatos, [Validators.required]],
      url: [data.url],
      estatus: [data.estatus, [Validators.required]],
      driver: [data.driver, [Validators.required]],
      clave: [data.clave, [Validators.required]],
      protocolo: [data.protocolo],
      host: [data.host, [Validators.required]],
      puerto: [data.puerto, [Validators.required]],
      descripcion: [data.descripcion, [Validators.required]],
      aplicacion: [data.aplicacion],
    });
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalEscaneo(modal, data) {
    this.data = data
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  async EvaluarConexion() {
    if (this.loginForm.value.basedatos == undefined || this.loginForm.value.clave == undefined || this.loginForm.value.basedatos === "" || this.loginForm.value.clave === "") {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe introducir los datos para establecer la conexión', 3000)
      return false;
    }
    await this.conexionesService.EvaluarConexion(this.loginForm.value, 'evaluarconexion').subscribe(
      (data) => {
        this.utilservice.AlertMini('top-end', 'success', data.msj, 3000)
      },
      (errot) => {
        this.utilservice.AlertMini('top-end', 'error', 'Error al momento de realizar la conexión, verifique e intente nuevamente', 3000)
      }
    )
  }

  ModalAdd(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  GuardarConexion() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        "coleccion": environment.colecciones.SYS_DRIVERS,
        "objeto": this.loginForm.value,
        "donde": JSON.stringify({ id: this.loginForm.value.id }),
        "driver": environment.driver.PRINCIPAL,
        "upsert": true
      }
      this._rowData.set([...this._rowData(), this._ListaConexiones()])
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this._ListaConexiones.set([])
          this.CargarListaConexiones()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end', 'success', `Tu (Conexión) ha sido registrada codigo: ${data.UpsertedID}`, 3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
        }
      )
    }
  }

  EditarDispositivo() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        "coleccion": environment.colecciones.SYS_DRIVERS,
        "objeto": this.loginForm.value,
        "donde": JSON.stringify({ id: this.loginForm.value.id }),
        "driver": environment.driver.PRINCIPAL,
        "upsert": true
      }
      this._rowData.set([...this._rowData(), this._ListaConexiones()])
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this._ListaConexiones.set([])
          this.CargarListaConexiones()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end', 'success', `Tu (Conexión) ha sido actualizada`, 3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
        }
      )

    }
  }

  async CargarListaAplicaciones() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = environment.functions.LISTAR_APLICACIONES;
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this._ListaAplicaciones.set(data.Cuerpo.map(e => {
          e.name = e.nombre + ' : ' + e.VERSION
          return e
        }));
      },
      (error) => {
        console.log(error)
      }
    )
  }

}
