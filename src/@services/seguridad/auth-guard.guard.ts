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

  sessionError() {
    sessionStorage.clear();
    this.router.navigate(["/login"]).then(() => {
      window.location.reload();
    })
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const token = sessionStorage.getItem('token');

    if (!token) {
      this.sessionError();
      return false;
    }

    try {
      this.token = jwt_decode(token);
    } catch (error) {
      console.error('AuthGuard: Invalid token', error);
      this.sessionError();
      return false;
    }

    const appActiva = (this.token?.Usuario?.Aplicacion || []).find(
      (a: any) => (a?.id ?? a?.ID) === environment.ID
    ) ?? this.token?.Usuario?.Aplicacion?.[0];
    const IDAPP = appActiva?.id ?? appActiva?.ID;
    if (this.token !== undefined && IDAPP == environment.ID) {
      let menu = JSON.parse(sessionStorage.getItem('menu'))
      let texto = Md5.hashStr(sessionStorage.getItem('menu'))
      let validar = sessionStorage.getItem('crypt')
      if (texto == validar) {
        let valor = false;
        // Normalizar la URL solicitada (sin query params y sin slash inicial)
        const cleanStateUrl = state.url.split('?')[0].replace(/^\/+/, '').toLowerCase();

        // Lista de URLs siempre permitidas
        const whitelistedUrls = ['home', 'principal', 'options/upgrade'];
        if (whitelistedUrls.includes(cleanStateUrl)) {
          return true;
        }

        if (Array.isArray(menu)) {
          for (const e of menu) {
            // Verificar ruta en nivel principal
            if (e.url) {
              const cleanParent = e.url.split('?')[0].replace(/^\/+/, '').toLowerCase();
              if (cleanParent && (cleanStateUrl === cleanParent || cleanStateUrl.startsWith(cleanParent))) {
                valor = true;
                break;
              }
            }
            // Verificar ruta en submenú
            if (e.SubMenu && Array.isArray(e.SubMenu)) {
              for (const xe of e.SubMenu) {
                if (xe.url) {
                  const cleanChild = xe.url.split('?')[0].replace(/^\/+/, '').toLowerCase();
                  if (cleanChild && (cleanStateUrl === cleanChild || cleanStateUrl.startsWith(cleanChild))) {
                    valor = true;
                    break;
                  }
                }
              }
            }
            if (valor) break;
          }
        }

        if (!valor) this.msj();
        return valor;
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