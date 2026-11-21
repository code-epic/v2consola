import { Injectable } from '@angular/core';
import {
  ComunicacionesService,
  IComunicaciones
} from '../comunicaciones/comunicaciones.service';

export { IComunicaciones };

@Injectable({
  providedIn: 'root'
})
export class ComunicationsService extends ComunicacionesService {}
