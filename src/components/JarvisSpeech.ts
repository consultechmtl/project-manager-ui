"use client";

import { useState, useCallback } from "react";

// JARVIS Voice Synthesizer
export function useJarvisVoice() {
  const [speaking, setSpeaking] = useState(false);
  
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to find a robotic/AI-like voice
    const voices = speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => 
      v.name.includes("Google") || 
      v.name.includes("Microsoft") ||
      v.name.includes("Samantha")
    );
    if (jarvisVoice) utterance.voice = jarvisVoice;
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    speechSynthesis.speak(utterance);
  }, []);
  
  const greet = useCallback(() => {
    const messages = [
      "Good morning. Systems are online and ready.",
      "Welcome back. Shall we review the projects?",
      "I'm here. What would you like to work on?",
      "Systems operational. Awaiting your command.",
    ];
    speak(messages[Math.floor(Math.random() * messages.length)]);
  }, [speak]);
  
  return { speak, greeting: greet, speaking };
}

// Voice command hook
export function useVoiceCommands(onCommand: (cmd: string) => void) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onCommand(result.toLowerCase());
    };
    
    recognition.start();
  }, [onCommand]);
  
  return { startListening, listening, transcript };
}
