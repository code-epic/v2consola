import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { Router } from '@angular/router'
import { NgbModalConfig, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap'
import { ITask, TaskService } from '@services/apicore/task.service';
import { openDB } from 'idb';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})
export class HomeComponent implements OnInit {


  // public task : ITask = {
  //   funcion: '',
  //   estatus: false,
  //   time: '',
  //   inicio: {
  //     hours: 0,
  //     minutes: 0
  //   },
  //   prioridad: 0,
  //   usuario: ''
  // }

  constructor(
    config: NgbModalConfig,
    private ruta: Router,
    private taskService: TaskService
    ) {
    config.backdrop = false;
    config.keyboard = false;
  }

  public contentHeader: object

  public Token

  closeResult: string = ''

  public products = [
    {
      id: 1,
      name: 'Servidores',
      description: 'Los servidores operan a través de una arquitectura cliente-servidor. Los servidores son programas de computadora en ejecución.',
      img: '../../../assets/items/servidores.png',
      estatus: true,
      base: 'networks',
      ruta: 'communications'
    },
    {
      id: 2,
      name: 'Conexiones',
      description: 'La conexión es el enlace que se establece entre el emisor y el receptor a través del que se envía el mensaje.',
      img: '../../../assets/items/conexiones.png',
      estatus: true,
      base: 'networks',
      ruta: 'connections'
    },
    {
      id: 3,
      name: 'API REST',
      description: 'Es una interfaz de programación de aplicaciones (Application Programming Interface).',
      img: '../../../assets/items/api.png',
      estatus: true,
      base: 'tools',
      ruta: 'api'
    },
    {
      id: 4,
      name: 'Seguridad',
      description: 'Se puede referir a la ausencia de riesgo o a la confianza en algo o en alguien.',
      img: '../../../assets/items/seguridad.png',
      estatus: true,
      base: 'security',
      ruta: 'role'
    }
  ]

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  irA(base: string, ruta: string) {
    this.ruta.navigate([base, ruta])
  }


  /**
   * On init
   */
  async ngOnInit() {
    console.log('Iniciando IndexDB')

    this.contentHeader = {
      headerTitle: 'Principal',
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
            name: 'Principal',
            isLink: false
          }
        ]
      }
    }

  }



}