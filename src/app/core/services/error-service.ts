// Enum pour les types d'erreurs
import {Injectable} from '@angular/core';

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

// Interface pour les erreurs structurées
export interface SAError {
  type: ErrorType;
  message: string;
  originalError?: any;
  statusCode?: number;
  timestamp: Date;
}

@Injectable({providedIn: 'root'})
export class ErrorService {
  handleError(error: any): SAError {
    // console.error('Login error:', error);
    let saError;

    // Erreur de réseau (hors ligne, CORS, etc.)
    if (error instanceof ErrorEvent) {
      saError = this.createError(
        ErrorType.NETWORK,
        'Problème de connexion réseau. Veuillez vérifier votre connexion internet.',
        error
      );
    }

    // Erreur de timeout
    if (error.name === 'TimeoutError') {
      saError = this.createError(
        ErrorType.TIMEOUT,
        'La connexion a expiré. Veuillez réessayer.',
        error
      );
    }

    // Erreurs HTTP basées sur le status code
    switch (error.status) {
      case 0:
        saError = this.createError(
          ErrorType.NETWORK,
          'Impossible de joindre le serveur. Veuillez vérifier votre connexion.',
          error
        );
        break;

      case 400:
        saError = this.createError(
          ErrorType.VALIDATION,
          error.error?.message || 'Données de connexion invalides',
          error
        );
        break;

      case 401:
        saError = this.createError(
          ErrorType.UNAUTHORIZED,
          error.error?.message || 'Email ou mot de passe incorrect',
          error,
          401
        );
        break;

      case 403:
        saError = this.createError(
          ErrorType.FORBIDDEN,
          error.error?.message || 'Accès refusé. Votre compte peut être désactivé.',
          error,
          403
        );
        break;

      case 404:
        return this.createError(
          ErrorType.UNKNOWN,
          'Ressource demandée introuvable',
          error,
          404
        );

      case 429:
        saError = this.createError(
          ErrorType.SERVER,
          'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.',
          error,
          429
        );
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        saError = this.createError(
          ErrorType.SERVER,
          'Problème technique temporaire. Veuillez réessayer ultérieurement.',
          error,
          error.status
        );
        break;

      default:
        saError =  this.createError(
          ErrorType.UNKNOWN,
          error.error?.message || 'Une erreur inattendue est survenue',
          error,
          error.status
        );
    }

    console.error(saError);
    return saError;
  }

  createError(
    type: ErrorType,
    message: string,
    originalError?: any,
    statusCode?: number
  ): SAError {
    return {
      type,
      message,
      originalError,
      statusCode,
      timestamp: new Date()
    };
  }

  // Méthode utilitaire pour formater les erreurs pour l'UI
  getErrorMessage(error: SAError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.message;

      case ErrorType.UNAUTHORIZED:
        return error.message;

      case ErrorType.NETWORK:
        return error.message;

      case ErrorType.SERVER:
        return error.message;

      case ErrorType.TIMEOUT:
        return error.message;

      default:
        return 'Une erreur inattendue est survenue. Veuillez réessayer.';
    }
  }

  // Méthode pour savoir si l'erreur est récupérable
  isRecoverableError(error: SAError): boolean {
    const nonRecoverableTypes = [
      ErrorType.FORBIDDEN,
      ErrorType.VALIDATION
    ];

    return !nonRecoverableTypes.includes(error.type);
  }
}
