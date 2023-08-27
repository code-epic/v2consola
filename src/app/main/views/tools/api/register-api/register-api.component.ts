import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Stepper from 'bs-stepper';

@Component({
  selector: 'app-register-api',
  templateUrl: './register-api.component.html',
  styleUrls: ['./register-api.component.scss']
})
export class RegisterApiComponent implements OnInit {

    // public
    public contentHeader: object;
    public TDNameVar;
    public TDEmailVar;
    public TDFirstNameVar;
    public TDLastNameVar;
    public twitterVar;
    public facebookVar;
    public googleVar;
    public linkedinVar;
    public landmarkVar;
    public addressVar;
  
    public selectBasic = [
      { name: 'UK' },
      { name: 'USA' },
      { name: 'Spain' },
      { name: 'France' },
      { name: 'Italy' },
      { name: 'Australia' }
    ];
  
    public selectMulti = [{ name: 'English' }, { name: 'French' }, { name: 'Spanish' }];
    public selectMultiSelected;

  public driversAPP

  constructor(
    private rutaActiva: ActivatedRoute,
  ) { }

  private horizontalWizardStepper: Stepper;

  /**
   * Horizontal Wizard Stepper Next
   *
   * @param data
   */
  horizontalWizardStepperNext(data) {
    if (data.form.valid === true) {
      this.horizontalWizardStepper.next();
    }
  }
  /**
   * Horizontal Wizard Stepper Previous
   */
  horizontalWizardStepperPrevious() {
    this.horizontalWizardStepper.previous();
  }


  ngOnInit(): void {

    this.driversAPP = this.rutaActiva.snapshot.params.id

    this.horizontalWizardStepper = new Stepper(document.querySelector('#stepper1'), {});

     // content header
     this.contentHeader = {
      headerTitle: 'Herramientas',
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
            name: 'Herramientas',
            isLink: false
          },
          {
            name: 'API REST',
            isLink: true,
            link: '/tools/api'
          },
          {
            name: 'Lista APIS',
            isLink: true,
            link: `/tools/api-list/${this.driversAPP}`
          },
          {
            name: this.driversAPP,
            isLink: false
          },
        ]
      }
    };
  }

}
