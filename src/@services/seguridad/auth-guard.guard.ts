import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';
import { environment } from 'environments/environment';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {

  public token

  constructor(private router: Router, private loginService: LoginService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this.token = jwt_decode(sessionStorage.getItem('token'));

    const IDAPP = this.token.Usuario.Aplicacion[0].id

    if (sessionStorage.getItem("token") !== undefined && IDAPP == 'ID-001') {
      return true;
    } else {
      console.log('Entrando');
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("id");
      this.router.navigate(['login']);
      return false;
    }


  }



  authConecting(): Promise<boolean> {
    return new Promise<boolean>((resolv, reject) => {
      // firebase.auth().onAuthStateChanged( user => {
      //   if(user){
      //     return resolv(true);
      //   }else{
      //     return reject(false);
      //   }
      // })
    })
  }
}