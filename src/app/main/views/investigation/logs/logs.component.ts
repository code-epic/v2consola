import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, ProcessID } from '@services/apicore/api.service';
import { TaskService } from '@services/apicore/task.service';
import { UtilService } from '@services/util/util.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class LogsComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI
  @BlockUI('section-block') sectionBlockUI: NgBlockUI

  public contentHeader: object;

  public ColumnMode = ColumnMode
  public SelectionType = SelectionType
  public basicSelectedOption: number = 10

  public nameFnx = '';

  public selectedLogType: number | null = null;
  public pID: ProcessID = {
    id: "",
    estatus: false,
    mensaje: "",
    segundos: "",
    contenido: "",
  };

  constructor(private taskService: TaskService,
    private apiService: ApiService,
    private msjService: WsocketsService,
    private modalService: NgbModal,
    private utilservice: UtilService,
  ) { }

  public logOptions = [
    {
      id: 1,
      title: 'Log del Sistema',
      icon: 'monitor',
      description: 'Monitoreo general del sistema y eventos principales.',
      class: 'primary',
      action: 'view'
    },
    {
      id: 3,
      title: 'Log de Consultas',
      icon: 'database',
      description: 'Historial detallado de consultas SQL ejecutadas.',
      class: 'success',
      action: 'view'
    },
    {
      id: 2,
      title: 'Log de Caché',
      icon: 'zap',
      description: 'Registros de operaciones y estado de la caché.',
      class: 'warning',
      action: 'view'
    },
    {
      id: 99,
      title: 'Backup de Logs',
      icon: 'archive',
      description: 'Generar y descargar copia de seguridad de los logs.',
      class: 'info',
      action: 'backup'
    }
  ];


  async ngOnInit() {
    this.contentHeader = {
      headerTitle: "Investigación",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Home",
            isLink: true,
            link: "/home",
          },
          {
            name: "Investigación",
            isLink: false,
          },
          {
            name: "Logs",
            isLink: false,
          },
        ],
      },
    };
  }

  selectOption(option: any) {
    if (option.action === 'backup') {
      this.nameFnx = ''
      this.backupLogs();
      return;
    }

    this.selectedLogType = option.id;

    switch (option.id) {
      case 1:
        this.nameFnx = "Fnx_SystemLog";
        break;
      case 2:
        this.nameFnx = "Fnx_CacheLog";
        break;
      case 3:
        this.nameFnx = "Fnx_QueryLog";
        break;
      default:
        this.nameFnx = ''
        break;
    }
  }

  async backupLogs() {
    let nameFnx = "Respaldar Logs";
    let fnx = {
      funcion: environment.functions.RESPALDAR_LOGS,
      proyecto: 'logs',
    };

    await Swal.fire({
      title: `Va a respaldar los logs`,
      text: "Estó puede durar varios segundos, dependiendo de su conexión a internet!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Respaldar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.ExecFnx(fnx).subscribe(
          (data) => {
            this.pID.id = data.contenido.id;
            this.pID.estatus = true;
            this.msjService.lstpid$.emit(this.pID);
            let proyecto = `BackupLogs`
            this.taskService
              .set(data.contenido.id, nameFnx, proyecto)
              .then((e) => {
                this.apiService.ConsultarPidRecursivo(
                  data.contenido.id,
                  proyecto
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


}