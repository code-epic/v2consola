import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { Wdefinicion, WListaEstado, WorkflowService } from '@services/workflow/workflow.service';

@Component({
  selector: 'app-registrar-workflow',
  templateUrl: './registrar-workflow.component.html',
  styleUrls: ['./registrar-workflow.component.scss']
})
export class RegistrarWorkflowComponent implements OnInit {

  public xAPI : IAPICore = {
    funcion: '',
    relacional: false,
    concurrencia : false,
    retorna : false,
    migrar : false,
    parametros: '',
    modulo : '',
    valores : {},
    logs : false,
    cache: 0,
    estatus: false
  };

  lstApps = []
  dataModulo = []
  aplicacion : string = '0'

  public Definicion = []
  xmodulo :  string = '0'

  
  nombre  :  string = ''
  descripcion  :  string = ''
  isBtnSalvar : boolean = true
  isDisabledInput : boolean = false
  isButtonVisibleSalvar : boolean = false
  isButtonVisibleUpdate : boolean = false

  public xDefinicion : Wdefinicion = {
    idap: 0,
    idmo: 0,
    nomb: '',
    obse: '',
    fech: Date.now()
  }

  constructor(private apiService : ApiService,
     private wkf : WorkflowService) { }

  ngOnInit(): void {
    this.lstAplicaciones()    
  }

  async lstAplicaciones(){
    this.xAPI.funcion = "LstAplicaciones";
    this.xAPI.valores = null;
    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        // console.info(data)
        this.lstApps = data.Cuerpo
      },
      (error) => {
        console.error(error)
      }
    )
  }

  selModulo() : void {
    this.xAPI.funcion = "LstModulos";
    this.xAPI.parametros = this.aplicacion;
    this.dataModulo = [];
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {          
          this.dataModulo.push({ id: e.id, name: e.nomb  })
        });             
      },
      (error) => {
        console.log(error)
      }
    )
  }

  consultarRed(){
    this.xAPI.funcion = 'Wk_SDefinicion'
    this.xAPI.parametros = this.aplicacion +","+ this.xmodulo
   /*  this.wkf.msjText$.emit( this.xmodulo) */
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.isBtnSalvar = false
        if (data.Cuerpo == undefined) return
        data.Cuerpo.forEach(e => {         
          if (e != ' ') {
         /*    this.wkf.msjText$.emit( e.id ) */
            this.isBtnSalvar = false
            this.isDisabledInput = true
            this.isButtonVisibleSalvar = true
            this.isButtonVisibleUpdate = true
            this.nombre = e.nombre
            this.descripcion = e.observacion
          } 
      });
      },
      (err) => {
        console.error(err)
      }
    )
  }

  limpiar(){
    this.isBtnSalvar = true
    this.isDisabledInput = false
    this.isButtonVisibleSalvar = false
    this.isButtonVisibleUpdate = false
    this.nombre = ''
    this.descripcion = ''
    this.aplicacion = ''
    this.xmodulo = ''
  }

  salvar(){
    var ObjSalvar = {
      'idap' : this.aplicacion,
      'idmo' : this.xmodulo,
      'nomb' : this.nombre,
      'obse' : this.descripcion,
    }
    this.Definicion.push(ObjSalvar)
    this.xAPI.funcion = 'Wk_IDefinicion'
    this.xAPI.valores = JSON.stringify(ObjSalvar)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data.msj)
      },
      (err) => {
        console.error(err)
      }
    )
  }

}
