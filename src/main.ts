import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, enableProdMode } from '@angular/core';

import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import 'codemirror/lib/codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/go/go';
import 'codemirror/mode/sql/sql';
// import 'codemirror/mode/idn/idn';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/php/php';
import 'codemirror/mode/python/python';
import 'codemirror/mode/rust/rust';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppModule)
  ]
}).catch(err => {
    // Si el error es por un token inválido (común en librerías JWT),
    // limpiamos el almacenamiento para evitar que el error persista
    // y recargamos la página para que el usuario pueda iniciar sesión de nuevo.
    if (err.name === 'InvalidTokenError' || (err.message && err.message.includes('Invalid token'))) {
      console.warn('Token inválido detectado. Limpiando almacenamiento y recargando...');
      localStorage.clear();
      window.location.reload();
    }
  });
