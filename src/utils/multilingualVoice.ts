// Multilingual Voice Recognition Configuration

export type VoiceLanguage = 'en-US' | 'hi-IN' | 'bn-IN';

export interface VoiceLanguageConfig {
  code: VoiceLanguage;
  name: string;
  nativeName: string;
  speechRecognitionLang: string;
  ttsLang: string;
  ttsVoice?: string;
}

export const voiceLanguages: Record<'en' | 'hi' | 'bn', VoiceLanguageConfig> = {
  en: {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    speechRecognitionLang: 'en-US',
    ttsLang: 'en-US',
    ttsVoice: 'Google US English',
  },
  hi: {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechRecognitionLang: 'hi-IN',
    ttsLang: 'hi-IN',
    ttsVoice: 'Google हिन्दी',
  },
  bn: {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechRecognitionLang: 'bn-IN',
    ttsLang: 'bn-IN',
    ttsVoice: 'Google বাংলা',
  },
};

// Voice consultation response templates
export const voiceConsultationResponses = {
  en: {
    listening: "I'm listening...",
    processing: "Processing your input...",
    analyzing: "Analyzing your symptoms...",
    understood: "I understood: ",
    didNotUnderstand: "I didn't quite catch that. Could you please repeat?",
    speakClearly: "Please speak clearly and describe your symptoms.",
    noMicrophoneAccess: "I don't have access to your microphone. Please grant permission.",
    errorOccurred: "An error occurred. Please try again.",
    startSpeaking: "Please start speaking now.",
    stopListening: "I've stopped listening.",
  },
  hi: {
    listening: "मैं सुन रहा हूँ...",
    processing: "आपके इनपुट को प्रोसेस कर रहा हूँ...",
    analyzing: "आपके लक्षणों का विश्लेषण कर रहा हूँ...",
    understood: "मैं समझ गया: ",
    didNotUnderstand: "मैं वह पूरी तरह नहीं पकड़ पाया। क्या आप कृपया दोहरा सकते हैं?",
    speakClearly: "कृपया स्पष्ट रूप से बोलें और अपने लक्षणों का वर्णन करें।",
    noMicrophoneAccess: "मेरे पास आपके माइक्रोफ़ोन तक पहुंच नहीं है। कृपया अनुमति दें।",
    errorOccurred: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    startSpeaking: "कृपया अब बोलना शुरू करें।",
    stopListening: "मैंने सुनना बंद कर दिया है।",
  },
  bn: {
    listening: "আমি শুনছি...",
    processing: "আপনার ইনপুট প্রক্রিয়া করছি...",
    analyzing: "আপনার লক্ষণগুলি বিশ্লেষণ করছি...",
    understood: "আমি বুঝেছি: ",
    didNotUnderstand: "আমি সম্পূর্ণভাবে বুঝতে পারিনি। আপনি কি দয়া করে আবার বলতে পারেন?",
    speakClearly: "দয়া করে স্পষ্টভাবে কথা বলুন এবং আপনার লক্ষণগুলি বর্ণনা করুন।",
    noMicrophoneAccess: "আমার আপনার মাইক্রোফোনে অ্যাক্সেস নেই। দয়া করে অনুমতি দিন।",
    errorOccurred: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    startSpeaking: "দয়া করে এখন কথা বলা শুরু করুন।",
    stopListening: "আমি শোনা বন্ধ করেছি।",
  },
};

// Check if browser supports speech recognition for the language
export function isSpeechRecognitionSupported(language: 'en' | 'hi' | 'bn'): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

// Get speech recognition configuration
export function getSpeechRecognitionConfig(language: 'en' | 'hi' | 'bn') {
  const config = voiceLanguages[language];
  return {
    lang: config.speechRecognitionLang,
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
  };
}

// Text-to-Speech function with language support
export function speak(text: string, language: 'en' | 'hi' | 'bn'): void {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const config = voiceLanguages[language];
    
    utterance.lang = config.ttsLang;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find the best voice for the language
    const voices = window.speechSynthesis.getVoices();
    const languageVoice = voices.find(voice => 
      voice.lang.startsWith(language === 'en' ? 'en' : language === 'hi' ? 'hi' : 'bn')
    );
    
    if (languageVoice) {
      utterance.voice = languageVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

// Stop speaking
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
