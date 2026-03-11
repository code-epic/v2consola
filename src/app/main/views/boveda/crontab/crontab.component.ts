import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crontab',
  templateUrl: './crontab.component.html',
  styleUrls: ['./crontab.component.scss']
})
export class CrontabComponent implements OnInit {
  public contentHeader: any;

  constructor() { }

  ngOnInit(): void {
    this.contentHeader = {
      headerTitle: 'Crontab',
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
            name: 'Crontab',
            isLink: false
          }
        ]
      }
    };
  }
}
