import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {


 /*  @ViewChild(RegistrarWorkflowComponent) registrarWorkFlow: RegistrarWorkflowComponent
  @ViewChild(EstadosComponent) estadosWorkFlow: EstadosComponent
  @ViewChild(TransicionesComponent) transicionesWorkFlow: TransicionesComponent */
  
  public sectionConsultar : string = ''
  
  constructor() { }
  

  ngOnInit(): void {
   
  }

}
