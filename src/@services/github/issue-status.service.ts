import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from '@services/apicore/api.service';
import { v4 as uuidv4 } from 'uuid';

export interface IssueStatusChangeRequest {
  issueNumber: number;
  userId: string; // ID del usuario (UUID)
  open?: boolean; // true para reabrir, false o undefined para cerrar
  requestId?: string;
}

export interface IssueStatusChangeResponse {
  success: boolean;
  issueNumber: number;
  newStatus: 'open' | 'closed';
  message: string;
  timestamp: Date;
}

export interface IssueStatusError {
  issueNumber: number;
  error: string;
  code?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IssueStatusService {
  
  // Estado reactivo para cambios de estatus
  private statusChangesSubject = new BehaviorSubject<IssueStatusChangeResponse[]>([]);
  public statusChanges$ = this.statusChangesSubject.asObservable();
  
  // Estado de loading para operaciones
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  // Estado de errores
  private errorsSubject = new BehaviorSubject<IssueStatusError[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  constructor(private apiService: ApiService) {
    console.log('🔄 IssueStatusService inicializado');
  }

  /**
   * Cambia el estatus de una issue (cerrar o reabrir)
   * @param issueNumber Número de la issue
   * @param userId ID del usuario (UUID)
   * @param open true para reabrir, false o undefined para cerrar
   * @returns Observable con la respuesta del cambio de estatus
   */
  changeIssueStatus(issueNumber: number, userId: string, open?: boolean): Observable<IssueStatusChangeResponse> {
    const requestId = uuidv4();
    const action = open ? 'reabrir' : 'cerrar';
    
    console.log(`🔄 Iniciando cambio de estatus para issue #${issueNumber} - Acción: ${action}`);
    console.log('📋 Parámetros:', { issueNumber, userId, open, requestId });
    
    // Validar parámetros
    if (!issueNumber || issueNumber <= 0) {
      const error = 'Número de issue inválido';
      console.error('❌ Error de validación:', error);
      return throwError(() => new Error(error));
    }
    
    if (!userId || userId.trim() === '') {
      const error = 'ID de usuario requerido';
      console.error('❌ Error de validación:', error);
      return throwError(() => new Error(error));
    }
    
    // Establecer estado de loading
    this.setLoading(true);
    
    console.log('🚀 Llamando a Fnx_CambiarEstatusGitea con parámetros individuales');
    console.log('📋 Valores:', { userId, issueNumber, estado: open ? 'open' : '' });
    
    // Preparar objeto para ExecFnx con parámetros individuales
    const fnxRequest = {
      funcion: 'Fnx_EstatusGiteaa',
      id_cliente: userId,
      idtarea:  issueNumber.toString(),
      estado: open ? 'open' : '' // vacío para cerrar, 'open' para reabrir
    };
    
    return this.apiService.ExecFnx(fnxRequest).pipe(
      map((response: any) => {
        console.log('✅ Respuesta de Fnx_CambiarEstatusGitea:', response);
        
        // Procesar respuesta exitosa
        const statusResponse: IssueStatusChangeResponse = {
          success: true,
          issueNumber: issueNumber,
          newStatus: open ? 'open' : 'closed',
          message: `Issue #${issueNumber} ${open ? 'reabierta' : 'cerrada'} exitosamente`,
          timestamp: new Date()
        };
        
        // Actualizar estado reactivo
        this.addStatusChange(statusResponse);
        
        console.log(`🎯 Issue #${issueNumber} ${action} exitosamente`);
        
        return statusResponse;
      }),
      catchError((error: any) => {
        console.error(`❌ Error al ${action} issue #${issueNumber}:`, error);
        
        // Crear error estructurado
        const statusError: IssueStatusError = {
          issueNumber: issueNumber,
          error: error.message || `Error al ${action} la issue`,
          code: error.code || 'CHANGE_STATUS_ERROR',
          timestamp: new Date()
        };
        
        // Actualizar estado de errores
        this.addError(statusError);
        
        // Retornar error observable
        return throwError(() => statusError);
      }),
      tap(() => {
        // Finalizar estado de loading
        this.setLoading(false);
      })
    );
  }

  /**
   * Cierra una issue específica
   * @param issueNumber Número de la issue a cerrar
   * @param userId ID del usuario (UUID)
   * @returns Observable con la respuesta del cierre
   */
  closeIssue(issueNumber: number, userId: string): Observable<IssueStatusChangeResponse> {
    console.log(`🔒 Cerrando issue #${issueNumber}`);
    return this.changeIssueStatus(issueNumber, userId, false);
  }

  /**
   * Reabre una issue específica
   * @param issueNumber Número de la issue a reabrir
   * @param userId ID del usuario (UUID)
   * @returns Observable con la respuesta de la reapertura
   */
  reopenIssue(issueNumber: number, userId: string): Observable<IssueStatusChangeResponse> {
    console.log(`🔓 Reabriendo issue #${issueNumber}`);
    return this.changeIssueStatus(issueNumber, userId, true);
  }

  /**
   * Cambia el estatus de múltiples issues
   * @param issues Array de requests de cambio de estatus
   * @returns Observable con array de respuestas
   */
  changeMultipleIssuesStatus(issues: IssueStatusChangeRequest[]): Observable<IssueStatusChangeResponse[]> {
    console.log(`🔄 Cambiando estatus de ${issues.length} issues`);
    
    const requests = issues.map(issue => 
      this.changeIssueStatus(issue.issueNumber, issue.userId, issue.open)
    );
    
    // Ejecutar todas las requests en paralelo
    return new Observable(observer => {
      const results: IssueStatusChangeResponse[] = [];
      let completed = 0;
      
      requests.forEach((request, index) => {
        request.subscribe({
          next: (response) => {
            results[index] = response;
            completed++;
            
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            // Crear respuesta de error
            const errorResponse: IssueStatusChangeResponse = {
              success: false,
              issueNumber: issues[index].issueNumber,
              newStatus: issues[index].open ? 'open' : 'closed',
              message: error.message || 'Error al cambiar estatus',
              timestamp: new Date()
            };
            
            results[index] = errorResponse;
            completed++;
            
            if (completed === requests.length) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Obtiene el historial de cambios de estatus
   * @returns Array de cambios de estatus realizados
   */
  getStatusChanges(): IssueStatusChangeResponse[] {
    return this.statusChangesSubject.value;
  }

  /**
   * Obtiene los errores de cambios de estatus
   * @returns Array de errores ocurridos
   */
  getErrors(): IssueStatusError[] {
    return this.errorsSubject.value;
  }

  /**
   * Limpia el historial de cambios de estatus
   */
  clearStatusChanges(): void {
    console.log('🧹 Limpiando historial de cambios de estatus');
    this.statusChangesSubject.next([]);
  }

  /**
   * Limpia los errores de cambios de estatus
   */
  clearErrors(): void {
    console.log('🧹 Limpiando errores de cambios de estatus');
    this.errorsSubject.next([]);
  }

  /**
   * Verifica si hay operaciones en progreso
   * @returns true si hay operaciones de cambio de estatus en progreso
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Métodos privados para manejo de estado

  private addStatusChange(change: IssueStatusChangeResponse): void {
    const current = this.statusChangesSubject.value;
    this.statusChangesSubject.next([...current, change]);
  }

  private addError(error: IssueStatusError): void {
    const current = this.errorsSubject.value;
    this.errorsSubject.next([...current, error]);
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    console.log('🔄 IssueStatusService destruido');
    this.statusChangesSubject.complete();
    this.loadingSubject.complete();
    this.errorsSubject.complete();
  }
}
