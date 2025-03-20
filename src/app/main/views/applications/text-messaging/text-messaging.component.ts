import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { ApiService, IAPICore, ProcessID } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import jwt_decode from "jwt-decode";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subject } from 'rxjs';
import { AngularFileUploaderComponent } from 'angular-file-uploader';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error } from 'console';
import { TaskService } from '@services/apicore/task.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { UtilService } from '@services/util/util.service';

@Component({
  selector: 'app-text-messaging',
  templateUrl: './text-messaging.component.html',
  styleUrls: ['./text-messaging.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class TextMessagingComponent implements OnInit {

  formulario: FormGroup;


  private fileUpload1: AngularFileUploaderComponent
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;
  @BlockUI('modal-section-block') modalsectionBlockUI: NgBlockUI;
  @ViewChild('CapturarLote') modalSubirXLS: TemplateRef<any>;


  public pID: ProcessID = {
    id: "",
    estatus: false,
    mensaje: "",
    segundos: "",
    contenido: "",
  };

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: '',
  };

  public token
  public pidData
  public rsObject
  public resSms
  public showButton : boolean = true;
  public leerSMS

  public sidebarToggleRef = false;
  public rows;
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public temp = [];

  public isLoading: number = 0;

  public listaMensajesDispositivos = []
  public rowsMensajes = []
  public tempDataMensajes = []

  public searchValue = '';
  private tempData = [];



  public listaDispositivos: any[] = [];
  public mensajeNoDispositivos: string = ""; // Propiedad para almacenar el mensaje
  public dispositivoSeleccionado: any = null; // Propiedad para almacenar el valor seleccionado

  private _unsubscribeAll: Subject<any>;

  public isButtonDisabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private utilService: UtilService,
    private modalService: NgbModal,
    private taskService: TaskService,
    private msjService: WsocketsService,
    private ws: WsocketsService

  ) {
    this.formulario = this.fb.group({
      phoneNumbers: ['', [Validators.required, Validators.pattern(/^(\+[0-9]+)(,\+[0-9]+)*$/)]], // Permite números con + y separados por comas
      message: ['', Validators.required] // Valida que el mensaje no esté vacío
    });
  }

  async ngOnInit() {

    await this.ConsultarDispositivo()
    this.token = jwt_decode(sessionStorage.getItem('token'));

  }


  async ConsultarDispositivo() {
    this.isLoading = 0;
    const config = {
      funcion: 'Fnx_ListarDispositivosMoviles',
      nombre: 'Listar dispositivos móviles'
    };
  
    try {
      const data = await this.apiService.ExecFnx(config).toPromise();
  
      if (data.tipo === 1) {
        this.pID.id = data.contenido.id;
        this.pID.estatus = true;
        this.msjService.pidDevice$.emit(this.pID);
  
        const taskResult = await this.taskService.set(data.contenido.id, config.funcion, config.nombre);
        this.pidData = await this.apiService.ConsultarPidSandraSms(data.contenido.id, config.nombre);

        // console.log(this.pidData)
    
        // Convertir this.pidData.rs en un objeto JSON
        const texto = this.pidData.rs;
  
        // Extraer el estado (true/false)
        const status = texto.includes('true');
  
        // Extraer el mensaje
        const dataMessage = texto.match(/✅.*/)?.[0] || '';
        
        // console.log(dataMessage)

        if (status == true) {
        await this.LeerMensaje()
         // Actualizar la lista de dispositivos
        this.listaDispositivos = [{
          label: dataMessage,  // El valor que se mostrará en el dropdown
          value: data.contenido.id   // El valor que se seleccionará
        }];
  
        this.mensajeNoDispositivos = ""; // Limpiar el mensaje si hay dispositivos
        this.dispositivoSeleccionado = this.listaDispositivos[0]; // Seleccionar el primer dispositivo
        this.isLoading = 1;
        } else {
          this.isLoading = 2;
          this.listaDispositivos = []; // Limpiar la lista si no hay dispositivos
          this.mensajeNoDispositivos = "❌ No hay dispositivos conectados"; // Guardar el mensaje
          this.dispositivoSeleccionado = "❌ No hay dispositivos conectados"; // Limpiar la selección  
        }
  
      } else {
        this.isLoading = 2;
      }
    } catch (error) {
      console.log(error);
    }
  }


  ModalMensaje(modal: any) {
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  async enviarMensaje() {
    if (this.formulario.valid) {
      this.isButtonDisabled = true; 
      const config = {
        funcion: 'Fnx_EnviarMensajeTexto',
        nombre: 'Enviar Mensaje de Texto',
        TELEFONO: this.formulario.value.phoneNumbers,
        MENSAJE: this.formulario.value.message,
      };

      try {
        const data = await this.apiService.ExecFnx(config).toPromise();
        if (data.tipo === 1) {
          this.pID.id = data.contenido.id;
          this.pID.estatus = true;
          this.msjService.pidDevice$.emit(this.pID);
    
          const taskResult = await this.taskService.set(data.contenido.id, config.funcion, config.nombre);
          this.resSms = await this.apiService.ConsultarPidSandraSms(data.contenido.id, config.nombre);

          if (typeof this.resSms.rs === 'string') {
            const rsJSON = JSON.parse(this.resSms.rs);
            // console.log(rsJSON)
          }

          if (this.resSms.rs.success !== false) {
            
            this.utilService.alertConfirmMini('success', "Mensaje enviado correctamente.");
            this.formulario.reset({ phoneNumbers: '', message: '' });
            this.cerrarModal()
            this.listaMensajesDispositivos = []
            this.rowsMensajes = []        
            await this.LeerMensaje()
          } else {
            this.utilService.alertConfirmMini('warning', "Oops lo sentimos!, Error al enviar el mensaje. Verifique que haya algún dispositivo conectado.");
            // this.formulario.reset({ phoneNumbers: '', message: '' });
            // this.cerrarModal()
            this.isButtonDisabled = false;
          }


        } else {
          this.cerrarModal()
          this.utilService.alertConfirmMini('error', "Oops lo sentimos!, Error al enviar el mensaje. Verifique que haya algún dispositivo conectado.");
          this.formulario.reset({ phoneNumbers: '', message: '' });
          this.isButtonDisabled = true;
        }
      } 
      catch(error) {
        console.log(error);
        this.formulario.reset({ phoneNumbers: '', message: '' });
        this.utilService.alertConfirmMini('info', 'Oops lo sentimos!, porfavor intente de nuevo.');
        this.isButtonDisabled = true;
      }
    }
  }



  async LeerMensaje(){
    const config = {
      funcion: 'Fnx_ListarMensajesDispositivos',
      nombre: 'Enviar Mensaje de Texto',
    };

    try {
      const data = await this.apiService.ExecFnx(config).toPromise();
      if (data.tipo === 1) {
        this.pID.id = data.contenido.id;
        this.pID.estatus = true;
        this.msjService.pidDevice$.emit(this.pID);
  
        const taskResult = await this.taskService.set(data.contenido.id, config.funcion, config.nombre);
        this.leerSMS = await this.apiService.ConsultarPidSandraSms(data.contenido.id, config.nombre);
        // console.log(this.leerSMS)

        if (typeof this.leerSMS.rs === 'string') {
          const rsJSON = JSON.parse(this.leerSMS.rs);
          // console.log(rsJSON)
          if (rsJSON.chats.length > 0) {
            rsJSON.chats.map(e => {
              this.listaMensajesDispositivos = rsJSON.chats
              this.isLoading = 1
            });
            this.rowsMensajes = this.listaMensajesDispositivos
            this.tempDataMensajes = this.rowsMensajes
            console.log(this.rowsMensajes)
            
          } else {
            this.isLoading = 2
          }
        }

      } else {
        this.cerrarModal()
        this.utilService.alertConfirmMini('error', "Oops lo sentimos!, Error al leer los mensajes. Verifique que haya algún dispositivo conectado.");
      }
    } 
    catch(error) {
      console.log(error);
      this.utilService.alertConfirmMini('info', 'Oops lo sentimos!, porfavor intente de nuevo.');
    }

  }


  cerrarModal() {
    this.modalService.dismissAll()
    this.formulario.reset({ phoneNumbers: '', message: '' });
  }


  filterUpdate(event) {
    // Reset ng-select on search
    const val = event.target.value.toLowerCase();
    // Filter Our Data
    const temp = this.tempData.filter(function (d) {
      return d.nombre_empresa.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // Update The Rows
    this.rowsMensajes = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }

}
