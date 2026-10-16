import React, { useState } from 'react';
import { 
  Bot, User, Clock, MapPin, Phone, ChevronRight, AlertCircle 
} from 'lucide-react';
import { CLINIC_INFO, CLINIC_SERVICES, CLINIC_DOCTORS } from './data/receptionistData';
import AIQuickActions from './AIQuickActions';
import AppointmentFlow from './AppointmentFlow';

export const AIChatMessage = ({ message, onActionClick, onBookService, onBookDoctor }) => {
  const isAI = message.sender === 'ai';
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'General & Preventive', 'Cosmetic Dentistry', 'Restorative & Implants', 'Orthodontics'];

  const filteredServices = selectedCategory === 'All' 
    ? CLINIC_SERVICES 
    : CLINIC_SERVICES.filter(s => s.category === selectedCategory);

  return (
    <div className={`flex flex-col mb-4 ${isAI ? 'items-start' : 'items-end'}`}>
      <div className={`flex items-start gap-2.5 max-w-[90%] sm:max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        {isAI ? (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0f172a] to-[#0ea5e9] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-slate-100 mt-1">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-1">
            <User className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Message Bubble Content */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs transition-all ${
              isAI
                ? 'bg-slate-50/95 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                : 'bg-[#0f172a] text-white rounded-tr-xs font-normal'
            }`}
          >
            {/* Standard Message Text */}
            <p className="whitespace-pre-line">{message.text}</p>

            {/* EMBEDDED APPOINTMENT FLOW */}
            {message.type === 'appointment_flow' && (
              <div className="mt-3">
                <AppointmentFlow initialService={message.initialService} />
              </div>
            )}

            {/* EMBEDDED SERVICES CARD LIST */}
            {message.type === 'services_list' && (
              <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/60">
                {/* Category Filter Pills */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#0ea5e9] text-white font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Service Items */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredServices.map((svc) => (
                    <div
                      key={svc.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#0ea5e9]/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-xs">{svc.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-50 text-[#0ea5e9] font-medium border border-sky-100">
                              {svc.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                            {svc.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 font-medium">{svc.duration}</span>
                        <button
                          type="button"
                          onClick={() => onBookService && onBookService(svc.title)}
                          className="text-[#0ea5e9] hover:text-[#0284c7] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Request Booking</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMBEDDED CLINIC HOURS CARD */}
            {message.type === 'clinic_hours' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0ea5e9] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Standard Hours</span>
                    <p className="text-slate-600 mt-0.5">{CLINIC_INFO.hours.weekdays}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{CLINIC_INFO.hours.weekends}</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Emergency triage available 24/7 on call via hotline: {CLINIC_INFO.emergencyPhone}
                  </span>
                </div>
              </div>
            )}

            {/* EMBEDDED DOCTORS LIST CARD */}
            {message.type === 'doctors_list' && (
              <div className="mt-3 space-y-2">
                {CLINIC_DOCTORS.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3"
                  >
                    <img
                      src={doc.image}
                      alt={doc.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                      }}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 text-xs truncate">{doc.name}</span>
                        <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 font-medium shrink-0">
                          {doc.experience}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#0ea5e9] truncate font-medium">{doc.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">Days: {doc.availability}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onBookDoctor && onBookDoctor(doc.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-[#0ea5e9] text-white text-[10px] font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Request
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* EMBEDDED CONTACT / LOCATION CARD */}
            {message.type === 'clinic_contact' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0ea5e9] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Sanctuary Address</span>
                    <p className="text-slate-600 mt-0.5">{CLINIC_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-1 border-t border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#0ea5e9] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Phone Concierge</span>
                    <p className="text-slate-600 mt-0.5">{CLINIC_INFO.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons under message if provided */}
          {message.quickActions && message.quickActions.length > 0 && (
            <AIQuickActions actions={message.quickActions} onSelectAction={onActionClick} />
          )}

          {/* Quick Follow-up Pills */}
          {message.quickReplies && message.quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {message.quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onActionClick && onActionClick({ label: reply, intent: reply })}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <span
            className={`text-[10px] text-slate-400 mt-1 px-1 font-mono ${
              isAI ? 'text-left' : 'text-right'
            }`}
          >
            {message.timestamp || 'Just now'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIChatMessage;
