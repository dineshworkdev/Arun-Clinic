import React, { useEffect, useRef } from 'react';
import AIChatHeader from './AIChatHeader';
import AIChatMessages from './AIChatMessages';
import AIChatInput from './AIChatInput';

export const AIChatPanel = ({
  isOpen,
  onClose,
  onReset,
  messages,
  isTyping,
  onSendMessage,
  onActionClick,
  onBookService,
  onBookDoctor,
}) => {
  const panelRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop for clear focus & smooth dismissal */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 sm:hidden transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Main Chat Panel Container */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI Receptionist Chat Window"
        className={`fixed z-50 transition-all duration-300 ease-out flex flex-col bg-white overflow-hidden shadow-2xl border border-slate-200/90
          /* Mobile styles: Bottom sheet */
          inset-x-0 bottom-0 h-[88vh] max-h-[88vh] rounded-t-3xl border-t border-slate-200
          /* Tablet / Desktop styles: Floating card bottom-right */
          sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[410px] sm:h-[620px] sm:max-h-[calc(100vh-120px)] sm:rounded-3xl
          animate-in fade-in slide-in-from-bottom-5 duration-300
        `}
      >
        {/* Mobile drag handle bar */}
        <div className="w-full flex justify-center py-1.5 sm:hidden bg-[#0f172a]">
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>

        {/* Chat Header */}
        <AIChatHeader onClose={onClose} onReset={onReset} isOnline={true} />

        {/* Messages Body */}
        <AIChatMessages
          messages={messages}
          isTyping={isTyping}
          onActionClick={onActionClick}
          onBookService={onBookService}
          onBookDoctor={onBookDoctor}
        />

        {/* Chat Input */}
        <AIChatInput onSendMessage={onSendMessage} disabled={isTyping} />
      </div>
    </>
  );
};

export default AIChatPanel;
