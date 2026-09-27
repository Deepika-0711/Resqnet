import React from 'react';
import { 
  Clock, 
  ShieldAlert, 
  Truck, 
  Building2, 
  Navigation, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function TimelineView({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl text-center text-slate-400 text-xs font-mono">
        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
        No telemetry timeline recorded yet.
      </div>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'REPORTED':
        return { icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'AI_ASSESSMENT':
        return { icon: ShieldAlert, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'AMBULANCE_ASSIGNED':
      case 'AMBULANCE_EN_ROUTE':
        return { icon: Truck, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'HOSPITAL_SELECTED':
      case 'HOSPITAL_ALERTED':
        return { icon: Building2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'ROUTE_SELECTED':
        return { icon: Navigation, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      default:
        return { icon: Radio, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-slate-800">
      {events.map((evt, idx) => {
        const { icon: Icon, color } = getEventIcon(evt.event_type || evt.type);
        return (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon className="w-3 h-3" />
            </div>

            {/* Event content */}
            <div className="glass-card p-3 rounded-xl border border-resq-border/80 hover:border-resq-borderLight transition-all">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {evt.event_type || 'UPDATE'}
                </span>
                <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {evt.time_display || new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans mt-1">
                {evt.description}
              </p>
              {evt.actor && (
                <div className="mt-2 text-[10px] font-mono text-slate-400">
                  Actor: <span className="text-slate-300 font-semibold">{evt.actor}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
