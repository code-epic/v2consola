import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, signal, ViewEncapsulation, ChangeDetectorRef } from '@angular/core'
import { Subscription } from 'rxjs'
import { ApiService, IAPICore, WkfDescripcionRed, WkfEstado, WkfEstatus, WkfFrom, WkfZRed, wkfRed, wkfTransicion } from '@services/apicore/api.service'
import { ComunicacionesService } from '@services/comunicaciones/comunicaciones.service'
import { UtilService } from '@services/util/util.service'
import { Wdefinicion, WorkflowService } from '@services/workflow/workflow.service'
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable'
import Swal from 'sweetalert2'
import Stepper from 'bs-stepper'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';

export interface MapaRedRow {
  origen_id: string;
  origen_area: string;
  estatus_origen_id: string;
  estatus_origen: string;
  transicion_valida: string | null;
  transicion_valida_desc: string | null;
  destino_valido_id: string;
  destino_valido_area: string;
  estatus_destino_valido_id: string;
  estatus_destino_valido: string;
  destino_falso_id: string | null;
  destino_falso_area: string | null;
  estatus_destino_falso_id: string | null;
  estatus_destino_falso: string | null;
  transicion_falsa: string | null;
  transicion_falsa_desc: string | null;
}

export interface FsmNode {
  key: string;
  estadoId: string;
  area: string;
  estatusId: string;
  estatus: string;
  inDegree: number;
  outDegree: number;
  inFalseDegree: number;
  role: 'INICIAL' | 'INTERMEDIO' | 'FINAL' | 'RECHAZO' | 'AISLADO';
}

export interface FsmArc {
  id: string;
  tipo: 'VALIDO' | 'FALSO';
  fromKey: string;
  toKey: string;
  fromEstadoId: string;
  fromArea: string;
  fromEstatus: string;
  toEstadoId: string;
  toArea: string;
  toEstatus: string;
  transicion: string | null;
  transicionDesc: string | null;
  esDirecta: boolean;
  esAutoRetorno: boolean;
  esDesvioRechazo: boolean;
}

export interface FsmTraceStep {
  node: FsmNode;
  arcToNext?: FsmArc;
  falseArc?: FsmArc;
}

export interface FsmStatusItem {
  key: string;
  estatusId: string;
  estatus: string;
  role: 'INICIAL' | 'INTERMEDIO' | 'FINAL' | 'RECHAZO' | 'AISLADO';
  siArc?: FsmArc;
  noArc?: FsmArc;
  siEsInterno: boolean;
}

export interface FsmStateSegment {
  estadoId: string;
  area: string;
  role: 'INICIAL' | 'INTERMEDIO' | 'FINAL' | 'AISLADO';
  estatuses: FsmStatusItem[];
  outgoingCrossArc?: FsmArc;
}

export interface PetriSwimlane {
  estadoId: string;
  area: string;
  role: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PetriPlace {
  key: string;
  estadoId: string;
  area: string;
  estatusId: string;
  estatus: string;
  role: 'INICIAL' | 'INTERMEDIO' | 'FINAL' | 'RECHAZO' | 'AISLADO';
  cx: number;
  cy: number;
  r: number;
  hasSelfLoopNo: boolean;
}

export interface PetriTransitionNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  desc: string;
  hasFunc: boolean;
}

export interface PetriEdge {
  id: string;
  kind: 'SI' | 'NO' | 'LOOP';
  path: string;
  label: string;
  labelX: number;
  labelY: number;
  tooltip: string;
}

export interface PetriDiagramLayout {
  width: number;
  height: number;
  swimlanes: PetriSwimlane[];
  places: PetriPlace[];
  transitions: PetriTransitionNode[];
  edges: PetriEdge[];
}

export interface FsmGraphAnalysis {
  nodes: FsmNode[];
  arcs: FsmArc[];
  validArcs: FsmArc[];
  falseArcs: FsmArc[];
  rejectionRoutes: FsmArc[];
  initialNodes: FsmNode[];
  finalNodes: FsmNode[];
  traces: FsmTraceStep[][];
  segments: FsmStateSegment[];
  stats: {
    totalEstados: number;
    totalArcos: number;
    arcosValidos: number;
    arcosFalsos: number;
    desviosRechazo: number;
    conTransicion: number;
    directos: number;
    cadenasConectadas: number;
  };
}

@Component({
    selector: 'app-workflow',
    templateUrl: './workflow.component.html',
    styleUrls: ['./workflow.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CoreDirectivesModule,
        CorePipesModule,
        NgbModule,
        NgxDatatableModule,
        NgSelectModule,
        ContentHeaderComponent,
    ]
})
export class WorkflowComponent implements OnInit, OnDestroy {

  @ViewChild(DatatableComponent) table: DatatableComponent
  private msjTextSub?: Subscription;
  private isLoadingRedDefinition = false;

  private horizontalWizardStepper: Stepper;

  public contentHeader: object

  //  Interface de APICORE
  public xAPI: IAPICore = {
    funcion: '',
    relacional: false,
    concurrencia: false,
    retorna: false,
    migrar: false,
    parametros: '',
    modulo: '',
    valores: {},
    logs: false,
    cache: 0,
    estatus: false
  }

  //  Interface de WKF-ESTADOS
  public wkfEstado: WkfEstado = {
    wkf: 0,
    nombre: '',
    descripcion: '',
    estatus: 0
  }

  public wkfForm: WkfFrom = {
    wkf: 0,
    nombre: '',
    descripcion: '',
    tipo: '',
    data: 0,
    origen: '',
    file: '',
    listado: '',
    estatus: 0
  }

  //  Interface WKF-ESTATUS
  public wkfEstatus: WkfEstatus = {
    nombre: "",
    descripcion: "",
    estatus: 0,
    estado: 0,
    orden: 0,
  }

  // Interface Transición
  public wkfTransicion: wkfTransicion = {
    idw: 0,
    funcion: undefined,
    parametro: ''
  }

  // Interface Red
  public wkfRed: wkfRed = {
    idred: 0,
    estadoOrigen: undefined,
    estatusOrigen: undefined,
    transicionVerdadero: undefined,
    estadoDestinoVerdadero: undefined,
    estatusDestinoVerdadero: undefined,
    estadoDestinoFalso: undefined,
    estatusDestinoFalso: undefined,
    transicionFalsa: undefined,
    descripcion: '',
    usuario: '',
    nombre: '',
    estatus: undefined
  }

  public DescripcionRed: WkfDescripcionRed = {
    nombre: '',
    descripcion: '',
    tipo: 0,
    usuario: '',
    fecha: ''
  }

  public idRed: number = 0;
  public isRedSaved: boolean = false;
  public isSavingEstatus: boolean = false;
  public ListaRedes: any[] = [];
  redSeleccionadaCtrl = new FormControl<any>(null);
  public fsmAnalysis: FsmGraphAnalysis = {
    nodes: [],
    arcs: [],
    validArcs: [],
    falseArcs: [],
    rejectionRoutes: [],
    initialNodes: [],
    finalNodes: [],
    traces: [],
    segments: [],
    stats: {
      totalEstados: 0,
      totalArcos: 0,
      arcosValidos: 0,
      arcosFalsos: 0,
      desviosRechazo: 0,
      conTransicion: 0,
      directos: 0,
      cadenasConectadas: 0,
    },
  };
  public showSelfLoops: boolean = true;
  public diagramViewMode: 'petri' | 'json' = 'petri';
  public exportableJsonText: string = '';
  public petriDiagram: PetriDiagramLayout = {
    width: 900,
    height: 360,
    swimlanes: [],
    places: [],
    transitions: [],
    edges: [],
  };

  public ZRed: WkfZRed = {
    idred: 0,
    idw: 0
  }

  //  Lista de Niveles de Estatus
  public niveles = [
    { id: "1", descripcion: 'SUPERIOR' },
    { id: "0", descripcion: 'SISTEMA' },
    { id: "2", descripcion: 'SUBSISTEMA' },
  ]
  // Lista de Tipos de Arquitectura

  public xtipo = ''
  public lstTipo = [
    { id: "0", descripcion: 'TEXTO' },
    { id: "1", descripcion: 'LISTA' },
    { id: "2", descripcion: 'ARCHIVO' },
    { id: "3", descripcion: 'SERVICIO' },
    { id: "4", descripcion: 'OBSERVACIONES' },
    { id: "5", descripcion: 'IMAGEN' },
    { id: "6", descripcion: 'FECHA' },
  ]

  public xdatos_val: boolean = false
  public xdatos_api: boolean = false
  public xdatos_archivo: boolean = false
  public xdatos_defecto: boolean = false

  public xdatos = ''
  public xorigen = ''
  public lstDatos = [
    { id: "0", descripcion: 'ARCHIVO DE TEXTO' },
    { id: "1", descripcion: 'API REST-FULL' },
    { id: "1", descripcion: 'DATOS POR DEFECTO' },
  ]

  public lstAPI = []

