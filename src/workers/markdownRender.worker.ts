/// <reference lib="webworker" />

/**
 * markdownRender.worker.ts
 *
 * Offloads heavy markdown parsing and sanitization to a Web Worker
 * for very long AI responses.
 */

import { marked } from "marked";
import DOMPurify from "dompurify";

self.onmessage = async (e: MessageEvent) => {
  const { content } = e.data;
  
  try {
    // Parse markdown to HTML
    const html = await marked(content, { async: true });
    
    // Sanitize HTML
    const sanitized = DOMPurify.sanitize(html);
    
    self.postMessage({ success: true, html: sanitized });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
