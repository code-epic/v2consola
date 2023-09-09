import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore, WkfEstado } from '@services/apicore/api.service';
import Swal from 'sweetalert2';
import { WorkflowService } from '@services/workflow/workflow.service';

@Component({
  selector: 'app-red',
  templateUrl: './red.component.html',
  styleUrls: ['./red.component.scss']
})
export class RedComponent implements OnInit {

  public xAPI : IAPICore = {
    funcion: '',
    parametros: '',
    valores : {},
  };


  public wkfEstado : WkfEstado = {
    wkf: 0,
    nombre: '',
    descripcion: '',
    estatus: 0
  }

  public estatus = '-'

  xidW : number = 0

  rowEstado : []
  constructor( private apiService : ApiService,
    private wkf : WorkflowService) { }

  ngOnInit(): void {
    this.wkf.msjText$.subscribe(e => {
      this.lstEstados(e)
      this.xidW = parseInt(e)
    })
  }

  lstEstados(idw : string) : any {
    this.xAPI.funcion = 'WKF_CEstados'
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

}
