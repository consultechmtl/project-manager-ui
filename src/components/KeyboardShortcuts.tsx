"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Global shortcuts
    if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      router.push("/new");
    }
    if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      router.push("/search");
    }
    if (e.key === "c" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      router.push("/calendar");
    }
    if (e.key === "h" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      router.push("/");
    }
    if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setShowHelp(prev => !prev);
    }
    if (e.key === "Escape") {
      setShowHelp(false);
    }
  }, [router]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">New Project</p>
              <p className="text-white font-mono">n</p>
            </div>
            <div>
              <p className="text-gray-400">Search</p>
              <p className="text-white font-mono">/</p>
            </div>
            <div>
              <p className="text-gray-400">Calendar</p>
              <p className="text-white font-mono">c</p>
            </div>
            <div>
              <p className="text-gray-400">Home</p>
              <p className="text-white font-mono">h</p>
            </div>
            <div>
              <p className="text-gray-400">Help</p>
              <p className="text-white font-mono">?</p>
            </div>
            <div>
              <p className="text-gray-400">Close</p>
              <p className="text-white font-mono">Esc</p>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-6 text-center">
          Press <span className="text-cyan-400 font-mono">?</span> anytime to show this help
        </p>
      </div>
    </div>
  );
}

// Hook for using keyboard shortcuts in components
export function useKeyboardShortcut(key: string, action: () => void, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key.toLowerCase() === key.toLowerCase() &&
          !!e.ctrlKey === !!modifiers.ctrl &&
          !!e.shiftKey === !!modifiers.shift &&
          !!e.altKey === !!modifiers.alt) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, action, modifiers]);
}
