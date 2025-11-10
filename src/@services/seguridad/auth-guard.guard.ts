import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';
import jwt_decode from "jwt-decode";

import { Md5 } from 'ts-md5';
import { UtilService } from '@services/util/util.service';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {

  public token

  constructor(private router: Router, private util: UtilService, private loginService: LoginService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this.token = jwt_decode(sessionStorage.getItem('token'));

    const IDAPP = this.token.Usuario.Aplicacion[0].id

    if (sessionStorage.getItem("token") !== undefined && IDAPP == environment.ID) {
      let menu = JSON.parse(sessionStorage.getItem('menu'))
      let texto = Md5.hashStr(sessionStorage.getItem('menu'))
      let validar = sessionStorage.getItem('crypt')
      if (texto == validar) {
        let valor = false
        // Lista de URLs siempre permitidas
        const whitelistedUrls = ['/home', '/options/upgrade'];
        if (whitelistedUrls.includes(state.url)) {
          return true;
        }

        menu.forEach(e => {
          e.SubMenu.forEach(xe => {
            if (state.url.indexOf(xe.url) == 1) return valor = true
          });
        })
        if (!valor) this.msj()
        return valor
      } else {
        return false
      }

    } else {
      sessionStorage.clear();

      this.router.navigate(["miscellaneous/error"]).then(() => {
        window.location.reload();
      })
      return false;
    }


  }



  authConecting(): Promise<boolean> {
    return new Promise<boolean>((resolv, reject) => {

    })
  }

  msj() {
    Swal.fire({
      title: 'Área restringida',
      text: 'No poseé autorización',
      icon: 'error',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok',
      allowEscapeKey: true,
    }).then((result) => {
      //
    })
  }


}