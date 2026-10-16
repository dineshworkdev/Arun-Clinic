import React from 'react';
import { CheckCircle2, Calendar, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';

export const AppointmentConfirmation = ({ requestData, onReset }) => {
  const { service, doctor, date, time, name, phone } = requestData || {};

  return (
    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 text-slate-800 shadow-xs transition-all duration-300">
      <div className="flex items-start gap-3 mb-3.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-base text-emerald-950">
            Appointment Request Received
          </h4>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            Thank you, <span className="font-semibold text-emerald-950">{name || 'Patient'}</span>. Our clinic team will contact you shortly at <span className="font-semibold text-emerald-950">{phone || 'your phone number'}</span> to confirm your appointment.
          </p>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-white/90 rounded-xl p-3 border border-emerald-100 text-xs space-y-2 mb-3">
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
            Service:
          </span>
          <span className="font-semibold text-slate-900 text-right">{service || 'Dental Consultation'}</span>
        </div>

        {doctor && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Specialist:
            </span>
            <span className="font-medium text-slate-900">{doctor}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Preferred Date:
          </span>
          <span className="font-medium text-slate-900">{date || 'Next Available'}</span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Preferred Time:
          </span>
          <span className="font-medium text-slate-900">{time || 'Morning Slot'}</span>
        </div>
      </div>

      {/* Request Notice */}
      <div className="flex items-start gap-1.5 text-[11px] text-emerald-700/90 mb-3 bg-emerald-100/50 p-2 rounded-lg">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Note: This is a provisional booking request. The clinic concierge will confirm final slot availability via phone/SMS.
        </span>
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer transition-colors"
        >
          Submit another request
        </button>
      )}
    </div>
  );
};

export default AppointmentConfirmation;
