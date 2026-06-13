import { Component, OnInit, OnDestroy, signal } from '@angular/core';

import { TaskService } from '@services/apicore/task.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-task-monitor',
    templateUrl: './task-monitor.component.html',
    styleUrls: ['./task-monitor.component.scss'],
    standalone: true,
    imports: []
})
export class TaskMonitorComponent implements OnInit, OnDestroy {
    public count;
    public ListaComunicaciones = [];
    public basicSelectedOption: number = 10;
    public ColumnMode = ColumnMode;
    public tempData: any[] = [];
    private _rowData = signal<any[]>([]);
    get rowData() { return this._rowData(); }
    public lstApp = [];

    private destroy$ = new Subject<void>();

    constructor(
        private taskService: TaskService,
        private msjService: WsocketsService,
    ) { }

    ngOnInit() {
        this.initProcess();
        this.escucharPID();
    }

    escucharPID() {
        this.msjService.lstpid$
            .pipe(takeUntil(this.destroy$))
            .subscribe(pid => {
                if (!pid.estatus) {
                    this.buscarElemento(pid.id);
                }
            });
    }

    async initProcess() {
        this.lstApp = [];
        const lst = await this.taskService.keys();
        
        for (let i = 0; i < lst.length; i++) {
            const data = await this.taskService.get(lst[i]);
            this.lstApp.push({
                pid: data.id.substring(0, 6),
                programa: data.funcion,
                argumento: data.nombre,
                usuario: data.usuario,
                tiempo: data.fin ? data.fin.toUTCString().substring(0, 16) : '',
                estatus: data.estatus
            });

            if (i === lst.length - 1) {
                this.insertCommitDB(this.lstApp);
            }
        }
    }

    buscarElemento(pid: string) {
        this._rowData.update(current =>
            current.map(e => {
                if (e.pid === pid.substring(0, 6)) {
                    return { ...e, tiempo: new Date().toUTCString().substring(0, 16), estatus: false };
                }
                return e;
            })
        );
        this.tempData = [...this.rowData];
    }

    insertCommitDB(lst: any[]) {
        this._rowData.set([...lst]);
        this.tempData = [...this.rowData];
    }

    ngOnDestroy() {
        this.destroy$.next(undefined);
        this.destroy$.complete();
    }
}