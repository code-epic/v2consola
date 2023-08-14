import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { NgbModal, NgbModalConfig, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
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

  public tipo;
  public tipoi = [
    { id: 1, descripcion: 'PRE-INSTALADA' },
    { id: 2, descripcion: 'INSTALAR' },
    { id: 3, descripcion: 'REPOSITORIO' },
  ]

  

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
  }
}
