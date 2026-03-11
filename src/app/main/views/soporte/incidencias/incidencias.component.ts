import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.component.html',
  styleUrls: ['./incidencias.component.scss']
})
export class IncidenciasComponent implements OnInit {
  public contentHeader: any;

  constructor() { }

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Incidencias',
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
            name: 'Soporte',
            isLink: true,
            link: '/'
          },
          {
            name: 'Incidencias',
            isLink: false
          }
        ]
      }
    };
  }
}
