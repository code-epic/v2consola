import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ApiService,
  ResumenRecognitionTools,
  BinarioToolInfo,
  AnalisisUsoTool,
  RecognitionToolDetailResponse,
} from '@services/apicore/api.service';

@Component({
  selector: 'app-recognition-tools',
  templateUrl: './recognition-tools.component.html',
  styleUrls: ['./recognition-tools.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class RecognitionToolsComponent implements OnInit, OnDestroy {
  searchCtrl = new FormControl('');
  private _search = signal<string>('');
  private _onlyActive = signal<boolean>(false);
  get onlyActive() { return this._onlyActive(); }
  private _onlyExecutable = signal<boolean>(true);
  get onlyExecutable() { return this._onlyExecutable(); }

  private _loading = signal<boolean>(false);
  get loading() { return this._loading(); }

  private _error = signal<string>('');
  get error() { return this._error(); }

  private _resumen = signal<ResumenRecognitionTools | null>(null);
  get resumen() { return this._resumen(); }

  public filteredToolsSignal = computed<BinarioToolInfo[]>(() => {
    const res = this._resumen();
    const list = res?.herramientas || [];
    const term = this._search().toLowerCase().trim();
    const act = this._onlyActive();
    const execOnly = this._onlyExecutable();

    return list
      .filter((t) => {
        if (execOnly && !t.ejecutable) return false;
        if (act && !t.activo) return false;
        if (!term) return true;
        return (
          (t.nombre || '').toLowerCase().includes(term) ||
          (t.ruta || '').toLowerCase().includes(term) ||
          (t.funciones_plataforma || []).some((fn) =>
            (fn.nombre || '').toLowerCase().includes(term),
          )
        );
      })
      .sort((a, b) => {
        if (a.activo !== b.activo) return a.activo ? -1 : 1;
        if (a.activo && b.activo) {
          const timeDiff =
            (b.tiempo_activo_max_seg || b.tiempo_activo_total_seg || 0) -
            (a.tiempo_activo_max_seg || a.tiempo_activo_total_seg || 0);
          if (timeDiff !== 0) return timeDiff;
          if ((b.instancias_activas || 0) !== (a.instancias_activas || 0)) {
            return (b.instancias_activas || 0) - (a.instancias_activas || 0);
          }
        }
        if (a.ejecutable !== b.ejecutable) return a.ejecutable ? -1 : 1;
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
  });
  get filteredTools() { return this.filteredToolsSignal(); }

  // Drill-down detail view inside drawer
  private _loadingDetail = signal<boolean>(false);
  get loadingDetail() { return this._loadingDetail(); }

  private _selectedTool = signal<BinarioToolInfo | null>(null);
  get selectedTool() { return this._selectedTool(); }

  private _selectedUsage = signal<AnalisisUsoTool | null>(null);
  get selectedUsage() { return this._selectedUsage(); }

  private _detailTab = signal<'procesos' | 'funciones' | 'uso'>('uso');
  get detailTab() { return this._detailTab(); }

  private _lastSync = signal<Date | null>(null);
  get lastSync() { return this._lastSync(); }

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this._search.set(val || '');
        this.cdr.markForCheck();
      });

    if (sessionStorage.getItem('token')) {
      this.cargarHerramientas();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }

  toggleOnlyActive() {
    this._onlyActive.update((v) => !v);
  }

  toggleOnlyExecutable() {
    this._onlyExecutable.update((v) => !v);
  }

  setDetailTab(tab: 'procesos' | 'funciones' | 'uso') {
    this._detailTab.set(tab);
  }

  cargarHerramientas() {
    this._loading.set(true);
    this._error.set('');

    this.apiService.GetRecognitionTools().subscribe({
      next: (res: any) => {
        this._loading.set(false);
        const payload: ResumenRecognitionTools =
          res?.contenido ?? res?.Contenido ?? res;
        if (payload && Array.isArray(payload.herramientas)) {
          this._resumen.set(payload);
        } else {
          this._resumen.set(null);
          this._error.set(
            res?.msj || res?.Msj || 'No se encontraron herramientas en ./bin.',
          );
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this._loading.set(false);
        this._error.set(
          err?.error?.msj ||
            err?.error?.Msj ||
            'Error al consultar recognition/tools en Sandra.',
        );
        this.cdr.markForCheck();
      },
    });
  }

  verDetalle(tool: BinarioToolInfo, preserveTab: boolean = false) {
    this._selectedTool.set(tool);
    if (!preserveTab) {
      this._selectedUsage.set(null);
      this._detailTab.set(tool.activo ? 'procesos' : 'uso');
    }
    this._loadingDetail.set(true);

    this.apiService.GetRecognitionToolDetail(tool.nombre).subscribe({
      next: (res: any) => {
        this._loadingDetail.set(false);
        this._lastSync.set(new Date());
        const detail: RecognitionToolDetailResponse =
          res?.contenido ?? res?.Contenido ?? res;
        if (detail?.herramienta) {
          this._selectedTool.set(detail.herramienta);
          this._resumen.update((curr) => {
            if (!curr) return curr;
            const herramientas = curr.herramientas.map((h) =>
              h.nombre === detail.herramienta.nombre ? detail.herramienta : h,
            );
            const activos = herramientas.filter((h) => h.activo).length;
            return {
              ...curr,
              herramientas,
              activos,
              inactivos: herramientas.length - activos,
            };
          });
        }
        if (detail?.uso) this._selectedUsage.set(detail.uso);
        this.cdr.markForCheck();
      },
      error: () => {
        this._loadingDetail.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  verUsoGlobal() {
    this._selectedTool.set(null);
    this._loadingDetail.set(true);
    this._detailTab.set('uso');

    this.apiService.GetRecognitionToolUsage('all', 40).subscribe({
      next: (res: any) => {
        this._loadingDetail.set(false);
        this._lastSync.set(new Date());
        const uso: AnalisisUsoTool = res?.contenido ?? res?.Contenido ?? res;
        if (uso) this._selectedUsage.set(uso);
        this.cdr.markForCheck();
      },
      error: () => {
        this._loadingDetail.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  refrescarDetalle() {
    const tool = this._selectedTool();
    if (tool) {
      this.verDetalle(tool, true);
    } else if (this._selectedUsage()) {
      this.verUsoGlobal();
    }
  }

  volverLista() {
    this._selectedTool.set(null);
    this._selectedUsage.set(null);
    this._lastSync.set(null);
  }
}
