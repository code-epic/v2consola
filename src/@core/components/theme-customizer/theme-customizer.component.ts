import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CoreConfigService } from '@core/services/config.service';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { TaskService } from '@services/apicore/task.service';
import { WsocketsService } from '@services/websockets/wsockets.service';

import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';


@Component({
  selector: 'core-theme-customizer',
  templateUrl: './theme-customizer.component.html',
  styleUrls: ['./theme-customizer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CoreThemeCustomizerComponent implements OnInit, OnDestroy {

   @ViewChild(DatatableComponent) table: DatatableComponent;

    public searchValue = ''
    public contentHeader: object;
    public count
    public ListaComunicaciones = []
    public basicSelectedOption: number = 10;
    public ColumnMode = ColumnMode;
    public tempData = [];
    public rowData = [];


    public lstApp

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor

   * @param {FormBuilder} _formBuilder
   * @param {CoreConfigService} _coreConfigService
   * @param {CoreSidebarService} _coreSidebarService
   * */
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _coreConfigService: CoreConfigService,
    private _coreSidebarService: CoreSidebarService,
    private taskService: TaskService, 
    private msjService: WsocketsService
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  //  Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit() {
    await this.initProcess()
    await this.escucharPID()
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  //  Private methods
  // -----------------------------------------------------------------------------------------------------

  async escucharPID() {
   await  this.msjService.lstpid$.subscribe(
      pid => {
        // console.log(pid)
        if (!pid.estatus) {

          this.buscarElemento(pid.id)
        }
      }
    )

  }

  async initProcess() {
     this.lstApp = []
    await this.taskService.keys().then(
      async lst => {
        let cnt = lst.length;
        for (let i = 0; i < cnt; i++) {
          const e = lst[i];
          this.taskService.get(e).then(
            data => {

              this.lstApp.push(
                {
                  pid: data.id.substring(0, 6),
                  programa: data.funcion,
                  argumento: data.nombre,
                  usuario: data.usuario,
                  tiempo: data.fin == undefined ? '' : data.fin.toUTCString().substring(0, 16),
                  estatus: data.estatus
                }
              )
              // console.log(this.lstApp)
              if (i == cnt - 1) this.insertCommitDB(this.lstApp)
            }
          )

        }
      }
    )
  }

  async buscarElemento(pid: string) {

    this.rowData = (await this.rowData).map(e => {
      if (e.pid == pid.substring(0, 6)) {
        e.tiempo = new Date().toUTCString().substring(0, 16)
        e.estatus = false
      }
      return e
    })
    console.log(this.rowData)
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

  /**
   * Toggle sidebar open
   *
   * @param key
   */
  toggleSidebar(key): void {
    this._coreSidebarService.getSidebarRegistry(key).toggleOpen();
  }
}
