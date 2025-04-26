import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class Sha256Service {

    constructor() { }


    private readonly K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
      0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      // ... (resto de las constantes K)
    ];
  
    public async hash(message: string): Promise<string> {
      // Preprocesamiento del mensaje
      const msgBuffer = new TextEncoder().encode(message);
      const msgBits = Array.from(msgBuffer)
        .map(b => b.toString(2).padStart(8, '0'))
        .join('');
  
      const len = msgBits.length;
      const totalLen = len + 1 + 64 - ((len + 1) % 64);
  
      // Añadir padding
      const paddedMsg = msgBits + '1' + '0'.repeat(totalLen - len - 1) 
        + len.toString(2).padStart(64, '0');
  
      // Procesar en bloques de 512 bits
      const blocks = [];
      for (let i = 0; i < paddedMsg.length; i += 512) {
        blocks.push(paddedMsg.substr(i, 512));
      }
  
      // Inicializar variables de hash
      let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
      let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  
      // Procesar cada bloque
      for (const block of blocks) {
        // ... (implementación completa del algoritmo)
      }
  
      // Combinar los hashes
      const hashArray = [h0, h1, h2, h3, h4, h5, h6, h7];
      const hashHex = hashArray.map(h => h.toString(16).padStart(8, '0')).join('');
  
      return hashHex;
    }
  }
  
  // Uso:
//   SHA256.hash('texto').then(hash => console.log(hash));