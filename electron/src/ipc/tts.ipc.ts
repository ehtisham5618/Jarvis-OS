import { ipcMain } from "electron";
import { IpcChannels } from "./channels";
import { spawn } from "child_process";
import log from "electron-log";

let ttsProcess: ReturnType<typeof spawn> | null = null;

export function registerTtsHandlers(): void {
  ipcMain.handle(IpcChannels.TTS_SPEAK, async (_, text: string) => {
    // Kill any existing speech
    if (ttsProcess) {
      ttsProcess.kill();
      ttsProcess = null;
    }

    log.info("[tts] Speaking:", text);

    return new Promise<void>((resolve, reject) => {
      // Escape quotes for PowerShell
      const escapedText = text.replace(/"/g, '""');

      const psCommand = `
        Add-Type -AssemblyName System.Speech;
        $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $synth.SetOutputToDefaultAudioDevice();
        $synth.Speak("${escapedText}");
      `;

      ttsProcess = spawn("powershell.exe", ["-Command", psCommand]);

      ttsProcess.on("close", (code) => {
        ttsProcess = null;
        if (code === 0) resolve();
        else reject(new Error(`TTS process exited with code ${code}`));
      });

      ttsProcess.on("error", (err) => {
        ttsProcess = null;
        reject(err);
      });
    });
  });

  ipcMain.handle(IpcChannels.TTS_STOP, async () => {
    if (ttsProcess) {
      log.info("[tts] Stopping speech");
      ttsProcess.kill();
      ttsProcess = null;
    }
  });
}
