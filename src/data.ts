import { VoiceData } from './types';

export const VOICES: VoiceData[] = [
  // Google Cloud Voices
  {
    id: 'gcp-hina',
    name: 'Aisa (Neural2)',
    gender: 'female',
    style: 'Bright • High-fidelity Neural',
    provider: 'google',
    voiceCode: 'tl-PH-Neural2-A',
  },
  {
    id: 'gcp-manuel',
    name: 'Manuel (Neural2)',
    gender: 'male',
    style: 'Deep • Clear & Solid',
    provider: 'google',
    voiceCode: 'tl-PH-Neural2-B',
  },
  {
    id: 'gcp-standard-f',
    name: 'Luningning (WaveNet)',
    gender: 'female',
    style: 'Standard • Warm & Conversational',
    provider: 'google',
    voiceCode: 'tl-PH-Wavenet-A',
  },
  
  // Microsoft Azure Voices
  {
    id: 'azure-hina',
    name: 'Hina (Neural)',
    gender: 'female',
    style: 'Extremely Natural • Empathetic & Fluid',
    provider: 'azure',
    voiceCode: 'tl-PH-HinaNeural',
  },
  {
    id: 'azure-angelo',
    name: 'Angelo (Neural)',
    gender: 'male',
    style: 'Professional • Trustworthy & Authoritative',
    provider: 'azure',
    voiceCode: 'tl-PH-AngeloNeural',
  },

  // ElevenLabs Voices
  {
    id: 'eleven-maria',
    name: 'Maria (Multilingual v2)',
    gender: 'female',
    style: 'Studio Quality • Breath effects & Inflected',
    provider: 'elevenlabs',
    voiceCode: 'fil-PH-maria-v2',
  },
  {
    id: 'eleven-juan',
    name: 'Juan (Multilingual v2)',
    gender: 'male',
    style: 'Cinematic • Expressive & Richly textured',
    provider: 'elevenlabs',
    voiceCode: 'fil-PH-juan-v2',
  },

  // System
  {
    id: 'system-local',
    name: 'Local Browser Voice',
    gender: 'female',
    style: 'System Engine • Varies based on your OS',
    provider: 'system',
    voiceCode: 'system-default',
  }
];

export interface TagalogPreset {
  id: string;
  label: string;
  text: string;
  english: string;
}

export const TAGALOG_PRESETS: TagalogPreset[] = [
  {
    id: 'p1',
    label: 'Greeting',
    text: 'Magandang umaga sa inyong lahat! Maligayang pagdating sa Vocalize.ph.',
    english: 'Good morning to everyone! Welcome to Vocalize.ph.',
  },
  {
    id: 'p2',
    label: 'Assistance',
    text: 'Kumusta ka? Paano kita matutulungan sa iyong mga gawain ngayon?',
    english: 'How are you? How can I help you with your tasks today?',
  },
  {
    id: 'p3',
    label: 'Tech Promo',
    text: 'Ang aming Text-to-Speech API ay napakabilis, matipid, at madaling gamitin para sa inyong mga proyekto.',
    english: 'Our Text-to-Speech API is very fast, economical, and easy to use for your projects.',
  },
  {
    id: 'p4',
    label: 'Inspirational',
    text: 'Mabuhay! Ang wika ay ang tulay na nag-uugnay sa ating puso at kaisipan saan man tayo naroroon.',
    english: 'Long live! Language is the bridge that connects our hearts and minds wherever we are.',
  }
];

export interface ProviderDetail {
  id: string;
  name: string;
  displayName: string;
  pricePerMillion: number;
  freeLimit: string;
  pricingNote: string;
  latency: string;
  qualityScore: number; // out of 5
  pros: string[];
  cons: string[];
  recommendedFor: string;
}

