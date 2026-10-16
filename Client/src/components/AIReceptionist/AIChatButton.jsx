import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';

export const AIChatButton = ({ isOpen, onClick, unreadCount = 0 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Initial subtle attention animation trigger
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none">
      {/* Desktop Tooltip */}
      <div
        className={`hidden sm:block absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium whitespace-nowrap shadow-lg border border-slate-700/80 pointer-events-none transition-all duration-200 ${
          showTooltip && !isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0ea5e9]" />
          <span>AI Receptionist</span>
        </div>
        {/* Tooltip triangle pointer */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-slate-900" />
      </div>

      {/* Subtle attention ring pulse on initial load */}
      {!hasAnimated && !isOpen && (
        <span className="absolute -inset-1 rounded-full bg-[#0ea5e9]/30 animate-ping pointer-events-none" />
      )}

      {/* Main Floating Button */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={isOpen ? 'Close AI Receptionist chat' : 'Open AI Receptionist chat'}
        aria-expanded={isOpen}
        className={`relative w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#0ea5e9]/40 ${
          isOpen
            ? 'bg-slate-900 hover:bg-slate-800 rotate-90 scale-95'
            : 'bg-gradient-to-tr from-[#0f172a] via-[#0f2444] to-[#0ea5e9] hover:scale-105 hover:shadow-[#0ea5e9]/25 hover:shadow-2xl active:scale-95'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#0ea5e9] ring-2 ring-[#0f172a] animate-pulse" />
          </div>
        )}

        {/* Unread badge indicator */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#0ea5e9] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default AIChatButton;
