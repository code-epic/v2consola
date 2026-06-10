import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss'],
    standalone: false
})
export class ReportesComponent implements OnInit {
  public contentHeader: any;

  constructor() { }

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Reportes',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Inicio',
            isLink: true,
            link: '/'
          },
          {
            name: 'Boveda',
            isLink: true,
            link: '/'
          },
          {
            name: 'Reportes',
            isLink: false
          }
        ]
      }
    };
  }
}