export const PROVIDER_DETAILS: ProviderDetail[] = [
  {
    id: 'google',
    name: 'Google Cloud Text-to-Speech (tl-PH)',
    displayName: 'Google Cloud TTS',
    pricePerMillion: 16.00,
    freeLimit: '4 Million characters / month',
    pricingNote: '$16 per 1M characters (Neural2/WaveNet). Standard voices are just $4 per 1M chars.',
    latency: '⚡ ~150ms (Ultra Low)',
    qualityScore: 4.5,
    pros: [
      'Incredibly generous free tier (4 Million chars/mo free)',
      'Highly stable and lowest global network latency',
      'Matches the official Android system TTS engine verbatim'
    ],
    cons: [
      'Slightly robotic on longer, unchecked paragraphs',
      'Limited speaking styles or emotional variations'
    ],
    recommendedFor: 'High-volume production sites, customer service chatbots, and cost-sensitive applications.'
  },
  {
    id: 'azure',
    name: 'Microsoft Azure Cognitive Speech (tl-PH)',
    displayName: 'Microsoft Azure AI',
    pricePerMillion: 16.00,
    freeLimit: '500,000 characters / month',
    pricingNote: '$16 per 1M characters. Free tier resets monthly.',
    latency: '⚡ ~200ms (Very Low)',
    qualityScore: 4.8,
    pros: [
      'Industry-leading neural naturalness for Filipino standard accents',
      'Excellent pronunciation of hybrid Taglish (Tagalog-English) contexts',
      'Advanced controls for fine-tuning speaking rate, volume, and exact pitch'
    ],
    cons: [
      'Free tier is smaller than Google Cloud\'s',
      'Azure Portal configuration can be slightly complex for beginners'
    ],
    recommendedFor: 'Voiceovers, audiobooks, educational platforms, and precise interactive voice response (IVR).'
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Multilingual API (Filipino)',
    displayName: 'ElevenLabs API',
    pricePerMillion: 150.00,
    freeLimit: '10,000 characters / month',
    pricingNote: '$150 to $240 per 1M characters depending on subscription tier ($5/mo to $99/mo plans).',
    latency: '⏱️ ~450ms (Medium)',
    qualityScore: 5.0,
    pros: [
      'Disturbingly high-quality audio with human breathing sounds',
      'Emotional inflection, custom voice cloning, and text-to-voice prompt features',
      'Supports fully realistic dialogue voice dynamics'
    ],
    cons: [
      'Critically expensive (nearly 10x-15x more expensive than Azure/Google)',
      'Underlying latency is slower, making live chat slightly lagging'
    ],
    recommendedFor: 'Audiobook narration, video production, game character dialog, and ultra-premium creative assets.'
  }
];

export const HOW_IT_WORKS_EXPLANATION = {
  androidSource: {
    title: "Where does the 'STCodesApp' get its Tagalog voices?",
    summary: "STCodesApp is an Android application that uses the phone's native system-level text-to-speech engine.",
    details: [
      {
        header: "1. Device-Native Speech Library",
        text: "Android devices run with a service called 'Speech Services by Google' pre-installed. When the user selects Tagalog, the app triggers Android's system API: android.speech.tts.TextToSpeech."
      },
      {
        header: "2. Zero-Cost Offline/Cached Voices",
        text: "Because the synthesis happens locally inside the user's phone hardware (using CPU, GPU, or neural co-processors depending on the device brand), the developer pays $0. This is why Android apps can offer endless speech synthesis without requiring subscription API keys."
      },
      {
        header: "3. Direct Google Synced Quality",
        text: "The high-quality voices you hear in modern Android TTS correspond exactly to the Google Cloud Text-to-Speech API's neural models, which are constantly refreshed on modern Android OS updates."
      }
    ]
  },
  webComparison: {
    title: "How to Build a Custom Web App using paid Voice APIs",
    summary: "In a standard desktop or mobile web browser, you cannot reliably access deep local operating system voices without severe cross-platform discrepancies. To achieve polished, dependable voice quality, you must leverage a professional paid TTS API.",
    steps: [
      {
        title: "Client-Side SpeechSynthesis (Free Fallback)",
        desc: "Browsers have a window.speechSynthesis API. In some modern desktop browsers (like Google Chrome) and Android browsers, users can hear native Google tl-PH voices for free. However, on iOS or generic Safari browsers, it falls back to basic robotic engines or may have no Tagalog voices at all. It is highly inconsistent."
      },
      {
        title: "Cloud Voice Proxy Services (Paid Professional)",
        desc: "To guarantee every visitor (device, safari, desktop) hears the exact same, gorgeous studio-grade Tagalog voice, you make a server-side curl request to Google Cloud or Microsoft Azure, retrieve the high-fidelity .mp3 audio binary, and stream it directly to the HTML5 tag."
      }
    ]
  }
};
