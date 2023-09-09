import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

export interface WListaEstado{
  idw : number,
  nomb : string
  obse : string
}

export interface Wdefinicion{
  idap : number,
  idmo : number,
  nomb : string,
  obse : string,
  fech : any
}


@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
   msjText$ = new EventEmitter<string>(); 
  msjText: string = ''
  constructor() { }
}
