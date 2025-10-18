/**
 * Error handling interfaces for GitHub Issues component
 * Provides consistent error management across the application
 */

export interface AppError {
  id: string;
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  timestamp: Date;
  retryable: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

export enum ErrorType {
  WEBSOCKET_CONNECTION = 'websocket_connection',
  API_REQUEST = 'api_request',
  DATA_PROCESSING = 'data_processing',
  NETWORK_TIMEOUT = 'network_timeout',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  DATA_VALIDATION = 'data_validation',
  UNKNOWN = 'unknown'
}

export interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = persistent
  dismissible: boolean;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  callback: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}
