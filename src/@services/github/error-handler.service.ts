import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { AppError, ErrorType, ErrorState, ConnectionState, ToastNotification, ToastAction } from './interfaces/error.interface';

/**
 * Professional Error Handler Service
 * Manages application errors, connection states, and user notifications
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  // Error State Management
  private errorStateSubject = new BehaviorSubject<ErrorState>({
    hasError: false,
    error: null,
    isRetrying: false,
    retryCount: 0,
    maxRetries: 3
  });
  
  // Connection State Management
  private connectionStateSubject = new BehaviorSubject<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  });
  
  // Toast Notifications Management
  private toastNotificationsSubject = new BehaviorSubject<ToastNotification[]>([]);
  
  // Public Observables
  public errorState$ = this.errorStateSubject.asObservable();
  public connectionState$ = this.connectionStateSubject.asObservable();
  public toastNotifications$ = this.toastNotificationsSubject.asObservable();
  
  constructor() {
    console.log('🛡️ ErrorHandlerService initialized');
  }
  
  // ==========================================
  // ERROR MANAGEMENT
  // ==========================================
  
  /**
   * Handle different types of errors with appropriate user feedback
   */
  handleError(error: any, context: string = 'Unknown'): AppError {
    console.error(`🚨 Error in ${context}:`, error);
    
    const appError = this.createAppError(error, context);
    this.setErrorState(appError);
    this.showErrorToast(appError);
    
    return appError;
  }
  
  /**
   * Create standardized AppError from various error types
   */
  private createAppError(error: any, context: string): AppError {
    const errorId = this.generateErrorId();
    const timestamp = new Date();
    
    // WebSocket connection errors
    if (context.includes('WebSocket') || error?.type === 'websocket') {
      return {
        id: errorId,
        type: ErrorType.WEBSOCKET_CONNECTION,
        title: 'Conexión perdida',
        message: 'Se perdió la conexión en tiempo real. Intentando reconectar...',
        details: error?.message || 'Error de conexión WebSocket',
        timestamp,
        retryable: true,
        actionLabel: 'Reconectar',
        actionCallback: () => this.retryConnection()
      };
    }
    
    // API/HTTP errors
    if (error?.status || error?.error || context.includes('API')) {
      const status = error?.status || 0;
      let title = 'Error del servidor';
      let message = 'Hubo un problema al comunicarse con el servidor.';
      
      if (status === 0) {
        title = 'Sin conexión';
        message = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (status >= 400 && status < 500) {
        title = 'Error de solicitud';
        message = 'La solicitud no pudo ser procesada correctamente.';
      } else if (status >= 500) {
        title = 'Error del servidor';
        message = 'El servidor está experimentando problemas temporales.';
      }
      
      return {
        id: errorId,
        type: ErrorType.API_REQUEST,
        title,
        message,
        details: `HTTP ${status}: ${error?.message || error?.error?.message || 'Error desconocido'}`,
        timestamp,
        retryable: true,
        actionLabel: 'Reintentar',
        actionCallback: () => this.retryLastAction()
      };
    }
    
    // Timeout errors
    if (error?.name === 'TimeoutError' || context.includes('timeout')) {
      return {
        id: errorId,
        type: ErrorType.NETWORK_TIMEOUT,
        title: 'Tiempo de espera agotado',
        message: 'La operación tardó demasiado en completarse.',
        details: error?.message || 'Timeout error',
        timestamp,
        retryable: true,
        actionLabel: 'Reintentar',
        actionCallback: () => this.retryLastAction()
      };
    }
    
    // Data processing errors
    if (context.includes('data') || context.includes('processing')) {
      return {
        id: errorId,
        type: ErrorType.DATA_PROCESSING,
        title: 'Error de datos',
        message: 'Hubo un problema al procesar la información recibida.',
        details: error?.message || 'Error de procesamiento de datos',
        timestamp,
        retryable: false,
        actionLabel: 'Reportar',
        actionCallback: () => this.reportError(errorId)
      };
    }
    
    // Generic/Unknown errors
    return {
      id: errorId,
      type: ErrorType.UNKNOWN,
      title: 'Error inesperado',
      message: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
      details: error?.message || error?.toString() || 'Error desconocido',
      timestamp,
      retryable: true,
      actionLabel: 'Reintentar',
      actionCallback: () => this.retryLastAction()
    };
  }
  
  /**
   * Set error state
   */
  private setErrorState(error: AppError): void {
    const currentState = this.errorStateSubject.value;
    this.errorStateSubject.next({
      ...currentState,
      hasError: true,
      error,
      isRetrying: false
    });
  }
  
  /**
   * Clear error state
   */
  clearError(): void {
    this.errorStateSubject.next({
      hasError: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
      maxRetries: 3
    });
  }
  
  // ==========================================
  // CONNECTION MANAGEMENT
  // ==========================================
  
  /**
   * Update connection state
   */
  updateConnectionState(isConnected: boolean, isConnecting: boolean = false): void {
    const currentState = this.connectionStateSubject.value;
    const newState: ConnectionState = {
      ...currentState,
      isConnected,
      isConnecting,
      lastConnected: isConnected ? new Date() : currentState.lastConnected
    };
    
    if (isConnected) {
      newState.reconnectAttempts = 0;
    }
    
    this.connectionStateSubject.next(newState);
    console.log(`🔌 Connection state updated: ${isConnected ? 'Connected' : 'Disconnected'}`);
  }
  
  /**
   * Handle connection retry
   */
  private retryConnection(): void {
    const currentState = this.connectionStateSubject.value;
    if (currentState.reconnectAttempts >= currentState.maxReconnectAttempts) {
      this.showErrorToast({
        id: this.generateErrorId(),
        type: 'error',
        title: 'Conexión fallida',
        message: 'No se pudo restablecer la conexión después de varios intentos.',
        duration: 0,
        dismissible: true
      });
      return;
    }
    
    this.connectionStateSubject.next({
      ...currentState,
      isConnecting: true,
      reconnectAttempts: currentState.reconnectAttempts + 1
    });
    
    // Emit reconnection event (components can listen to this)
    this.showInfoToast('Intentando reconectar...', 'Reestableciendo conexión en tiempo real');
  }
  
  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  
  /**
   * Show success toast
   */
  showSuccessToast(title: string, message: string, duration: number = 4000): void {
    this.addToast({
      id: this.generateErrorId(),
      type: 'success',
      title,
      message,
      duration,
      dismissible: true
    });
  }
  
  /**
   * Show error toast
   */
  showErrorToast(error: AppError | ToastNotification): void {
    let toast: ToastNotification;
    
    if ('type' in error && typeof error.type === 'string') {
      // It's already a ToastNotification
      toast = error as ToastNotification;
    } else {
      // It's an AppError, convert it
      const appError = error as AppError;
      toast = {
        id: appError.id,
        type: 'error',
        title: appError.title,
        message: appError.message,
        duration: 0, // Persistent for errors
        dismissible: true,
        actions: appError.retryable ? [{
          label: appError.actionLabel || 'Reintentar',
          callback: appError.actionCallback || (() => {}),
          style: 'primary'
        }] : undefined
      };
    }
    
    this.addToast(toast);
  }
  
  /**
   * Show warning toast
   */
  showWarningToast(title: string, message: string, duration: number = 6000): void {
    this.addToast({
      id: this.generateErrorId(),
      type: 'warning',
      title,
      message,
      duration,
      dismissible: true
    });
  }
  
  /**
   * Show info toast
   */
  showInfoToast(title: string, message: string, duration: number = 3000): void {
    this.addToast({
      id: this.generateErrorId(),
      type: 'info',
      title,
      message,
      duration,
      dismissible: true
    });
  }
  
  /**
   * Add toast to the list
   */
  private addToast(toast: ToastNotification): void {
    const currentToasts = this.toastNotificationsSubject.value;
    const newToasts = [...currentToasts, toast];
    this.toastNotificationsSubject.next(newToasts);
    
    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      timer(toast.duration).subscribe(() => {
        this.removeToast(toast.id);
      });
    }
  }
  
  /**
   * Remove toast by ID
   */
  removeToast(toastId: string): void {
    const currentToasts = this.toastNotificationsSubject.value;
    const filteredToasts = currentToasts.filter(t => t.id !== toastId);
    this.toastNotificationsSubject.next(filteredToasts);
  }
  
  /**
   * Clear all toasts
   */
  clearAllToasts(): void {
    this.toastNotificationsSubject.next([]);
  }
  
  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Retry last action (placeholder - components should override this)
   */
  private retryLastAction(): void {
    console.log('🔄 Retry action triggered');
    // This should be overridden by components
  }
  
  /**
   * Report error (placeholder - can integrate with error reporting service)
   */
  private reportError(errorId: string): void {
    console.log(`📋 Error reported: ${errorId}`);
    this.showInfoToast('Error reportado', 'Gracias por reportar este error. Nuestro equipo lo revisará.');
  }
  
  /**
   * Get current error state
   */
  getCurrentErrorState(): ErrorState {
    return this.errorStateSubject.value;
  }
  
  /**
   * Get current connection state
   */
  getCurrentConnectionState(): ConnectionState {
    return this.connectionStateSubject.value;
  }
}
