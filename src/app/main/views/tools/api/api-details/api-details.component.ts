import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, IAPICore } from '@services/apicore/api.service';


@Component({
  selector: 'app-api-details',
  templateUrl: './api-details.component.html',
  styleUrls: ['./api-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})


export class ApiDetailsComponent implements OnInit {

  public xAPI : IAPICore = {
    funcion: '',
    parametros: '',
    relacional: false,
    concurrencia : false,
    protocolo: '',
    ruta : '',
    retorna : false,
    migrar : false,
    modulo : '',
    valores : {},
    coleccion : '',
    http : 0,
    https : 0,
    consumidores : 0,
    puertohttp : 0,
    puertohttps : 0,
    driver : '',
    query : '',
    metodo : '',
    tipo : '',
    prioridad : '',
    entorno: '',
    logs : false
  };

// public
public contentHeader: object;

public rutaURL

public product = 
  {
    id: 1,
    name: 'VicTsing Wireless Mouse,',
    slug: 'vic-tsing-wireless-mouse-1',
    description:
      'After thousands of samples of palm data, we designed this ergonomic mouse. The laptop mouse has a streamlined arc and thumb rest to help reduce the stress caused by prolonged use of the laptop mouse.',
    brand: 'VicTsing',
    price: 10.99,
    image: 'assets/images/pages/eCommerce/27.png',
    hasFreeShipping: true,
    rating: 3
  }


public api =
  {
  'funcion' : '',
  'estatus' : undefined,
  'descripcion' : '',
  'version': 0,
  'driver': '',
  'hash': '',
  }


    // Swiper
    // public swiperResponsive: SwiperConfigInterface = {
    //   slidesPerView: 3,
    //   spaceBetween: 50,
    //   navigation: {
    //     nextEl: '.swiper-button-next',
    //     prevEl: '.swiper-button-prev'
    //   },
    //   breakpoints: {
    //     1024: {
    //       slidesPerView: 3,
    //       spaceBetween: 40
    //     },
    //     768: {
    //       slidesPerView: 3,
    //       spaceBetween: 30
    //     },
    //     640: {
    //       slidesPerView: 2,
    //       spaceBetween: 20
    //     },
    //     320: {
    //       slidesPerView: 1,
    //       spaceBetween: 10
    //     }
    //   }
    // };

/**
 * Constructor
 *
 */
constructor(
  private rutaActiva: ActivatedRoute,
  private apiService : ApiService,
) {}

// Public Methods
// -----------------------------------------------------------------------------------------------------

/**
 * Toggle Wishlist
 *
 * @param product
 */
toggleWishlist(product) {

}

/**
 * Add To Cart
 *
 * @param product
 */
addToCart(product) {

}

// Lifecycle Hooks
// -----------------------------------------------------------------------------------------------------

/**
 * On init
 */
async ngOnInit() {

  this.rutaURL = this.rutaActiva.snapshot.params.id

  await this.ConsultarAPI(this.rutaURL)
  // content header
  this.contentHeader = {
    headerTitle: 'Detalle API REST',
    actionButton: true,
    breadcrumb: {
      type: '',
      links: [
        {
          name: 'Home',
          isLink: true,
          link: '/'
        },
        {
          name: 'Herramientas',
          isLink: false,
        },
        {
          name: 'API REST',
          isLink: true,
          link: '/tools/api'
        },
        {
          name: 'Details',
          isLink: false
        }
      ]
    }
  };
}

async ConsultarAPI(api: string){
  this.xAPI.funcion = "_SYS_R_ListarApisID";
  this.xAPI.parametros = api
   await this.apiService.Ejecutar(this.xAPI).subscribe(
    (data) => {
      console.log(data)
      data.map(e => {
        this.api.funcion = e.funcion
        this.api.estatus = e.estatus
        this.api.descripcion = e.descripcion
        this.api.version = e.version
        this.api.driver = e.driver
        this.api.hash = e.id
      });
    },
    (error) => {
      console.log(error)
    }
  ) 
}


}
