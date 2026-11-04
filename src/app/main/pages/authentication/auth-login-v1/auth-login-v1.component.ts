import { Component, OnInit, ViewEncapsulation, Inject, DOCUMENT, ChangeDetectorRef } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";

import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

import { CoreConfigService } from "@core/services/config.service";
import { CoreCommonModule } from "@core/common.module";

import { IToken, LoginService } from "@services/seguridad/login.service";
import { CaptchaService, ICaptchaSolution } from "@services/seguridad/captcha.service";

import { environment } from "environments/environment";
import { UtilService } from "@services/util/util.service";

import { TaskService } from "@services/apicore/task.service";
import { ApiService } from "@services/apicore/api.service";

@Component({
    selector: "app-auth-login-v1",
    templateUrl: "./auth-login-v1.component.html",
    styleUrls: ["./auth-login-v1.component.scss"],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, CoreCommonModule]
})
export class AuthLoginV1Component implements OnInit {
  token: string | undefined;
  //  Public
  public fechafinal;
  public fechaX;
  public build;
  public coreConfig: any;
  public loginForm: UntypedFormGroup;
  public submitted = false;
  public passwordTextType: boolean;
  usuarioCtrl = new FormControl('');
  claveCtrl = new FormControl('');

  public loading = false;
  public isHidden: boolean = true;

  public iToken: IToken = {
    token: "",
  };

  public itk: IToken;

  public bdv: boolean = true;

  // Challenge PoW / Captcha
  public botValidado: boolean = false;
  public validandoBot: boolean = false;
  public captchaData: ICaptchaSolution | null = null;

  // Transición animada de ingreso interactivo
  public isFadingOut: boolean = false;
  public isTransitioning: boolean = false;
  public transitionStep: string = "Iniciando sesión segura...";
  public transitionPercent: number = 10;

  // Private
  private _unsubscribeAll: Subject<any>;
  public showTotpSection = false;
  public otp: string[] = new Array(6).fill("");
  public isOtpInvalid = false;
  private tempAuthToken = ""; // To store the token from the first login step

  public xWidth = "660px";

  public version = "1.0.0";
  public fecha = "";

