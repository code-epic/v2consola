import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore, ObjectoGenerico } from '@services/apicore/api.service';
import { Wdefinicion, WListaEstado, WorkflowService } from '@services/workflow/workflow.service';
import Swal from "sweetalert2"

@Component({
  selector: 'app-estados',
  templateUrl: './estados.component.html',
  styleUrls: ['./estados.component.scss']
})
export class EstadosComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    relacional: false,
    concurrencia: false,
    retorna: false,
    migrar: false,
    parametros: '',
    modulo: '',
    valores: {},
    logs: false,
    cache: 0,
    estatus: false
  };

  public niveles = [
    { id: "-", descripcion: 'SELECCIONE' },
    { id: "1", descripcion: 'SUPERIOR' },
    { id: "0", descripcion: 'SISTEMA' },
    { id: "2", descripcion: 'SUBSISTEMA' },
  ]

  public xObj: ObjectoGenerico = {
    nomb: '',
    obse: '',
    idw: 0
  }

  public estatus = undefined

  xidW: number = 0

  rowEstado: []


  constructor(private apiService: ApiService,
    private wkf: WorkflowService) { }

  ngOnInit(): void {
    console.info('NgInit')
    this.wkf.msjText$.subscribe(e => {
      console.info(e)
      if ( e == 'CLEAN') this.rowEstado = []
      this.lstEstados(e)
      this.xidW = parseInt(e)

    })
  }

  lstEstados(idw: string): any {
    console.log('llego lstEstados')
    this.xAPI.funcion = 'WKF_CEstados'
    this.xAPI.parametros = idw
    this.xAPI.valores = {}
    console.log(this.xAPI)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowEstado = data.Cuerpo
      },
      (err) => {
        console.error(err)
      }
    )
  }

  deleteEstado(id: any) {
     Swal.fire({
       title: 'Esta seguro?',
       text: "de eliminar este registro!",
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Si, Eliminarlo!'
     }).then((result) => {
       if (result.isConfirmed) {
         this.xAPI.funcion = 'Wk_DEstado'
         this.xAPI.parametros = id
         this.apiService.Ejecutar(this.xAPI).subscribe(
           (data) => {
             console.log(data)
           },
           (err) => {
             console.error(err)
           }
         )
       }
     }) 
  }

  Guardar(): any {
    this.xAPI.funcion = 'Wk_IEstados'
    this.xObj.idw = this.xidW
    this.xAPI.valores = JSON.stringify(this.xObj)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
      },
      (err) => {
        console.error(err)
      }
    )
  }

}
