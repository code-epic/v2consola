import { Injectable } from "@angular/core";


export interface Users{
  tipo: string,
  login: string,
  password: string,
  format: string,
  name: string,
  description: string,
  observation: string,
  email: string, 
  backup: string,
  valid: string,
  endpoint: string,
  system: string,
  token_duration: string,
  session_duartion: string,
  type_session: string, // horas minutos segundos
  oficina: string,
  regional: string,
  estatus: string
}



@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }
}
