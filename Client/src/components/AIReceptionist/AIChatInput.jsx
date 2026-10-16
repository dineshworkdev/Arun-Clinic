import React, { useState, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';

export const AIChatInput = ({ onSendMessage, disabled = false, placeholder = 'Type your message...' }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            aria-label="Message to AI Receptionist"
            className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl py-2.5 pl-4 pr-10 text-sm sm:text-base md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50 disabled:bg-slate-100"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || disabled}
          aria-label="Send message"
          className="w-10 h-10 rounded-2xl bg-[#0f172a] hover:bg-[#0ea5e9] active:scale-95 text-white flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 disabled:hover:bg-[#0f172a] disabled:cursor-not-allowed cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Subtle reassurance footer note */}
      <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#0ea5e9]" />
          Instant AI assistance · Clinic team will confirm appointments
        </span>
      </div>
    </div>
  );
};

export default AIChatInput;
