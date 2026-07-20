/**
 * notifications.store — In-Memory Notification History
 *
 * Tracks all notifications shown by Jarvis (native + in-app).
 * Integrates with the JarvisEventBus to auto-show notifications on events.
 */

import { create } from "zustand";

export interface JarvisNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  icon?: string;
}

interface NotificationsState {
  notifications: JarvisNotification[];
  unreadCount: number;

  /** Show a notification (and optionally fire native OS notification) */
  show(title: string, body: string, icon?: string): void;

  /** Mark a single notification as read */
  dismiss(id: string): void;

  /** Mark all notifications as read */
  dismissAll(): void;

  /** Remove a notification from history */
  remove(id: string): void;

  /** Clear all notification history */
  clearAll(): void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,

  show(title, body, icon) {
    const notification: JarvisNotification = {
      id: crypto.randomUUID(),
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      icon,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100),
      unreadCount: state.unreadCount + 1,
    }));

    // Fire native OS notification if we're in Electron
    const api = (window as any).jarvisOS?.notification;
    if (api) {
      api.show(title, body, icon).catch(() => {
        // Silently fail — in-app notification is the fallback
      });
    }
  },

  dismiss(id) {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },

  dismissAll() {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  remove(id) {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
  },

  clearAll() {
    set({ notifications: [], unreadCount: 0 });
  },
}));
