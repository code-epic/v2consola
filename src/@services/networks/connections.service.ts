import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IAPICore, getHttpOptions } from '../apicore/api.service';



export interface IConexiones {
  id ?: string
  driver ?: string
  usuario ?: string
  basedatos ?: string
  clave ?: string
  host ?: string
  puerto ?: string
  url ?: string
  descripcion ?: string
  estatus ?: boolean

}

@Injectable({
  providedIn: 'root'
})


export class ConexionesService {
   //Dirección Get para servicios en la página WEB
   URL =  '/v1/api/';

  constructor(private router: Router, private http : HttpClient) {
   
  }
  
  Guardar(xDRI : IConexiones, sApi : string) : Observable<any>{
    var url = this.URL + sApi;
    return this.http.post<any>(url, xDRI, getHttpOptions());
  }

  Listar(APICORE : IAPICore) : Observable<any>{
    var url = this.URL + 'crud';
    return this.http.post<any>(url, APICORE, getHttpOptions());
  }

  EvaluarConexion(xDRI : IConexiones, sApi : string) : Observable<any>{
    var url = this.URL + sApi;
    return this.http.post<any>(url, xDRI, getHttpOptions());
  }
  
  EstablecerConexion(xDRI : IConexiones, sApi : string) : Observable<any>{
    
    var url = this.URL + sApi;
    return this.http.post<any>(url, xDRI, getHttpOptions());
  }
  
  EvaluarPuente(sApi : string) : Observable<any>{
    var url = this.URL + sApi;
    return this.http.post<any>(url, {}, getHttpOptions());
  }
  
}
