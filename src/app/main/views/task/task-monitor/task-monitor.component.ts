import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { ApiService, IAPICore } from '@services/apicore/api.service';
// import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { WsocketsService } from '@services/websockets/wsockets.service';
import { NgbModal, NgbActiveModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig } from '@ng-select/ng-select';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UtilService } from '@services/util/util.service';
import { ComunicationsService } from '@services/networks/comunications.service';


@Component({
  selector: 'app-task-monitor',
  templateUrl: './task-monitor.component.html',
  styleUrls: ['./task-monitor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class TaskMonitorComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public searchValue = ''
  public contentHeader: object;
  public count
  public ListaComunicaciones = []
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public tempData = [];
  public rowData = [
    {
      pid : '5843779',
      programa : 'cdddc',
      argumento : 'adcsc',
      usuario : 'sqxac',
      tiempo : 'dcfec',
      estatus : true
    }
  ];


  constructor() { }

  ngOnInit(): void {
    // content header
    this.contentHeader = {
      headerTitle: 'Tareas',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/home'
          },
          {
            name: 'Tareas',
            isLink: false
          },
          {
            name: 'Monitor de Tareas',
            isLink: false
          }
        ]
      }
    };
  }


  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.descripcion.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    this.count = this.rowData.length
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


}
