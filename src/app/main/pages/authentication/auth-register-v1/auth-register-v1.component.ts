import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { environment } from 'environments/environment';
import * as CryptoJS from 'crypto-js';
import { UtilService } from '@services/util/util.service';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { IUsuario, LoginService, Usuario } from '@services/seguridad/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-register-v1',
  templateUrl: './auth-register-v1.component.html',
  styleUrls: ['./auth-register-v1.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthRegisterV1Component implements OnInit {
  // Public
  public coreConfig: any;
  public passwordTextType: boolean;
  public registerForm: UntypedFormGroup;
  public submitted = false;

  public version
  public fecha
  
  public xUser: Usuario = {
    _id: undefined,
    cedula: '',
    nombre: '',
    login: '',
    correo: '',
    clave: '',
    sucursal: '',
    direccion: '',
    cargo: '',
    telefono: '',
    sistema: '',
    token: '',
    Perfil: undefined,
    Aplicacion: [],
    firmadigital: undefined
  }

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: UntypedFormBuilder,
    private utilservice: UtilService,
    private apiService : ApiService,
    private loginService: LoginService, 
    private router: Router,
    ) {
    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * On Submit
   */
  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    } else {
      // this.xUser.login = this.registerForm.value.user
      // this.xUser.clave = this.registerForm.value.password
      // var obj = {
      //   "coleccion": "usuario",
      //   "objeto": this.xUser,
      //   "donde": `{\"id\":\"${this.registerForm.value.id}\"}`,
      //   "driver": "MGDBA",
      //   "upsert": true
      // }
      this.loginService.getCrear(this.registerForm.value.user, this.registerForm.value.clave).subscribe(
        (data) => {
          this.router.navigate(['/']);
          this.utilservice.AlertMini('top-end','success',`Usuario creado exitosamente!`,3000)
        }, (error) => {
          this.utilservice.AlertMini('top-end','error','Error al Guardadar los Datos',3000)
        }
      )
    }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    // const hash = CryptoJS.SHA256('za7896321').toString();
    // console.log(hash);

    this.version = environment.version
    this.fecha = environment.fecha


    this.registerForm = this._formBuilder.group({
      user: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
