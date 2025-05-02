import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {

  constructor() { }

  public contentHeader: object;
  
    isUpdating = false;
    progressValue = 0;
    estimatedTime = 15;

  ngOnInit(): void {

    this.contentHeader = {
      headerTitle: 'Opciones de Actualización',
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
            name: 'Opciones',
            isLink: false
          },
          {
            name: 'Actualizar Sistema',
            isLink: false
          }
        ]
      }
    };
  }

  startUpdate() {
    this.isUpdating = true;
    this.progressValue = 0;
    this.estimatedTime = 15;
    
    const interval = setInterval(() => {
      this.progressValue += 1;
      this.estimatedTime = Math.max(0, Math.floor((100 - this.progressValue) * 15 / 100));
      
      if (this.progressValue >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.isUpdating = false;
          // Aquí podrías agregar lógica para cuando termine la actualización
        }, 1000);
      }
    }, 300);
  }

}
