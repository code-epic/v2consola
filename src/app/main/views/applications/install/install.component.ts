import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { InstallService, SSB_IAplicacion } from '@services/applications/install.service';
import JSONFormatter from 'json-formatter-js';
import Stepper from 'bs-stepper';
import { NgSelectConfig } from '@ng-select/ng-select';
//import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss'],
  encapsulation: ViewEncapsulation.None
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
        this.dataApp.push(data);
        console.log(data);
        data.Cuerpo.map(e => {    
        //  console.log(e.nombre)      
          this.dataApp.push({id: e.identificador, name: e.nombre + " | " + e.version });  
        });             
      },
      (error) => {
        console.log(error)
      }
    )
  }

  // private
  private horizontalWizardStepper: Stepper;
  private verticalWizardStepper: Stepper;
  private modernWizardStepper: Stepper;
  private modernVerticalWizardStepper: Stepper;
  private bsStepper;

/**
   * Horizontal Wizard Stepper Next
   *
   * @param data
   */
horizontalWizardStepperNext(data) {
  if (data.form.valid === true) {
    this.horizontalWizardStepper.next();
  }
}
/**
 * Horizontal Wizard Stepper Previous
 */
horizontalWizardStepperPrevious() {
  this.horizontalWizardStepper.previous();
}

/**
 * Vertical Wizard Stepper Next
 */
verticalWizardNext() {
  this.verticalWizardStepper.next();
}
/**
 * Vertical Wizard Stepper Previous
 */
verticalWizardPrevious() {
  this.verticalWizardStepper.previous();
}
/**
 * Modern Horizontal Wizard Stepper Next
 */
modernHorizontalNext() {
  this.modernWizardStepper.next();
}
/**
 * Modern Horizontal Wizard Stepper Previous
 */
modernHorizontalPrevious() {
  this.modernWizardStepper.previous();
}
/**
 * Modern Vertical Wizard Stepper Next
 */
modernVerticalNext() {
  this.modernVerticalWizardStepper.next();
}
/**
 * Modern Vertical Wizard Stepper Previous
 */
modernVerticalPrevious() {
  this.modernVerticalWizardStepper.previous();
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
