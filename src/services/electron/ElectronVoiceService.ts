import type { IVoiceService, AudioDevice } from "../interfaces/IVoiceService";

export class ElectronVoiceService implements IVoiceService {
  private recording = false;

  async startRecording(): Promise<void> {
    this.recording = true;
    await window.jarvisOS.voice.startRecording();
  }

  async stopRecording(): Promise<string> {
    this.recording = false;
    const pcmData = await window.jarvisOS.voice.stopRecording();
    const transcript = await window.jarvisOS.voice.transcribe(pcmData);
    return transcript;
  }

  isRecording(): boolean {
    return this.recording;
  }

  async listDevices(): Promise<AudioDevice[]> {
    return window.jarvisOS.voice.listDevices();
  }

  async setDevice(deviceId: string): Promise<void> {
    await window.jarvisOS.voice.setDevice(deviceId);
  }

  async speak(text: string): Promise<void> {
    await window.jarvisOS.tts.speak(text);
  }

  async stopSpeaking(): Promise<void> {
    await window.jarvisOS.tts.stop();
  }
}
