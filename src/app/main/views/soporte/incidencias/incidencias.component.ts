import { Component, OnInit } from '@angular/core';

import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';
import { FeatherIconDirective } from '@core/directives/core-feather-icons/core-feather-icons';

@Component({
    selector: 'app-incidencias',
    templateUrl: './incidencias.component.html',
    styleUrls: ['./incidencias.component.scss'],
    standalone: true,
    imports: [ContentHeaderComponent, FeatherIconDirective]
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
