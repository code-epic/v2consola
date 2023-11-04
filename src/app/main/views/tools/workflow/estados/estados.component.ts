import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore, ObjectoGenerico, WkfEstado } from '@services/apicore/api.service';
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


  public wkfEstado : WkfEstado = {
    wkf: 0,
    nombre: '',
    descripcion: '',
    estatus: 0
  }

  public estatus = undefined

  xidW: number = 0

  rowEstado: []


  constructor(private apiService: ApiService,
    private wkf: WorkflowService) { }

  ngOnInit(): void {
    // console.info('NgInit')

    if ( window.sessionStorage.getItem('estados') != undefined) {
      this.rowEstado = JSON.parse(window.sessionStorage.getItem('estados'));
      return
    }
    this.wkf.msjText$.subscribe(e => {
      // console.info(e)
      if ( e == 'CLEAN') this.rowEstado = []
      this.lstEstados(e)
      this.xidW = parseInt(e)
    })
  }

  lstEstados(idw: string): any {
    this.xAPI.funcion = 'WKF_CEstados'
    this.xAPI.parametros = idw
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowEstado = data.Cuerpo
        window.sessionStorage.setItem('estados', JSON.stringify(this.rowEstado));
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
    this.xAPI.funcion = 'WKF_IEstados'
    this.wkfEstado.wkf = this.xidW
    this.wkfEstado.estatus = parseInt(this.estatus)
    this.xAPI.valores = JSON.stringify(this.wkfEstado)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj)
        console.log(this.xidW.toString())
        this.lstEstados(this.xidW.toString())
        this.limpiarEstados()

      },
      (err) => {
        console.error(err)
      }
    )
  }

  Ok(id: any) {
    Swal.fire({
      title: "Creando Estatus del Workflow ",
      text: "El estado ha sido creado con exito (#" + id + ") ",
      icon: "info",
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aceptar / Continuar",
      cancelButtonText: "No",
    }).then((result) => {
      if (!result.isConfirmed) return
    })
  }

  limpiarEstados() {
    this.wkfEstado = {
      wkf: 0,
      nombre: '',
      descripcion: '',
      estatus: 0
    }
    this.niveles = undefined
    this.rowEstado = []
    this.wkf.msjText$.emit(this.xidW.toString())
     this.lstEstados(this.xidW.toString())
  }

}
