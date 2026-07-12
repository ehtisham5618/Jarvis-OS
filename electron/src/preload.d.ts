import type { JarvisOSAPI } from "./preload";

/**
 * Global type augmentation for the renderer.
 * After the preload exposes `window.jarvisOS`, TypeScript knows its full shape.
 * Reference this file in the root tsconfig.json so renderer code is fully typed.
 */
declare global {
  interface Window {
    jarvisOS: JarvisOSAPI;
  }
}

export {};
