/**
 * Jarvis Event Bus
 *
 * A typed, singleton event bus for platform-wide communication.
 * Components and services communicate through events — never through direct coupling.
 *
 * Key properties:
 * - Fully typed: TypeScript enforces correct payload shapes at compile time
 * - Synchronous emission: subscribers are called synchronously in registration order
 * - Unsubscription via returned cleanup function (no listener leak risk)
 * - Wildcard listener support for debugging/telemetry
 *
 * Usage:
 *   // Subscribe
 *   const unsub = eventBus.on("system:metrics-updated", (metrics) => {
 *     console.log(metrics.cpu);
 *   });
 *   // Later: unsub(); // cleans up the listener
 *
 *   // Emit
 *   eventBus.emit("system:metrics-updated", { cpu: 45, ... });
 */

import type {
  JarvisEventMap,
  JarvisEventName,
  JarvisEventPayload,
} from "./EventTypes";

type Subscriber<T> = (payload: T) => void;
type WildcardSubscriber = (event: JarvisEventName, payload: unknown) => void;
type Unsubscribe = () => void;

class JarvisEventBus {
  private readonly listeners = new Map<
    JarvisEventName,
    Set<Subscriber<unknown>>
  >();
  private readonly wildcardListeners = new Set<WildcardSubscriber>();

  /**
   * Subscribe to a specific event.
   * Returns a cleanup function — call it to unsubscribe.
   */
  on<T extends JarvisEventName>(
    event: T,
    subscriber: Subscriber<JarvisEventPayload<T>>,
  ): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    // Safe cast: the Map key and subscriber type are guaranteed to match
    const set = this.listeners.get(event)!;
    set.add(subscriber as Subscriber<unknown>);

    return () => {
      set.delete(subscriber as Subscriber<unknown>);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Subscribe to a single occurrence of an event.
   * Automatically unsubscribes after first emission.
   */
  once<T extends JarvisEventName>(
    event: T,
    subscriber: Subscriber<JarvisEventPayload<T>>,
  ): Unsubscribe {
    const unsub = this.on(event, (payload) => {
      unsub();
      subscriber(payload);
    });
    return unsub;
  }

  /**
   * Emit an event. All subscribers are called synchronously.
   * Errors in subscribers are caught and logged to avoid cascading failures.
   */
  emit<T extends JarvisEventName>(
    event: T,
    payload: JarvisEventPayload<T>,
  ): void {
    // Notify typed subscribers
    const set = this.listeners.get(event);
    if (set) {
      for (const sub of set) {
        try {
          sub(payload);
        } catch (err) {
          console.error(`[EventBus] Subscriber error for event "${event}":`, err);
        }
      }
    }

    // Notify wildcard subscribers (used for debugging/telemetry)
    for (const sub of this.wildcardListeners) {
      try {
        sub(event, payload);
      } catch (err) {
        console.error(`[EventBus] Wildcard subscriber error for event "${event}":`, err);
      }
    }
  }

  /**
   * Subscribe to ALL events. Useful for logging and telemetry.
   * Returns a cleanup function.
   */
  onAny(subscriber: WildcardSubscriber): Unsubscribe {
    this.wildcardListeners.add(subscriber);
    return () => this.wildcardListeners.delete(subscriber);
  }

  /**
   * Returns the number of subscribers for a given event.
   * Useful for debugging subscriber leaks.
   */
  listenerCount(event: JarvisEventName): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Remove all subscribers for a given event, or all events if not specified.
   * Use with caution — only in tests or during shutdown.
   */
  removeAll(event?: JarvisEventName): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
      this.wildcardListeners.clear();
    }
  }
}

/** Singleton event bus — the nervous system of Jarvis */
export const eventBus = new JarvisEventBus();
