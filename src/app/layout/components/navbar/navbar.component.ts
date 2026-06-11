import {
  Component,
  OnDestroy,
  OnInit,
  HostBinding,
  HostListener,
  ViewEncapsulation,
} from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";

import * as _ from "lodash";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";

import { CoreSidebarService } from "@core/components/core-sidebar/core-sidebar.service";
import { CoreConfigService } from "@core/services/config.service";
import { CoreMediaService } from "@core/services/media.service";
import { resolveBreakpoint } from "app/layout/custom-breakpoints";
import jwt_decode from "jwt-decode";

import { coreConfig } from "app/app-config";
import { Router } from "@angular/router";
import { LoginService } from "@services/seguridad/login.service";
import { WsocketsService } from "@services/websockets/wsockets.service";
import { TaskService } from "@services/apicore/task.service";
import Swal from "sweetalert2";
import { environment } from "environments/environment";
import { ApiService, IAPICore } from "@services/apicore/api.service";
import { UtilService } from "@services/util/util.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Sha256Service } from "@services/util/sha256";
import { IdleService } from '@services/seguridad/idle.service';
import { WsSandraService } from "@services/seguridad/ws-sandra.service";


interface Change {
  usuario: string;
  clave: string;
  nueva: string;
  repite: string;
}

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {
  public horizontalMenu: boolean;
  public hiddenMenu: boolean;

  public coreConfig = coreConfig;
  public currentSkin: string;
  public prevSkin: string;

  public token;
  public usuario;
  public tipo;
  public blCargando = false;

  public languageOptions: any;
  public navigation: any;
  public selectedLanguage: any;

  public progressPercentage: number = 0;
  public circumference: number = 2 * Math.PI * 16; // 2 * π * r (nuevo radio = 16)
  public strokeOffset: number = this.circumference;

  @HostBinding("class.fixed-top")
  public isFixed = false;

  @HostBinding("class.navbar-static-style-on-scroll")
  public windowScrolled = false;


  @HostListener("window:scroll", [])
  onWindowScroll() {
    if (
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop > 100) &&
      this.coreConfig.layout.navbar.type == "navbar-static-top" &&
      this.coreConfig.layout.type == "horizontal"
    ) {
      this.windowScrolled = true;
    } else if (
      (this.windowScrolled && window.pageYOffset) ||
      document.documentElement.scrollTop ||
      document.body.scrollTop < 10
    ) {
      this.windowScrolled = false;
    }
  }

  // Private
  private _unsubscribeAll: Subject<any>;

  public showClave = false;
  public showNueva = false;
  public showRepite = false;


  public Change: Change = {
    usuario: "",
    clave: "",
    nueva: "",
    repite: "",
  }

  public bDirectorioActivo: boolean = false;
  public logo: string = ''
  public isBDV: boolean = false
  public icono: string = ''

  // Password Strength properties
  public passwordStrength: number = 0;
  public passwordStrengthLabel: string = 'Sin seguridad';
  public passwordStrengthColor: string = '';
  public passwordStrengthWidth: number = 0;


  // Agrega estas propiedades a tu clase NavbarComponent
  public showTotpSection: boolean = false;
  public totpQrCodeUrl: string = '';
  public totpSecret: string = '';
  public isTotpSecretCopied: boolean = false;
  public isTotpActive: boolean = false;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  };



  /**
   * Constructor
   *
   * @param {Router} _router
   * @param {CoreConfigService} _coreConfigService
   * @param {CoreSidebarService} _coreSidebarService
   * @param {CoreMediaService} _coreMediaService
   * @param {BreakpointObserver} _breakpointObserver
   * @param {TranslateService} _translateService
   */
  constructor(
    private msjService: WsocketsService,
    private taskService: TaskService,
    private _coreConfigService: CoreConfigService,
    private _coreMediaService: CoreMediaService,
    private _coreSidebarService: CoreSidebarService,
    private _breakpointObserver: BreakpointObserver,
    public _translateService: TranslateService,
    private loginService: LoginService,
    private apiService: ApiService,
    private utilservice: UtilService,
    private modalService: NgbModal,
    private sha256: Sha256Service,
    private router: Router,
    private idleService: IdleService,
    private ws: WsSandraService
  ) {
    this.languageOptions = {
      en: {
        title: "English",
        flag: "us",
      },
      es: {
        title: "Espanish",
        flag: "es",
      },
    };


    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }



  /**
   * On init
   */
  ngOnInit(): void {



    this.accionesGenerales()


    // Initialize Idle Service
    this.idleService.init();

    this.bDirectorioActivo =
      this.usuario.startsWith("NM") || this.usuario.startsWith("CT");

    // get the currentUser details from localStorage

    // Subscribe to the config changes
    this._coreConfigService.config
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.coreConfig = config;
        this.horizontalMenu = config.layout.type === "horizontal";
        this.hiddenMenu = config.layout.menu.hidden === true;
        this.currentSkin = config.layout.skin;
        // Fix: for vertical layout if default navbar fixed-top than set isFixed = true
        if (this.coreConfig.layout.type === "vertical") {
          setTimeout(() => {
            if (this.coreConfig.layout.navbar.type === "fixed-top") {
              this.isFixed = true;
            }
          }, 0);
        }
      });

    // Horizontal Layout Only: Add class fixed-top to navbar below large screen
    if (this.coreConfig.layout.type == "horizontal") {
      // On every media(screen) change
      this._coreMediaService.onMediaUpdate
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(() => {
          const isFixedTop = this._breakpointObserver.isMatched(resolveBreakpoint("bs-gt-xl"));
          if (isFixedTop) {
            this.isFixed = false;
          } else {
            this.isFixed = true;
          }
        });
    }

    // Set the selected language from default languageOptions
    this.selectedLanguage = _.find(this.languageOptions, {
      id: this._translateService.currentLang,
    });


    let isBDV = this.apiService.ConsultaSistemaBDV()
    if (isBDV) {
      this.coreConfig.app.appName = ''
      this.logo = 'assets/images/bdv/logobdv.png'
      this.icono = 'assets/images/bdv/icon.png'
    } else {
      this.logo = 'assets/images/logo/logo.png'
      this.icono = 'assets/images/logo/logo.png'
    }




  }


  accionesGenerales() {

    const token = sessionStorage.getItem("token");
    if (token !== null) {
      try {
        this.token = jwt_decode(token);
        this.usuario = this.token.Usuario.usuario;
        this.tipo = this.token.Usuario.nombre;
        if (this.token.Usuario.token !== undefined && this.token.Usuario.token !== '') {
          this.showTotpSection = true
          this.totpSecret = this.token.Usuario.token
          this.activarSinEvento()
        }


        // console.log('Iniciando conexion')
        this.msjService.lstpid$.subscribe((pid) => {
          this.blCargando = pid.estatus;
          this.updateProgress(pid.progress || 0);

          if (!pid.estatus) {
            this.taskService.update(pid.id);
            this.ok("Sandra Server", pid);
            // Opcional: Ocultar y resetear después de un tiempo
            setTimeout(() => { this.blCargando = false; this.updateProgress(0); }, 2000);
          }
        });

        this.msjService.pidDevice$.subscribe((pid) => {
          this.blCargando = pid.estatus;
          if (!pid.estatus) {
            this.taskService.update(pid.id);
          }
        });
        // console.log(this.token.Usuario)
        this.ws.Run(this.token.usuario);



      } catch (error) {
        console.error("Error decoding token in Navbar:", error);
        // Optional: Redirect to login or handle invalid session
      }
    } else {
      // Handle case where there is no token (e.g. redirect to login)
      // For now, ensure variables used later are safe
      this.usuario = '';
    }

  }



  activarSinEvento() {
    this.isTotpActive = true;
    this.apiService.GetImageQR(this.totpSecret).subscribe(
      (data) => {

        this.totpQrCodeUrl = data.contenido;
      },
      (error) => {
        console.error('Error al generar el código TOTP', error);
      }
    )
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle sidebar open
   *
   * @param key
   */
  toggleSidebar(key): void {
    this._coreSidebarService.getSidebarRegistry(key).toggleOpen();
  }

  /**
   * Set the language
   *
   * @param language
   */
  setLanguage(language): void {
    // Set the selected language for the navbar on change
    this.selectedLanguage = language;

    // Use the selected language id for translations
    this._translateService.use(language);

    this._coreConfigService.setConfig(
      { app: { appLanguage: language } },
      { emitEvent: true }
    );
  }

  /**
   * Toggle Dark Skin
   */
  toggleDarkSkin() {
    // Get the current skin
    this._coreConfigService
      .getConfig()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.currentSkin = config.layout.skin;
      });

    // Toggle Dark skin with prevSkin skin
    this.prevSkin = localStorage.getItem("prevSkin");

    if (this.currentSkin === "dark") {
      this._coreConfigService.setConfig(
        { layout: { skin: this.prevSkin ? this.prevSkin : "default" } },
        { emitEvent: true }
      );
    } else {
      localStorage.setItem("prevSkin", this.currentSkin);
      this._coreConfigService.setConfig(
        { layout: { skin: "dark" } },
        { emitEvent: true }
      );
    }
  }

  /**
 * Check Password Strength
 * @param password 
 */
  checkPasswordStrength(password: string): void {
    let result = 0;
    if (password.length >= 8) result += 20;
    if (password.match(/[A-Z]/)) result += 20;
    if (password.match(/[a-z]/)) result += 20;
    if (password.match(/[0-9]/)) result += 20;
    if (password.match(/[@$!%*?&]/)) result += 20;

    this.passwordStrengthWidth = result;

    if (result < 40) {
      this.passwordStrengthLabel = 'Débil';
      this.passwordStrengthColor = 'bg-danger';
    } else if (result < 80) {
      this.passwordStrengthLabel = 'Media';
      this.passwordStrengthColor = 'bg-warning';
    } else if (result === 100) {
      this.passwordStrengthLabel = 'Fuerte';
      this.passwordStrengthColor = 'bg-success';
    } else {
      this.passwordStrengthLabel = 'Buena';
      this.passwordStrengthColor = 'bg-info';
    }
  }


  /**
   * Logout method
   */
  logout() {
    this.loginService.logout();
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();
  }

  /**
   * Actualiza el valor del anillo de progreso
   * @param percentage El nuevo porcentaje (0-100)
   */
  private updateProgress(percentage: number): void {
    this.progressPercentage = Math.round(percentage);
    const offset = this.circumference - (this.progressPercentage / 100) * this.circumference;
    this.strokeOffset = offset;
  }

  ok(titulo: string, PID: any) {
    let contenido = "";
    let textoBoton = "";
    let bCancel = true;
    switch (PID.contenido) {
      case "Descargando api":
        contenido = `Proceso finalizado`;
        textoBoton = "Descargar";
        break;
      case "Descargando funciones":
        contenido = `Proceso finalizado`;
        textoBoton = "Descargar";
        break;

      case "Restaurando api":
        contenido = `Proceso finalizado, las API's se han restaurado`;
        textoBoton = "Ok";
        bCancel = false;
        break;
      case "Restaurando funciones":
        contenido = `Proceso finalizado, las Funciones se han restaurado`;
        textoBoton = "Ok";
        bCancel = false;
        break;
      case "BackupLogs":
        contenido = `Proceso finalizado, los logs se han respaldado`;
        textoBoton = "Ok";
        bCancel = false;
        break;
      default:
        contenido = `Su proyecto a sido clonado exitosamente!`;
        textoBoton = "Ir al proyecto!";
        break;
    }

    Swal.fire({
      title: titulo,
      text: contenido,
      icon: "success",
      showCancelButton: bCancel,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: textoBoton,
    }).then((result) => {
      if (result.isConfirmed) {
        switch (PID.contenido) {
          case "Descargando api":
            this.utilservice.AlertMini(
              "bottom-end",
              "success",
              "APIs Generadas",
              3000
            );
            this.apiService.DwsCdn(
              "bck-export/" + environment.driver.API_CORE_ZIP, "application/zip", ""
            );
            break;
          case "Descargando funciones":
            this.utilservice.AlertMini(
              "bottom-end",
              "success",
              "Funciones Generadas",
              3000
            );
            this.apiService.DwsCdn(
              "bck-export/" + environment.driver.SYS_FUNCION_ZIP, "application/zip", ""
            );
            break;
          case "Restaurando api":
            this.utilservice.AlertMini(
              "bottom-end",
              "success",
              "Restauracion exitosa",
              3000
            );
            break;
          case "Restaurando funciones":
            this.utilservice.AlertMini(
              "bottom-end",
              "success",
              "Restauracion exitosa",
              3000
            );
            break;
          case "Fusionando proyecto":
            this.utilservice.AlertMini(
              "bottom-end",
              "success",
              "Fusion exitosa",
              3000
            );
            break;
          case "BackupLogs":

            break;
          default:
            let dir = PID.contenido.split('|')
            window.open(`https://${dir[0]}/${dir[1]}`);
            break;
        }
      }
    });
  }

  ModalChangePassword(modal) {
    this.Change.usuario = this.usuario;
    this.modalService.open(modal, {
      centered: true,
      size: "md",
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal'
    });
  }

  async ChangesPassword() {
    if (!this.Change.usuario) {
      this.utilservice.AlertMini("top-end", "error", "No existe un usuario", 3000);
      return;
    }

    if (this.Change.nueva !== this.Change.repite) {
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "La nueva contraseña y su repetición no coinciden.",
        3000
      );
      return;
    }

    const password = this.Change.nueva;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!passwordRegex.test(password)) {
      this.utilservice.AlertMini(
        "top-end",
        "error",
        "La clave no cumple con los requisitos de complejidad.",
        5000
      );
      this.utilservice.AlertMini(
        "top-end",
        "info",
        "Debe tener entre 8 y 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&).",
        8000
      );
      return;
    }


    await this.sha256.hash(this.Change.clave).then(hash => {
      this.Change.clave = hash
    })

    await this.sha256.hash(this.Change.nueva).then(hash => {
      this.Change.nueva = hash
    })


    let xApi = {
      funcion: environment.functions.ACTUALIZAR_CLAVE_USUARIO,
      parametros: `${this.Change.usuario},${this.Change.clave},${this.Change.nueva}`,
    }

    this.apiService.Ejecutar(xApi).subscribe(
      (data) => {
        // console.log(data.ModifiedCount)
        if (data.ModifiedCount > 0) {
          this.utilservice.AlertMini("top-end", "success", "Contraseña actualizada exitosamente", 3000);
          window.sessionStorage.clear();
          this.router.navigate(['/login']);
        }
        this.clearModal();
      },
      (error) => {
        // console.log(error)
        this.clearModal();
      }
    )


  }

  clearModal() {
    this.Change = {
      usuario: "",
      clave: "",
      nueva: "",
      repite: "",
    }
    this.modalService.dismissAll();
  }





  // ... (dentro de la clase NavbarComponent)

  /**
   * Activa o desactiva la sección de configuración de TOTP.
   * Si se activa, genera el código si no ha sido generado antes.
   * @param event El evento del interruptor.
   */
  toggleTotp(event: any) {
    const isChecked = event.target.checked;
    this.showTotpSection = isChecked;

    if (isChecked && !this.totpSecret) {
      this.generateTotp()
    } else {
      this.limpiarTotp()
      console.log('Desactivado')
    }
  }

  /**
   * Llama al backend para generar un nuevo secreto y código QR para TOTP.
   */
  async generateTotp() {
    // Muestra un spinner mientras se genera el código
    this.totpQrCodeUrl = '';
    this.totpSecret = '';

    // NOTA: La siguiente sección es un EJEMPLO. Debes reemplazarla con la llamada real a tu API.
    // Asumo que tienes una función en tu API para esto.

    this.apiService.GenerarQR_TOTP('base64').subscribe(
      (data) => {
        // Asumiendo que tu API devuelve un objeto con 'qrCode' (sdata URL) y 'secret' (la clave)
        this.totpQrCodeUrl = data.contenido;
        this.totpSecret = data.msj;
      },
      (error) => {
        console.error('Error al generar el código TOTP', error);
        this.utilservice.AlertMini('top-end', 'error', 'No se pudo generar el código.', 4000);
        this.showTotpSection = false; // Oculta la sección si hay un error
      }
    );
  }

  async limpiarTotp() {

    this.showTotpSection = false;
    this.xAPI = {} as IAPICore
    this.xAPI.funcion = environment.functions.ACTUALIZAR_TOTP
    this.xAPI.parametros = this.totpSecret

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.totpQrCodeUrl = ''
        this.totpSecret = ''
      },
      (error) => {
        console.log(error)
      }
    )

  }

  /**
   * Copia la clave secreta de TOTP al portapapeles del usuario.
   */
  copyTotpSecret() {
    if (!this.totpSecret) return;

    navigator.clipboard.writeText(this.totpSecret).then(() => {
      this.isTotpSecretCopied = true;
      setTimeout(() => {
        this.isTotpSecretCopied = false;
      }, 2500);
    }).catch(err => {
      console.error('Error al copiar la clave TOTP:', err);
      this.utilservice.AlertMini('top-end', 'error', 'No se pudo copiar la clave.', 3000);
    });
  }

}
