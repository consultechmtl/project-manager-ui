"use client";

import { useState, useEffect } from "react";
import { Activity, Brain } from "lucide-react";

interface JarvisMessage {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "task";
  timestamp: Date;
}

export default function Jarvis() {
  const [active, setActive] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState<JarvisMessage | null>(null);
  const [orbPhase, setOrbPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrbPhase(p => (p + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messages = [
      { type: "info" as const, text: "Monitoring project progress..." },
      { type: "info" as const, text: "Analyzing task completion rates..." },
      { type: "success" as const, text: "All systems operational." },
      { type: "task" as const, text: "You have pending tasks awaiting completion." },
    ];
    
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setMessage({ ...msg, id: Date.now(), timestamp: new Date() });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const orbIntensity = Math.sin(orbPhase) * 0.3 + 0.7;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative w-20 h-20">
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(0, 212, 255, ${0.3 * orbIntensity}) 0%, transparent 70%)`,
            filter: "blur(10px)"
          }}
        />
        
        <div 
          className="absolute inset-2 rounded-full border-2 border-cyan-500/30"
          style={{ animation: "spin 8s linear infinite" }}
        />
        <div 
          className="absolute inset-4 rounded-full border border-cyan-400/50"
          style={{ animation: "spin 4s linear infinite reverse" }}
        />
        
        <div 
          className="absolute inset-0 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.9), rgba(0, 150, 200, 0.8))`,
            boxShadow: `
              0 0 20px rgba(0, 212, 255, ${orbIntensity}),
              0 0 40px rgba(0, 212, 255, ${0.5 * orbIntensity})
            `
          }}
          onClick={() => setActive(!active)}
        >
          {speaking ? (
            <Activity className="w-8 h-8 text-white animate-pulse" />
          ) : (
            <Brain className="w-8 h-8 text-white" />
          )}
        </div>
        
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full">
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping" />
        </div>
      </div>
      
      {message && (
        <div 
          className="absolute bottom-24 right-0 w-72 bg-slate-900/95 border border-cyan-500/50 rounded-xl p-4"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs text-cyan-400 font-mono uppercase">JARVIS</span>
          </div>
          <p className="text-white text-sm">{message.text}</p>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Welcome Screen
export function JarvisWelcome({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const [content, setContent] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setContent(false), 1000);
    const timer2 = setTimeout(() => setVisible(false), 2000);
    const timer3 = setTimeout(onComplete, 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-cyan-400" />
          <div className="absolute inset-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Brain className="w-12 h-12 text-cyan-400" />
          </div>
        </div>
        {content && (
          <>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2 tracking-widest">JARVIS</h1>
            <p className="text-gray-400">Project Management System</p>
          </>
        )}
        {content === false && (
          <p className="text-white animate-fade-in">Systems online. Ready to work.</p>
        )}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
