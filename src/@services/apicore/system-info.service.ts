// src/app/services/system-info.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService, IAPICore } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SystemInfoService {
  private systemData: any;

  constructor(private http: HttpClient, private apiService: ApiService) {
    // Aquí puedes cargar los datos desde una API o dejarlos estáticos
    this.systemData = []
  }

  XgetSystemInfo(): Observable<any> {
    // Si los datos vienen de una API:
    // return this.http.get('tu-api-endpoint');
    let fnx = {
      funcion: "Fnx_DatosServidor",
    }

    this.apiService.ExecFnx(fnx).subscribe(
      (data) => {
        console.log(data)
        let pid = data.contenido.id

        return  this.systemData = data
      },
      (error) => {
        console.log(error)
      }
    )

    // Para datos estáticos:
    return new Observable(observer => {
      observer.next(this.systemData);
      observer.complete();
    });
  }

  getSystemInfo(): Observable<any> {
    const fnx = {
      funcion: "Fnx_DatosServidor",
    };
  
    return new Observable(observer => {
      this.apiService.ExecFnx(fnx).subscribe(
        (data) => {
          // console.log(data);
          const pid = data.contenido.id;
          this.systemData = data;
  
          // Si ya está procesado, parseamos newData.rs
          if (data.documento === "PROCESADO") {
            this.parseAndAssignSystemData(data);
            observer.next(this.systemData);
            observer.complete();
            return;
          }
  
          // Si no, iniciamos la verificación periódica
          const checkStatus = () => {
            this.apiService.ExecFnxId(pid).subscribe(
              (newData) => {
                console.log(newData);
                
                if (newData.documento === "PROCESADO") {
                  this.parseAndAssignSystemData(newData);
                  observer.next(this.systemData);
                  observer.complete();
                } else {
                  setTimeout(checkStatus, 2000); // Reintentar en 2 segundos
                }
              },
              (error) => {
                console.log(error);
                observer.error(error);
              }
            );
          };
  
          setTimeout(checkStatus, 2000); // Primera verificación después de 2 segundos
        },
        (error) => {
          console.log(error);
          observer.error(error);
        }
      );
    });
  }
  
  // Método para extraer y parsear el JSON de newData.rs
  private parseAndAssignSystemData(data: any): void {
    try {
      // 1. Extraer el JSON del string completo
      const jsonStart = data.rs.indexOf('{');
      const jsonEnd = data.rs.lastIndexOf('}') + 1;
      let jsonString = data.rs.substring(jsonStart, jsonEnd);
  
      // 2. Arreglar problemas comunes en el JSON
      // - Comas al final de arrays/objetos
      jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
      // - Valores vacíos en propiedades numéricas
      jsonString = jsonString.replace(/:\s*,/g, ': null,');
      jsonString = jsonString.replace(/:\s*$/g, ': null');
  
      // 3. Parsear el JSON corregido
      const parsedData = JSON.parse(jsonString);
      
      // 4. Limpiar los datos numéricos vacíos
      if (parsedData.cpu) {
        parsedData.cpu.cores = parsedData.cpu.cores || null;
        parsedData.cpu.threads = parsedData.cpu.threads || null;
      }
  
      this.systemData = parsedData;
      // console.log('Datos del sistema parseados:', this.systemData);
    } catch (error) {
      console.error('Error al parsear data.rs:', error);
      console.error('Contenido problemático:', data.rs);
      this.systemData = { 
        error: "Error al parsear datos del sistema",
        rawData: data.rs // Guardamos los datos crudos para diagnóstico
      };
    }
  }

}