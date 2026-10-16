import React from 'react';
import { Bot } from 'lucide-react';

export const AITypingIndicator = () => {
  return (
    <div className="flex items-start gap-2.5 my-2 animate-fadeIn" aria-live="polite" aria-label="AI Receptionist is typing">
      {/* Small Assistant Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0f172a] to-[#0ea5e9] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-slate-100">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>

      {/* Bubble with three pulsing dots */}
      <div className="bg-slate-100/90 text-slate-600 px-4 py-3 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-xs flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '900ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '180ms', animationDuration: '900ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '360ms', animationDuration: '900ms' }}></span>
        <span className="sr-only">AI Receptionist is typing a response...</span>
      </div>
    </div>
  );
};

export default AITypingIndicator;
