import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore } from '@services/apicore/api.service';

import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';



@Component({
  selector: 'app-communications',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})

export class CommunicationsComponent implements OnInit {

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


  // Private
  private _unsubscribeAll: Subject<any>;
 
  public ListaComunicaciones = []
  public tempData = [];
  public rowData = [];

  public sDispositivo

  public dispositivos = [
    {id:'SRV', descripcion: 'SERVIDORES'},
    {id:'ROU', descripcion: 'ROUTERS'},
    {id:'SWI', descripcion: 'SWITCHES'},
    {id:'IMP', descripcion: 'IMPRESORAS'},
    {id:'LHU', descripcion: 'LECTOR BIOMETRICO'},
    {id:'DVR', descripcion: 'DVR - CAMARAS'},
    {id:'CIP', descripcion: 'CAMARAS IP'},
  ]

  public status = [
    {id:true, name: 'ACTIVO'},
    {id:false, name: 'INACTIVO'},
  ]


  // public
  public submitted = false;
  public loginForm: UntypedFormGroup;
  public contentHeader: object;
  public selected = [];
  public kitchenSinkRows: any;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  @ViewChild(DatatableComponent) table: DatatableComponent;


  constructor(
    private apiService : ApiService,
    private modalService: NgbModal,
    private ws : WsocketsService,
    private config: NgSelectConfig,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,

  ) {
    this.config.notFoundText = 'Custom not found';
      this.config.appendTo = 'body';
      this.config.bindValue = 'value';
  }

    // convenience getter for easy access to form fields
    get f() {
      return this.loginForm.controls;
    }

  async ngOnInit() {

    this.loginForm = this._formBuilder.group({
      host: ['', [Validators.required]],
      mac: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      id: ['', [Validators.required]],
      tipo: [undefined],
      estatus: [undefined],
    });

    if(this.sDispositivo == undefined){
      await this.CargarLista('SRV')
    } 

     // content header
     this.contentHeader = {
      headerTitle: 'Redes',
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
    const val = event.target.value;
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.host.indexOf(val) !== -1 ;
    });
    // update the rows
    this.kitchenSinkRows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }

  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  async CargarLista(e: any){
    this.xAPI.funcion = "LstComunicaciones";
    this.xAPI.parametros = e;
    this.ListaComunicaciones = []
     await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
          this.ListaComunicaciones.push(data);
          setTimeout(() => {
            this.rowData = data;
            this.tempData = this.rowData;
        }, 400);
      },
      (error) => {
        console.log(error)
      }
    ) 
  }

  async capturar(e:any){
    await this.CargarLista(e)
  }


  ModalEdit(modal, data){
    this.loginForm = this._formBuilder.group({
      host: [data.host, [Validators.required]],
      mac: [data.mac, [Validators.required]],
      descripcion: [data.descripcion, [Validators.required]],
      id: [data.id, [Validators.required]],
      tipo: [data.tipo],
      estatus: [data.estatus],
    });
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  ModalAdd(modal){
    this.modalService.open(modal,{
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  submit(){
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
      this.rowData.push(this.ListaComunicaciones)
      this.apiService.ExecColeccion(obj).subscribe(
        (data) => {
          console.log(data)
          this.ListaComunicaciones = []
          this.CargarLista('SRV')
          this.modalService.dismissAll('Close')
          this.utilservice.AlertMini('top-end','success',`Tu (Comunicacion) ha sido registrada codigo: ${data.UpsertedID}`,3000)
          
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
          console.log(error)
        }
      )

    }
  }

}
