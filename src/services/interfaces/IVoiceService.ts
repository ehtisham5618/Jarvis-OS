/**
 * IVoiceService — Voice Input/Output Contract
 */

export interface AudioDevice {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface IVoiceService {
  // STT
  startRecording(): Promise<void>;
  stopRecording(): Promise<string>; // returns transcript
  isRecording(): boolean;
  listDevices(): Promise<AudioDevice[]>;
  setDevice(deviceId: string): Promise<void>;

  // TTS
  speak(text: string): Promise<void>;
  stopSpeaking(): Promise<void>;
}
