import { ipcMain } from "electron";
import { IpcChannels } from "./channels";
import record from "node-record-lpcm16";
import log from "electron-log";
import { pipeline, env } from "@xenova/transformers";

// Disable local models fallback to huggingface by default in production, but here we let xenova download the model
env.allowLocalModels = true;
env.useBrowserCache = false; 

let recordingProcess: any = null;
let audioChunks: Buffer[] = [];
let transcriber: any = null;

export function registerVoiceHandlers(): void {
  ipcMain.handle(IpcChannels.VOICE_START_RECORDING, async () => {
    if (recordingProcess) {
      log.warn("[voice] Already recording");
      return;
    }
    log.info("[voice] Starting recording...");
    audioChunks = [];
    try {
      recordingProcess = record.record({
        sampleRate: 16000,
        channels: 1,
        audioType: "raw", // 'raw' typically gives raw pcm which whisper expects
      });

      recordingProcess.stream()
        .on("data", (chunk: Buffer) => {
          audioChunks.push(chunk);
        })
        .on("error", (err: any) => {
          log.error("[voice] Recording error:", err);
        });
    } catch (err) {
      log.error("[voice] Failed to start recording", err);
      throw err;
    }
  });

  ipcMain.handle(IpcChannels.VOICE_STOP_RECORDING, async () => {
    if (!recordingProcess) {
      log.warn("[voice] Not recording");
      return Buffer.alloc(0);
    }
    log.info("[voice] Stopping recording...");
    recordingProcess.stop();
    recordingProcess = null;
    
    // Combine chunks
    const pcmData = Buffer.concat(audioChunks);
    audioChunks = [];
    return pcmData; // Send back to renderer or process here
  });

  ipcMain.handle(IpcChannels.VOICE_TRANSCRIBE, async (_, pcmData: Buffer) => {
    log.info("[voice] Transcribing audio chunk (size: " + pcmData.length + " bytes)");
    
    if (pcmData.length === 0) return "";

    try {
      // Lazy load Whisper model
      if (!transcriber) {
        log.info("[voice] Loading Whisper model (Xenova/whisper-tiny.en)...");
        transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en");
        log.info("[voice] Whisper model loaded.");
      }

      // We need to convert 16-bit PCM Buffer into Float32Array for Transformers.js
      const float32Array = new Float32Array(pcmData.length / 2);
      for (let i = 0; i < pcmData.length / 2; i++) {
        // Read 16-bit signed integer and normalize to [-1, 1]
        const int16 = pcmData.readInt16LE(i * 2);
        float32Array[i] = int16 / 32768.0;
      }

      const result = await transcriber(float32Array, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: "english",
        task: "transcribe",
      });

      return result.text.trim();
    } catch (err) {
      log.error("[voice] Transcription failed:", err);
      return "";
    }
  });
}
