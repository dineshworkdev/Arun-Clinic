import React, { useState, useCallback } from 'react';
import AIChatButton from './AIChatButton';
import AIChatPanel from './AIChatPanel';
import { QUICK_ACTIONS } from './data/receptionistData';
import { handlePatientMessage, getInitialConversationState } from '../../utils/dentalFaq';

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-1',
  sender: 'ai',
  text: "Hello! Welcome to Dental Clinic. I'm the virtual receptionist. I can help with our treatments, clinic information, common dental questions, and appointment requests. How can I help you today?",
  type: 'welcome',
  timestamp: 'Just now',
  quickActions: QUICK_ACTIONS,
};

export const AIReceptionist = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [conversationContext, setConversationContext] = useState(getInitialConversationState);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setUnreadCount(0);
      }
      return !prev;
    });
  };

  const handleResetConversation = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsTyping(false);
    setLastUserMessage('');
    setConversationContext(getInitialConversationState());
  };

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const trimmedText = text.trim();
    setLastUserMessage(trimmedText);

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      text: trimmedText,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Process using rule-based conversation engine with context
    setTimeout(() => {
      try {
        const result = handlePatientMessage(trimmedText, conversationContext);
        if (result.updatedState) {
          setConversationContext(result.updatedState);
        }

        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: result.message,
          type: result.type || 'text',
          initialService: result.initialService || null,
          initialDoctor: result.initialDoctor || null,
          quickReplies: result.quickReplies || ['Book an Appointment', 'Our Services', 'Clinic Hours'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        console.error('[AI Receptionist Error]:', err);
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: 'ai',
            text: "I am here to help with our dental services, clinic hours, location, and appointment booking. What would you like to explore?",
            type: 'text',
            quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }, 400);
  }, [conversationContext]);

  const handleActionClick = useCallback((action) => {
    const actionLabel = action.label || action.id || action.intent;

    // Retry handling
    if (actionLabel === 'Retry Message' && lastUserMessage) {
      handleSendMessage(lastUserMessage);
      return;
    }

    // Direct appointment wizard button
    if (
      action.id === 'book' ||
      action.intent === 'book_appointment' ||
      actionLabel === 'Book an Appointment' ||
      actionLabel === 'Book Priority Request' ||
      actionLabel === 'Book with a Specialist'
    ) {
      setConversationContext((prev) => ({
        ...prev,
        isBookingActive: true,
      }));

      const userMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: 'I would like to request an appointment',
        type: 'text',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: "Certainly! Please select your treatment, preferred specialist, and time slot below to submit your appointment request:",
            type: 'appointment_flow',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 400);
      return;
    }

    // All other quick actions send a real query through handleSendMessage
    handleSendMessage(actionLabel);
  }, [handleSendMessage, lastUserMessage]);

  const handleBookService = useCallback((serviceTitle) => {
    setConversationContext((prev) => ({
      ...prev,
      isBookingActive: true,
      lastTreatment: serviceTitle,
    }));

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `I'd like to book ${serviceTitle}`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Great choice! I have pre-selected "${serviceTitle}" for your appointment request. Please choose your preferred date and time:`,
        type: 'appointment_flow',
        initialService: serviceTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
    }, 400);
  }, []);

  const handleBookDoctor = useCallback((doctorName) => {
    setConversationContext((prev) => ({
      ...prev,
      isBookingActive: true,
      lastDoctor: doctorName,
    }));

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `I'd like to book a consultation with ${doctorName}`,
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Wonderful. Let's arrange your consultation with ${doctorName}. Please select your preferred appointment date and time below:`,
        type: 'appointment_flow',
        initialDoctor: doctorName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
    }, 400);
  }, []);

  return (
    <>
      {/* Floating Receptionist Trigger Button */}
      <AIChatButton
        isOpen={isOpen}
        onClick={toggleOpen}
        unreadCount={unreadCount}
      />

      {/* Receptionist Chat Panel Window */}
      <AIChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onReset={handleResetConversation}
        messages={messages}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        onActionClick={handleActionClick}
        onBookService={handleBookService}
        onBookDoctor={handleBookDoctor}
      />
    </>
  );
};

export default AIReceptionist;