  public validar_token: string | null = null;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private taskService: TaskService,
    // private recaptchaV3Service: ReCaptchaV3Service,
    private _coreConfigService: CoreConfigService,
    private _formBuilder: UntypedFormBuilder,
    private router: Router,
    private loginService: LoginService,
    // private toastrService: ToastrService,
    private utilservice: UtilService,
    private apiService: ApiService,
    private captchaService: CaptchaService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.bdv = true;
    if (sessionStorage.getItem("token") != undefined) {
      this.router.navigate(["home"]);
    }
    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true,
        },
        menu: {
          hidden: true,
        },
        footer: {
          hidden: true,
        },
        customizer: false,
        enableLocalStorage: false,
      },
    };
    this.bdv = this.apiService.ConsultaSistemaBDV();
    this.validar_token = sessionStorage.getItem("token");
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * On init
   */
  ngOnInit(): void {
    this.getCurrentDate();
    this.fechafinal = environment.buildDateTime;
    this.fechaX = this.utilservice.FechaMoment(
      new Date(environment.buildDateTime),
    );
    this.build = this.utilservice
      .FechaMomentL(new Date(environment.buildDateTime))
      .replace(/\//g, ".");

    this.version = environment.version;

    this.loginForm = this._formBuilder.group({
      email: ["", [Validators.required]],
      password: ["", Validators.required],
    });

    // Subscribe to config changes
    this._coreConfigService.config
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.coreConfig = config;
      });

    if (this.validar_token) {
      this.loginService.Token = this.loginService.getUserDecrypt(
        this.validar_token,
      );
      this.loginService.obenterAplicacion(this.validar_token);
    }

    // Reto criptográfico PoW automático y transparente de fondo
    setTimeout(() => {
      this.validarHumano();
    }, 400);
  }

  getCurrentDate() {
    return new Date(); // or format as you prefer
  }

  /**
   * Resuelve o regenera el reto criptográfico PoW de Sandra Server
   */
  async validarHumano() {
    if (this.botValidado || this.validandoBot) return;
    this.validandoBot = true;
    this.cdr.markForCheck();
    try {
      const solData = await this.captchaService.obtenerYResolver();
      if (solData) {
        this.captchaData = solData;
        this.botValidado = true;
      } else {
        // Fallback cuando Sandra Server no requiere captcha o endpoint retorna nulo
        this.botValidado = true;
      }
    } catch (err) {
      console.warn("[AuthLoginV1Component] Validación captcha fallback:", err);
      this.botValidado = !environment.production;
    } finally {
      this.validandoBot = false;
      this.cdr.markForCheck();
    }
  }

  async login() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    if (!this.botValidado && !this.validandoBot) {
      await this.validarHumano();
    }

    this.loading = true;
    this.loginService
      .getLogin(this.loginForm.value.email, this.loginForm.value.password, this.captchaData)
      .subscribe(
        (itk) => {
          this.loading = false;
          this.isHidden = false;
          let tk: any = this.loginService.getUserDecrypt(itk.token);

          if (tk.Usuario.token !== undefined && tk.Usuario.token !== null) {
            this.loading = false;
            this.isHidden = false;
            this.showTotpSection = true;

            this.tempAuthToken = itk.token; // Store the temporary token
          } else {
            // No 2FA, proceed with interactive animated transition
            this.isHidden = false;
            this.iniciarSesionConTransicion(itk.token);
          }
          this.cdr.markForCheck();
        },
        (er) => {
          this.loading = false;
          this.isFadingOut = false;
          this.isHidden = false;
          this.isTransitioning = false;
          // Diagnóstico: mostrar error real en consola
          console.error('[LOGIN_ERROR]', er, er.error || '(sin error.http)');
          const msg = er.error?.msj || (typeof er === 'string' ? er : 'Error al acceder al sistema');
          this.utilservice.AlertMini(
            "top-end",
            "error",
            msg,
            5000,
          );

          // Regenerar reto de seguridad en caso de fallo
          this.botValidado = false;
          this.captchaData = null;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.validarHumano();
          }, 400);
        },
      );
  }

  /**
   * Ejecuta la transición suave de ingreso con difuminado elegante sin mover la tarjeta
   */
  async iniciarSesionConTransicion(token: string) {
    this.isFadingOut = true;
    this.loading = true;
    this.cdr.markForCheck();

    try {
      await this.loginService.Iniciar(token);
    } catch (err) {
      console.error("[iniciarSesionConTransicion] Error:", err);
      this.isFadingOut = false;
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(undefined);
    this._unsubscribeAll.complete();
    this._coreConfigService.resetConfig();
  }

  async loginOpt() {
    this.xWidth = "660px";

    if (!this.botValidado && !this.validandoBot) {
      await this.validarHumano();
    }

    this.loading = true;
    console.log(this.usuarioCtrl.value, this.claveCtrl.value);
    this.loginService.getLogin(this.usuarioCtrl.value, this.claveCtrl.value, this.captchaData).subscribe(
      (itk) => {
        let tk: any = this.loginService.getUserDecrypt(itk.token);
        this.tempAuthToken = itk.token;
        if (tk.Usuario.token !== undefined && tk.Usuario.token !== null) {
          this.loading = false;
          this.isHidden = false;
          this.xWidth = "840px";
          this.showTotpSection = true;
        } else {
          this.isHidden = false;
          this.iniciarSesionConTransicion(this.tempAuthToken);
        }
        this.cdr.markForCheck();
      },
      (er) => {
        this.loading = false;
        this.isFadingOut = false;
        this.isTransitioning = false;
        console.error('[LOGIN_OPT_ERROR]', er, er.error || '(sin error.http)');
        const msg = er.error?.msj || (typeof er === 'string' ? er : 'Error al acceder al sistema');
        this.utilservice.AlertMini(
          "top-end",
          "error",
          msg,
          5000,
        );

        // Regenerar reto de seguridad en caso de fallo
        this.botValidado = false;
        this.captchaData = null;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.validarHumano();
        }, 400);
      },
    );
  }

  onLoginBlur() {
    if (this.bdv && this.usuarioCtrl.value) {
      const prefix = this.usuarioCtrl.value.substring(0, 2).toUpperCase();
      if (prefix === "NM" || prefix === "CT") {
        this.usuarioCtrl.setValue(this.usuarioCtrl.value.toUpperCase());
      }
    }
  }

  /**
   * Handles the paste event on the OTP inputs.
   * @param event The clipboard event.
   */
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData("text").trim();

    // Check if pasted data is a 6-digit number
    if (pastedData && /^[0-9]{6}$/.test(pastedData)) {
      const inputs = Array.from(
        document.querySelectorAll(".otp-box"),
      ) as HTMLInputElement[];
      const digits = pastedData.split("");

      inputs.forEach((input, index) => {
        if (digits[index]) {
          input.value = digits[index];
        }
      });

      // Focus the last input and trigger verification
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
        this.checkAndVerify();
      }
    }
  }

  /**
   * Navigates back to the username/password login view.
   */
  goBackToLogin() {
    this.showTotpSection = false;
    this.isTransitioning = false;
    this.tempAuthToken = "";
    this.isOtpInvalid = false;
    this.otp = new Array(6).fill("");
    this.xWidth = "660px";
    // Also clear the actual input fields in the DOM
    const inputs = document.querySelectorAll(
      ".otp-box",
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((i) => (i.value = ""));
    // Optionally, focus the username/email field again
    const emailInput = this.document.querySelector(
      "#login-email",
    ) as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  }

  onInput(event: any, nextInput: HTMLInputElement | null) {
    const input = event.target;
    const value = input.value;

    // Limpiar si no es número
    if (!/^[0-9]$/.test(value)) {
      input.value = "";
      return;
    }

    // Mover al siguiente si hay valor
    if (value && nextInput) {
      nextInput.focus();
    }

    this.checkAndVerify();
  }

  onKeydown(event: KeyboardEvent, prevInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;

    if (event.key === "Backspace") {
      if (!input.value && prevInput) {
        prevInput.focus();
        // Opcional: borrar el valor del anterior al retroceder
        // prevInput.value = '';
      }
    }
  }

  private checkAndVerify() {
    // Obtenemos todos los valores directamente del DOM para máxima precisión
    const inputs = Array.from(
      document.querySelectorAll(".otp-box"),
    ) as HTMLInputElement[];
    const code = inputs.map((i) => i.value).join("");

    if (code.length === 6) {
      this.otp = code.split(""); // Sincronizamos con tu lógica existente
      this.Continuar();
    }
  }

  // Modifica tu handleOtpError para limpiar los inputs físicos
  private handleOtpError(alertMessage = "Código incorrecto") {
    this.isOtpInvalid = true;
    const inputs = document.querySelectorAll(
      ".otp-box",
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((i) => (i.value = ""));
    inputs[0].focus();
    inputs.forEach((i) => (i.value = ""));

    // Usamos setTimeout para asegurar que el foco se aplique después de que Angular
    // haya actualizado la vista y aplicado la clase 'shake'.
    setTimeout(() => inputs[0]?.focus(), 0);

    // Quitar la clase de animación después de 500ms para poder repetirla
    setTimeout(() => (this.isOtpInvalid = false), 500);
    setTimeout(() => (this.isOtpInvalid = false), 500);

    this.utilservice.AlertMini("top-end", "error", alertMessage, 4000);
  }

  /**
   * Validates the completed OTP code with the backend.
   */
  Continuar() {
    const otpCode = this.otp.join("");
    if (otpCode.length !== 6 || this.loading) {
      // Evita re-entrada si ya está cargando
      return;
    }

    this.loading = true; // Mostrar spinner mientras valida
    this.apiService.Validar_TOTP(otpCode, this.tempAuthToken).subscribe(
      (data) => {
        this.loading = false;
        if (data.msj === "Ok") {
          this.apiService.MultipleSesion(this.tempAuthToken).subscribe(
            (xdata) => {
              console.log(xdata);
              if (xdata.msj === "Ok") {
                this.iniciarSesionConTransicion(this.tempAuthToken);
              } else if (xdata.tipo == 99) {
                this.handleOtpError(xdata.msj);
                this.goBackToLogin();
              } else {
                this.handleOtpError(
                  "Error al validar el código. Consulta al administrador",
                );
              }
            },
            (error) => {},
          );
        } else {
          this.handleOtpError("Error de validacion");
        }
      },
      (e) => {
        this.loading = false;
        console.info(e.error.msj);
        let xdata = e.error;

        if (xdata.tipo == 99) {
          this.handleOtpError(xdata.msj);
          this.goBackToLogin();
        } else {
          this.handleOtpError(
            "Error al validar el código. Inténtelo de nuevo.",
          );
        }
      },
    );
  }
}