  public tipos = [
    { id: "1", descripcion: 'DOCUMENTOS' },
    { id: "0", descripcion: 'SISTEMA' },
    { id: "2", descripcion: 'SERVIDORES' },
  ]
  public readonly lstOrdenBase: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public lstOrden: number[] = [...this.lstOrdenBase];
  public lstApps = []
  public dataModulo = []
  public Definicion = []
  public rowEstado: []
  public rowEstadoDF = []
  public rowEstatusDF = []
  public rowEstatus: []
  public rowEstatusRedV = []
  public rowEstatusRedF = []
  public ListaFunciones = []
  public tempData = []
  public rowForm = []
  public rowData = []
  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }
  public ListaTransiciones = []
  public rowDataTransiciones = []
  public tempDataTransiciones = []
  public ListaRed = []
  public rowDataRed = []
  public tempDataRed = []

  public rowTipologia = [
    { id: 1, name: 'Acción' },
    { id: 2, name: 'Área' }
  ]
  public rowStatus = [
    { id: 1, name: 'Activo' },
    { id: 0, name: 'Inactivo' }
  ]

  public showWKF: boolean = false
  public estado = undefined
  public orden = undefined
  public xidW: number = 0
  public sectionConsultar: string = ''
  public estatus = undefined
  public aplicacion: string = undefined
  public xdrivers: string = undefined
  public xmodulo: string = undefined
  public drivers: any
  public nombre: string = ''
  public descripcion: string = ''
  public isBtnSalvar: boolean = true
  public isDisabledInput: boolean = false
  public isButtonVisibleSalvar: boolean = false
  public isButtonVisibleUpdate: boolean = false

  aplicacionCtrl = new FormControl(undefined)
  xmoduloCtrl = new FormControl(undefined)
  xdriversCtrl = new FormControl(undefined)
  nombreCtrl = new FormControl('')
  descripcionCtrl = new FormControl('')
  xtipoCtrl = new FormControl('')
  xdatosCtrl = new FormControl('')
  xorigenCtrl = new FormControl('')
  estatusCtrl = new FormControl(undefined)
  estadoCtrl = new FormControl(undefined)
  ordenCtrl = new FormControl(undefined)

  // FormControls migrados desde ngModel
  wkfFormNombreCtrl = new FormControl('')
  wkfFormDescripcionCtrl = new FormControl('')
  wkfEstadoNombreCtrl = new FormControl('')
  wkfEstadoDescripcionCtrl = new FormControl('')
  wkfEstatusNombreCtrl = new FormControl('')
  wkfEstatusDescripcionCtrl = new FormControl('')
  wkfTransicionFuncionCtrl = new FormControl(undefined)
  wkfTransicionParametroCtrl = new FormControl('')
  descripcionRedNombreCtrl = new FormControl('')
  descripcionRedTipoCtrl = new FormControl(0)
  descripcionRedEstatusCtrl = new FormControl(0)
  descripcionRedDescripcionCtrl = new FormControl('')
  wkfRedEstadoOrigenCtrl = new FormControl(undefined)
  wkfRedEstatusOrigenCtrl = new FormControl(undefined)
  wkfRedTransicionVCtrl = new FormControl(undefined)
  wkfRedEstadoDestVCtrl = new FormControl(undefined)
  wkfRedEstatusDestVCtrl = new FormControl(undefined)
  wkfRedEstadoDestFCtrl = new FormControl(undefined)
  wkfRedEstatusDestFCtrl = new FormControl(undefined)
  wkfRedTransicionFCtrl = new FormControl(undefined)

  constructor(
    private utilservice: UtilService,
    private apiService: ApiService,
    private comunicacionesService: ComunicacionesService,
    private wkf: WorkflowService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    this.msjTextSub = this.wkf.msjText$.subscribe(e => {
      if (!e || e === 'CLEAN') {
        this.rowEstado = [];
        this.rowDataTransiciones = [];
        this.rowDataRed = [];
        this.ListaRedes = [];
        return;
      }
      const idStr = String(e);
      this.xidW = parseInt(idStr, 10);
      this.lstEstados(idStr);
      this.lstTranscion(idStr);
      this.CargarListaRedes(true);
    });
    this.lstAplicaciones();
    this.CargarDrivers();
    this.CargarListaFunciones();

    // content header
    this.contentHeader = {
      headerTitle: 'Herramientas',
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
            name: 'Herramientas',
            isLink: false
          },
          {
            name: 'WorkFlow',
            isLink: false
          }
        ]
      }
    }

  }

  ngOnDestroy(): void {
    this.msjTextSub?.unsubscribe();
  }

  //  Carga la Lista de las Funciones
  async CargarListaFunciones() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "SSB_LFunciones"
    this.xAPI.parametros = ''
    this.ListaFunciones = []
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.map(e => {
          this.ListaFunciones.push(e)
        })
      },
      (error) => {
        console.log(error)
      }
    )
  }

  // Carga la Lista de Redes existentes (WKF_CRed: id, nomb, obse, tipo, fech, usua)
  CargarListaRedes(autoSelectFirst: boolean = false) {
    const xAPI: IAPICore = {
      funcion: 'WKF_CRed',
      parametros: '',
      valores: {},
    };
    this.apiService.Ejecutar(xAPI).subscribe({
      next: (data: any) => {
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.Cuerpo)
            ? data.Cuerpo
            : [];
        this.ListaRedes = rows;

        if (autoSelectFirst) {
          const candidateIds = Array.from(
            new Set([
              ...rows.map((r: any) => String(r.id)),
              ...(this.xidW > 0 ? [String(this.xidW)] : []),
            ]),
          ).filter((id) => !!id && id !== '0');

          if (candidateIds.length > 0) {
            this.probarCandidatosRed(candidateIds, 0);
          }
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[WorkflowComponent] Error cargando WKF_CRed:', error);
      },
    });
  }

  private probarCandidatosRed(candidates: string[], index: number) {
    if (index >= candidates.length) return;
    const candidateId = candidates[index];
    const xAPI: IAPICore = {
      funcion: 'WKF_CMapaRed',
      parametros: candidateId,
      valores: {},
    };
    this.apiService.Ejecutar(xAPI).subscribe({
      next: (data: any) => {
        const rawRows = Array.isArray(data?.Cuerpo)
          ? data.Cuerpo
          : Array.isArray(data)
            ? data
            : data?.Cuerpo
              ? [data.Cuerpo]
              : data
                ? [data]
                : [];
        const petriPayload = this.extractPetriJsonPayload(data, rawRows);
        const normalized = petriPayload
          ? this.mapPetriJsonToRows(petriPayload)
          : rawRows.map((r: any) => this.normalizeMapaRedRow(r));

        if (normalized.length > 0 || index === candidates.length - 1) {
          // Seleccionar el primer candidato con datos (o el primero si ninguno tiene reglas aún)
          const chosenId = normalized.length > 0 ? candidateId : candidates[0];
          const foundRed = this.ListaRedes.find((r) => String(r.id) === String(chosenId));
          if (foundRed) {
            this.seleccionarRedExistente(String(foundRed.id));
          } else {
            this.lstRed(chosenId);
          }
        } else {
          this.probarCandidatosRed(candidates, index + 1);
        }
      },
      error: () => {
        this.probarCandidatosRed(candidates, index + 1);
      },
    });
  }

  getTipologiaName(tipo: any): string {
    const found = this.rowTipologia.find((t) => Number(t.id) === Number(tipo));
    return found ? found.name : '';
  }

  seleccionarRedExistente(event: any) {
    const rawId =
      event && typeof event === 'object'
        ? (event.id ?? event.$ngOptionValue ?? event.value ?? this.redSeleccionadaCtrl.value)
        : (event !== undefined ? event : this.redSeleccionadaCtrl.value);
    const redId = rawId !== null && rawId !== undefined ? String(rawId).trim() : '';

    if (!redId) {
      this.nuevaRed();
      return;
    }
    const red = this.ListaRedes.find((r) => String(r.id) === redId);
    if (!red) return;

    const parsedId = parseInt(String(red.id), 10);
    this.idRed = isNaN(parsedId) ? 0 : parsedId;
    this.isRedSaved = true;
    this.redSeleccionadaCtrl.setValue(String(red.id), { emitEvent: false });

    this.descripcionRedNombreCtrl.setValue(red.nomb || '');
    this.descripcionRedDescripcionCtrl.setValue(red.obse || '');
    this.descripcionRedTipoCtrl.setValue(
      red.tipo !== undefined && red.tipo !== null ? Number(red.tipo) : null,
    );
    this.descripcionRedNombreCtrl.disable();
    this.descripcionRedDescripcionCtrl.disable();
    this.descripcionRedTipoCtrl.disable();

    this.DescripcionRed = {
      nombre: red.nomb || '',
      descripcion: red.obse || '',
      tipo: Number(red.tipo) || 0,
      usuario: red.usua || '',
      fecha: red.fech || '',
    };

    if (this.idRed > 0) {
      this.lstRed(this.idRed.toString());
    }
    this.cdr.detectChanges();
  }

  nuevaRed() {
    this.redSeleccionadaCtrl.setValue(null, { emitEvent: false });
    this.idRed = 0;
    this.isRedSaved = false;
    this.descripcionRedNombreCtrl.enable();
    this.descripcionRedDescripcionCtrl.enable();
    this.descripcionRedTipoCtrl.enable();
    this.descripcionRedNombreCtrl.setValue('');
    this.descripcionRedDescripcionCtrl.setValue('');
    this.descripcionRedTipoCtrl.setValue(null);
    this.DescripcionRed = {
      nombre: '',
      descripcion: '',
      tipo: 0,
      usuario: '',
      fecha: '',
    };
    this.rowDataRed = [];
    this.fsmAnalysis = this.analizarMapaRed([]);
    this.petriDiagram = this.buildPetriDiagram(this.fsmAnalysis);
  }

  // Carga la Lista de las Apliaciones
  async lstAplicaciones() {
    this.lstApps = []
    // console.info('llego lista aplicaciones')
    this.xAPI.funcion = "SEC_CAplicaciones"
    this.xAPI.parametros = ''
    this.xAPI.valores = null
    this._isLoading.set(true);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstApps = data.Cuerpo
        this._isLoading.set(false);
      },
      (error) => {
        console.error(error)
        this._isLoading.set(false);
      }
    )
  }

  private syncDisabledState() {
    const action = this.isDisabledInput ? 'disable' : 'enable'
    this.aplicacionCtrl[action]()
    this.xdriversCtrl[action]()
    this.nombreCtrl[action]()
    this.descripcionCtrl[action]()
  }

  // Lista los Modulos 
  selModulo(): void {
    let app = this.aplicacionCtrl.value.split('|')
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "LstModulos"
    this.xAPI.parametros = app[0]
    this.dataModulo = []


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.dataModulo.push({ id: e.id, name: e.nomb })
        })
      },
      (error) => {
        console.error(error)
      }
    )
  }

  selTipo(): void {
    this.visibleFalse()
    if (this.xtipoCtrl.value == "1") {
      this.xdatos_val = true
    }
    if (this.xdatos_val) this.xdatosCtrl.enable(); else this.xdatosCtrl.disable()
  }

  visibleFalse() {
    this.xdatos_val = false
    this.xdatos_api = false
    this.xdatos_archivo = false
    this.xdatos_defecto = false
    this.xdatosCtrl.disable()
    this.xorigenCtrl.disable()
  }

  selOrigen(): void {
    this.xdatos_api = false
    this.xdatos_archivo = false
    this.xdatos_defecto = false
    switch (this.xdatosCtrl.value) {
      case "1":
        this.xdatos_api = true
        break;

      default:
        break;
    }
    if (this.xdatos_api) this.xorigenCtrl.enable(); else this.xorigenCtrl.disable()
  }
  //  Consula la Red y la Carga
  consultarRed() {
    if (!this.aplicacionCtrl.value || !this.xmoduloCtrl.value || this.isLoadingRedDefinition) {
      return;
    }
    this.isLoadingRedDefinition = true;
    const app = String(this.aplicacionCtrl.value).split('|');
    this.apiService.hash = app[1];

    const xAPI: IAPICore = {
      funcion: 'WKF_CDefinicion',
      parametros: app[0],
      valores: {},
    };

    this.apiService.Ejecutar(xAPI).subscribe(
      (data) => {
        this.isLoadingRedDefinition = false;
        this.isBtnSalvar = false;
        if (data?.Cuerpo != undefined) {
          if (data.Cuerpo.length == 0) {
            this.CargarListaRedes();
            return;
          }
          this.showWKF = true;
          this.wkf.msjText$.emit(data.Cuerpo[0].wkf);
          let obj = data.Cuerpo[0];
          this.isBtnSalvar = false;
          this.isDisabledInput = true;
          this.syncDisabledState();
          this.isButtonVisibleSalvar = true;
          this.isButtonVisibleUpdate = true;
          this.nombreCtrl.setValue(obj.nomb);
          this.xdriversCtrl.setValue(obj.driver);
          this.descripcionCtrl.setValue(obj.obse);
        }
      },
      (err) => {
        this.isLoadingRedDefinition = false;
        console.error(err)
      }
    )
  }

  // Carga la lista de los Drivers
  async CargarDrivers() {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "LESBDrivers"
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.drivers = data.filter(e => {
          return e.driver.indexOf('mysql') == 0
        })
      },
      (error) => { console.log(error) }
    )
  }

  // Limpiar los Registros de la Interface de Registrar WorkFlow
  limpiarRegistroWKF() {
    this.isBtnSalvar = true
    this.isDisabledInput = false
    this.syncDisabledState()
    this.isButtonVisibleSalvar = false
    this.isButtonVisibleUpdate = false
    this.nombreCtrl.setValue('')
    this.descripcionCtrl.setValue('')
    this.aplicacionCtrl.setValue(undefined)
    this.xmoduloCtrl.setValue(undefined)
    this.xdriversCtrl.setValue(undefined)
    this.showWKF = false
  }

  //  Salva el registro del WorkFlow
  salvar() {
    var ObjSalvar = {
      'aplicacion': parseInt(this.aplicacionCtrl.value.split('|')[0]),
      'modulo': parseInt(this.xmoduloCtrl.value),
      'nombre': this.nombreCtrl.value,
      'descripcion': this.descripcionCtrl.value,
      'driver': this.xdriversCtrl.value
    }
    this.Definicion.push(ObjSalvar)
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = 'WKF_IDefinicion'
    this.xAPI.valores = JSON.stringify(ObjSalvar)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.utilservice.AlertMini('top-end', 'success', 'WorkFlow Creado Exitosamente', 3000)
          this.aplicacionCtrl.setValue(undefined)
          this.xmoduloCtrl.setValue(undefined)
          this.nombreCtrl.setValue('')
          this.descripcionCtrl.setValue('')
          this.xdriversCtrl.setValue(undefined)
          this.lstAplicaciones()
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'Oops, Algo salio mal!', 3000)
        }
      },
      (err) => {
        console.error(err)
      }
    )
  }


  Guardar(): any {
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = 'WKF_IEstados'
    const estado = {
      wkf: this.xidW,
      nombre: this.wkfEstadoNombreCtrl.value,
      descripcion: this.wkfEstadoDescripcionCtrl.value,
      estatus: parseInt(this.estatusCtrl.value)
    }
    this.xAPI.valores = JSON.stringify(estado)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj, 'Estado')
        this.lstEstados(this.xidW.toString())
        this.limpiarEstados()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  isOrdenUsado(orden: any): boolean {
    if (orden === null || orden === undefined || orden === '') return false;
    const target = Number(orden);
    return (this.rowEstatus || []).some((r: any) => Number(r?.idc) === target);
  }

  GuardarEstatus(): any {
    if (this.isSavingEstatus) return;

    const estadoId = parseInt(String(this.estadoCtrl.value ?? ''), 10);
    const nombre = (this.wkfEstatusNombreCtrl.value || '').toString().trim();
    const descripcion = (this.wkfEstatusDescripcionCtrl.value || '').toString().trim();
    const orden = parseInt(String(this.ordenCtrl.value ?? ''), 10);

    if (isNaN(estadoId)) {
      this.utilservice.AlertMini('top-end', 'warning', 'Seleccione primero el Estado Origen', 2500);
      return;
    }
    if (!nombre) {
      this.utilservice.AlertMini('top-end', 'warning', 'Ingrese el nombre del estatus', 2500);
      return;
    }
    if (isNaN(orden)) {
      this.utilservice.AlertMini('top-end', 'warning', 'Seleccione un número de orden (IDC)', 2500);
      return;
    }
    if (this.isOrdenUsado(orden)) {
      this.utilservice.AlertMini('top-end', 'warning', `El orden #${orden} ya está en uso para este estado`, 3000);
      return;
    }

    this.isSavingEstatus = true;
    const estatus = {
      nombre,
      descripcion,
      estado: estadoId,
      estatus: this.estatusCtrl.value,
      orden,
    };
    const xAPI: IAPICore = {
      funcion: 'WKF_IEstatus',
      parametros: '',
      valores: JSON.stringify(estatus),
    };

    this.apiService.Ejecutar(xAPI).subscribe(
      (data) => {
        this.utilservice.AlertMini(
          'top-end',
          'success',
          data?.msj ? `Estatus registrado (#${data.msj})` : 'Estatus registrado exitosamente',
          2500,
        );
        this.limpiarEstatus();
        this.lstEstatus();
      },
      (err) => {
        this.isSavingEstatus = false;
        console.error('[WorkflowComponent] Error en WKF_IEstatus:', err);
        this.utilservice.AlertMini('top-end', 'error', 'No se pudo registrar el estatus', 3000);
        this.cdr.detectChanges();
      }
    );
  }

  Ok(id: any, title: string) {
    Swal.fire({
      title: `Creando ${title} del Workflow`,
      text: `El ${title} ha sido creado con exito (#" ${id} ") `,
      icon: "info",
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar / Continuar",
      cancelButtonText: "No",
    }).then((result) => {
      if (!result.isConfirmed) return
    })
  }

  lstEstados(idw: string): any {
    const xAPI: IAPICore = {
      funcion: 'WKF_CEstados',
      parametros: idw,
      valores: {},
    };
    this.apiService.Ejecutar(xAPI).subscribe(
      (data) => {
        this.rowEstado = data?.Cuerpo || []
        window.sessionStorage.setItem('estados', JSON.stringify(this.rowEstado))
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarEstados() {
    this.wkfEstadoNombreCtrl.setValue('')
    this.wkfEstadoDescripcionCtrl.setValue('')
    this.estatusCtrl.setValue(undefined)
    this.rowEstado = []
    this.wkf.msjText$.emit(this.xidW.toString())
    this.lstEstados(this.xidW.toString())
  }

  lstEstatus(event?: any): any {
    const rawVal =
      event && typeof event === 'object'
        ? (event.id ?? event.$ngOptionValue ?? event.value ?? this.estadoCtrl.value)
        : (event !== undefined ? event : this.estadoCtrl.value);
    const estadoVal = rawVal !== null && rawVal !== undefined ? String(rawVal).trim() : '';

    if (!estadoVal) {
      this.rowEstatus = [];
      this.lstOrden = [...this.lstOrdenBase];
      this.ordenCtrl.setValue(undefined);
      this.isSavingEstatus = false;
      this.cdr.detectChanges();
      return;
    }

    const xAPI: IAPICore = {
      funcion: 'WKF_CEstatus',
      parametros: estadoVal,
      valores: {},
    };
    this.apiService.Ejecutar(xAPI).subscribe(
      (data: any) => {
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.Cuerpo)
            ? data.Cuerpo
            : [];
        const sorted = [...rows].sort((a, b) => Number(a?.idc || 0) - Number(b?.idc || 0));
        this.rowEstatus = sorted as any;

        // Quitar del combo Orden todos los idc que ya están en uso en este estado
        const usados = new Set(
          sorted
            .map((r: any) => Number(r?.idc))
            .filter((n: number) => !isNaN(n) && n > 0),
        );
        this.lstOrden = this.lstOrdenBase.filter((n) => !usados.has(n));
        if (
          this.ordenCtrl.value !== null &&
          this.ordenCtrl.value !== undefined &&
          usados.has(Number(this.ordenCtrl.value))
        ) {
          this.ordenCtrl.setValue(undefined);
        }

        this.isSavingEstatus = false;
        this.cdr.detectChanges();
      },
      (err) => {
        this.isSavingEstatus = false;
        console.error('[WorkflowComponent] Error en WKF_CEstatus:', err);
        this.cdr.detectChanges();
      }
    );
  }

  lstEstatusRedV(event): any {
    this.rowEstatusRedV = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusRedV.push(e)
        })
      },
      (err) => {
        console.error(err)
      }
    )
  }
  lstEstatusRedF(event): any {
    this.rowEstatusRedF = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusRedF.push(e)
        })
      },
      (err) => {
        console.error(err)
      }
    )
  }
  lstEstatusRedDF(event): any {
    this.rowEstatusDF = []
    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = event
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {
          this.rowEstatusDF.push(e)
        })
      },
      (err) => {
        console.error(err)
      }
    )
  }

  lstTranscion(e: any): any {
    this.ListaTransiciones = []
    const xAPI: IAPICore = {
      funcion: 'WKF_RTransicion',
      parametros: e,
      valores: {},
    };
    this.apiService.Ejecutar(xAPI).subscribe(
      (data) => {
        (data?.Cuerpo || []).map(item => {
          this.ListaTransiciones.push(item)
        })
        this.rowDataTransiciones = this.ListaTransiciones
        this.tempDataTransiciones = this.rowDataTransiciones
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarEstatus() {
    this.wkfEstatusNombreCtrl.setValue('')
    this.wkfEstatusDescripcionCtrl.setValue('')
    this.ordenCtrl.setValue(undefined)
  }

  abrirModal(modalPrimary) {
    this.modalService.open(modalPrimary, {
      centered: true,
      windowClass: 'fondo-modal modal-pastel-card',
      size: 'lg',
      backdrop: false,
      keyboard: false,
    });
  }

  onCloseClick(event: Event) {
    this.modalService.dismissAll();
  }

  EliminarEstatus(estatus: any) {
    Swal.fire({
      title: "Esta seguro?",
      html: `Eliminar el estatus <font><strong>${estatus.nomb}</strong></font> ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (!result.isConfirmed) return
    })
  }

  GuardarTransaccion() {
    const transicion = {
      idw: this.xidW,
      funcion: this.wkfTransicionFuncionCtrl.value,
      parametro: this.wkfTransicionParametroCtrl.value
    }
    this.xAPI.funcion = "WKF_ITransicion"
    this.xAPI.valores = JSON.stringify(transicion)
    this.rowDataTransiciones = []
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj, 'Transición')
        this.lstTranscion(this.xidW.toString())
        this.limpiarTransicion()
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiarTransicion() {
    this.wkfTransicionFuncionCtrl.setValue(undefined)
    this.wkfTransicionParametroCtrl.setValue('')
  }

  private normalizeMapaRedRow(raw: any): MapaRedRow {
    const destFalsoId = raw?.destino_falso_id != null && raw?.destino_falso_id !== ''
      ? String(raw.destino_falso_id)
      : null;
    return {
      origen_id: String(raw?.origen_id ?? raw?.origen ?? ''),
      origen_area: String(raw?.origen_area ?? raw?.area_origen ?? '---'),
      estatus_origen_id: String(raw?.estatus_origen_id ?? raw?.so ?? ''),
      estatus_origen: String(raw?.estatus_origen ?? raw?.area_estatus ?? '---'),
      transicion_valida: raw?.transicion_valida ?? raw?.transicion_origen ?? null,
      transicion_valida_desc: raw?.transicion_valida_desc ?? raw?.transicion_origen_desc ?? null,
      destino_valido_id: String(raw?.destino_valido_id ?? raw?.destino_id ?? raw?.destino ?? ''),
      destino_valido_area: String(raw?.destino_valido_area ?? raw?.destino_area ?? raw?.area_destino ?? '---'),
      estatus_destino_valido_id: String(raw?.estatus_destino_valido_id ?? raw?.estatus_destino_id ?? raw?.sdv ?? ''),
      estatus_destino_valido: String(raw?.estatus_destino_valido ?? raw?.estatus_destino ?? '---'),
      destino_falso_id: destFalsoId,
      destino_falso_area: raw?.destino_falso_area || null,
      estatus_destino_falso_id: raw?.estatus_destino_falso_id != null ? String(raw.estatus_destino_falso_id) : null,
      estatus_destino_falso: raw?.estatus_destino_falso || null,
      transicion_falsa: raw?.transicion_falsa ?? raw?.transicion_destino ?? null,
      transicion_falsa_desc: raw?.transicion_falsa_desc ?? raw?.transicion_destino_desc ?? null,
    };
  }

  /**
   * Analiza el mapa de red (WKF_CMapaRed), identifica nodos (estado:estatus),
   * enlaza arcos válidos (✓) y arcos falsos/rechazo (✕), y reconstruye las trazas conectadas de la FSM.
   */
  analizarMapaRed(rows: MapaRedRow[]): FsmGraphAnalysis {
    const nodeMap = new Map<string, FsmNode>();
    const validArcs: FsmArc[] = [];
    const falseArcs: FsmArc[] = [];
    const validAdj = new Map<string, FsmArc[]>();
    const falseByOrigin = new Map<string, FsmArc>();

    const ensureNode = (
      estadoId: string,
      area: string,
      estatusId: string,
      estatus: string,
    ): FsmNode => {
      const key = `${estadoId}:${estatusId}`;
      let node = nodeMap.get(key);
      if (!node) {
        node = {
          key,
          estadoId,
          area,
          estatusId,
          estatus,
          inDegree: 0,
          outDegree: 0,
          inFalseDegree: 0,
          role: 'AISLADO',
        };
        nodeMap.set(key, node);
      }
      return node;
    };

    rows.forEach((r, idx) => {
      const fromNode = ensureNode(
        r.origen_id,
        r.origen_area,
        r.estatus_origen_id,
        r.estatus_origen,
      );
      const toValidNode = ensureNode(
        r.destino_valido_id,
        r.destino_valido_area,
        r.estatus_destino_valido_id,
        r.estatus_destino_valido,
      );

      fromNode.outDegree++;
      toValidNode.inDegree++;

      const validArc: FsmArc = {
        id: `V:${fromNode.key}->${toValidNode.key}#${idx}`,
        tipo: 'VALIDO',
        fromKey: fromNode.key,
        toKey: toValidNode.key,
        fromEstadoId: fromNode.estadoId,
        fromArea: fromNode.area,
        fromEstatus: fromNode.estatus,
        toEstadoId: toValidNode.estadoId,
        toArea: toValidNode.area,
        toEstatus: toValidNode.estatus,
        transicion: r.transicion_valida,
        transicionDesc: r.transicion_valida_desc,
        esDirecta: !r.transicion_valida,
        esAutoRetorno: fromNode.key === toValidNode.key,
        esDesvioRechazo: false,
      };
      validArcs.push(validArc);

      const vList = validAdj.get(fromNode.key) || [];
      vList.push(validArc);
      validAdj.set(fromNode.key, vList);

      // Rama Falsa / Rechazo (edf / sdf / tre)
      if (r.destino_falso_id && r.destino_falso_area) {
        const toFalseNode = ensureNode(
          r.destino_falso_id,
          r.destino_falso_area,
          r.estatus_destino_falso_id || '0',
          r.estatus_destino_falso || '---',
        );
        const esAuto = fromNode.key === toFalseNode.key;
        if (!esAuto) {
          toFalseNode.inFalseDegree++;
        }

        const falseArc: FsmArc = {
          id: `F:${fromNode.key}->${toFalseNode.key}#${idx}`,
          tipo: 'FALSO',
          fromKey: fromNode.key,
          toKey: toFalseNode.key,
          fromEstadoId: fromNode.estadoId,
          fromArea: fromNode.area,
          fromEstatus: fromNode.estatus,
          toEstadoId: toFalseNode.estadoId,
          toArea: toFalseNode.area,
          toEstatus: toFalseNode.estatus,
          transicion: r.transicion_falsa,
          transicionDesc: r.transicion_falsa_desc,
          esDirecta: !r.transicion_falsa,
          esAutoRetorno: esAuto,
          esDesvioRechazo: !esAuto,
        };
        falseArcs.push(falseArc);
        falseByOrigin.set(fromNode.key, falseArc);
      }
    });

    const nodes = Array.from(nodeMap.values());
    nodes.forEach((n) => {
      if (n.inDegree === 0 && n.outDegree > 0) n.role = 'INICIAL';
      else if (n.inDegree === 0 && n.outDegree === 0 && n.inFalseDegree > 0) n.role = 'RECHAZO';
      else if (n.inDegree > 0 && n.outDegree === 0) n.role = 'FINAL';
      else if (n.inDegree > 0 && n.outDegree > 0) n.role = 'INTERMEDIO';
      else n.role = 'AISLADO';
    });

    const initialNodes = nodes.filter((n) => n.role === 'INICIAL');
    const finalNodes = nodes.filter((n) => n.role === 'FINAL');
    const rejectionRoutes = falseArcs.filter((a) => a.esDesvioRechazo);

    // Reconstruir trazas principales conectadas mediante DFS (adjuntando rama falsa en cada paso)
    const traces: FsmTraceStep[][] = [];
    const startNodes = initialNodes.length > 0 ? initialNodes : nodes.slice(0, 1);

    const dfs = (
      current: FsmNode,
      path: FsmTraceStep[],
      visitedKeys: Set<string>,
    ) => {
      const outgoing = validAdj.get(current.key) || [];
      const falseArc = falseByOrigin.get(current.key);

      if (outgoing.length === 0) {
        traces.push([...path, { node: current, falseArc }]);
        return;
      }

      let extended = false;
      for (const arc of outgoing) {
        const nextNode = nodeMap.get(arc.toKey);
        if (!nextNode) continue;

        if (visitedKeys.has(nextNode.key)) {
          traces.push([
            ...path,
            { node: current, arcToNext: arc, falseArc },
            { node: nextNode, falseArc: falseByOrigin.get(nextNode.key) },
          ]);
          extended = true;
          continue;
        }

        const nextVisited = new Set(visitedKeys);
        nextVisited.add(nextNode.key);
        dfs(
          nextNode,
          [...path, { node: current, arcToNext: arc, falseArc }],
          nextVisited,
        );
        extended = true;
      }

      if (!extended) {
        traces.push([...path, { node: current, falseArc }]);
      }
    };

    for (const start of startNodes) {
      dfs(start, [], new Set([start.key]));
    }

    const allArcs = [...validArcs, ...falseArcs];
    const conTransicion = allArcs.filter((a) => !a.esDirecta).length;

    // Agrupar en Segmentos por Estado (MEF unificada: Estado -> Estatus internos -> Decisiones SI / NO)
    const segMap = new Map<string, FsmStateSegment>();
    const validByOrigin = new Map<string, FsmArc>();
    validArcs.forEach((a) => validByOrigin.set(a.fromKey, a));

    // Ordenar los segmentos siguiendo el orden de aparición en las trazas principales
    const orderedEstadoIds: string[] = [];
    traces.forEach((trace) => {
      trace.forEach((step) => {
        if (!orderedEstadoIds.includes(step.node.estadoId)) {
          orderedEstadoIds.push(step.node.estadoId);
        }
      });
    });
    nodes.forEach((n) => {
      if (!orderedEstadoIds.includes(n.estadoId)) {
        orderedEstadoIds.push(n.estadoId);
      }
    });

    orderedEstadoIds.forEach((estId) => {
      const stateNodes = nodes
        .filter((n) => n.estadoId === estId)
        .sort((a, b) => Number(a.estatusId || 0) - Number(b.estatusId || 0));
      if (stateNodes.length === 0) return;

      const estatuses: FsmStatusItem[] = stateNodes.map((n) => {
        const siArc = validByOrigin.get(n.key);
        const noArc = falseByOrigin.get(n.key);
        return {
          key: n.key,
          estatusId: n.estatusId,
          estatus: n.estatus,
          role: n.role,
          siArc,
          noArc,
          siEsInterno: !!siArc && siArc.toEstadoId === n.estadoId,
        };
      });

      const outgoingCrossArc = validArcs.find(
        (a) => a.fromEstadoId === estId && a.toEstadoId !== estId,
      );
      const hasInitial = stateNodes.some((n) => n.role === 'INICIAL');
      const hasFinal = stateNodes.some((n) => n.role === 'FINAL');
      const segRole: 'INICIAL' | 'INTERMEDIO' | 'FINAL' | 'AISLADO' = hasInitial
        ? 'INICIAL'
        : hasFinal && !outgoingCrossArc
          ? 'FINAL'
          : 'INTERMEDIO';

      segMap.set(estId, {
        estadoId: estId,
        area: stateNodes[0].area,
        role: segRole,
        estatuses,
        outgoingCrossArc,
      });
    });

    const segments = orderedEstadoIds
      .map((id) => segMap.get(id))
      .filter((s): s is FsmStateSegment => !!s);

    return {
      nodes,
      arcs: allArcs,
      validArcs,
      falseArcs,
      rejectionRoutes,
      initialNodes,
      finalNodes,
      traces,
      segments,
      stats: {
        totalEstados: segments.length,
        totalArcos: allArcs.length,
        arcosValidos: validArcs.length,
        arcosFalsos: falseArcs.length,
        desviosRechazo: rejectionRoutes.length,
        conTransicion,
        directos: validArcs.filter((a) => a.esDirecta).length,
        cadenasConectadas: traces.length,
      },
    };
  }

  /**
   * Construye las coordenadas SVG de la Red de Petri (Lugares, Transiciones, Swimlanes y Arcos Bézier SI/NO).
   */
  buildPetriDiagram(analysis: FsmGraphAnalysis): PetriDiagramLayout {
    const segments = analysis.segments || [];
    if (segments.length === 0) {
      return { width: 900, height: 320, swimlanes: [], places: [], transitions: [], edges: [] };
    }

    const COL_W = 240;
    const COL_GAP = 140;
    const PAD_X = 32;
    const LANE_TOP = 24;
    const HEADER_H = 44;
    const ROW_H = 165;
    const R = 26;

    const maxRows = Math.max(1, ...segments.map((s) => s.estatuses.length));
    const laneH = HEADER_H + maxRows * ROW_H + 36;
    const totalW = PAD_X * 2 + segments.length * COL_W + Math.max(0, segments.length - 1) * COL_GAP;
    const totalH = LANE_TOP + laneH + 54;

    const swimlanes: PetriSwimlane[] = [];
    const places: PetriPlace[] = [];
    const placeMap = new Map<string, PetriPlace>();
    const transitions: PetriTransitionNode[] = [];
    const edges: PetriEdge[] = [];

    segments.forEach((seg, colIdx) => {
      const x = PAD_X + colIdx * (COL_W + COL_GAP);
      swimlanes.push({
        estadoId: seg.estadoId,
        area: seg.area,
        role: seg.role,
        x,
        y: LANE_TOP,
        width: COL_W,
        height: laneH,
      });

      seg.estatuses.forEach((st, rowIdx) => {
        const cx = x + COL_W / 2;
        const cy = LANE_TOP + HEADER_H + 64 + rowIdx * ROW_H;
        const place: PetriPlace = {
          key: st.key,
          estadoId: seg.estadoId,
          area: seg.area,
          estatusId: st.estatusId,
          estatus: st.estatus,
          role: st.role,
          cx,
          cy,
          r: R,
          hasSelfLoopNo: !!st.noArc?.esAutoRetorno,
        };
        places.push(place);
        placeMap.set(place.key, place);
      });
    });

    // 1. Arcos Válidos (SI) con barra de Transición de Red de Petri
    analysis.validArcs.forEach((arc, idx) => {
      const from = placeMap.get(arc.fromKey);
      const to = placeMap.get(arc.toKey);
      if (!from || !to) return;

      const labelText = arc.transicion || 'Directa';
      const tw = Math.min(132, Math.max(76, labelText.length * 7.2 + 20));
      const th = 26;
      const sameCol = Math.abs(from.cx - to.cx) < 10;

      if (sameCol) {
        // Transición vertical interna dentro del mismo Estado (ej: Recibido -> Conformacion)
        const tx = from.cx;
        const ty = (from.cy + to.cy) / 2 + 12;
        transitions.push({
          id: `T-V-${idx}`,
          x: tx - tw / 2,
          y: ty - th / 2,
          width: tw,
          height: th,
          label: labelText,
          desc: arc.transicionDesc || 'Transición directa (SI)',
          hasFunc: !arc.esDirecta,
        });

        // Arco Place Origen -> Transición (saliendo por debajo del texto del lugar)
        const startY = from.cy + R + 28;
        const endTransY = ty - th / 2 - 2;
        edges.push({
          id: `E-V1-${idx}`,
          kind: 'SI',
          path: `M ${from.cx} ${startY} L ${tx} ${endTransY}`,
          label: '',
          labelX: tx,
          labelY: (startY + endTransY) / 2,
          tooltip: arc.transicionDesc || 'Entrada a transición',
        });

        // Arco Transición -> Place Destino
        const startTransY = ty + th / 2;
        const endY = to.cy - R - 4;
        edges.push({
          id: `E-V2-${idx}`,
          kind: 'SI',
          path: `M ${tx} ${startTransY} L ${to.cx} ${endY}`,
          label: 'SI',
          labelX: tx + 18,
          labelY: (startTransY + endY) / 2,
          tooltip: `SI → ${to.area} · ${to.estatus}`,
        });
      } else {
        // Transición horizontal entre segmentos (ej: ENTRADA -> CONFORMACION -> GERENTE)
        const goRight = to.cx > from.cx;
        const startX = goRight ? from.cx + R + 4 : from.cx - R - 4;
        const endX = goRight ? to.cx - R - 6 : to.cx + R + 6;
        const tx = (startX + endX) / 2;
        const ty = (from.cy + to.cy) / 2;

        transitions.push({
          id: `T-H-${idx}`,
          x: tx - tw / 2,
          y: ty - th / 2,
          width: tw,
          height: th,
          label: labelText,
          desc: arc.transicionDesc || 'Transición directa (SI)',
          hasFunc: !arc.esDirecta,
        });

        const tInX = goRight ? tx - tw / 2 - 2 : tx + tw / 2 + 2;
        const tOutX = goRight ? tx + tw / 2 : tx - tw / 2;
        const c1x = (startX + tInX) / 2;
        const c2x = (tOutX + endX) / 2;

        edges.push({
          id: `E-H1-${idx}`,
          kind: 'SI',
          path: `M ${startX} ${from.cy} C ${c1x} ${from.cy}, ${c1x} ${ty}, ${tInX} ${ty}`,
          label: '',
          labelX: c1x,
          labelY: from.cy - 8,
          tooltip: arc.transicionDesc || 'Entrada a transición',
        });

        edges.push({
          id: `E-H2-${idx}`,
          kind: 'SI',
          path: `M ${tOutX} ${ty} C ${c2x} ${ty}, ${c2x} ${to.cy}, ${endX} ${to.cy}`,
          label: 'SI',
          labelX: (tOutX + endX) / 2,
          labelY: (ty + to.cy) / 2 - 10,
          tooltip: `SI → ${to.area} · ${to.estatus}`,
        });
      }
    });

    // 2. Arcos Falsos (NO): Desvíos de rechazo (curva Bézier inferior limpia) + Auto-retornos (↺)
    analysis.falseArcs.forEach((arc, idx) => {
      const from = placeMap.get(arc.fromKey);
      const to = placeMap.get(arc.toKey);
      if (!from || !to) return;

      if (arc.esAutoRetorno) {
        const lx1 = from.cx - 12;
        const ly = from.cy - R - 1;
        const lx2 = from.cx + 12;
        edges.push({
          id: `E-L-${idx}`,
          kind: 'LOOP',
          path: `M ${lx1} ${ly} C ${from.cx - 28} ${ly - 30}, ${from.cx + 28} ${ly - 30}, ${lx2} ${ly - 2}`,
          label: 'NO ↺',
          labelX: from.cx,
          labelY: ly - 24,
          tooltip: `NO: permanece en ${from.area} · ${from.estatus}`,
        });
      } else {
        // Curva elegante por debajo o lateral sin cruzar los nodos principales
        const goLeft = to.cx < from.cx;
        const startX = goLeft ? from.cx - R - 2 : from.cx + R + 2;
        const startY = from.cy + 8;
        const endX = goLeft ? to.cx + R + 6 : to.cx - R - 6;
        const endY = to.cy + 4;
        const midX = (startX + endX) / 2;
        const curveY = Math.max(startY, endY) + 56;

        edges.push({
          id: `E-N-${idx}`,
          kind: 'NO',
          path: `M ${startX} ${startY} C ${startX} ${curveY}, ${endX} ${curveY}, ${endX} ${endY}`,
          label: arc.transicion ? `NO · ${arc.transicion}` : 'NO · Rechazo',
          labelX: midX,
          labelY: curveY - 12,
          tooltip: `NO → ${to.area} · ${to.estatus}${arc.transicion ? ' (' + arc.transicion + ')' : ''}`,
        });
      }
    });

    return {
      width: totalW,
      height: totalH,
      swimlanes,
      places,
      transitions,
      edges,
    };
  }

  toggleSelfLoops() {
    this.showSelfLoops = !this.showSelfLoops;
  }

  setDiagramViewMode(mode: 'petri' | 'json') {
    this.diagramViewMode = mode;
    if (mode === 'json' && !this.exportableJsonText) {
      this.exportableJsonText = JSON.stringify(this.buildExportableJson(), null, 2);
    }
  }

  buildExportableJson(): any {
    const appRaw = String(this.aplicacionCtrl.value || '').split('|')[0];
    const redNombre = this.descripcionRedNombreCtrl.value || this.DescripcionRed.nombre || 'Red';
    const redDesc = this.descripcionRedDescripcionCtrl.value || this.DescripcionRed.descripcion || '';
    const redTipo = this.descripcionRedTipoCtrl.value ?? this.DescripcionRed.tipo;

    return {
      schema: 'sandra.workflow.mef-petri/v1',
      generado_en: new Date().toISOString(),
      workflow: {
        id: this.xidW || 0,
        nombre: this.nombreCtrl.value || '',
        descripcion: this.descripcionCtrl.value || '',
        aplicacion: appRaw || '',
      },
      red: {
        id: this.idRed || this.xidW || 0,
        nombre: redNombre,
        tipologia: this.getTipologiaName(redTipo) || redTipo || '',
        descripcion: redDesc,
      },
      resumen: {
        segmentos_estados: this.fsmAnalysis.stats.totalEstados,
        lugares_estatus: this.fsmAnalysis.nodes.length,
        flujos_si: this.fsmAnalysis.stats.arcosValidos,
        desvios_no: this.fsmAnalysis.stats.desviosRechazo,
        transiciones_con_funcion: this.fsmAnalysis.stats.conTransicion,
        trazas_conectadas: this.fsmAnalysis.stats.cadenasConectadas,
      },
      petri_net: {
        segmentos: this.fsmAnalysis.segments.map((seg) => ({
          estado_id: seg.estadoId,
          area: seg.area,
          rol: seg.role,
          lugares: seg.estatuses.map((st) => ({
            key: st.key,
            estatus_id: st.estatusId,
            estatus: st.estatus,
            rol: st.role,
            token_inicial: st.role === 'INICIAL',
            si: st.siArc
              ? {
                  destino: st.siArc.toKey,
                  estado_id: st.siArc.toEstadoId,
                  area: st.siArc.toArea,
                  estatus: st.siArc.toEstatus,
                  interno: st.siEsInterno,
                  transicion: st.siArc.transicion || 'Directa',
                  descripcion: st.siArc.transicionDesc,
                }
              : null,
            no: st.noArc
              ? {
                  destino: st.noArc.toKey,
                  estado_id: st.noArc.toEstadoId,
                  area: st.noArc.toArea,
                  estatus: st.noArc.toEstatus,
                  auto_retorno: st.noArc.esAutoRetorno,
                  transicion: st.noArc.transicion || null,
                  descripcion: st.noArc.transicionDesc,
                }
              : null,
          })),
        })),
        arcos: this.fsmAnalysis.arcs.map((a) => ({
          id: a.id,
          decision: a.tipo === 'VALIDO' ? 'SI' : 'NO',
          origen: { key: a.fromKey, area: a.fromArea, estatus: a.fromEstatus },
          destino: { key: a.toKey, area: a.toArea, estatus: a.toEstatus },
          transicion: a.transicion || 'Directa',
          descripcion: a.transicionDesc,
          auto_retorno: a.esAutoRetorno,
          desvio_rechazo: a.esDesvioRechazo,
        })),
        trazas: this.fsmAnalysis.traces.map((trace, idx) => ({
          traza: idx + 1,
          ruta: trace.map((step) => `${step.node.area}:${step.node.estatus}`),
        })),
      },
    };
  }

  copiarJsonRed() {
    const text = this.exportableJsonText || JSON.stringify(this.buildExportableJson(), null, 2);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.utilservice.AlertMini('top-end', 'success', 'JSON de Red de Petri copiado al portapapeles', 2200);
      });
    }
  }

  descargarJsonRed() {
    const payload = this.buildExportableJson();
    const jsonStr = JSON.stringify(payload, null, 2);
    this.exportableJsonText = jsonStr;
    const safeName = (payload.red.nombre || 'Workflow_Red').replace(/[^a-zA-Z0-9_-]+/g, '_');
    const fileName = `MEF_Petri_${safeName}_${payload.red.id || '0'}.json`;

    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    this.utilservice.AlertMini('top-end', 'success', `Descargado ${fileName}`, 2500);
  }

  descargarSvgRed() {
    const svgEl = document.querySelector('.petri-svg') as SVGSVGElement | null;
    if (!svgEl) {
      this.utilservice.AlertMini('top-end', 'warning', 'Cambie a la vista Diagrama para exportar el SVG', 2500);
      return;
    }
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
      text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .lane-bg { fill: #ffffff; stroke: #e2e8f0; stroke-width: 1.2; }
      .lane-header { fill: #f1f5f9; }
      .inicial .lane-header { fill: #ede9fe; }
      .final .lane-header { fill: #d1fae5; }
      .lane-id { font-size: 11px; font-weight: 700; fill: #5b4fd6; }
      .lane-title { font-size: 12px; font-weight: 700; fill: #1e293b; }
      .petri-arc.si { stroke: #10b981; stroke-width: 2.2; fill: none; }
      .petri-arc.no { stroke: #ef4444; stroke-width: 2.2; stroke-dasharray: 6 4; fill: none; }
      .petri-arc.loop { stroke: #94a3b8; stroke-width: 1.5; stroke-dasharray: 3 3; fill: none; }
      .petri-arc-label { font-size: 10.5px; font-weight: 700; }
      .petri-arc-label.si { fill: #047857; }
      .petri-arc-label.no { fill: #dc2626; }
      .petri-arc-label.loop { fill: #64748b; }
      .petri-trans-rect { fill: #ffffff; stroke: #334155; stroke-width: 1.8; }
      .has-fn .petri-trans-rect { fill: #7367f0; stroke: #5b4fd6; }
      .petri-trans-text { font-size: 10.5px; font-weight: 700; fill: #1e293b; font-family: monospace; }
      .has-fn .petri-trans-text { fill: #ffffff; }
      .petri-place-circle { fill: #ffffff; stroke: #64748b; stroke-width: 2.2; }
      .inicial .petri-place-circle { stroke: #7367f0; fill: #f5f3ff; }
      .intermedio .petri-place-circle { stroke: #0ea5e9; fill: #f0f9ff; }
      .final .petri-place-circle { stroke: #10b981; fill: #ecfdf5; }
      .rechazo .petri-place-circle { stroke: #ef4444; fill: #fef2f2; }
      .petri-place-inner-ring { stroke: #10b981; stroke-width: 1.6; fill: none; }
      .petri-token { fill: #7367f0; }
      .petri-place-id { font-size: 12px; font-weight: 700; fill: #334155; }
      .petri-place-name { font-size: 11.5px; font-weight: 700; fill: #1e293b; }
      .petri-place-role { font-size: 9px; font-weight: 700; fill: #64748b; }
    `;
    clone.insertBefore(styleEl, clone.firstChild);

    const svgStr = new XMLSerializer().serializeToString(clone);
    const redNombre = (this.descripcionRedNombreCtrl.value || this.DescripcionRed.nombre || 'Red').replace(/[^a-zA-Z0-9_-]+/g, '_');
    const fileName = `MEF_Petri_${redNombre}_${this.idRed || this.xidW || '0'}.svg`;

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    this.utilservice.AlertMini('top-end', 'success', `Diagrama exportado (${fileName})`, 2500);
  }

  private safeJsonParse(val: any): any {
    let current = val;
    let depth = 0;
    while (typeof current === 'string' && depth < 3) {
      const trimmed = current.trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) break;
      try {
        current = JSON.parse(trimmed);
        depth++;
      } catch (e) {
        console.error('[WorkflowComponent] Error en JSON.parse(petri_json):', e);
        break;
      }
    }
    if (current && typeof current === 'object') {
      if (typeof current.petri_net === 'string') {
        current.petri_net = this.safeJsonParse(current.petri_net);
      }
      if (typeof current.resumen === 'string') {
        current.resumen = this.safeJsonParse(current.resumen);
      }
      if (current.petri_net && typeof current.petri_net === 'object') {
        if (typeof current.petri_net.segmentos === 'string') {
          current.petri_net.segmentos = this.safeJsonParse(current.petri_net.segmentos);
        }
        if (typeof current.petri_net.arcos === 'string') {
          current.petri_net.arcos = this.safeJsonParse(current.petri_net.arcos);
        }
        if (typeof current.petri_net.trazas === 'string') {
          current.petri_net.trazas = this.safeJsonParse(current.petri_net.trazas);
        }
      }
    }
    return current;
  }

  private extractPetriJsonPayload(data: any, rawRows: any[]): any | null {
    // 1. Verificar explícitamente data.Cuerpo[0].petri_json
    const cuerpoFirst = Array.isArray(data?.Cuerpo) ? data.Cuerpo[0] : null;
    if (cuerpoFirst && cuerpoFirst.petri_json !== undefined && cuerpoFirst.petri_json !== null) {
      const parsed = this.safeJsonParse(cuerpoFirst.petri_json);
      console.log('[WKF_CMapaRed] Cuerpo[0].petri_json convertido a JSON:', parsed);
      return typeof parsed === 'object' ? parsed : null;
    }

    // 2. Verificar rawRows[0].petri_json
    if (Array.isArray(rawRows) && rawRows.length > 0 && rawRows[0]?.petri_json != null) {
      const parsed = this.safeJsonParse(rawRows[0].petri_json);
      console.log('[WKF_CMapaRed] rawRows[0].petri_json convertido a JSON:', parsed);
      return typeof parsed === 'object' ? parsed : null;
    }

    // 3. Verificar data.petri_json o data.petri_net directo
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (data.petri_json != null) {
        const parsed = this.safeJsonParse(data.petri_json);
        return typeof parsed === 'object' ? parsed : null;
      }
      if (data.petri_net != null) {
        return this.safeJsonParse(data);
      }
    }

    return null;
  }

  private mapPetriJsonToRows(payload: any): MapaRedRow[] {
    const petriNet = payload?.petri_net ?? payload;
    if (!petriNet || typeof petriNet !== 'object') return [];

    const rows: MapaRedRow[] = [];
    const segmentos = Array.isArray(petriNet.segmentos)
      ? petriNet.segmentos
      : Array.isArray(payload?.segmentos)
        ? payload.segmentos
        : [];

    // 1. Intentar leer desde segmentos[].lugares[] (o estatuses[] / nodos[])
    if (segmentos.length > 0) {
      segmentos.forEach((seg: any) => {
        const lugares = Array.isArray(seg?.lugares)
          ? seg.lugares
          : Array.isArray(seg?.estatuses)
            ? seg.estatuses
            : Array.isArray(seg?.nodos)
              ? seg.nodos
              : [];
        lugares.forEach((lugar: any) => {
          const siObj = lugar?.si ?? lugar?.valido ?? lugar?.destino_valido;
          const noObj = lugar?.no ?? lugar?.falso ?? lugar?.destino_falso;
          if (!siObj) return;

          const siDestinoKey = String(siObj.destino ?? siObj.key ?? '');
          const siParts = siDestinoKey.includes(':') ? siDestinoKey.split(':') : [];
          const noDestinoKey = String(noObj?.destino ?? noObj?.key ?? '');
          const noParts = noDestinoKey.includes(':') ? noDestinoKey.split(':') : [];

          const transVal =
            siObj.transicion && siObj.transicion !== 'Directa'
              ? String(siObj.transicion)
              : null;
          const transFal =
            noObj?.transicion && noObj.transicion !== 'Directa'
              ? String(noObj.transicion)
              : null;

          rows.push({
            origen_id: String(seg.estado_id ?? seg.estadoId ?? seg.id ?? ''),
            origen_area: String(seg.area ?? seg.nombre ?? '---'),
            estatus_origen_id: String(lugar.estatus_id ?? lugar.estatusId ?? lugar.id ?? ''),
            estatus_origen: String(lugar.estatus ?? lugar.nombre ?? '---'),
            transicion_valida: transVal,
            transicion_valida_desc: siObj.descripcion ?? null,
            destino_valido_id: String(siObj.estado_id ?? siObj.estadoId ?? siParts[0] ?? ''),
            destino_valido_area: String(siObj.area ?? '---'),
            estatus_destino_valido_id: String(siObj.estatus_id ?? siObj.estatusId ?? siParts[1] ?? ''),
            estatus_destino_valido: String(siObj.estatus ?? '---'),
            destino_falso_id: noObj ? String(noObj.estado_id ?? noObj.estadoId ?? noParts[0] ?? '') : null,
            destino_falso_area: noObj ? String(noObj.area ?? '') : null,
            estatus_destino_falso_id: noObj
              ? String(noObj.estatus_id ?? noObj.estatusId ?? noParts[1] ?? '')
              : null,
            estatus_destino_falso: noObj ? String(noObj.estatus ?? '') : null,
            transicion_falsa: transFal,
            transicion_falsa_desc: noObj?.descripcion ?? null,
          });
        });
      });
      if (rows.length > 0) return rows;
    }

    // 2. Respaldo: reconstruir desde petri_net.arcos[] (si segmentos no trajo .si/.no o vino null)
    const arcos = Array.isArray(petriNet.arcos)
      ? petriNet.arcos
      : Array.isArray(payload?.arcos)
        ? payload.arcos
        : [];
    if (arcos.length > 0 && arcos[0]?.origen_area !== undefined) {
      return arcos.map((r: any) => this.normalizeMapaRedRow(r));
    }

    const isSiArc = (a: any) => {
      const dec = String(a?.decision ?? a?.tipo ?? 'SI').toUpperCase();
      return dec === 'SI' || dec === 'VALIDO' || dec === 'TRUE';
    };
    const isNoArc = (a: any) => {
      const dec = String(a?.decision ?? a?.tipo ?? '').toUpperCase();
      return dec === 'NO' || dec === 'FALSO' || dec === 'FALSE';
    };

    const arcosSi = arcos.filter(isSiArc);
    const arcosNoByOrigen = new Map<string, any>();
    arcos.filter(isNoArc).forEach((a: any) => {
      const key = String(
        a?.origen?.key ??
          `${a?.origen?.estado_id ?? a?.origen_id ?? ''}:${a?.origen?.estatus_id ?? a?.estatus_origen_id ?? ''}`,
      );
      if (key && key !== ':') arcosNoByOrigen.set(key, a);
    });

    arcosSi.forEach((a: any) => {
      const oKey = String(
        a?.origen?.key ??
          `${a?.origen?.estado_id ?? a?.origen_id ?? ''}:${a?.origen?.estatus_id ?? a?.estatus_origen_id ?? ''}`,
      );
      const dKey = String(
        a?.destino?.key ??
          `${a?.destino?.estado_id ?? a?.destino_id ?? ''}:${a?.destino?.estatus_id ?? a?.estatus_destino_id ?? ''}`,
      );
      const oParts = oKey.split(':');
      const dParts = dKey.split(':');
      const noArc = arcosNoByOrigen.get(oKey);
      const fKey = String(
        noArc?.destino?.key ??
          `${noArc?.destino?.estado_id ?? noArc?.destino_id ?? ''}:${noArc?.destino?.estatus_id ?? noArc?.estatus_destino_id ?? ''}`,
      );
      const fParts = fKey.split(':');

      rows.push({
        origen_id: String(a?.origen?.estado_id ?? oParts[0] ?? ''),
        origen_area: String(a?.origen?.area ?? a?.origen_area ?? '---'),
        estatus_origen_id: String(a?.origen?.estatus_id ?? oParts[1] ?? ''),
        estatus_origen: String(a?.origen?.estatus ?? a?.estatus_origen ?? '---'),
        transicion_valida:
          a?.transicion && a.transicion !== 'Directa' ? String(a.transicion) : null,
        transicion_valida_desc: a?.descripcion ?? null,
        destino_valido_id: String(a?.destino?.estado_id ?? dParts[0] ?? ''),
        destino_valido_area: String(a?.destino?.area ?? a?.destino_area ?? '---'),
        estatus_destino_valido_id: String(a?.destino?.estatus_id ?? dParts[1] ?? ''),
        estatus_destino_valido: String(a?.destino?.estatus ?? a?.estatus_destino ?? '---'),
        destino_falso_id: noArc ? String(noArc?.destino?.estado_id ?? fParts[0] ?? '') : null,
        destino_falso_area: noArc ? String(noArc?.destino?.area ?? noArc?.destino_area ?? '') : null,
        estatus_destino_falso_id: noArc
          ? String(noArc?.destino?.estatus_id ?? fParts[1] ?? '')
          : null,
        estatus_destino_falso: noArc
          ? String(noArc?.destino?.estatus ?? noArc?.estatus_destino ?? '')
          : null,
        transicion_falsa:
          noArc?.transicion && noArc.transicion !== 'Directa'
            ? String(noArc.transicion)
            : null,
        transicion_falsa_desc: noArc?.descripcion ?? null,
      });
    });

    return rows;
  }

  lstRed(e: any): any {
    const idParam = String(e ?? '').trim();
    if (!idParam || idParam === '0') {
      this.ListaRed = [];
      this.rowDataRed = [];
      this.tempDataRed = [];
      this.fsmAnalysis = this.analizarMapaRed([]);
      this.petriDiagram = this.buildPetriDiagram(this.fsmAnalysis);
      this.exportableJsonText = '';
      this.cdr.detectChanges();
      return;
    }

    const xAPI: IAPICore = {
      funcion: 'WKF_CMapaRed',
      parametros: idParam,
      valores: {},
    };
    this.apiService.Ejecutar(xAPI).subscribe(
      (data: any) => {
        const rawRows = Array.isArray(data)
          ? data
          : Array.isArray(data?.Cuerpo)
            ? data.Cuerpo
            : data?.Cuerpo && typeof data.Cuerpo === 'object'
              ? [data.Cuerpo]
              : data && typeof data === 'object'
                ? [data]
                : [];

        const petriPayload = this.extractPetriJsonPayload(data, rawRows);
        const normalized: MapaRedRow[] = petriPayload
          ? this.mapPetriJsonToRows(petriPayload)
          : rawRows.map((r: any) => this.normalizeMapaRedRow(r));

        this.ListaRed = [...normalized];
        this.rowDataRed = [...normalized];
        this.tempDataRed = [...normalized];
        this.fsmAnalysis = this.analizarMapaRed(normalized);
        this.petriDiagram = this.buildPetriDiagram(this.fsmAnalysis);
        this.exportableJsonText = JSON.stringify(
          petriPayload ?? this.buildExportableJson(),
          null,
          2,
        );
        this.cdr.detectChanges();
      },
      (err) => {
        console.error('[WorkflowComponent] Error en WKF_CMapaRed:', err);
      }
    );
  }

  GuardarRed() {
    if (!this.wkfRedEstadoOrigenCtrl.value || !this.wkfRedEstatusOrigenCtrl.value) {
      this.utilservice.AlertMini(
        'top-end',
        'warning',
        'Seleccione el Estado y Estatus de origen antes de agregar la regla',
        3000,
      );
      return;
    }

    const targetIdRed = this.idRed > 0 ? this.idRed : this.xidW;
    const estadoOrigen = String(this.wkfRedEstadoOrigenCtrl.value);
    const estatusOrigen = String(this.wkfRedEstatusOrigenCtrl.value);
    const estadoDestinoVerdadero = String(this.wkfRedEstadoDestVCtrl.value || 0);
    const estatusDestinoVerdadero = String(this.wkfRedEstatusDestVCtrl.value || 0);
    const estadoDestinoFalso = String(this.wkfRedEstadoDestFCtrl.value || 0);
    const estatusDestinoFalso = String(this.wkfRedEstatusDestFCtrl.value || 0);
    const transV = this.wkfRedTransicionVCtrl.value
      ? parseInt(String(this.wkfRedTransicionVCtrl.value), 10)
      : 0;
    const transF = this.wkfRedTransicionFCtrl.value
      ? parseInt(String(this.wkfRedTransicionFCtrl.value), 10)
      : 0;

    const autoDescripcion = `R${targetIdRed}-O${estadoOrigen}.${estatusOrigen}-V${estadoDestinoVerdadero}.${estatusDestinoVerdadero}-F${estadoDestinoFalso}.${estatusDestinoFalso}`;

    const red = {
      idred: targetIdRed,
      estadoOrigen,
      estatusOrigen,
      transicionVerdadero: isNaN(transV) ? 0 : transV,
      estadoDestinoVerdadero,
      estatusDestinoVerdadero,
      estadoDestinoFalso,
      estatusDestinoFalso,
      transicionFalsa: isNaN(transF) ? 0 : transF,
      usuario: this.obtenerUsuarioActual(),
      descripcion: autoDescripcion,
    };

    const xAPI: IAPICore = {
      funcion: 'WKF_IRedDescripcion',
      parametros: '',
      valores: JSON.stringify(red),
    };
    this.apiService.Ejecutar(xAPI).subscribe(
      (data) => {
        this.utilservice.AlertMini(
          'top-end',
          'success',
          data?.msj || 'Regla de transición agregada a la red',
          3000,
        );
        this.lstRed(targetIdRed.toString());
        this.limpiarRed();
      },
      (err) => {
        console.error(err);
        this.utilservice.AlertMini(
          'top-end',
          'error',
          'No se pudo registrar la regla en la red',
          3000,
        );
      }
    );
  }

  limpiarRed() {
    this.wkfRedEstadoOrigenCtrl.setValue(undefined)
    this.wkfRedEstatusOrigenCtrl.setValue(undefined)
    this.wkfRedTransicionVCtrl.setValue(undefined)
    this.wkfRedEstadoDestVCtrl.setValue(undefined)
    this.wkfRedEstatusDestVCtrl.setValue(undefined)
    this.wkfRedEstadoDestFCtrl.setValue(undefined)
    this.wkfRedEstatusDestFCtrl.setValue(undefined)
    this.wkfRedTransicionFCtrl.setValue(undefined)
  }


  private obtenerUsuarioActual(): string {
    try {
      const token = sessionStorage.getItem('token');
      if (token && token.includes('.')) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (
          payload?.Usuario?.login ||
          payload?.Usuario?.usuario ||
          payload?.login ||
          payload?.usuario ||
          this.DescripcionRed.usuario ||
          'sistema'
        );
      }
    } catch {
      // fallback
    }
    return this.DescripcionRed.usuario || 'sistema';
  }

  salvarRed() {
    const nombre = (
      this.descripcionRedNombreCtrl.value ||
      this.DescripcionRed.nombre ||
      ''
    )
      .toString()
      .trim();
    const descripcion = (
      this.descripcionRedDescripcionCtrl.value ||
      this.DescripcionRed.descripcion ||
      ''
    )
      .toString()
      .trim();
    const tipoParsed = parseInt(
      String(this.descripcionRedTipoCtrl.value ?? this.DescripcionRed.tipo ?? 0),
      10,
    );

    if (!nombre) {
      this.utilservice.AlertMini('top-end', 'warning', 'Debe indicar el nombre de la red', 2500);
      return;
    }

    this.DescripcionRed = {
      nombre,
      descripcion,
      tipo: isNaN(tipoParsed) ? 0 : tipoParsed,
      usuario: this.obtenerUsuarioActual(),
      fecha: this.utilservice.FechaActual(),
    };

    this.xAPI = {} as IAPICore;
    this.xAPI.funcion = 'WKF_IRed';
    this.xAPI.parametros = '';
    this.xAPI.valores = JSON.stringify(this.DescripcionRed);

    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        if (data?.tipo == 1 || data?.tipo === undefined) {
          const parsedId = parseInt(String(data?.msj ?? '').trim(), 10);
          if (!isNaN(parsedId) && parsedId > 0) {
            this.idRed = parsedId;
            this.redSeleccionadaCtrl.setValue(String(this.idRed), { emitEvent: false });
          }
          this.isRedSaved = true;
          this.descripcionRedNombreCtrl.disable();
          this.descripcionRedDescripcionCtrl.disable();
          this.descripcionRedTipoCtrl.disable();
          this.CargarListaRedes();

          this.utilservice.AlertMini(
            'top-end',
            'success',
            this.idRed > 0
              ? `Red #${this.idRed} registrada y bloqueada`
              : data?.msj || 'Red registrada exitosamente',
            3000,
          );
        } else {
          this.utilservice.AlertMini(
            'top-end',
            'warning',
            data?.msj || 'No se pudo registrar la red',
            3000,
          );
        }
      },
      error: (err) => {
        console.error('[WorkflowComponent] Error en WKF_IRed:', err);
        this.utilservice.AlertMini(
          'top-end',
          'error',
          'Oops, algo salió mal al guardar la red',
          3000,
        );
      },
    });
  }

  addItemForm() {
    const item: WkfFrom = {
      wkf: this.xidW,
      nombre: this.wkfFormNombreCtrl.value,
      descripcion: this.wkfFormDescripcionCtrl.value,
      tipo: this.xtipoCtrl.value,
      data: parseInt(this.xdatosCtrl.value),
      origen: this.xorigenCtrl.value,
      file: '',
      listado: '',
      estatus: 1
    }
    this.rowForm.push(item)
    this.wkfFormNombreCtrl.setValue('')
    this.wkfFormDescripcionCtrl.setValue('')
    this.xtipoCtrl.setValue('')
    this.xdatosCtrl.setValue('')
    this.xorigenCtrl.setValue('')
  }


}
