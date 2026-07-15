/// <reference lib="webworker" />

/**
 * memorySearch.worker.ts
 *
 * Offloads embedding vector computation to a Web Worker.
 * If this were using transformers.js, it would keep the heavy WASM execution off the main thread.
 * Currently, it offloads the fetch call to Ollama.
 */

self.onmessage = async (e: MessageEvent) => {
  const { query, model } = e.data;

  try {
    const res = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "nomic-embed-text",
        prompt: query,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama embedding failed: ${res.statusText}`);
    }

    const json = await res.json();
    self.postMessage({ success: true, embedding: json.embedding });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
