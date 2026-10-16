import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export const AIChatHeader = ({ onClose, onReset, isOnline = true }) => {
  return (
    <div className="px-4 py-3.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between border-b border-slate-800 shadow-xs shrink-0 select-none">
      {/* Clinic Branding & Receptionist Title */}
      <div className="flex items-center gap-3">
        {/* Assistant Avatar with Clinic Tooth Emblem */}
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] text-[#0f172a] flex items-center justify-center font-bold shadow-xs">
            <svg fill="none" viewBox="0 0 48 48" className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg">
              <path 
                clipRule="evenodd" 
                d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" 
                fill="currentColor" 
                fillRule="evenodd"
              />
              <path 
                clipRule="evenodd" 
                d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" 
                fill="currentColor" 
                fillRule="evenodd"
              />
            </svg>
          </div>
          {/* Online Status Dot */}
          <span 
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f172a]" 
            title="Online"
          >
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-serif font-bold text-sm tracking-wide text-white">
              AI Receptionist
            </h3>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Concierge
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] text-slate-300 font-medium">
              {isOnline ? 'Online · Dental Clinic' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {/* Reset Conversation */}
        <button
          type="button"
          onClick={onReset}
          title="Restart conversation"
          aria-label="Restart conversation"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          title="Close chat window"
          aria-label="Close chat window"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AIChatHeader;
