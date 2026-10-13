import React from 'react';
import { 
  Clock, 
  ShieldAlert, 
  Truck, 
  Building2, 
  Navigation, 
  Radio, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export default function TimelineView({ events = [], layout = 'vertical' }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E8E8E1] p-6 rounded-xl text-center text-[#707970] text-xs font-sans">
        <Clock className="w-5 h-5 mx-auto mb-2 text-[#929B92]" />
        No response events recorded yet.
      </div>
    );
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'REPORTED':
        return { icon: AlertCircle, color: 'text-[#B94430] bg-[#FCECE9] border-[#F5C2BA]' };
      case 'AI_ASSESSMENT':
        return { icon: ShieldAlert, color: 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]' };
      case 'AMBULANCE_ASSIGNED':
      case 'AMBULANCE_EN_ROUTE':
        return { icon: Truck, color: 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]' };
      case 'HOSPITAL_SELECTED':
      case 'HOSPITAL_ALERTED':
        return { icon: Building2, color: 'text-[#203B32] bg-[#F4F7F4] border-[#E8E8E1]' };
      case 'ROUTE_SELECTED':
        return { icon: Navigation, color: 'text-[#245C4A] bg-[#EEF4EF] border-[#CBDACD]' };
      default:
        return { icon: Radio, color: 'text-[#707970] bg-[#F8F7F2] border-[#E8E8E1]' };
    }
  };

  // Horizontal Response Timeline (e.g. for below the Command Center map)
  if (layout === 'horizontal') {
    return (
      <div className="bg-[#FFFFFF] border border-[#E8E8E1] rounded-2xl p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8E1]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#245C4A]" />
            <h3 className="font-serif text-base font-semibold text-[#203B32]">
              Emergency Coordination Sequence
            </h3>
          </div>
          <span className="text-[11px] font-sans text-[#707970]">
            {events.length} chronological events recorded
          </span>
        </div>

        <div className="relative overflow-x-auto pb-2">
          <div className="flex items-start gap-4 min-w-[680px]">
            {events.map((evt, idx) => {
              const { icon: Icon, color } = getEventBadge(evt.event_type || evt.type);
              const isLast = idx === events.length - 1;
              return (
                <div key={evt.id || idx} className="flex-1 relative group">
                  {/* Connector line between steps */}
                  {!isLast && (
                    <div className="absolute top-4 left-7 right-[-16px] h-[1.5px] bg-[#E8E8E1] -z-0" />
                  )}

                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${color} shadow-sm`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#707970] block">
                        {evt.event_type?.replace(/_/g, ' ') || 'UPDATE'}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-[#203B32]">
                        {evt.time_display || (evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#203B32] line-clamp-2 leading-relaxed bg-[#F8F7F2] p-2.5 rounded-xl border border-[#E8E8E1] group-hover:border-[#245C4A] transition-colors">
                    {evt.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vertical Timeline
  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#E8E8E1]">
      {events.map((evt, idx) => {
        const { icon: Icon, color } = getEventBadge(evt.event_type || evt.type);
        return (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon className="w-2.5 h-2.5" />
            </div>

            {/* Event content */}
            <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E8E8E1] hover:border-[#245C4A] transition-all shadow-subtle">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F8F7F2] text-[#707970] border border-[#E8E8E1]">
                  {evt.event_type?.replace(/_/g, ' ') || 'UPDATE'}
                </span>
                <span className="text-[11px] font-mono text-[#707970] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#929B92]" />
                  {evt.time_display || (evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                </span>
              </div>
              <p className="text-xs text-[#203B32] leading-relaxed font-sans mt-1">
                {evt.description}
              </p>
              {evt.actor && (
                <div className="mt-2 text-[10px] font-sans text-[#707970]">
                  Actor: <span className="text-[#203B32] font-medium">{evt.actor}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
