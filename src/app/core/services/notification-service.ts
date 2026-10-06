import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private nextId = 1;

  notifications = signal<Notification[]>([]);

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  remove(id: number): void {
    this.notifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== id),
    );
  }

  private show(type: NotificationType, message: string): void {
    const id = this.nextId++;

    this.notifications.update((notifications) => [
      ...notifications,
      {
        id,
        type,
        message,
      },
    ]);

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }
}
