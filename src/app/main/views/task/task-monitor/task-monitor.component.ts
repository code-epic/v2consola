import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore } from '@services/apicore/api.service';
// import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ComunicationsService } from '@services/networks/comunications.service';
import { TaskService } from '@services/apicore/task.service';


@Component({
  selector: 'app-task-monitor',
  templateUrl: './task-monitor.component.html',
  styleUrls: ['./task-monitor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class TaskMonitorComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public searchValue = ''
  public contentHeader: object;
  public count
  public ListaComunicaciones = []
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public tempData = [];
  public rowData = [

  ];


  constructor(private taskService : TaskService, private msjService: WsocketsService,
    ) { }

  ngOnInit(): void {
    // content header
    this.contentHeader = {
      headerTitle: 'Tareas',
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
            name: 'Tareas',
            isLink: false
          },
          {
            name: 'Monitor de Tareas',
            isLink: false
          }
        ]
      }
    };
    this.initProcess()
    this.escucharPID()

  }

  escucharPID(){
    this.msjService.lstpid$.subscribe(
      pid => {
        console.log(pid)
        if ( !pid.estatus){

            this.buscarElemento(pid.id)
        }
      }
    )

  }

  async buscarElemento(pid: string){
   
    this.rowData = (await this.rowData).map(e => {
      if (e.pid == pid.substring(0,6)) {
        e.tiempo = new Date().toUTCString().substring(0,16)
        e.estatus = false
      }
      return e
    })
    this.tempData = this.rowData
  }

  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.descripcion.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async initProcess(){
    let lstApp = []
    await this.taskService.keys().then(
      async lst => {
        let cnt = lst.length;
        for (let i = 0; i < cnt; i++) {
          const e = lst[i];
          this.taskService.get(e).then(
            data => {

              lstApp.push(
                {
                  pid : data.id.substring(0,6),
                  programa : data.funcion,
                  argumento : data.nombre,
                  usuario : data.usuario,
                  tiempo : data.fin==undefined?'':data.fin.toUTCString().substring(0,16),
                  estatus : data.estatus
                }
              )
              if(i == cnt-1) this.insertCommitDB(lstApp)
            }
          )
          
        }
      }
    )
  }

  insertCommitDB(lst){
    this.rowData = lst
    this.tempData = this.rowData
  }


}
