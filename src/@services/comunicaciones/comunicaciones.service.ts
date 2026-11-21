import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IAPICore, getHttpOptions } from '../apicore/api.service';

export interface IComunicaciones {
  id?: string;
  host?: string;
  mac?: string;
  descripcion?: string;
  tipo?: number;
  estatus?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComunicacionesService {
  URL = environment.API;
  hash = environment.Hash;

  constructor(protected router: Router, protected http: HttpClient) {}

  Guardar(xCOM: IComunicaciones, sApi: string): Observable<any> {
    const url = this.URL + sApi;
    return this.http.post<any>(url, xCOM, getHttpOptions());
  }

  Listar(): Observable<any> {
    const url = this.URL + 'lcoleccion/sys-conection';
    return this.http.get<any>(url, getHttpOptions()).pipe(
      catchError(() => {
        const crudUrl = `${this.URL}crud:${this.hash}`;
        const xAPI = {
          funcion: environment.functions.LISTAR_COMUNICACIONES,
          parametros: ''
        };
        return this.http.post<any>(crudUrl, xAPI, getHttpOptions());
      })
    );
  }

  ListarDrivers(): Observable<any> {
    const url = this.URL + 'drivers';
    return this.http.get<any>(url, getHttpOptions());
  }

  ListarConexiones(xAPI: IAPICore): Observable<any> {
    const url = `${this.URL}crud:${this.hash}`;
    return this.http.post<any>(url, xAPI, getHttpOptions());
  }

  ScanMac(ip: string): Observable<any> {
    const url = this.URL + 'scanmac/' + ip;
    return this.http.get<any>(url, getHttpOptions());
  }

  ScanNmap(ip: string): Observable<any> {
    const url = this.URL + 'nmap/' + ip;
    return this.http.get<any>(url, getHttpOptions());
  }
}
