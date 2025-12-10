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

  public version = "1.0.0";
  public fecha = "";

  /**
   * On init
   */
  ngOnInit(): void {
    this.getCurrentDate()
    this.fechafinal = environment.buildDateTime
    this.fechaX = this.utilservice.FechaMoment(environment.buildDateTime)
    this.build = this.utilservice.FechaMomentL(environment.buildDateTime).replace(/\//g, '.')

    this.version = environment.version;
    // this.fecha = environment.fecha;

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
            this.loginService.Iniciar(itk.token)
          },
          (error) => {
            this.loading = false;
            this.isHidden = false;
            this.utilservice.AlertMini(
              "top-end",
              "error",
              "Error al acceder a los datos de conexion del Bus Empresarial",
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

    this.loading = true;
    this.loginService
      .getLogin(this.usuario, this.clave)
      .subscribe(
        (itk) => {
          this.loading = false;
          this.isHidden = false;
          this.loginService.Iniciar(itk.token)
        },
        (error) => {
          this.loading = false;
          this.isHidden = false;
          this.utilservice.AlertMini(
            "top-end",
            "error",
            "Error al acceder a los datos de conexion del Bus Empresarial",
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

}
