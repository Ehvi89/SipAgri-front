import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private renderer: Renderer2;
  private notificationContainer: HTMLElement | null = null;
  private notificationId = 0;
  private notifications = new BehaviorSubject<Notification[]>([]);
  private timeoutRefs: Map<number, any> = new Map(); // Pour stocker les timeouts

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.createNotificationContainer();
  }

  get notifications$(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  private createNotificationContainer(): void {
    this.notificationContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.notificationContainer, 'custom-notification-container');
    this.renderer.appendChild(document.body, this.notificationContainer);
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.showNotification(message, 'success', duration);
  }

  showError(message: string, duration: number = 3000): void {
    this.showNotification(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 3000): void {
    this.showNotification(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    this.showNotification(message, 'info', duration);
  }

  comingSoon(message?: string) {
    this.showInfo(message ?? "Fonctionnalité à venir, restez à l'affût");
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void {
    const id = this.notificationId++;
    const notification: Notification = { id, message, type, duration };

    // Ajouter à l'observable
    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    // Créer l'élément DOM
    this.createNotificationElement(notification);

    // Supprimer après la durée spécifiée
    const timeoutRef = setTimeout(() => {
      this.removeNotification(id);
    }, duration);

    this.timeoutRefs.set(id, timeoutRef);
  }

  private createNotificationElement(notification: Notification): void {
    if (!this.notificationContainer) return;

    const notificationElement = this.renderer.createElement('div');
    this.renderer.addClass(notificationElement, 'custom-notification');
    this.renderer.addClass(notificationElement, `custom-notification-${notification.type}`);
    this.renderer.setAttribute(notificationElement, 'data-notification-id', notification.id.toString()); // Ajout de l'ID

    // Icône selon le type
    const icon = this.renderer.createElement('span');
    this.renderer.addClass(icon, 'notification-icon');

    let iconText = '';
    switch (notification.type) {
      case 'success': iconText = '✓'; break;
      case 'error': iconText = '✕'; break;
      case 'warning': iconText = '⚠'; break;
      case 'info': iconText = 'ℹ'; break;
    }
    this.renderer.setProperty(icon, 'textContent', iconText);

    // Message
    const messageElement = this.renderer.createElement('span');
    this.renderer.addClass(messageElement, 'notification-message');
    this.renderer.setProperty(messageElement, 'textContent', notification.message);

    // Bouton fermer
    const closeButton = this.renderer.createElement('button');
    this.renderer.addClass(closeButton, 'notification-close');
    this.renderer.setProperty(closeButton, 'textContent', '×');
    this.renderer.setAttribute(closeButton, 'aria-label', 'Fermer la notification');
    this.renderer.listen(closeButton, 'click', () => {
      if (!environment.prod) {
        console.log("Bouton de fermeture cliqué pour la notification:", notification.id);
      }
      this.removeNotification(notification.id);
    });

    // Assemblage
    this.renderer.appendChild(notificationElement, icon);
    this.renderer.appendChild(notificationElement, messageElement);
    this.renderer.appendChild(notificationElement, closeButton);
    this.renderer.appendChild(this.notificationContainer, notificationElement);

    // Animation d'entrée
    setTimeout(() => {
      this.renderer.addClass(notificationElement, 'show');
    }, 10);
  }

  private removeNotification(id: number): void {
    if (!environment.prod) {
      console.log("Tentative de suppression de la notification:", id);
    }

    // Annuler le timeout si il existe
    if (this.timeoutRefs.has(id)) {
      clearTimeout(this.timeoutRefs.get(id));
      this.timeoutRefs.delete(id);
    }

    // Retirer de l'observable
    const currentNotifications = this.notifications.value;
    this.notifications.next(currentNotifications.filter(n => n.id !== id));

    // Retirer du DOM
    const element = document.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
      if (!environment.prod) {
        console.log("Élément trouvé, suppression en cours...");
      }

      // Animation de sortie
      this.renderer.removeClass(element, 'show');
      this.renderer.addClass(element, 'hiding');

      // Supprimer après l'animation
      setTimeout(() => {
        if (element.parentNode) {
          this.renderer.removeChild(element.parentNode, element);
          if (!environment.prod) {
            console.log("Notification supprimée du DOM:", id);
          }
        }
      }, 300);
    } else {
      if (!environment.prod) {
        console.warn("Élément non trouvé pour l'ID:", id);
      }
    }
  }

  clearAll(): void {
    // Annuler tous les timeouts
    this.timeoutRefs.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.timeoutRefs.clear();

    // Vider l'observable
    this.notifications.next([]);

    // Vider le DOM
    if (this.notificationContainer) {
      const elements = this.notificationContainer.querySelectorAll('.custom-notification');
      elements.forEach(element => {
        this.renderer.removeClass(element, 'show');
        this.renderer.addClass(element, 'hiding');
        setTimeout(() => {
          if (element.parentNode) {
            this.renderer.removeChild(element.parentNode, element);
          }
        }, 300);
      });
    }
  }

  // Nettoyage pour éviter les fuites mémoire
  ngOnDestroy(): void {
    this.clearAll();
    if (this.notificationContainer && this.notificationContainer.parentNode) {
      this.renderer.removeChild(document.body, this.notificationContainer);
    }
  }
}
