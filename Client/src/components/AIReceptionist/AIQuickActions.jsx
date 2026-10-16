import React from 'react';
import { Calendar, Stethoscope, Clock, Users, Phone, ArrowUpRight } from 'lucide-react';

const iconMap = {
  book: Calendar,
  services: Stethoscope,
  hours: Clock,
  doctors: Users,
  contact: Phone,
};

export const AIQuickActions = ({ actions, onSelectAction, disabled = false }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-1">
      {actions.map((action) => {
        const IconComponent = iconMap[action.id] || ArrowUpRight;
        return (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAction(action)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 shadow-2xs hover:border-[#0ea5e9]/60 hover:text-[#0ea5e9] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30"
          >
            <IconComponent className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#0ea5e9] transition-colors shrink-0" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AIQuickActions;
