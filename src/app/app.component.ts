import { Component, Inject, OnDestroy, OnInit, ElementRef, Renderer2, HostListener, ApplicationRef, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as Waves from 'node-waves';

import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';
import { CoreConfigService } from '@core/services/config.service';
import { CoreLoadingScreenService } from '@core/services/loading-screen.service';
import { CoreTranslationService } from '@core/services/translation.service';

import { menu } from 'app/menu/menu';
import { locale as menuEnglish } from 'app/menu/i18n/en';
import { locale as menuEspanish } from 'app/menu/i18n/es';
import {Md5} from 'ts-md5';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None 
})
export class AppComponent implements OnInit, OnDestroy {
  devToolsOpened = false;
  private checkInterval: any;
  showContent = true;
  private disableRightClick = false; // Variable para controlar el bloqueo del clic derecho

  token: string|undefined;
  coreConfig: any;
  menu: any;
  defaultLanguage: 'es'; // This language will be used as a fallback when a translation isn't found in the current language
  appLanguage: 'es'; // Set application default language i.e fr

  // Private
  private _unsubscribeAll: Subject<any>;
  public Menu;
  private overlayElement: HTMLElement;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private _title: Title,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    public _coreConfigService: CoreConfigService,
    private _coreSidebarService: CoreSidebarService,
    private _coreLoadingScreenService: CoreLoadingScreenService,
    private _coreMenuService: CoreMenuService,
    private _coreTranslationService: CoreTranslationService,
    private _translateService: TranslateService,
    private appRef: ApplicationRef,
    private renderer: Renderer2
  ) {
    // Crear el overlay de protección
    this.overlayElement = this.renderer.createElement('div');
    this.renderer.addClass(this.overlayElement, 'devtools-overlay');
    this.renderer.setStyle(this.overlayElement, 'display', 'none');
    this.renderer.appendChild(document.body, this.overlayElement);

    // Configurar protección solo en producción
    if (environment.production) {
      this.disableRightClick = true; // Activar bloqueo de clic derecho
      this.setupProtection();
    
      // Detectar cuando las herramientas ya estaban abiertas al cargar la página
      if (window.outerWidth - window.innerWidth > 160 || 
        window.outerHeight - window.innerHeight > 160) {
        this.handleDevToolsOpened();
      }
    }

    this.Menu = undefined;
    // Get the application main menu
    var token = sessionStorage.getItem('token');
    if (token === null) {
      this.menu = menu;
    } else {
      this.Menu = JSON.parse(sessionStorage.getItem('menu'))
      this.menu = this.Menu.map(e => {
        e.id = e.nombre.toLowerCase()
        e.type = e.clase
        e.icon = e.icono
        e.translate = ''
        e.title = e.nombre
        if(e.SubMenu != undefined ) {
          e.children = e.SubMenu.map(el => {
            el.id = el.nombre.toLowerCase()
            el.title = el.descripcion
            el.type = el.clase
            el.icon = el.icono
            return el
          })
          switch (e.type) {
            case 'item':
              e.url = e.descripcion
              break;
            case 'collapsible':
              e.url = ''
              break;
            default:
              break;
          }
        }
        return e
      });
    }

    // Register the menu to the menu service
    this._coreMenuService.register('main', this.menu);

    // Set the main menu as our current menu
    this._coreMenuService.setCurrentMenu('main');

    // Add languages to the translation service
    this._translateService.addLangs(['es', 'en']);

    // This language will be used as a fallback when a translation isn't found in the current language
    this._translateService.setDefaultLang('es');

    // Set the translations for the menu
    this._coreTranslationService.translate(menuEnglish, menuEspanish);

    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    if (this.disableRightClick) {
      event.preventDefault();
    }
  }

  // Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Init wave effect (Ripple effect)
    Waves.init();

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;

      // Set application default language.
      const appLanguage = this.coreConfig.app.appLanguage || 'es';
      this._translateService.use(appLanguage);

      // Fix for ngxTranslate
      setTimeout(() => {
        this._translateService.setDefaultLang('es');
        this._translateService.setDefaultLang(appLanguage);
      });

      // Layout
      //--------

      // Remove default classes first
      this._elementRef.nativeElement.classList.remove(
        'vertical-layout',
        'vertical-menu-modern',
        'horizontal-layout',
        'horizontal-menu'
      );
      // Add class based on config options
      if (this.coreConfig.layout.type === 'vertical') {
        this._elementRef.nativeElement.classList.add('vertical-layout', 'vertical-menu-modern');
      } else if (this.coreConfig.layout.type === 'horizontal') {
        this._elementRef.nativeElement.classList.add('horizontal-layout', 'horizontal-menu');
      }

      // Navbar
      //--------

      // Remove default classes first
      this._elementRef.nativeElement.classList.remove(
        'navbar-floating',
        'navbar-static',
        'navbar-sticky',
        'navbar-hidden'
      );

      // Add class based on config options
      if (this.coreConfig.layout.navbar.type === 'navbar-static-top') {
        this._elementRef.nativeElement.classList.add('navbar-static');
      } else if (this.coreConfig.layout.navbar.type === 'fixed-top') {
        this._elementRef.nativeElement.classList.add('navbar-sticky');
      } else if (this.coreConfig.layout.navbar.type === 'floating-nav') {
        this._elementRef.nativeElement.classList.add('navbar-floating');
      } else {
        this._elementRef.nativeElement.classList.add('navbar-hidden');
      }

      // Footer
      //--------

      // Remove default classes first
      this._elementRef.nativeElement.classList.remove('footer-fixed', 'footer-static', 'footer-hidden');

      // Add class based on config options
      if (this.coreConfig.layout.footer.type === 'footer-sticky') {
        this._elementRef.nativeElement.classList.add('footer-fixed');
      } else if (this.coreConfig.layout.footer.type === 'footer-static') {
        this._elementRef.nativeElement.classList.add('footer-static');
      } else {
        this._elementRef.nativeElement.classList.add('footer-hidden');
      }

      // Blank layout
      if (
        this.coreConfig.layout.menu.hidden &&
        this.coreConfig.layout.navbar.hidden &&
        this.coreConfig.layout.footer.hidden
      ) {
        this._elementRef.nativeElement.classList.add('blank-page');
        // ! Fix: Transition issue while coming from blank page
        this._renderer.setAttribute(
          this._elementRef.nativeElement.getElementsByClassName('app-content')[0],
          'style',
          'transition:none'
        );
      } else {
        this._elementRef.nativeElement.classList.remove('blank-page');
        // ! Fix: Transition issue while coming from blank page
        setTimeout(() => {
          this._renderer.setAttribute(
            this._elementRef.nativeElement.getElementsByClassName('app-content')[0],
            'style',
            'transition:300ms ease all'
          );
        }, 0);
        // If navbar hidden
        if (this.coreConfig.layout.navbar.hidden) {
          this._elementRef.nativeElement.classList.add('navbar-hidden');
        }
        // Menu (Vertical menu hidden)
        if (this.coreConfig.layout.menu.hidden) {
          this._renderer.setAttribute(this._elementRef.nativeElement, 'data-col', '1-column');
        } else {
          this._renderer.removeAttribute(this._elementRef.nativeElement, 'data-col');
        }
        // Footer
        if (this.coreConfig.layout.footer.hidden) {
          this._elementRef.nativeElement.classList.add('footer-hidden');
        }
      }

      // Skin Class (Adding to body as it requires highest priority)
      if (this.coreConfig.layout.skin !== '' && this.coreConfig.layout.skin !== undefined) {
        this.document.body.classList.remove('default-layout', 'bordered-layout', 'dark-layout', 'semi-dark-layout');
        this.document.body.classList.add(this.coreConfig.layout.skin + '-layout');
      }
    });

    // Set the application page title
    this._title.setTitle(this.coreConfig.app.appTitle);
  }

  private setupProtection(): void {
    // Configurar detección inicial
    this.checkDevTools();

    // Verificar periódicamente
    this.checkInterval = setInterval(() => this.checkDevTools(), 1000);

    // Detectar atajos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        this.handleDevToolsOpened();
      }
    });
  }

  private checkDevTools(): void {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      this.handleDevToolsOpened();
    } else {
      this.handleDevToolsClosed();
    }
  }

  private handleDevToolsOpened(): void {
    if (!this.devToolsOpened) {
      this.devToolsOpened = true;
      this.showContent = false;
      this.disableInteractions();
      this.appRef.tick(); // Forzar actualización de la vista
    }
  }

  private handleDevToolsClosed(): void {
    if (this.devToolsOpened) {
      this.devToolsOpened = false;
      this.showContent = true;
      this.enableInteractions();
      this.appRef.tick(); // Forzar actualización de la vista
    }
  }

  private disableInteractions(): void {
    // Deshabilitar eventos
    document.addEventListener('keydown', this.preventEvent, true);
    document.addEventListener('click', this.preventEvent, true);
    document.addEventListener('contextmenu', this.preventEvent, true);
  }

  private enableInteractions(): void {
    // Habilitar eventos nuevamente
    document.removeEventListener('keydown', this.preventEvent, true);
    document.removeEventListener('click', this.preventEvent, true);
    document.removeEventListener('contextmenu', this.preventEvent, true);
  }

  private preventEvent(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    clearInterval(this.checkInterval);
    console.log('destroy code')
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle sidebar open
   *
   * @param key
   */
  toggleSidebar(key): void {
    this._coreSidebarService.getSidebarRegistry(key).toggleOpen();
  }
}