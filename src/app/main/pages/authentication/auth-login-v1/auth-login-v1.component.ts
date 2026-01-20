import { Component, OnInit, ViewEncapsulation, Inject } from "@angular/core";
import {
  NgForm,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

import { CoreConfigService } from "@core/services/config.service";

import { IToken, LoginService } from "@services/seguridad/login.service";

import { environment } from "environments/environment";
import { UtilService } from "@services/util/util.service";

// import { ReCaptchaV3Service } from "ng-recaptcha";
import { TaskService } from "@services/apicore/task.service";
import { Router } from "@angular/router";

import { DOCUMENT } from '@angular/common';
import { ApiService } from "@services/apicore/api.service";

@Component({
  selector: "app-auth-login-v1",
  templateUrl: "./auth-login-v1.component.html",
  styleUrls: ["./auth-login-v1.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AuthLoginV1Component implements OnInit {
  token: string | undefined;
  //  Public
  public fechafinal
  public fechaX
  public build
  public coreConfig: any;
  public loginForm: UntypedFormGroup;
  public submitted = false;
  public passwordTextType: boolean;
  public usuario: string;
  public clave: string;

  public loading = false;
  public isHidden: boolean = true;

  public iToken: IToken = {
    token: "",
  };

  public itk: IToken;

  public bdv: boolean = true


  // Private
  private _unsubscribeAll: Subject<any>;
  public showTotpSection = false;
  public otp: string[] = new Array(6).fill('');
  public isOtpInvalid = false;
  private tempAuthToken = ''; // To store the token from the first login step

  public xWidth = '660px'

  public version = "1.0.0";
  public fecha = "";


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
    @Inject(DOCUMENT) private document: Document
  ) {


    this.bdv = true
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
    this.bdv = this.apiService.ConsultaSistemaBDV()


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
    this.getCurrentDate()
    this.fechafinal = environment.buildDateTime
    this.fechaX = this.utilservice.FechaMoment(new Date(environment.buildDateTime))
    this.build = this.utilservice.FechaMomentL(new Date(environment.buildDateTime)).replace(/\//g, '.')

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
  }

  getCurrentDate() {
    return new Date(); // or format as you prefer
  }

  login() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.loading = true;
      this.loginService
        .getLogin(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe(
          (itk) => {

            this.loading = false;
            this.isHidden = false;
            let tk: any = this.loginService.getUserDecrypt(itk.token);


            if (tk.Usuario.token !== undefined && tk.Usuario.token !== null) {

              this.showTotpSection = true;

              this.tempAuthToken = itk.token; // Store the temporary token
            } else {
              // No 2FA, proceed with normal login
              this.loginService.Iniciar(itk.token);
            }




          },
          (er) => {
            this.loading = false;
            this.isHidden = false;
            this.utilservice.AlertMini(
              "top-end",
              "error",
              er.error?.msj || "Error al acceder al sistema",
              3000
            );
          }
        );
    }
  }


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  loginOpt() {
    this.xWidth = '660px'
    this.loading = true;
    console.log(this.usuario, this.clave)
    this.loginService
      .getLogin(this.usuario, this.clave)
      .subscribe(
        (itk) => {
          console.log(itk)
          this.loading = false;
          this.isHidden = false;
          let tk: any = this.loginService.getUserDecrypt(itk.token);
          this.tempAuthToken = itk.token; 
          if (tk.Usuario.token !== undefined && tk.Usuario.token !== null) {
            this.xWidth = '840px'
            this.showTotpSection = true;
          } else {
            console.log(this.tempAuthToken)
            this.loginService.Iniciar(this.tempAuthToken);
          }

        },
        (er) => {
          console.log(er)
          this.loading = false;
          this.isHidden = false;
          this.utilservice.AlertMini(
            "top-end",
            "error",
            er.error?.msj || "Error al acceder al sistema",
            3000
          );
        }
      );

  }


  onLoginBlur() {
    if (this.bdv && this.usuario) {
      const prefix = this.usuario.substring(0, 2).toUpperCase();
      if (prefix === 'NM' || prefix === 'CT') {
        this.usuario = this.usuario.toUpperCase();
      }
    }
  }

  /**
   * Handles the paste event on the OTP inputs.
   * @param event The clipboard event.
   */
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim();

    // Check if pasted data is a 6-digit number
    if (pastedData && /^[0-9]{6}$/.test(pastedData)) {
      const inputs = Array.from(document.querySelectorAll('.otp-box')) as HTMLInputElement[];
      const digits = pastedData.split('');

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
    this.tempAuthToken = '';
    this.isOtpInvalid = false;
    this.otp = new Array(6).fill('');
    this.xWidth = '660px'
    // Also clear the actual input fields in the DOM
    const inputs = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;
    inputs.forEach(i => i.value = '');
    // Optionally, focus the username/email field again
    const emailInput = this.document.querySelector('#login-email') as HTMLInputElement;
    if (emailInput) { emailInput.focus(); }
  }


  onInput(event: any, nextInput: HTMLInputElement | null) {
    const input = event.target;
    const value = input.value;

    // Limpiar si no es número
    if (!/^[0-9]$/.test(value)) {
      input.value = '';
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

    if (event.key === 'Backspace') {
      if (!input.value && prevInput) {
        prevInput.focus();
        // Opcional: borrar el valor del anterior al retroceder
        // prevInput.value = ''; 
      }
    }
  }

  private checkAndVerify() {
    // Obtenemos todos los valores directamente del DOM para máxima precisión
    const inputs = Array.from(document.querySelectorAll('.otp-box')) as HTMLInputElement[];
    const code = inputs.map(i => i.value).join('');

    if (code.length === 6) {
      this.otp = code.split(''); // Sincronizamos con tu lógica existente
      this.Continuar();
    }
  }

  // Modifica tu handleOtpError para limpiar los inputs físicos
  private handleOtpError(alertMessage = 'Código incorrecto') {
    this.isOtpInvalid = true;
    const inputs = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
    inputs.forEach(i => (i.value = ''));

    // Usamos setTimeout para asegurar que el foco se aplique después de que Angular
    // haya actualizado la vista y aplicado la clase 'shake'.
    setTimeout(() => inputs[0]?.focus(), 0);

    // Quitar la clase de animación después de 500ms para poder repetirla
    setTimeout(() => this.isOtpInvalid = false, 500);
    setTimeout(() => (this.isOtpInvalid = false), 500);

    this.utilservice.AlertMini('top-end', 'error', alertMessage, 4000);
  }


  /**
   * Validates the completed OTP code with the backend.
   */
  Continuar() {
    const otpCode = this.otp.join('');
    if (otpCode.length !== 6 || this.loading) { // Evita re-entrada si ya está cargando
      return;
    }

    this.loading = true; // Mostrar spinner mientras valida
    this.apiService.Validar_TOTP(otpCode, this.tempAuthToken).subscribe(
      (data) => {
        this.loading = false;
        if (data.msj === 'Ok') {
          this.apiService.MultipleSesion(this.tempAuthToken).subscribe(
            (xdata) => {
              console.log(xdata)
              if (xdata.msj === 'Ok') {
                this.loginService.Iniciar(this.tempAuthToken)
              } else if (xdata.tipo == 99) {
                this.handleOtpError(xdata.msj);
                this.goBackToLogin()
              } else {
                this.handleOtpError('Error al validar el código. Consulta al administrador');
              }
            },
            (error) => { }
          );



        } else {
          this.handleOtpError('Error de validacion');
        }
      },
      (e) => {
        this.loading = false;
        console.info(e.error.msj)
        let xdata = e.error

        if (xdata.tipo == 99) {
          this.handleOtpError(xdata.msj);
          this.goBackToLogin()
        } else {
          this.handleOtpError('Error al validar el código. Inténtelo de nuevo.');
        }


      }
    );
  }


}
