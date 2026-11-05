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
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import JSONFormatter from 'json-formatter-js';


@Component({
    selector: 'app-communications',
    templateUrl: './communications.component.html',
    styleUrls: ['./communications.component.scss'],
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

export class CommunicationsComponent implements OnInit {

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

  searchValueCtrl = new FormControl('');
  basicSelectedOptionCtrl = new FormControl(10);
  sDispositivoCtrl = new FormControl(null);
  xrsCtrl = new FormControl({value: '', disabled: true});

  public selectedStatusFilter: string = 'all'; // 'all' | 'activos' | 'inactivos'

  get totalDispositivos(): number {
    return this._tempData() ? this._tempData().length : 0;
  }

  get totalActivos(): number {
    return this._tempData() ? this._tempData().filter(d => d.estatus === true || d.estatus == 1 || d.estatus === '1').length : 0;
  }

  get totalInactivos(): number {
    return this._tempData() ? this._tempData().filter(d => d.estatus === false || d.estatus == 0 || d.estatus === '0').length : 0;
  }

  setStatusFilter(filter: string) {
    this.selectedStatusFilter = filter;
    this.applyCombinedFilters();
  }

  clearSearch() {
    this.searchValueCtrl.setValue('');
    this.applyCombinedFilters();
  }

  applyCombinedFilters() {
    const val = (this.searchValueCtrl.value || '').toLowerCase().trim();
    const statusFilter = this.selectedStatusFilter;
    const tipo = this.sDispositivoCtrl.value;

    const filtered = (this._tempData() || []).filter(d => {
      // 1. Búsqueda en vivo
      if (val) {
        const host = (d.host || '').toLowerCase();
        const mac = (d.mac || '').toLowerCase();
        const desc = (d.descripcion || '').toLowerCase();
        const id = (d.id || '').toLowerCase();
        const matches = host.includes(val) || mac.includes(val) || desc.includes(val) || id.includes(val);
        if (!matches) return false;
      }

      // 2. Filtro de estado
      if (statusFilter === 'activos') {
        const isActive = d.estatus === true || d.estatus == 1 || d.estatus === '1';
        if (!isActive) return false;
      } else if (statusFilter === 'inactivos') {
        const isInactive = d.estatus === false || d.estatus == 0 || d.estatus === '0';
        if (!isInactive) return false;
      }

      // 3. Filtro de tipo de dispositivo
      if (tipo) {
        if (d.tipo !== tipo) return false;
      }

      return true;
    });

    this._rowData.set(filtered);
    this._count.set(filtered.length);
    if (this.table) {
      this.table.offset = 0;
    }
  }

  public searchValue = ''

  /**
   * Valida si una dirección MAC cumple con el formato estándar (XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX o XXXX.XXXX.XXXX)
   */
  isValidMac(mac: string | null | undefined): boolean {
    if (!mac || typeof mac !== 'string') {
      return false;
    }
    const cleanMac = mac.trim();
    if (!cleanMac) {
      return false;
    }
    const standardMac = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    const ciscoMac = /^[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}$/;
    return standardMac.test(cleanMac) || ciscoMac.test(cleanMac);
  }

  /**
   * Aplica la clase de tono mate vino a las filas cuya dirección MAC carece de formato
   */
  getRowClass = (row: any) => {
    return {
      'row-invalid-mac': !this.isValidMac(row?.mac)
    };
  };

  // Private
  private _count = signal<any>(undefined);
  get count() { return this._count(); }

  public titleModal

  public fnx

  private _ListaComunicaciones = signal<any[]>([]);
  get ListaComunicaciones() { return this._ListaComunicaciones(); }
  private _tempData = signal<any[]>([]);
  get tempData() { return this._tempData(); }
  private _rowData = signal<any[]>([]);
  get rowData() { return this._rowData(); }
  public isLoading: boolean = false;;

  public sDispositivo
  public hostIP

  public dispositivos = [
    { id: 'SRV', descripcion: 'SERVIDORES' },
    { id: 'ROU', descripcion: 'ROUTERS' },
    { id: 'SWI', descripcion: 'SWITCHES' },
    { id: 'IMP', descripcion: 'IMPRESORAS' },
    { id: 'LHU', descripcion: 'LECTOR BIOMETRICO' },
    { id: 'DVR', descripcion: 'DVR - CAMARAS' },
    { id: 'CIP', descripcion: 'CAMARAS IP' },
  ]

  public status = [
    { id: true, name: 'ACTIVO' },
    { id: false, name: 'INACTIVO' },
  ]

  public btnShow = false

  public btnShowScan = true

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


  constructor(
    private msjService: WsocketsService,
    private comunicacionesService: ComunicationsService,
    private apiService: ApiService,
    private modalService: NgbModal,
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

    await this.CargarLista()

    this.loginForm = this._formBuilder.group({
      host: ['', [Validators.required]],
      mac: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      id: ['', [Validators.required]],
      tipo: [undefined],
      estatus: [undefined],
    });

    this.msjService.lstpid$.subscribe(
      (e) => {
        this.xrsCtrl.setValue(e.rs)
        this.btnShow = true
      }
    )

    // content header
    this.contentHeader = {
      headerTitle: 'Comunicaciones',
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
            name: 'Comunicaciones',
            isLink: false
          }
        ]
      }
    };
  }



  filterUpdate(event: any) {
    this.applyCombinedFilters();
  }

  filterDispositivo(event: any) {
    this.applyCombinedFilters();
  }

  LimpiarForm() {
    this.submitted = false;
    this.btnShowScan = true;
    if (this.loginForm) {
      this.loginForm.reset({
        host: '',
        mac: '',
        descripcion: '',
        id: '',
        tipo: undefined,
        estatus: undefined,
      });
      this.loginForm.markAsPristine();
      this.loginForm.markAsUntouched();
    }
  }

  async CargarLista() {
    this.isLoading = true;
    this.xAPI.funcion = "_SYS_LstComunicaciones";
    this.xAPI.parametros = '';
    this._ListaComunicaciones.set([]);
    this._count.set(0);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this._ListaComunicaciones.set([...this._ListaComunicaciones(), data]);
        this._tempData.set(data || []);
        this.applyCombinedFilters();
        this.isLoading = false;
      },
      (error) => {
        console.log(error);
        this.isLoading = false;
      }
    );
  }

  ModalEdit(modal, data) {
    this.LimpiarForm();
    this.loginForm.patchValue({
      host: data.host || '',
      mac: data.mac || '',
      descripcion: data.descripcion || '',
      id: data.id || '',
      tipo: data.tipo,
      estatus: data.estatus,
    });
    const modalRef = this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal modal-pastel-card',
    });
    modalRef.result.then(
      () => this.LimpiarForm(),
      () => this.LimpiarForm()
    );
  }

  ModalEscaneo(modal, data) {
    this.hostIP = data.host
    this.titleModal = `IP: ${data.host} - ${data.descripcion}`
    this.btnShow = true
    this.data = data
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  async Nmap() {
    this.xrsCtrl.setValue('Escaneando red, por favor Espere...');
    this.btnShow = false;
    this.fnx = {
      'funcion': 'Fnx_NMap',
      'ip': this.hostIP
    };

    try {
      // Esperamos a que se complete la ejecución
      const data = await this.apiService.ExecFnx(this.fnx).toPromise();

      this.utilservice.AlertMini('top-end', 'success', 'Realizando Escaneo Nmap', 3000);

      // Esperamos a que se complete la consulta del PID
      const resultadoScan = await this.apiService.ConsultarPidScan(data.contenido.id, this.fnx);

      // Aquí puedes procesar el resultado del scan
      // console.log('Resultado del escaneo:', resultadoScan);
      this.xrsCtrl.setValue(resultadoScan.rs || 'No se encontraron resultados');
      this.btnShow = true; // Restablecer el botón cuando termine (éxito o error)

    } catch (error) {
      this.xrsCtrl.setValue('Error al escanear la red');
      this.btnShow = true; // Restablecer el botón en caso de error
      this.utilservice.AlertMini('top-end', 'error', 'Error al generar Nmap', 3000);
      // console.error('Error en Nmap:', error);
    } finally {
      this.btnShow = true; // Restablecer el botón cuando termine (éxito o error)
    }
  }

  async ScanRed() {
    this.xrsCtrl.setValue('Escaneando red, por favor Espere...');
    this.btnShow = false;
    this.fnx = {
      'funcion': 'Fnx_ScanRed',
    };

    try {
      // Convertimos el Observable a Promesa usando firstValueFrom (RxJS 7+)
      const data = await this.apiService.ExecFnx(this.fnx).toPromise();

      this.utilservice.AlertMini('top-end', 'success', 'Realizando Escaneo de Red', 3000);

      // Esperamos el resultado del escaneo
      const scanResult = await this.apiService.ConsultarPidScan(data.contenido.id, this.fnx);

      // Actualizamos la UI con el resultado
      this.xrsCtrl.setValue(scanResult.rs || 'Escaneo completado');
      // console.log(scanResult);

    } catch (error) {
      console.error('Error en ScanRed:', error);
      this.utilservice.AlertMini('top-end', 'error', 'Error al generar Escaneo de Red', 3000);
    } finally {
      this.btnShow = true; // Siempre restauramos el botón
    }
  }

  async ScanRedMac() {
    this.btnShowScan = false;
    this.fnx = {
      'funcion': 'Fnx_NMapAuto',
      'ip': this.loginForm.value.host
    };

    try {
      const data = await this.apiService.ExecFnx(this.fnx).toPromise();
      this.utilservice.AlertMini('top-end', 'success', 'Realizando Escaneo Nmap', 3000);

      const resultadoScan = await this.apiService.ConsultarPidScan(data.contenido.id, this.fnx);
      // console.log('Resultado completo:', resultadoScan); // Para depuración

      // Verifica si resultadoScan.rs existe y es un string
      if (resultadoScan?.rs) {
        const parsedData = JSON.parse(resultadoScan.rs);
        // console.log('Datos parseados:', parsedData); // Para depuración

        if (parsedData.active_connection) {
          this.loginForm.patchValue({
            host: parsedData.active_connection.ip,
            mac: parsedData.active_connection.mac
          });
          // console.log('Formulario actualizado:', this.loginForm.value);
        } else {
          throw new Error('El formato de active_connection no es válido');
        }
      } else {
        throw new Error('No se encontraron datos en resultadoScan.rs');
      }

      this.btnShowScan = true;

    } catch (error) {
      this.btnShowScan = false;
      this.utilservice.AlertMini('top-end', 'error', 'Error al generar Nmap', 3000);
      console.error('Error completo:', error);

      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
      }
    }
  }

  ModalAdd(modal) {
    this.LimpiarForm();
    const modalRef = this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal modal-pastel-card',
    });
    modalRef.result.then(
      () => this.LimpiarForm(),
      () => this.LimpiarForm()
    );
  }

  GuardarDispositivo() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      var obj = {
        "coleccion": "sys-conection",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this._rowData.set([...this._rowData(), this._ListaComunicaciones()])
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this._ListaComunicaciones.set([])
          this.CargarLista()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end', 'success', `Tu (Comunicacion) ha sido registrada codigo: ${data.UpsertedID}`, 3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
          // console.log(error)
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
        "coleccion": "sys-conection",
        "objeto": this.loginForm.value,
        "donde": `{\"id\":\"${this.loginForm.value.id}\"}`,
        "driver": "MGDBA",
        "upsert": true
      }
      this._rowData.set([...this._rowData(), this._ListaComunicaciones()])
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this._ListaComunicaciones.set([])
          this.CargarLista()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end', 'success', `Tu (Comunicacion) ha sido actualizada`, 3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
          // console.log(error)
        }
      )

    }
  }

}
