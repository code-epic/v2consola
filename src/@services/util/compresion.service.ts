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
    if (!base64Str) return '';
    
    try {
      // 1. Decodificar Base64 a una cadena de bytes
      const binaryString = atob(base64Str);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Intentar descompresión GZIP
      try {
        // Verificamos si tiene cabecera GZIP (1f 8b)
        if (bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
          const decompressed = pako.ungzip(bytes);
          return new TextDecoder().decode(decompressed);
        }
        
        // Si no es GZIP, intentamos inflate (ZLIB)
        try {
          const inflated = pako.inflate(bytes);
          return new TextDecoder().decode(inflated);
        } catch (e) {
          // Si ambos fallan, devolvemos el texto plano decodificado de Base64
          return new TextDecoder().decode(bytes);
        }
      } catch (err) {
        // Fallback final: devolver la cadena decodificada tal cual
        return new TextDecoder().decode(bytes);
      }
    } catch (err) {
      console.error('Error al descomprimir:', err);
      return '';
    }
  }
}