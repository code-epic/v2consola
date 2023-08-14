import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit {

  public contentHeader: object;

  
  constructor() { }

  ngOnInit(): void {
    // content header
    this.contentHeader = {
      headerTitle: 'Monitoreo',
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
            name: 'Redes',
            isLink: false
          },
          {
            name: 'Monitoreo',
            isLink: false
          }
        ]
      }
    };
  }

}
