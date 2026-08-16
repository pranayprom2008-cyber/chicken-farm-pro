// ==========================================
// CHICKAI VOICE SYNTHESIS & SPEECH PROCESSING
// ==========================================

export interface VoiceSettings {
  enabled: boolean;
  voicePersona: 'friendly-assistant' | 'friendly-female' | 'friendly-male' | 'professional-clear';
  speed: number; // 0.8 to 1.2
  volume: number; // 0 to 1
  autoSpeak: boolean;
  voiceCommands: boolean;
  dailyBriefEnabled: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  voicePersona: 'friendly-female',
  speed: 1.0,
  volume: 1.0,
  autoSpeak: true,
  voiceCommands: true,
  dailyBriefEnabled: false,
};

/**
 * Converts rich markdown and financial text into clean, warm, friendly conversational voice speech
 */
export function formatTextForSpeech(text: string): string {
  let spoken = text;

  // Remove markdown headers
  spoken = spoken.replace(/#{1,6}\s+/g, '');

  // Remove bold / italic / code syntax
  spoken = spoken.replace(/\*\*(.*?)\*\*/g, '$1');
  spoken = spoken.replace(/\*(.*?)\*/g, '$1');
  spoken = spoken.replace(/`{1,3}(.*?)`{1,3}/g, '$1');

  // Remove markdown tables entirely
  spoken = spoken.replace(/\|.*\|/g, '');

  // Convert Indian Rupee symbols and numbers to natural spoken phrases
  spoken = spoken.replace(/₹\s*(\d{1,3}(?:,\d{3})+|\d+)/g, (match, numStr) => {
    const num = parseInt(numStr.replace(/,/g, ''), 10);
    if (num >= 100000) {
      const lakhs = (num / 100000).toFixed(1).replace('.0', '');
      return `${lakhs} lakh rupees`;
    }
    if (num >= 1000) {
      const thousands = (num / 1000).toFixed(1).replace('.0', '');
      return `${thousands} thousand rupees`;
    }
    return `${num} rupees`;
  });

  // Convert kg feed and percentages
  spoken = spoken.replace(/(\d+)\s*kg/gi, '$1 kilos');
  spoken = spoken.replace(/(\d+(?:\.\d+)?)\s*%/g, '$1 percent');

  // Convert Batch numbers (e.g. B-2026-01 -> Batch 1, Batch-45 -> Batch 45)
  spoken = spoken.replace(/batch[#-]?\s*(\d+)/gi, 'Batch $1');

  // Remove bullet points and extra markdown symbols
  spoken = spoken.replace(/^[•\-*]\s+/gm, '');
  spoken = spoken.replace(/✅|🔴|🟡|🟢|⚠️|🚨|🌾|🐥|🐔|💊|⚡|👥|🔧|💰|📈|🏆|💡|📋|📁|📱|👋|✨/g, '');

  // Collapse excess whitespace into natural pauses
  spoken = spoken.replace(/\n{2,}/g, '. ').replace(/\n/g, ' ').trim();

  // If the text contained complex tables or charts, add a friendly screen reference note
  if (text.includes('|') || text.includes('####') || text.includes('Simulation Assumptions')) {
    spoken += " I've put the full breakdown right on your screen.";
  }

  return spoken;
}

export class ChickAIVoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private onStateChangeCallback?: (isSpeaking: boolean) => void;

  constructor(onStateChange?: (isSpeaking: boolean) => void) {
    this.onStateChangeCallback = onStateChange;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeakingState = false;
      this.currentUtterance = null;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public speak(
    text: string,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      // Cancel any ongoing speech before starting a new one
      this.stop();

      const spokenText = formatTextForSpeech(text);
      if (!spokenText) {
        resolve();
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      const voices = this.getAvailableVoices();

      let selectedVoice: SpeechSynthesisVoice | null = null;

      // Friendly Female / Assistant selection
      if (settings.voicePersona === 'friendly-assistant' || settings.voicePersona === 'friendly-female') {
        selectedVoice =
          voices.find((v) => v.name.includes('Natural') && (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Michelle') || v.name.includes('Sonia'))) ||
          voices.find((v) => v.name.includes('Google US English') || v.name.includes('Google UK English Female')) ||
          voices.find((v) => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen')) ||
          voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
          voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en-IN') ||
          voices[0] ||
          null;

        utterance.pitch = 1.02; // Warm, natural, friendly pitch
      }
      // Friendly Male selection
      else if (settings.voicePersona === 'friendly-male') {
        selectedVoice =
          voices.find((v) => v.name.includes('Natural') && (v.name.includes('Guy') || v.name.includes('Ryan') || v.name.includes('Christopher') || v.name.includes('George'))) ||
          voices.find((v) => v.name.includes('Google US English') || v.name.includes('Google UK English Male')) ||
          voices.find((v) => v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Oliver')) ||
          voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
          voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en-IN') ||
          voices[0] ||
          null;

        utterance.pitch = 1.0; // Friendly normal male pitch
      }
      // Professional & Clear selection
      else {
        selectedVoice =
          voices.find((v) => v.name.includes('Natural')) ||
          voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en-IN') ||
          voices[0] ||
          null;

        utterance.pitch = 1.0;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Normal, friendly speaking rate (1.0x) and clear volume
      utterance.rate = Math.max(0.85, Math.min(1.2, settings.speed || 1.0));
      utterance.volume = Math.max(0, Math.min(1, settings.volume ?? 1.0));

      utterance.onstart = () => {
        this.isSpeakingState = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis notice:', e);
        this.isSpeakingState = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
        resolve();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }
}
