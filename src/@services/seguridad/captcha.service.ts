import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, of } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from 'environments/environment';

export interface IChallengeResponse {
  algorithm: string;
  challenge: string;
  salt: string;
  signature: string;
  maxnumber: number;
}

export interface ICaptchaSolution {
  sol: number;
  sig: string;
  salt: string;
  challenge: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private http = inject(HttpClient);
  private endpoint = `${environment.API}captcha/challenge`;

  /**
   * Obtiene el reto criptográfico desde Sandra Server con timeout seguro
   */
  obtenerChallenge(): Observable<IChallengeResponse | null> {
    return this.http.get<IChallengeResponse>(this.endpoint).pipe(
      timeout(2500),
      catchError(err => {
        console.warn('[CaptchaService] Sandra Server endpoint no respondió o timeout:', err?.message || err);
        return of(null);
      })
    );
  }

  /**
   * Resuelve el Proof-of-Work (SHA-256) en el cliente
   * Busca i en [0..maxNumber] tal que SHA256(salt + i) === challenge
   * Compatible tanto con HTTPS/localhost (crypto.subtle) como con HTTP en IP local (CryptoJS)
   */
  async resolverPoW(salt: string, challenge: string, maxNumber: number): Promise<number> {
    const tieneSubtle = typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle;

    if (tieneSubtle) {
      try {
        const encoder = new TextEncoder();
        for (let i = 0; i <= maxNumber; i++) {
          const data = encoder.encode(`${salt}${i}`);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          if (hashHex === challenge) {
            return i;
          }
        }
        return -1;
      } catch (err) {
        console.warn('[CaptchaService] crypto.subtle no disponible, recurriendo a CryptoJS:', err);
      }
    }

    // Fallback universal para contextos HTTP sin cifrado (IPs locales ej: 172.20.10.2)
    for (let i = 0; i <= maxNumber; i++) {
      const hashHex = CryptoJS.SHA256(`${salt}${i}`).toString();
      if (hashHex === challenge) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Orquesta la obtención del reto y la resolución del PoW
   */
  async obtenerYResolver(): Promise<ICaptchaSolution | null> {
    try {
      const ch = await firstValueFrom(this.obtenerChallenge());
      if (!ch || !ch.challenge || !ch.salt) {
        return null;
      }

      const sol = await this.resolverPoW(ch.salt, ch.challenge, ch.maxnumber || 50000);
      if (sol === -1) {
        console.warn('[CaptchaService] No se encontró solución para el challenge PoW');
        return null;
      }

      return {
        sol,
        sig: ch.signature,
        salt: ch.salt,
        challenge: ch.challenge
      };
    } catch (error) {
      console.error('[CaptchaService] Error al obtener o resolver el challenge:', error);
      return null;
    }
  }
}

