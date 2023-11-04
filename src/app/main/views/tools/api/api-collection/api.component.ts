import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore, RestoreAPI } from '@services/apicore/api.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { SqlFormatPipe } from '@core/pipes/sql-format.pipe';

import { AES } from 'crypto-js';
const clave = '5412892DF0D2919B04ADD29EDEFABA30E30F6D7F5A62A9B84AD46BDE23B25491';
import { enc } from 'crypto-js';


import JSONFormatter from 'json-formatter-js';

import { PdfService } from '@services/pdf/pdf.service';

import { FormGroup, FormBuilder } from '@angular/forms';

import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ComunicationsService } from '@services/networks/comunications.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import Stepper from 'bs-stepper';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';

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

  public xAPI : IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia : false,
    protocolo: '',
    ruta : '',
    retorna : false,
    migrar : false,
    modulo : '',
    valores : {},
    coleccion : '',
    http : 0,
    https : 0,
    consumidores : 0,
    puertohttp : 0,
    puertohttps : 0,
    driver : '',
    query : '',
    metodo : '',
    tipo : '',
    prioridad : '',
    entorno: '',
    logs : false
  };

  public xRestore : RestoreAPI = {
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
    {id:true, name: 'ACTIVO'},
    {id:false, name: 'INACTIVO'},
  ]

  public archivos = []

  public rutaURL 

  // public
  public mac
  public data : any
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

  public llave : string
  public hashcontrol : string


  constructor(
    private rutaActiva: ActivatedRoute,
    private apiService : ApiService,
    private modalService: NgbModal,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,
    private pdf: PdfService,
    private router: Router
  ) {
  }

    // convenience getter for easy access to form fields
    get f() {
      return this.loginForm.controls;
    }


  async ngOnInit() {
    this.llave = this.utilservice.GenerarUnicId();
    this.hashcontrol = btoa("ING" + this.llave);
    
    this.driversAPP = AES.decrypt(this.rutaActiva.snapshot.params.id, clave).toString(enc.Utf8)
    this.rutaURL = this.rutaActiva.snapshot.params.id
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
            name: 'Herramientas',
            isLink: false
          },
          {
            name: 'API REST',
            isLink: true,
            link: '/tools/api'
          },
          {
            name: this.driversAPP,
            isLink: false
          },
        ]
      }
    };
  }

  async ListarApis(t : string) {
    this.developer = []
    this.xAPI.funcion = '_SYS_R_ListarApis'
    this.xAPI.parametros = t
    this.xAPI.valores = ''
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.map(e => {
          this.developer.push(e)
          this.rowData = this.developer;
          this.count = this.rowData.length
          this.tempData = this.rowData;     
        })
      },
      (error) => {
        console.error(error)
      }
    );
  }
  
  ExportApi(){
    this.fnx = {
      'funcion': 'Fnx_ExportAPI',
      'basedatos': 'sandra-server',
      'user': 'elpolox',
      'passw': 'Arrd17818665',
      'driver': this.driversAPP
    }
    this.apiService.ExecFnx(this.fnx).subscribe(
      (data) => {
        this.utilservice.AlertMini('bottom-end','success','Backup Generado',3000)
        this.apiService.DwsCdn('bck-export/apicore.zip')
      },
      (error) => {
        this.utilservice.AlertMini('top-end','success',error,3000)
        console.log(error)
      })
  }

  ListadoApis(){
    this.pdf.ListadoDeApis(this.rowData)
  }

  async ImportApi(){
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

  LimpiarForm(){
    this.loginForm = this._formBuilder.group({
      host: ['', [Validators.required]],
      mac: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      id: ['', [Validators.required]],
      tipo: [undefined],
      estatus: [undefined],
    });
  }


  async CargarLista(){
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

  ModalEditApi(modal, data){
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalEscaneo(modal, data){
    this.data = data
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  fileSelected(e) {
    this.archivos = e.target.files;
  }

  async SubirArchivo() {
    var frm = new FormData(document.forms.namedItem("forma"));
    try {
      await this.apiService.EnviarArchivos(frm).subscribe((data) => {
        this.ValoresMasivos();
      });
    } catch (error) {
      console.error(error);
    }
  }



  ValoresMasivos() {
    let cargaMasiva = {
      codigo: this.llave,
      ruta: this.hashcontrol,
      nombre: this.archivos[0].name,
      funcion: "SetPath",
      fin: this.utilservice.FechaActual(0),
      tipo: 'ZIP',
      sistema: 'CORE',
      contenido: 'Importar API',
      cantidad: 0,
      estatus: 0,
      usuario: environment.Hash,
    };
    this.xAPI.funcion = "_SYS_ISetPath";
    this.xAPI.parametros = "";
    this.xAPI.valores = JSON.stringify(cargaMasiva);

    document.forms.namedItem("forma").reset();

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.tipo == 1) {
          this.ObtenerNombreArchivo()
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success','Archivo Subido Exitosamente',3000)          
        } else {
          this.utilservice.AlertMini('top-end','error','El archivo no pudo ser subido, por favor verifica e intente de nuevo',3000)
        }
      },
      (errot) => {
        console.log(errot);
        this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
      }
    );
  }

  ObtenerNombreArchivo(){
    this.xAPI.funcion = "SYS_getFileName";
    this.xAPI.parametros = this.llave;
    this.xAPI.valores = "";
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data.Cuerpo.length > 0) {
          this.xRestore.nombre = data.Cuerpo[0].nomb
          this.xRestore.ruta = data.Cuerpo[0].ruta
          this.xRestore.pass = 'Arrd17818665'
          this.xRestore.user = 'elpolox'
          this.xRestore.basedatos = 'sandra-server'
          this.xRestore.coleccion = 'apicore'
          this.ejecutarFuncion()
        }
      },
      (errot) => {
        console.log(errot);
        this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
      }
    )
  }

  ejecutarFuncion(){
    this.xRestore.funcion = 'Fnx_RestoreAPI'
    this.apiService.ExecFnx(this.xRestore).subscribe(
      data => {
        this.ListarApis(this.driversAPP)
        this.utilservice.AlertMini('top-end','success','Se han importado las APIS de la Base de datos XXXXX y la Coleccion XXXX',3000)          
      },
      error => {
        console.log(error)
      }
    )
  }


  ModalApi(modal){
    this.modalService.open(modal,{
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalSubirArchivo(modal){
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  ModalPromover(data){
    console.log(data)
  }

  ModalEliminar(data){
    console.log(data)
  }

  ModalModificar(modal){
    console.log(modal)
  }


  GuardarDispositivo(){
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
          this.utilservice.AlertMini('top-end','success',`Tu (Comunicacion) ha sido registrada codigo: ${data.UpsertedID}`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
          // console.log(error)
        }
      )

    }
  }

  EditarDispositivo(){
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
          this.utilservice.AlertMini('top-end','success',`Tu (Comunicacion) ha sido actualizada`,3000)
          this.LimpiarForm()
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
          // console.log(error)
        }
      )

    }
  }

}
