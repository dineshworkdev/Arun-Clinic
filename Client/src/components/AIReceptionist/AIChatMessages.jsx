import React, { useEffect, useRef } from 'react';
import AIChatMessage from './AIChatMessage';
import AITypingIndicator from './AITypingIndicator';

export const AIChatMessages = ({
  messages,
  isTyping,
  onActionClick,
  onBookService,
  onBookDoctor,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div 
      className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 space-y-1 scroll-smooth"
      role="log"
      aria-live="polite"
      aria-label="Conversation messages"
    >
      {/* Clinic Welcome Badge */}
      <div className="flex justify-center mb-3">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200/50">
          Dental Clinic AI Concierge · Active Session
        </span>
      </div>

      {messages.map((message) => (
        <AIChatMessage
          key={message.id}
          message={message}
          onActionClick={onActionClick}
          onBookService={onBookService}
          onBookDoctor={onBookDoctor}
        />
      ))}

      {isTyping && <AITypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
