import { NgModule } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';




//import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { zoneInterceptor } from '@services/seguridad/zone-interceptor';

import 'hammerjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';


import { CoreModule } from '@core/core.module';
import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule, CoreThemeCustomizerModule } from '@core/components';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { coreConfig } from 'app/app-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { HomeModule } from './main/home/home.module';
import { NetworksModule } from './main/views/networks/networks.module';
import { OptionsModule } from './main/views/options/options.module';
import { SecurityModule } from './main/views/security/security.module';
import { ToolsModule } from './main/views/tools/tools.module';
import { ApplicationsModule } from './main/views/applications/applications.module';
import { TaskModule } from './main/views/task/task.module';
import { InvestigationModule } from './main/views/investigation/investigation.module';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';


// Recaptcha V3
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from 'environments/environment';
import { AuthInterceptorService } from '@services/seguridad/auth-interceptor.service';
import { SharedModule } from './main/license-bunker/shared.module';
import { GithubModule } from './main/views/github/github.module';
import { BovedaModule } from './main/views/boveda/boveda.module';
import { SoporteModule } from './main/views/soporte/soporte.module';
import { PushService } from '@services/seguridad/push.service';
import { ErrorModalModule } from './layout/components/error-modal/error-modal.module';

const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./main/pages/pages.module').then(m => m.PagesModule),
  },
  {
    path: '**',
    redirectTo: '/miscellaneous/error' //Error 404 - Page not found
  }
];


@NgModule({ declarations: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, {
            scrollPositionRestoration: 'enabled', // Add options right here
            useHash: true
        }),
        TranslateModule.forRoot(),
        CodemirrorModule,
        RecaptchaV3Module,
        NgbModule,
        CoreModule.forRoot(coreConfig),
        CoreCommonModule,
        CoreSidebarModule,
        CoreThemeCustomizerModule,
        LayoutModule,
        HomeModule,
        ErrorModalModule,
        NetworksModule,
        ApplicationsModule,
        OptionsModule,
        FormsModule,
        ReactiveFormsModule,
        SecurityModule,
        ToolsModule,
        TaskModule,
        InvestigationModule,
        NgSelectModule,
        SharedModule,
        GithubModule,
        BovedaModule,
        SoporteModule], providers: [
        {
            provide: RECAPTCHA_V3_SITE_KEY,
            useValue: environment.recaptcha.siteKey,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true
        },
        PushService,
        provideHttpClient(withInterceptorsFromDi(), withInterceptors([zoneInterceptor])),
    ] })
export class AppModule { }
