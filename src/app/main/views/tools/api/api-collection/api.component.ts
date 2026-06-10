import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ApiService, IAPICore, ProcessID, RestoreAPI } from '@services/apicore/api.service';
import { PdfService } from '@services/pdf/pdf.service';

import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { TaskService } from '@services/apicore/task.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
    selector: 'app-api',
    templateUrl: './api.component.html',
    styleUrls: ['./api.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [NgbModalConfig, NgbModal],
    standalone: false
})

export class ApiComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;


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
    user: '',
    file_name: ''
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

  public passwordTextType: boolean = false;

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
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
    this.hashcontrol = btoa("XING" + this.llave);
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

    let nameFnx = environment.functions.EXPORTAR_API
    this.fnx = {
      'funcion': nameFnx,
      'basedatos': 'code-epic',
      'user': this.IExportAPI.usuario,
      'pass': this.IExportAPI.clave,
      'driver': this.driversAPP,
      'file_name': environment.colecciones.API_CORE_NAME
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
    this.exportarPDF();
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // ==========================================
    // PÁGINA 1: PORTADA Y GUÍA
    // ==========================================

    // Título Principal - Azul Pastel Premium
    doc.setFontSize(24);
    doc.setTextColor(100, 181, 246); // Blue 300
    doc.setFont('helvetica', 'bold');
    doc.text('CATÁLOGO TÉCNICO DE APIS', pageWidth / 2, 60, { align: 'center' });

    // Línea Decorativa
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.5);
    doc.line(40, 65, pageWidth - 40, 65);

    // Subtítulo
    doc.setFontSize(14);
    doc.setTextColor(97, 97, 97);
    doc.text(`INFRAESTRUCTURA: ${this.driversAPP || 'SRE CORE'}`, pageWidth / 2, 75, { align: 'center' });

    // Detalles Centrados
    doc.setFontSize(11);
    doc.setTextColor(117, 117, 117);
    // Asumiendo que `this.urlControl` decodificado (o la parte de app) nos da el nombre de la app,
    // o hardcodeamos 'Aplicación Core' como fallback elegante
    doc.text(`Driver Principal: ${this.rowData.length > 0 ? (this.rowData[0].driver || 'MGDBA') : 'MGDBA'}`, pageWidth / 2, 83, { align: 'center' });

    // --- Sección: Guía de Arquitectura ---
    doc.setDrawColor(100, 181, 246);
    doc.setLineWidth(0.1);
    doc.setFillColor(248, 249, 252);
    doc.roundedRect(20, 93, pageWidth - 40, 75, 2, 2, 'FD');

    doc.setFontSize(11);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTÁNDAR DE INTEGRACIÓN SRE', 25, 103);

    doc.setFontSize(9);
    doc.setTextColor(33, 37, 41);
    doc.setFont('helvetica', 'normal');
    doc.text('Endpoint Rest API:', 25, 113);
    doc.setFont('courier', 'bold');
    doc.text('/v1/api/crud:{hash_control}', 60, 113);

    doc.setFont('helvetica', 'normal');
    doc.text('Endpoint Stream API:', 25, 120);
    doc.setFont('courier', 'bold');
    doc.text('/v1/api/crudstream:{hash_control}', 60, 120);

    doc.setFont('helvetica', 'normal');
    doc.text('Estructura de Objeto JSON (xAPI):', 25, 130);

    const codeSnippet = [
      'let xAPI = {',
      '  funcion: "NOMBRE_DE_LA_FUNCION",',
      '  parametros: "VALORES_QUERY_PATH",',
      '  valores: { ...PAYLOAD_JSON... }',
      '}'
    ];
    doc.setFont('courier', 'normal');
    doc.setTextColor(80, 80, 80);
    codeSnippet.forEach((line, index) => {
      doc.text(line, 35, 138 + (index * 5));
    });

    // --- Sección: Normas y Referencias ---
    doc.setFontSize(10);
    doc.setTextColor(158, 158, 158);
    doc.setFont('helvetica', 'italic');
    doc.text('Referencias Normativas e ISO:', 20, 182);

    doc.setFontSize(9);
    doc.setTextColor(189, 189, 189);
    doc.setFont('helvetica', 'normal');
    const isoText = [
      '• ISO/IEC 27001: Gestión de la Seguridad de la Información en Endpoints.',
      '• ISO/IEC 25010: Calidad de Software y Mantenibilidad de Arquitecturas Orientadas a Servicios.',
      '• Cumplimiento con el estándar de cifrado y transporte seguro de Sandra Server.'
    ];
    isoText.forEach((line, index) => {
      doc.text(line, 25, 192 + (index * 6));
    });

    // Pie de página Portada
    doc.setFontSize(8);
    doc.setTextColor(200);
    doc.text('CONFIDENCIAL - USO INTERNO EXCLUSIVO', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text(`Generado el: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });


    // ==========================================
    // PÁGINA 2+: TABLA DETALLADA
    // ==========================================
    doc.addPage();

    doc.setFontSize(14);
    doc.setTextColor(100, 181, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('Inventario de Endpoints (API Collection)', 14, 20);

    const tableData = this.rowData.map(row => [
      row.funcion.toUpperCase(),
      row.metodo || 'N/A',
      row.accion ? 'SEGURO' : 'BAJA', // WAF Status
      row.version || '0.0.1',
      row.cache == 1 ? 'SI' : 'NO',
      row.prioridad == '0' ? 'BAJA' : row.prioridad == '1' ? 'MEDIA' : 'ALTA',
      row.estatus ? 1 : 0
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['FUNCIÓN / ENDPOINT', 'MÉTODO', 'WAF', 'VER', 'CACHE', 'PRIORIDAD', 'ESTATUS']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        valign: 'middle',
        lineColor: [238, 238, 238],
        lineWidth: 0.1,
        textColor: [97, 97, 97]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 181, 246],
        fontStyle: 'bold',
        halign: 'left',
        lineWidth: 0
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [33, 37, 41] },
        2: { cellWidth: 20, halign: 'center' }, // WAF Column
        6: { cellWidth: 20, halign: 'center' }  // Estatus Column
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Alternancia suave (Zebra pastel)
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [252, 253, 255];
          }
          
          // Estilo badge para WAF
          if (data.column.index === 2) {
            const isSecure = data.cell.raw === 'SEGURO';
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = isSecure ? [76, 175, 80] : [244, 67, 54] // Green or Red
          }

          // Limpiar texto de estatus para dibujar el check
          if (data.column.index === 6) {
            data.cell.text = [];
          }
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const estatus = data.cell.raw as number;
          const dim = 3.5;
          const cx = data.cell.x + (data.cell.width / 2) - (dim / 2);
          const cy = data.cell.y + (data.cell.height / 2) - (dim / 2);

          if (estatus === 1) {
            doc.setFillColor(165, 214, 167); // Green Pastel
            doc.setDrawColor(165, 214, 167);
            doc.roundedRect(cx, cy, dim, dim, 0.8, 0.8, 'FD');
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.4);
            doc.line(cx + 0.8, cy + 1.8, cx + 1.5, cy + 2.5);
            doc.line(cx + 1.5, cy + 2.5, cx + 2.8, cy + 1);
          } else {
            doc.setDrawColor(224, 224, 224);
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(cx, cy, dim, dim, 0.8, 0.8, 'FD');
          }
        }
      }
    });

    // Paginación
    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(200);
      doc.text(`${i} / ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }

    const fileName = `Catalogo_API_${this.driversAPP || 'SRE'}.pdf`.replace(/ /g, '_');
    const pdfDataUri = doc.output('datauristring');

    if (window.parent && window !== window.parent) {
      window.parent.postMessage({
        type: 'OPEN_PDF',
        payload: {
          fileName: fileName,
          data: pdfDataUri
        }
      }, '*');
    } else {
      doc.save(fileName);
    }
  }

  // async ImportApi() {
  //   const { value: file } = await Swal.fire({
  //     title: 'Sube el documento',
  //     input: 'file',
  //     inputAttributes: {
  //       'accept': 'application/zip',
  //       'aria-label': 'Upload your profile picture'
  //     }
  //   })

  //   if (file) {
  //     const reader = new FileReader()
  //     reader.onload = (e) => {
  //       // Swal.fire({
  //       //   title: 'Your uploaded picture',
  //       //   imageUrl: e.target.result,
  //       //   imageAlt: 'The uploaded picture'
  //       // })
  //     }
  //     reader.readAsDataURL(file)
  //   }
  // }





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
    this.xAPI.funcion = environment.functions.LISTAR_COMUNICACIONES;
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
    console.log(document.getElementById('identificador'))
    var frm = new FormData(document.forms.namedItem("forma"))
    try {
      await this.apiService.EnviarArchivos(frm).subscribe(
        (data) => {
          this.ValoresMasivos()

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

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.ObtenerNombreArchivo()
          document.forms.namedItem("forma").reset();
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
    this.xAPI.funcion = environment.functions.OBTENER_NOMBRE_ARCHIVO;
    this.xAPI.parametros = this.llave;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.Cuerpo.length > 0) {
          this.xRestore.nombre = data.Cuerpo[0].nomb
          this.xRestore.ruta = data.Cuerpo[0].ruta
          this.xRestore.pass = this.IExportAPI.clave
          this.xRestore.user = this.IExportAPI.usuario
          this.xRestore.file_name = environment.colecciones.API_CORE_NAME
          this.xRestore.basedatos = environment.driver.DATA_BASE
          this.xRestore.coleccion = environment.colecciones.API_CORE_NAME
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
    let nameFnx = 'Restaurar API'
    this.xRestore.funcion = environment.functions.RESTAURAR_API
    this.apiService.ExecFnx(this.xRestore).subscribe(
      (data) => {
        // console.log(data);
        this.pID.id = data.contenido.id;
        this.pID.estatus = true;
        this.msjService.lstpid$.emit(this.pID);
        this.modalService.dismissAll()
        this.taskService
          .set(data.contenido.id, nameFnx, 'Restaurando api')
          .then((e) => {
            this.apiService.ConsultarPidRecursivo(
              data.contenido.id,
              'Restaurando api'
            );
          })
          .catch((e) => console.log(e));

      },
      (error) => {
        console.log(error);
      }
    );
    // this.apiService.ExecFnx(this.xRestore).subscribe(
    //   data => {

    //     this.ListarApis(this.driversAPP)
    //     this.utilservice.AlertMini('top-end', 'success', 'Se han importado las APIS de la Base de datos XXXXX y la Coleccion XXXX', 3000)
    //   },
    //   error => {
    //     console.log(error)
    //   }
    // )
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
