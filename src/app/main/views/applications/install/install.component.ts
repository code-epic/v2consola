import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { InstallService, SSB_IAplicacion } from '@services/applications/install.service';
import { FormGroup, FormControl } from '@angular/forms';
import JSONFormatter from 'json-formatter-js';
import Stepper from 'bs-stepper';
import { NgSelectConfig } from '@ng-select/ng-select';
//import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})



export class InstallComponent implements OnInit {

  

  public mtipo;
  public mservidor;
  public msistema;
  public mrepo;
  public musuario;
  public mpassword;
  public mmontaje;
  public mbdatos;
  public mversion;
  public mlenguaje;

  dataApp     = []
  rowData     = []
  keyword     = 'name'

  public iApp : SSB_IAplicacion = {
    identificador : 0,
    basedatos: '0',
    lenguaje: '0',
    nombre: '',
    observacion: '',
    clave: '',
    puntoMontaje: '',
    origen: '0',
    repositorio: '',
    sistema: '0',
    tipo: 0,
    usuario: '',
    creador: '',
    version: '0.0.1'
  }

  public xAPI : IAPICore = {
    id            : '',
    funcion       : '',
    relacional    : false,
    concurrencia  : false,
    retorna       : false,
    migrar        : false,
    parametros    : '',
    modulo        : '',
    valores       : null,
    logs          : false,
    cache         : 0,
    estatus       : false
  };

  public tipo = [
    { id: "0", descripcion: 'SELECCIONE' },
    { id: "1", descripcion: 'PRE-INSTALADA' },
    { id: "2", descripcion: 'INSTALAR' },
    { id: "3", descripcion: 'REPOSITORIO' },
  ]

  async lstAplicaciones(){
    console.log("llegooo")
    this.xAPI.funcion = "LstAplicaciones";
    this.xAPI.valores = null;

    await this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        data.Cuerpo.forEach(e => {    
          console.log(e.nombre)      
          this.dataApp.push({id: e.identificador, name: e.nombre + " | " + e.version });  
        });             
      },
      (error) => {
        console.log(error)
      }
    )
  }

  public horizontalWizardStepper: Stepper;

  horizontalWizardStepperNext(e){
    console.log(e);
   
      this.horizontalWizardStepper.next();
    
  }

  horizontalWizardStepperPrevious(){
   
      this.horizontalWizardStepper.previous();
    
  }

  
  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private config: NgSelectConfig,
    //private configmodul: NgSelectModule,
  ) { }

  ngOnInit(): void {
    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});
    this.lstAplicaciones()
  }
}
