import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * ZoneInterceptor
 * 
 * Garantiza que todas las respuestas HTTP (next/error/complete) se ejecuten
 * dentro de la zona de Angular (NgZone), forzando así la detección de cambios
 * incluso cuando el backend subyacente (FetchBackend) opera fuera de la zona.
 * 
 * Solución permanente al problema de cambio de detección en Angular 22
 * con FetchBackend, que ejecuta runOutsideAngular para la petición fetch
 * y no re-ingresa a la zona al emitir la respuesta.
 */
export const zoneInterceptor: HttpInterceptorFn = (req, next) => {
  const ngZone = inject(NgZone);

  // Envolvemos el Observable original en uno nuevo que re-ingresa a la zona
  return new Observable(subscriber => {
    const sub = next(req).subscribe({
      next(value: any) {
        ngZone.run(() => subscriber.next(value));
      },
      error(err: any) {
        ngZone.run(() => subscriber.error(err));
      },
      complete() {
        ngZone.run(() => subscriber.complete());
      }
    });
    return () => sub.unsubscribe();
  });
};
