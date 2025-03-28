import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { IUser } from '@services/seguridad/rol.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { BlockUI, NgBlockUI } from 'ng-block-ui';

export interface Log {
  date: string;
  file: string;
  id?: string;
  type: 'WARNING' | 'ERROR' | 'INFO';
  query: string;
  error?: string;
}

export interface QueryLog {
  date: string;
  file: string;
  type: 'ALERT' | 'WARNING' | 'ERROR';
  message: string;
  errorCode?: string;
}

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})


export class LogsComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI
  @BlockUI('section-block') sectionBlockUI: NgBlockUI

  public contentHeader: object;
  // @ViewChild('dataUsers') dataUsers: any

  public ColumnMode = ColumnMode
  public SelectionType = SelectionType
  public basicSelectedOption: number = 10


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public xrs:string = "Por favor seleccione el tipo de log que quieres visualizar!"
  public  selectedLogType: number | null = null;

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private modalService: NgbModal,
  ) { }

  public lstLogs = [
    {id: 1, name:"Log Sistema"},
    {id: 2, name:"Log Cache"},
    {id: 3, name:"Log Query"}
  ]


  logs: Log[] = [
    {
      date: '2025/03/26 22:30:11',
      file: 'relacional.go:94',
      id: '0733f6fc975db7b4ffbee1db47bb1e10',
      type: 'WARNING',
      query: 'SELECT * FROM requisitos_exigidos_tramite_otorgramiento reto ORDER BY reto.id_reto ASC;',
      error: null
    },
    {
      date: '2025/03/28 08:29:51',
      file: 'sql_select.go:30',
      id: null,
      type: 'WARNING',
      query: `SELECT
        sp.id,
        sp.nomb as perfil,
        sp.obse AS descripcion,
        sp.status as estatus,
        sa.nomb AS aplicacion,
        sa.llav AS llave,
        idapp
      FROM
        SEC_001_Perfil sp
      JOIN SEC_001_Aplicacion sa ON 
        sp.idapp = sa.id`,
      error: "Error 1146: Table 'sandra_server.sec_001_perfil' doesn't exist"
    }
  ];

  // Pipe para revertir el orden
  get reversedLogs(): Log[] {
    return [...this.logs].reverse();
  }



  queryLogs: QueryLog[] = [
    {
      date: '2025/03/27 16:54:38',
      file: 'conexion.go:75',
      type: 'ALERT',
      message: "Unknown database 'wkf_ceropapel'",
      errorCode: 'Error 1049'
    },
    {
      date: '2025/03/27 16:54:38',
      file: 'conexion.go:44',
      type: 'ALERT',
      message: 'role "postgres" does not exist',
      errorCode: 'pq'
    },
    // Agrega aquí el resto de los logs...
    {
      date: '2025/03/28 08:20:58',
      file: 'conexion.go:44',
      type: 'ALERT',
      message: 'role "postgres" does not exist',
      errorCode: 'pq'
    }
  ];

  get reversedQueryLogs(): QueryLog[] {
    return [...this.queryLogs].reverse();
  }

  // Método para extraer el tipo de error (opcional)
  getErrorType(message: string): string {
    if (message.includes('database')) return 'database';
    if (message.includes('role')) return 'role';
    return 'other';
  }



 async  ngOnInit() {
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

    // await this.verLogs()

  }



  onLogTypeChange(selectedId: { id: number }) {
    this.selectedLogType = selectedId.id;
  }
  
  
  //Fnx_QueryLog
  // Fnx_SystemLog
  
  async verLogs() {
    this.xrs = "Por favor espere!!! leyendo el archivo log..."
    let nameFnx = "Fnx_QueryLog";
    let fnx = {
      funcion: nameFnx,
    };
    await this.apiService.ExecFnx(fnx).subscribe(
      (data) => {
        setTimeout(() => {
          this.apiService.ExecFnxId(data.contenido.id).subscribe(
            (data) => {
              console.log(data.rs)
              this.xrs = data.rs
            },
            (error) => {
              console.log(error)
            }
          )
        }, 3000);
      },
      (error) => {
        console.log(error);
      }
    );
  }


}