import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  public showReportIcons = true;
  public contentHeader: object;

  constructor() { }

  ngOnInit(): void {
    // content header
    this.contentHeader = {
      headerTitle: 'Aplicaciones',
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
            name: 'Aplicaciones',
            isLink: false
          },
          {
            name: 'Eventos',
            isLink: false
          }
        ]
      }
    };
  }

}
