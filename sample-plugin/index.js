// Sample Plugin - index.js
// This runs in a sandboxed renderer environment with the JarvisPluginSDK injected

console.log("Sample Plugin initialized!");

// Note: In a real implementation, the SDK methods would be wired to the main process via IPC.
// This is just a placeholder script to show how a plugin is structured.

// We can listen for initialization events
window.addEventListener('message', (event) => {
    if (event.data && event.data.channel === 'plugin:init') {
        const manifest = event.data.payload.manifest;
        console.log(`Plugin ${manifest.id} initialized with permissions:`, manifest.permissions);
    }
});
