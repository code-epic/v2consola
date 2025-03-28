import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, IAPICore } from '@services/apicore/api.service';
import { IUser } from '@services/seguridad/rol.service';
import { UtilService } from '@services/util/util.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { BlockUI, NgBlockUI } from 'ng-block-ui';


@Component({
  selector: 'app-binnacle',
  templateUrl: './binnacle.component.html',
  styleUrls: ['./binnacle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbModalConfig, NgbModal]
})
export class BinnacleComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI
  @BlockUI('section-block') sectionBlockUI: NgBlockUI

  public contentHeader: object;
  // @ViewChild('dataUsers') dataUsers: any

  public ColumnMode = ColumnMode
  public SelectionType = SelectionType
  public basicSelectedOption: number = 10

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };


  constructor(
    private apiService: ApiService,
    private utilservice: UtilService,
    private modalService: NgbModal,
  ) { }



  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: "Bitacora",
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
            name: "Bitacora",
            isLink: false,
          },
        ],
      },
    };
  }


}