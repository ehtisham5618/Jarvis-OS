import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  durationMs?: number;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  add: (notification: Omit<Notification, "id" | "createdAt">) => void;
  dismiss: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],

  add: (notification) => {
    const id = crypto.randomUUID();
    const newNotif = { ...notification, id, createdAt: new Date().toISOString() };
    
    set((state) => ({
      notifications: [...state.notifications, newNotif]
    }));

    // Auto dismiss
    if (notification.durationMs !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }, notification.durationMs ?? 5000);
    }
  },

  dismiss: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  }
}));
