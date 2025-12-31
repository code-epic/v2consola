import { Component, OnInit, OnDestroy, ViewChild, HostListener, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Subject } from 'rxjs';
import { take, takeUntil, filter } from 'rxjs/operators';
import { PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';

import { CoreConfigService } from '@core/services/config.service';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { ApiService } from '@services/apicore/api.service';
import { MensajeService } from '@services/util/mensaje.service';

@Component({
  selector: 'vertical-menu',
  templateUrl: './vertical-menu.component.html',
  styleUrls: ['./vertical-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VerticalMenuComponent implements OnInit, OnDestroy {
  coreConfig: any;
  menu: any;
  isCollapsed: boolean;
  isScrolled: boolean = false;

  // Private
  private _unsubscribeAll: Subject<any>;
  public logo: string = '';
  public logoWidth: string = '36';
  public isBDV: boolean = false;

  // Propiedades para el indicador de progreso
  public blCargando: boolean = false;
  public progressPercentage: number = 0;
  public progressText: string = '';
  public progressMode: 'determinate' | 'indeterminate' = 'determinate';
  public speed: string = '';
  public progressLabel: string = 'Sincronizando...';

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {CoreMenuService} _coreMenuService
   * @param {CoreSidebarService} _coreSidebarService
   * @param {Router} _router
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _coreMenuService: CoreMenuService,
    private _coreSidebarService: CoreSidebarService,
    private _router: Router,
    private apiService: ApiService,
    private mensajeService: MensajeService
  ) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  @ViewChild(PerfectScrollbarDirective, { static: false }) directiveRef?: PerfectScrollbarDirective;

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On Init
   */
  ngOnInit(): void {

    this.mensajeService.progreso$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(progreso => this.handleProgressUpdate(progreso));

    // Subscribe config change
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });

    this.isCollapsed = this._coreSidebarService.getSidebarRegistry('menu').collapsed;

    // Close the menu on router NavigationEnd (Required for small screen to close the menu on select)
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        if (this._coreSidebarService.getSidebarRegistry('menu')) {
          this._coreSidebarService.getSidebarRegistry('menu').close();
        }
      });

    // scroll to active on navigation end
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe(() => {
        setTimeout(() => {
          this.directiveRef.scrollToElement('.navigation .active', -180, 500);
        });
      });

    // Get current menu
    this._coreMenuService.onMenuChanged
      .pipe(
        filter(value => value !== null),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.menu = this._coreMenuService.getCurrentMenu();
      });

    this.isBDV = this.apiService.ConsultaSistemaBDV()
    if (this.isBDV) {
      this.coreConfig.app.appName = ''
      this.logo = 'assets/images/bdv/bdv.png'
      this.logoWidth = '70'
    } else {
      this.logo = 'assets/images/logo/logo.png'
    }

  }

  /**
   * Routes progress updates to the appropriate handler based on the source.
   * @param progreso The progress event object from MensajeService.
   */
  private handleProgressUpdate(progreso: any): void {
    if (!progreso || !progreso.from) {
      return;
    }

    this.blCargando = true;

    switch (progreso.from) {
      case 'exec-pipe':
        this.handleExecPipe(progreso);
        break;
      case 'file-upload':
        this.handleFileUpload(progreso);
        break;
      default:
        this.blCargando = false;
        console.warn('VerticalMenuComponent: Fuente de progreso desconocida:', progreso.from);
        break;
    }
  }

  /**
   * Handles progress events from 'exec-pipe' (backups, restores).
   * @param progreso The progress event object.
   */
  private handleExecPipe(progreso: any): void {
    switch (progreso.type) {
      case 'progress': // Backup progress
        this.progressMode = 'indeterminate';
        this.progressLabel = 'Generando Respaldo...';
        this.actualizarProgresoIndeterminado(progreso.message.bytes, progreso.message.speed);
        break;
      case 'dump_finished':
        // console.log(progreso.message)
        this.finishProgress('Respaldo Completado');
        this.apiService.DwsCdn("bck-export/" + progreso.message.file, "application/zip", progreso.message.file);
        this.mensajeService.finalizacion$.emit({"estatus": true})
        break
      case 'restore':
        this.progressMode = 'determinate';
        this.progressLabel = 'Restaurando Base de Datos...';
        this.actualizarProgreso(progreso.message.percentage, progreso.message.total);
        break;
      case 'restore_finished':
        this.finishProgress('Restauración Completada');
        break;
    }
  }

  /**
   * Handles progress events from 'file-upload'.
   * @param progreso The progress event object.
   */
  private handleFileUpload(progreso: any): void {
    switch (progreso.type) {
      case 'progress':
        this.progressMode = 'determinate';
        this.progressLabel = progreso.progress < 99 ? 'Subiendo Archivo...' : 'Procesando en servidor...';
        this.progressPercentage = progreso.progress;
        this.progressText = `${this.formatBytes(progreso.loaded)} de ${this.formatBytes(progreso.total)}`;
        break;
      case 'finished':
        this.finishProgress('Subida Finalizada');
        break;
    }
  }




  /**
   * Actualiza los valores del indicador de progreso.
   * @param percentage El progreso en porcentaje (0-100).
   * @param totalSize El tamaño total de la descarga/proceso.
   */
  actualizarProgreso(percentage: number, totalSizeInBytes: number): void {
    this.progressPercentage = Math.round(percentage);
    const totalSizeInMB = totalSizeInBytes / (1024 * 1024);
    const downloadedInMB = totalSizeInMB * (this.progressPercentage / 100);

    this.progressText = `${downloadedInMB.toFixed(1)} MB de ${totalSizeInMB.toFixed(1)} MB`;
  }

  /**
   * Formatea los bytes a un tamaño legible (KB, MB, GB).
   * @param bytes El número de bytes.
   * @param decimals El número de decimales.
   */
  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
 * Actualiza los valores del indicador de progreso INDETERMINADO.
 * @param bytes Los bytes procesados hasta ahora.
 * @param speedInBps La velocidad actual en bytes por segundo.
 */
  actualizarProgresoIndeterminado(bytes: number, speedInBps: number): void {
    if (speedInBps > 1024 * 1024) {
      this.speed = `${(speedInBps / (1024 * 1024)).toFixed(2)} MB/s`;
    } else {
      this.speed = `${(speedInBps / 1024).toFixed(1)} KB/s`;
    }

    if (bytes > 1024 * 1024) {
      this.progressText = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      this.progressText = `${(bytes / 1024).toFixed(1)} KB`;
    }
  }

  /**
   * Finalizes the progress bar display for a completed task.
   * @param label The final label to show (e.g., "Completed").
   */
  private finishProgress(label: string): void {
    this.progressLabel = label;
    if (this.progressMode === 'determinate' && this.progressPercentage < 100) {
      this.progressPercentage = 100;
    }
    setTimeout(() => {
      this.blCargando = false;


    }, 2000);
  }


  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * On Sidebar scroll set isScrolled as true
   */
  onSidebarScroll(): void {
    if (this.directiveRef.position(true).y > '3') {
      this.isScrolled = true;
    } else {
      this.isScrolled = false;
    }
  }

  /**
   * Toggle sidebar expanded status
   */
  toggleSidebar(): void {
    this._coreSidebarService.getSidebarRegistry('menu').toggleOpen();
  }

  /**
   * Toggle sidebar collapsed status
   */
  toggleSidebarCollapsible(): void {
    // Get the current menu state
    this._coreConfigService
      .getConfig()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(config => {
        this.isCollapsed = config.layout.menu.collapsed;
      });

    if (this.isCollapsed) {
      this._coreConfigService.setConfig({ layout: { menu: { collapsed: false } } }, { emitEvent: true });
    } else {
      this._coreConfigService.setConfig({ layout: { menu: { collapsed: true } } }, { emitEvent: true });
    }
  }
}
