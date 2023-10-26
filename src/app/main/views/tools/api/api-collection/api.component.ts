import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore } from '@services/apicore/api.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import JSONFormatter from 'json-formatter-js';

import { PdfService } from '@services/pdf/pdf.service';

import { FormGroup, FormBuilder } from '@angular/forms';

import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ComunicationsService } from '@services/networks/comunications.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  ) {
  }

    // convenience getter for easy access to form fields
    get f() {
      return this.loginForm.controls;
    }


  async ngOnInit() {
    this.llave = this.utilservice.GenerarUnicId();
    this.hashcontrol = btoa("ING" + this.llave);
    
    this.driversAPP = this.rutaActiva.snapshot.params.id
    
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
      'funcion': 'Fnx_ExportarAPI',
      'base-datos': 'sandra-server',
      'user': '',
      'passw': '',
      'driver': this.driversAPP

    }
    // console.log(this.fnx)
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
        console.log(data)
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
        this.modalService.dismissAll('Close')
        this.utilservice.AlertMini('top-end','success','Archivo Subido Exitosamente',3000)
      },
      (errot) => {
        console.log(errot);
        this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
      }
    );
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

  ModalProbar(modal, data){
    var api = data.entorno == "produccion" ? "/v1/" : "/devel/"
    this.xentorno = api + "api/crud:" + data.id;
    this.data = data
    this.modalService.open(modal,{
      centered: true,
      size: 'xl',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  async ejecutarApi() {
    this.xAPI = this.data;
    this.xAPI.parametros = this.xparametro
    this.xAPI.valores = this.valores
    // console.log(this.xAPI);
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data !== null) {
          this.utilservice.AlertMini('top-end','success','Consulta Exitosa!', 3000)
          const formatter = new JSONFormatter(data);
          document.getElementById("xrs").appendChild(formatter.render());
        } else {
          this.resultado = null
          this.utilservice.AlertMini('top-end','error','La API respondio NULL', 3000)
        }
      },
      (error) => {
        this.resultado = error;
      }
    )
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
