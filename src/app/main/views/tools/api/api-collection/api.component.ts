import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ApiService, IAPICore, ProcessID, RestoreAPI } from '@services/apicore/api.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { PdfService } from '@services/pdf/pdf.service';

import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { TaskService } from '@services/apicore/task.service';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})

export class ApiComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;

  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public codeMirrorOptions: any = {
    theme: 'idea',
    mode: 'text/x-idn',
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: true
  };



  public fnx

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

  public xRestore: RestoreAPI = {
    nombre: '',
    ruta: '',
    pass: '',
    basedatos: '',
    coleccion: '',
    funcion: '',
    user: ''
  }

  public searchValue = ''

  public developer
  public quality
  public production

  // Private
  public count

  public ListaApis = []
  public tempData = [];
  public rowData = [];

  public sDispositivo

  public driver = []

  public status = [
    { id: true, name: 'ACTIVO' },
    { id: false, name: 'INACTIVO' },
  ]

  public IExportAPI = {
    usuario: '',
    clave: ''
  }

  public archivos = []

  public rutaURL

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

  public driversAPP


  public xentorno
  resultado: any;
  xresultado: any;
  xparametro: string = ''
  valores: string = ''

  public llave: string
  public hashcontrol: string

  public urlControl = ''

  public pID: ProcessID = {
    id: "",
    estatus: false,
    mensaje: "",
    segundos: "",
    contenido: "",
  };


  constructor(
    private rutaActiva: ActivatedRoute,
    private apiService: ApiService,
    private modalService: NgbModal,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,
    private pdf: PdfService,
    private taskService: TaskService,
    private msjService: WsocketsService,
  ) {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }


  async ngOnInit() {
    this.llave = this.utilservice.GenerarUnicId();
    this.hashcontrol = btoa("ING" + this.llave);
    this.urlControl = this.rutaActiva.snapshot.params.id
    let id = atob(this.urlControl).split('|')

    this.driversAPP = id[0]
    let url = id[1]
    await this.ListarApis(this.driversAPP)


    this.loginForm = this._formBuilder.group({
      host: ['', [Validators.required]],
      mac: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      id: ['', [Validators.required]],
      tipo: [undefined],
      estatus: [undefined],
    });

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
            name: 'Aplicaciones',
            isLink: true,
            link: '/tools/applications'
          },
          {
            name: 'Api',
            isLink: true,
            link: '/tools/applications/' + url
          },
          {
            name: 'Detalle',
            isLink: false
          },
        ]
      }
    };
  }

  async ListarApis(t: string) {

    if (t == "") return
    this.developer = []
    this.xAPI.funcion = '_SYS_R_ListarApis'
    this.xAPI.parametros = t
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      async data => {
        // console.log(data)
        if (data == null) return

        await data.map(e => {
          e.descripcion = e.descripcion == undefined ? '' : e.descripcion
          this.developer.push(e)
        })
        this.rowData = this.developer;
        this.count = this.rowData.length
        this.tempData = this.rowData;
      },
      (error) => {
        console.error(error)
      }
    );
  }

  async ExportApi() {
 
    let nameFnx = 'Fnx_ExportarAPI'
    this.fnx = {
      'funcion': nameFnx,
      'basedatos': 'code-epic',
      'user': this.IExportAPI.usuario,
      'pass': this.IExportAPI.clave,
      'driver': this.driversAPP,
      'file_name' : environment.driver.API_CORE_ZIP
    };
    await Swal.fire({
      title: `Va a descargar la coleccion de API `,
      text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Descargar!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.ExecFnx(this.fnx).subscribe(
          (data) => {
            // console.log(data);
            this.pID.id = data.contenido.id;
            this.pID.estatus = true;
            this.msjService.lstpid$.emit(this.pID);
            this.modalService.dismissAll()
            this.taskService
              .set(data.contenido.id, nameFnx, 'Descargando api')
              .then((e) => {
                this.apiService.ConsultarPidRecursivo(
                  data.contenido.id,
                  'Descargando api'
                );
              })
              .catch((e) => console.log(e));

             
              
           
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });



  }

  ListadoApis() {
    this.pdf.ListadoDeApis(this.rowData)
  }

  async ImportApi() {
    const { value: file } = await Swal.fire({
      title: 'Sube el documento',
      input: 'file',
      inputAttributes: {
        'accept': 'application/zip',
        'aria-label': 'Upload your profile picture'
      }
    })

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Swal.fire({
        //   title: 'Your uploaded picture',
        //   imageUrl: e.target.result,
        //   imageAlt: 'The uploaded picture'
        // })
      }
      reader.readAsDataURL(file)
    }
  }



  

  rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.funcion.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  filterStatus(event: any) {
    const val = event.id
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.estatus.indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  LimpiarForm() {
    this.loginForm = this._formBuilder.group({
      host: ['', [Validators.required]],
      mac: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      id: ['', [Validators.required]],
      tipo: [undefined],
      estatus: [undefined],
    });
  }


  async CargarLista() {
    this.xAPI.funcion = "_SYS_LstComunicaciones";
    this.xAPI.parametros = ''
    this.ListaApis = []
    this.count = 0
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.ListaApis.push(data);
        this.rowData = data;
        this.count = this.rowData.length
        this.tempData = this.rowData;
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ModalEditApi(modal, data) {
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


  fileSelected(e) {
    this.archivos.push(e.target.files[0])
  }

  async SubirArchivo(e) {
    this.hashcontrol = btoa( environment.driver.API_CORE_ZIP )
    var frm = new FormData(document.forms.namedItem("forma"))
    try {
      await this.apiService.EnviarArchivos(frm).subscribe(
        (data) => {
         this.ValoresMasivos()
         this.modalService.dismissAll('Close')
        }
      )
    } catch (error) {
      console.error(error)
    }

  }





  ValoresMasivos() {
    let cargaMasiva = {
      codigo: this.llave,
      ruta: this.hashcontrol,
      nombre: this.archivos[0].name,
      funcion: "SetPath",
      inicio: this.utilservice.FechaActual(0),
      fin: this.utilservice.FechaActual(0),
      tipo: 'ZIP',
      sistema: 'CORE',
      contenido: 'Importar API',
      cantidad: 0,
      estatus: 0,
      usuario: environment.Hash,
    };
    this.xAPI.funcion = environment.functions.INSERT_FILE_PATH;
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(cargaMasiva);

    document.forms.namedItem("forma").reset();

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.ObtenerNombreArchivo()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end', 'success', 'Archivo Subido Exitosamente', 3000)
        } else {
          this.utilservice.AlertMini('top-end', 'error', 'El archivo no pudo ser subido, por favor verifica e intente de nuevo', 3000)
        }
      },
      (errot) => {
        console.log(errot);
        this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
      }
    );
  }

  ObtenerNombreArchivo() {
    this.xAPI.funcion = environment.functions.GET_FILE_NAME;
    this.xAPI.parametros = this.llave;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.Cuerpo.length > 0) {
          this.xRestore.nombre = data.Cuerpo[0].nomb
          this.xRestore.ruta = data.Cuerpo[0].ruta
          this.xRestore.pass = ''
          this.xRestore.user = ''
          this.xRestore.basedatos = ''
          this.xRestore.coleccion = 'apicore'
          this.ejecutarFuncion()
        }
      },
      (errot) => {
        console.log(errot);
        this.utilservice.AlertMini('top-end', 'error', 'Error al Guardadar los Datos', 3000)
      }
    )
  }

  ejecutarFuncion() {
    this.xRestore.funcion = 'Fnx_RestoreAPI'
    this.apiService.ExecFnx(this.xRestore).subscribe(
      data => {
        this.ListarApis(this.driversAPP)
        this.utilservice.AlertMini('top-end', 'success', 'Se han importado las APIS de la Base de datos XXXXX y la Coleccion XXXX', 3000)
      },
      error => {
        console.log(error)
      }
    )
  }


  ModalApi(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalExportarArchivo(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'sm',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalSubirArchivo(modal) {
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  ModalPromover(data) {
    console.log(data)
  }

  ModalEliminar(data) {
    console.log(data)
  }

  ModalModificar(modal) {
    console.log(modal)
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
      this.rowData.push(this.ListaApis)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaApis = []
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
      this.rowData.push(this.ListaApis)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          this.ListaApis = []
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
