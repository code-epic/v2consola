import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { ApiService } from '@services/apicore/api.service'


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})
export class HomeComponent implements OnInit {


  public imageUrl: string = 'assets/images/login-v2.svg';
  constructor( private apiService: ApiService) { }


  /**
   * On init
   */
  async ngOnInit() {
    let isBDV = this.apiService.ConsultaSistemaBDV()
    this.imageUrl = isBDV ? 'assets/images/login-v2.png' : 'assets/images/login-v2.svg';

  }



}