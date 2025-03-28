import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@services/apicore/api.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

import { BlockUI, NgBlockUI } from 'ng-block-ui';


@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class LogsComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI
  @BlockUI('section-block') sectionBlockUI: NgBlockUI

  public contentHeader: object;
  // @ViewChild('dataUsers') dataUsers: any

  public ColumnMode = ColumnMode
  public SelectionType = SelectionType
  public basicSelectedOption: number = 10


  public  selectedLogType: number | null = null;

  constructor() { }

  public lstLogs = [
    {id: 1, name:"Log Sistema"},
    {id: 2, name:"Log Cache"},
    {id: 3, name:"Log Query"}
  ]


 async  ngOnInit() {
    this.contentHeader = {
      headerTitle: "Investigación",
      actionButton: true,
      breadcrumb: {
        type: "",
        links: [
          {
            name: "Home",
            isLink: true,
            link: "/home",
          },
          {
            name: "Investigación",
            isLink: false,
          },
          {
            name: "Logs",
            isLink: false,
          },
        ],
      },
    };


  }



  onLogTypeChange(selectedId: { id: number }) {
    this.selectedLogType = selectedId.id;
  }


}