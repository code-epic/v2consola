import { Component, OnInit, ViewChild, ViewEncapsulation, signal } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule, ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { CoreCommonModule } from '@core/common.module';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';

import { Subject } from 'rxjs';
import { ApiService } from '@services/apicore/api.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgSelectConfig } from '@ng-select/ng-select';
import { TaskService } from '@services/apicore/task.service';


@Component({
    selector: 'app-task-monitor',
    templateUrl: './task-monitor.component.html',
    styleUrls: ['./task-monitor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [NgbModalConfig, NgbModal],
    standalone: true,
    imports: [
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    NgxDatatableModule,
    CoreCommonModule,
    CoreDirectivesModule,
    CorePipesModule,
    ContentHeaderComponent
]
})
export class TaskMonitorComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;


  searchValueCtrl = new FormControl('');
  get searchValue() { return this.searchValueCtrl.value; }
  public contentHeader: object;
  public count
  public ListaComunicaciones = []
  basicSelectedOptionCtrl = new FormControl(10);
  get basicSelectedOption() { return this.basicSelectedOptionCtrl.value; }
  public ColumnMode = ColumnMode;
  private _isLoading = signal<boolean>(false);
  get isLoading() { return this._isLoading(); }
  public tempData = [];
  public rowData = [

  ];


  constructor(private taskService: TaskService, private msjService: WsocketsService) { }

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

  escucharPID() {
    this.msjService.lstpid$.subscribe(
      pid => {
        console.log(pid)
        if (!pid.estatus) {

          this.buscarElemento(pid.id)
        }
      }
    )

  }

  async initProcess() {
    this._isLoading.set(true);
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
                  pid: data.id.substring(0, 6),
                  programa: data.funcion,
                  argumento: data.nombre,
                  usuario: data.usuario,
                  tiempo: data.fin == undefined ? '' : data.fin.toUTCString().substring(0, 16),
                  estatus: data.estatus
                }
              )
              if (i == cnt - 1) {
                this.insertCommitDB(lstApp)
                this._isLoading.set(false);
              }
            }
          )

        }
      }
    ).catch(error => {
      console.error(error);
      this._isLoading.set(false);
    })
  }

  async buscarElemento(pid: string) {

    this.rowData = (await this.rowData).map(e => {
      if (e.pid == pid.substring(0, 6)) {
        e.tiempo = new Date().toUTCString().substring(0, 16)
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



  insertCommitDB(lst) {
    this.rowData = lst
    this.tempData = this.rowData
  }


}
