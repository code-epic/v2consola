import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '@services/apicore/task.service';
import { WsocketsService } from '@services/websockets/wsockets.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-task-monitor',
  templateUrl: './task-monitor.component.html',
  styleUrls: ['./task-monitor.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class TaskMonitorComponent implements OnInit, OnDestroy {
  searchCtrl = new FormControl('');
  private _searchTerm = signal<string>('');
  private _statusFilter = signal<'ALL' | 'RUNNING' | 'DONE'>('ALL');
  get statusFilter() { return this._statusFilter(); }

  private _loading = signal<boolean>(false);
  get loading() { return this._loading(); }

  private _rowData = signal<any[]>([]);
  get rowData() { return this.filteredRowsSignal(); }

  public kpisSignal = computed(() => {
    const all = this._rowData();
    const running = all.filter((r) => !!r.estatus).length;
    return {
      total: all.length,
      running,
      done: all.length - running,
    };
  });
  get kpis() { return this.kpisSignal(); }

  public filteredRowsSignal = computed(() => {
    const all = this._rowData();
    const term = this._searchTerm().toLowerCase().trim();
    const filter = this._statusFilter();

    return all.filter((r) => {
      if (filter === 'RUNNING' && !r.estatus) return false;
      if (filter === 'DONE' && r.estatus) return false;
      if (!term) return true;
      return (
        (r.pid || '').toLowerCase().includes(term) ||
        (r.programa || '').toLowerCase().includes(term) ||
        (r.argumento || '').toLowerCase().includes(term) ||
        (r.usuario || '').toLowerCase().includes(term)
      );
    });
  });

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private msjService: WsocketsService,
  ) {}

  ngOnInit() {
    this.searchCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => this._searchTerm.set(val || ''));

    this.initProcess();
    this.escucharPID();
  }

  setStatusFilter(filter: 'ALL' | 'RUNNING' | 'DONE') {
    this._statusFilter.set(filter);
  }

  escucharPID() {
    this.msjService.lstpid$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pid) => {
        if (pid && !pid.estatus && pid.id) {
          this.buscarElemento(pid.id);
        }
      });
  }

  async initProcess() {
    this._loading.set(true);
    try {
      const lst = await this.taskService.keys();
      if (!lst || lst.length === 0) {
        this._rowData.set([]);
        return;
      }

      const items = await Promise.all(
        lst.map(async (key: string) => {
          const data = await this.taskService.get(key);
          if (!data) return null;
          return {
            pid: (data.id || '').substring(0, 6),
            programa: data.funcion || '---',
            argumento: data.nombre || '---',
            usuario: data.usuario || 'sistema',
            tiempo: data.fin ? new Date(data.fin).toUTCString().substring(0, 16) : '',
            estatus: !!data.estatus,
          };
        }),
      );

      this._rowData.set(items.filter((x) => x !== null));
    } catch (error) {
      console.error('[Core TaskMonitor] Error cargando procesos:', error);
    } finally {
      this._loading.set(false);
    }
  }

  buscarElemento(pid: string) {
    const prefix = pid.substring(0, 6);
    this._rowData.update((current) =>
      current.map((e) =>
        e.pid === prefix
          ? { ...e, tiempo: new Date().toUTCString().substring(0, 16), estatus: false }
          : e,
      ),
    );
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
