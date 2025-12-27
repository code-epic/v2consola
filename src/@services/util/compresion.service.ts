import { Injectable } from '@angular/core';
import * as pako from 'pako';

@Injectable({
  providedIn: 'root'
})
export class CompresionService {

  constructor() { }

  /**
   * Réplica de Comprimir_zip (Go)
   * Recibe un Uint8Array (databytes) y devuelve una cadena Base64
   */
  comprimirZip(dataBytes: Uint8Array): string {
    try {
      // 1. Comprimir usando GZIP (pako genera un Uint8Array comprimido)
      const compressed = pako.gzip(dataBytes);
      
      // 2. Convertir los bytes comprimidos a cadena Base64
      return btoa(String.fromCharCode(...compressed));
    } catch (err) {
      console.error('Error al comprimir:', err);
      throw err;
    }
  }

  /**
   * Réplica de Descomprimir_zip (Go)
   * Recibe una cadena Base64 y devuelve el string original
   */
  descomprimirZip(base64Str: string): string {
    try {
      // 1. Decodificar Base64 a una cadena de bytes
      const binaryString = atob(base64Str);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Descomprimir GZIP
      const decompressed = pako.ungzip(bytes);

      // 3. Convertir Uint8Array a String (UTF-8)
      return new TextDecoder().decode(decompressed);
    } catch (err) {
      console.error('Error al descomprimir:', err);
      return '';
    }
  }
}