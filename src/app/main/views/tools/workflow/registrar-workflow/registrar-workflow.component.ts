import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { Wdefinicion, WListaEstado, WorkflowService } from '@services/workflow/workflow.service';
import { ComunicacionesService } from '@services/comunicaciones/comunicaciones.service';

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

  public tipos = [
    { id: "-", descripcion: 'SELECCIONE' },
    { id: "1", descripcion: 'DOCUMENTOS' },
    { id: "0", descripcion: 'SISTEMA' },
    { id: "2", descripcion: 'SERVIDORES' },
  ]

  lstApps = []
  dataModulo = []
  aplicacion : string = undefined
  xdrivers: string = undefined
  drivers: any

  public Definicion = []
  xmodulo :  string = undefined

  
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
    private comunicacionesService: ComunicacionesService,
     private wkf : WorkflowService) { }

  ngOnInit(): void {
    this.lstAplicaciones()    
    this.CargarDrivers()
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
    this.wkf.msjText$.emit( this.xmodulo)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.isBtnSalvar = false
        if (data.Cuerpo == undefined) return
        data.Cuerpo.forEach(e => {         
          if (e != ' ') {
            this.wkf.msjText$.emit( e.id )
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

  async CargarDrivers() {
    this.xAPI.funcion = "LESBDrivers";

    await this.comunicacionesService.ListarConexiones().subscribe(
      (data) => {
        
        this.drivers = data
        this.apiService.Ejecutar(this.xAPI).subscribe(
          (data) => {

            this.drivers = data.filter(e => {
              
               return e.driver.indexOf('mysql') == 0  
              
            });
          },
          (error) => { console.log(error) }
        )
      },
      (error) => { console.log(error) }
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
