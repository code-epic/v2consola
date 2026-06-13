import { Component, OnInit } from '@angular/core';
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderComponent } from 'app/layout/components/content-header/content-header.component';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss'],
    standalone: true,
    imports: [
        CoreCommonModule,
        ContentHeaderComponent
    ]
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
