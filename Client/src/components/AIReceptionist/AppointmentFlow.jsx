import React, { useState } from 'react';
import { 
  Calendar, Clock, User, Phone, CheckCircle2, ChevronRight, ChevronLeft, 
  Loader2, AlertCircle, Stethoscope 
} from 'lucide-react';
import { CLINIC_SERVICES, CLINIC_DOCTORS, CLINIC_INFO } from './data/receptionistData';
import AppointmentConfirmation from './AppointmentConfirmation';

export const AppointmentFlow = ({ onComplete, initialService = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    service: initialService || CLINIC_SERVICES[0].title,
    doctor: 'Any Available Specialist',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    time: '10:30 AM',
    name: '',
    phone: '',
    note: '',
  });

  const [isConfirmed, setIsConfirmed] = useState(false);

  // Quick preset services
  const primaryServices = CLINIC_SERVICES.slice(0, 6);

  const handleNextFromService = () => {
    if (!formData.service) {
      setErrorMessage('Please choose a dental service to proceed.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleNextFromDateTime = () => {
    if (!formData.date || !formData.time) {
      setErrorMessage('Please select both a preferred date and time slot.');
      return;
    }
    setErrorMessage('');
    setStep(3);
  };

  const handleNextFromContact = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    // Basic phone validation (at least 7 digits)
    const cleanedPhone = formData.phone.replace(/[^0-9+]/g, '');
    if (cleanedPhone.length < 7) {
      setErrorMessage('Please provide a valid contact phone number.');
      return;
    }
    setErrorMessage('');
    setStep(4); // Review
  };

  const handleSubmitRequest = () => {
    setLoading(true);
    setErrorMessage('');

    // Simulate realistic asynchronous submission
    setTimeout(() => {
      setLoading(false);
      setIsConfirmed(true);
      if (onComplete) {
        onComplete(formData);
      }
    }, 900);
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setStep(1);
    setFormData({
      service: CLINIC_SERVICES[0].title,
      doctor: 'Any Available Specialist',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:30 AM',
      name: '',
      phone: '',
      note: '',
    });
    setErrorMessage('');
  };

  if (isConfirmed) {
    return <AppointmentConfirmation requestData={formData} onReset={handleReset} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 text-slate-800 my-2 transition-all">
      {/* Header & Step Tracker */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center text-xs font-bold">
            {step}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              {step === 1 && 'Select Service'}
              {step === 2 && 'Preferred Date & Time'}
              {step === 3 && 'Contact Details'}
              {step === 4 && 'Review & Submit Request'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Step {step} of 4</span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-5 bg-[#0ea5e9]'
                  : s < step
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            What type of appointment or procedure are you requesting?
          </p>

          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {primaryServices.map((svc) => {
              const isSelected = formData.service === svc.title;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, service: svc.title })}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 text-slate-900 font-semibold ring-1 ring-[#0ea5e9]/40'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Stethoscope className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#0ea5e9]' : 'text-slate-400'}`} />
                    <span className="truncate">{svc.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 shrink-0 ml-2">
                    {svc.duration}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Specialist preference optional */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Preferred Specialist (Optional)
            </label>
            <select
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 outline-none focus:border-[#0ea5e9]"
            >
              <option value="Any Available Specialist">Any Available Specialist</option>
              {CLINIC_DOCTORS.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name} ({doc.role})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextFromService}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#0ea5e9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Continue to Schedule</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* STEP 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0ea5e9]" />
              Preferred Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#0ea5e9]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0ea5e9]" />
              Select Available Slot
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CLINIC_INFO.timeSlots.map((slot) => {
                const isSelected = formData.time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData({ ...formData, time: slot })}
                    className={`p-2 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0ea5e9] bg-[#0ea5e9] text-white font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextFromDateTime}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#0ea5e9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Continue to Contact</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Contact Info */}
      {step === 3 && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-[#0ea5e9]" />
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#0ea5e9] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Phone className="w-3.5 h-3.5 text-[#0ea5e9]" />
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#0ea5e9] focus:bg-white"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              We will call or WhatsApp this number to confirm the booking.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Additional Notes or Concerns (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. sensitive gums, routine checkup, pain on left side"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-[#0ea5e9] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextFromContact}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#0ea5e9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Review Request</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Please verify your consultation details before submitting the request:
          </p>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Service:</span>
              <span className="font-semibold text-slate-900 text-right">{formData.service}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Specialist:</span>
              <span className="font-medium text-slate-800">{formData.doctor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Preferred Slot:</span>
              <span className="font-medium text-slate-800">{formData.date} at {formData.time}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
              <span className="text-slate-500">Patient:</span>
              <span className="font-medium text-slate-900">{formData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Phone:</span>
              <span className="font-medium text-slate-900">{formData.phone}</span>
            </div>
            {formData.note && (
              <div className="flex justify-between items-start pt-1 text-[11px]">
                <span className="text-slate-500">Notes:</span>
                <span className="text-slate-700 italic text-right max-w-[65%]">{formData.note}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(3)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitRequest}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Send Appointment Request</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentFlow;
