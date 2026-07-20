import { ipcMain, desktopCapturer } from "electron";
import { IpcChannels } from "./channels";
import log from "electron-log";
import Tesseract from "tesseract.js";
import sharp from "sharp";

export function registerVisionHandlers(): void {
  ipcMain.handle(IpcChannels.VISION_SCREENSHOT, async () => {
    log.info("[vision] Capturing primary screen...");
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    if (sources.length > 0) {
      // Return raw PNG buffer
      return sources[0].thumbnail.toPNG();
    }
    
    throw new Error("No screens found");
  });

  ipcMain.handle(IpcChannels.VISION_OCR, async (_, imageBuffer: Buffer) => {
    log.info("[vision] Running OCR on image buffer...");
    
    // Pre-process for OCR: grayscale and increase contrast using Sharp
    const processedBuffer = await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .png()
      .toBuffer();

    const result = await Tesseract.recognize(processedBuffer, "eng", {
      logger: (m) => log.debug("[tesseract]", m.status, Math.round(m.progress * 100) + "%"),
    });

    log.info("[vision] OCR complete.");
    return result.data.text.trim();
  });

  // VISION_ANALYZE will be handled in the renderer process via Ollama chat API 
  // with the base64 image attached to the prompt.
}
