import { Component, OnInit } from "@angular/core"
import {ApiService,IAPICore,WkfEstatus } from "@services/apicore/api.service"
import Swal from "sweetalert2"
import { WorkflowService } from "@services/workflow/workflow.service"

@Component({
  selector: 'app-estatus',
  templateUrl: './estatus.component.html',
  styleUrls: ['./estatus.component.scss']
})
export class EstatusComponent implements OnInit {
  public xAPI: IAPICore = {
    funcion: "",
    parametros: "",
    valores: {},
  }

  public wkfEstatus: WkfEstatus = {
    nombre: "",
    descripcion: "",
    estatus: 0,
    estado: 0,
    orden: 0,
  }

  public estado = "-"
  public estatus = 0
  public orden = "-"

  xidW: number = 0

  rowEstado: []
  rowEstatus: []
  lstOrden = [1,2,3,4,5,6,7,8,9,10]

  isDisabledInput: boolean = false

  constructor(private apiService: ApiService, private wkf: WorkflowService) {}

  ngOnInit(): void {
    this.wkf.msjText$.subscribe((e) => {
      if (e == "CLEAN") this.rowEstado = []
      this.lstEstados(e)
      this.xidW = parseInt(e)
    })
  }

  lstEstados(idw: string): any {
    this.xAPI.funcion = "WKF_CEstados"
    this.xAPI.parametros = idw
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowEstado = data.Cuerpo
      },
      (err) => {
        console.error(err)
      }
    )
  }

  lstEstatus(): any {
    this.rowEstatus = []
    this.xAPI.funcion = "WKF_CEstatus"
    this.xAPI.parametros = this.estado
    this.xAPI.valores = {}
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowEstatus = data.Cuerpo
      },
      (err) => {
        console.error(err)
      }
    )
  }

  deleteEstado(id: any) {
    Swal.fire({
      title: "Esta seguro?",
      text: "de eliminar este registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminarlo!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.xAPI.funcion = "Wk_DEstatus"
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
    this.xAPI.funcion = "WKF_IEstatus"
    this.wkfEstatus.estado = parseInt(this.estado)
    this.wkfEstatus.estatus = this.estatus
    this.wkfEstatus.orden = parseInt(this.orden)
    this.xAPI.valores = JSON.stringify(this.wkfEstatus)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.Ok(data.msj)
        this.lstEstatus()
        this.limpiar()
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

  limpiar() {
    this.wkfEstatus = {
      nombre: "",
      descripcion: "",
      estatus: 0,
      estado: 0,
      orden: 0,
    }
    this.orden = '-'
    this.rowEstatus = []
    this.wkf.msjText$.emit(this.xidW.toString())
     this.lstEstados(this.xidW.toString())
  }

}
