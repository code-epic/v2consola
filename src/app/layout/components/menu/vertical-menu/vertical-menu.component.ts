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


    this.mensajeService.progreso$.subscribe((progreso) => {
      // console.log('VerticalMenuComponent: Progreso recibido:', progreso);
      if (progreso.from === 'exec-pipe' && progreso.type === 'progress') {
        this.progressMode = 'indeterminate';
        this.progressLabel = 'Generando Respaldo...';
        this.blCargando = true;
        this.actualizarProgresoIndeterminado(progreso.message.bytes, progreso.message.speed);
      }else if (progreso.from === 'exec-pipe' && progreso.type === 'dump_finished') {
        this.blCargando = false;
      }

    });

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

    // this.simularProgreso();
    // this.simularProgresoIndeterminado(); // Descomenta esta línea para probar el modo indeterminado
  }

  /**
   * Simula una carga DETERMINADA para demostrar el indicador de progreso.
   */
  simularProgreso(): void {
    this.blCargando = true;
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5; // Incremento aleatorio
      if (progress >= 100) {
        progress = 100;
        this.actualizarProgreso(progress, 25.8); // Actualiza una última vez al 100%
        clearInterval(interval);
        setTimeout(() => { this.blCargando = false; }, 2000); // Oculta después de 2s
        return;
      }
      this.actualizarProgreso(progress, 25.8);
    }, 800);
  }
  /**
   * Actualiza los valores del indicador de progreso.
   * @param percentage El progreso en porcentaje (0-100).
   * @param totalSize El tamaño total de la descarga/proceso.
   */
  actualizarProgreso(percentage: number, totalSize: number): void {
    this.progressPercentage = Math.round(percentage);
    const downloaded = (totalSize * (this.progressPercentage / 100)).toFixed(1);
    this.progressText = `${downloaded} MB de ${totalSize} MB`;
  }


  /**
   * Actualiza los valores del indicador de progreso.
   * Simula una carga INDETERMINADA (ej. dump de BD) para demostrar el indicador.
   */
  simularProgresoIndeterminado(): void {
    this.progressMode = 'indeterminate';
    this.progressLabel = 'Generando Dump BD...';
    this.blCargando = true;
    let bytes = 0;
    const interval = setInterval(() => {
      const chunk = (Math.random() * 500000) + 100000; // entre 100KB y 600KB
      bytes += chunk;
      const currentSpeed = chunk / 0.8; // chunk por intervalo de 800ms
      this.actualizarProgresoIndeterminado(bytes, currentSpeed);

      if (bytes > 15000000) { // Detener después de ~15MB para la demo
        clearInterval(interval);
        setTimeout(() => { this.blCargando = false; }, 2000);
      }
    }, 800);
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
