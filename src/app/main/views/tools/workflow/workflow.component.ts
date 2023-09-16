import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { EstadosComponent } from './estados/estados.component';
import { RegistrarWorkflowComponent } from './registrar-workflow/registrar-workflow.component';
import { TransicionesComponent } from './transiciones/transiciones.component';
import { EstatusComponent } from './estatus/estatus.component';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {


  

  @ViewChild(RegistrarWorkflowComponent) registrarWorkFlow: RegistrarWorkflowComponent
  @ViewChild(EstadosComponent) estadosWorkFlow: EstadosComponent
  @ViewChild(TransicionesComponent) transicionesWorkFlow: TransicionesComponent
  @ViewChild(EstatusComponent) estatusWorkFlow: EstatusComponent
  
  public sectionConsultar : string = ''
  
  constructor() { }
  

  ngOnInit(): void {
   console.log("Control")
  }

}
