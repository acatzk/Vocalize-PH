export type VoiceProvider = 'google' | 'azure' | 'elevenlabs' | 'system';
export type VoiceGender = 'male' | 'female';

export interface VoiceData {
  id: string;
  name: string;
  gender: VoiceGender;
  style: string;
  provider: VoiceProvider;
  voiceCode: string;
}

export type TtsSnippetLanguage = 'curl' | 'nodejs' | 'python';
