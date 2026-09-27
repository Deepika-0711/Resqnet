import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, Clock, Activity, Radio } from 'lucide-react';

export function PriorityBadge({ priority = 'HIGH', size = 'md' }) {
  const p = (priority || 'HIGH').toUpperCase();
  
  const config = {
    CRITICAL: {
      bg: 'bg-red-500/15 border-red-500/40 text-red-400',
      dot: 'bg-red-500',
      icon: ShieldAlert,
      label: 'CRITICAL PRIORITY'
    },
    HIGH: {
      bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
      dot: 'bg-orange-500',
      icon: AlertTriangle,
      label: 'HIGH PRIORITY'
    },
    MODERATE: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      dot: 'bg-amber-500',
      icon: AlertCircle,
      label: 'MODERATE PRIORITY'
    },
    LOW: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'LOW PRIORITY'
    }
  }[p] || {
    bg: 'bg-slate-700/30 border-slate-600 text-slate-300',
    dot: 'bg-slate-400',
    icon: AlertCircle,
    label: p
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1.5' 
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
    : 'text-xs px-2.5 py-1 gap-2 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} tracking-wide uppercase font-mono`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}

export function StatusBadge({ status = 'REPORTED', size = 'md' }) {
  const s = (status || 'REPORTED').toUpperCase();

  const labels = {
    REPORTED: { text: 'EMERGENCY REPORTED', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
    ANALYZING: { text: 'AI ANALYZING', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
    ASSESSED: { text: 'PRIORITY ASSESSED', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
    AMBULANCE_SEARCH: { text: 'FLEET SCANNING', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' },
    AMBULANCE_ASSIGNED: { text: 'AMBULANCE ASSIGNED', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
    HOSPITAL_SEARCH: { text: 'TRAUMA SEARCH', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' },
    HOSPITAL_SELECTED: { text: 'HOSPITAL CONFIRMED', color: 'border-teal-500/30 bg-teal-500/10 text-teal-400' },
    ROUTE_SELECTED: { text: 'ROUTE LOCKED', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
    HOSPITAL_ALERTED: { text: 'PRE-ALERT SENT', color: 'border-green-500/30 bg-green-500/10 text-green-400' },
    AMBULANCE_EN_ROUTE: { text: 'AMBULANCE EN ROUTE', color: 'border-red-500/40 bg-red-500/15 text-red-400 animate-pulse' },
    ON_SCENE: { text: 'RESPONDER ON SCENE', color: 'border-blue-500/40 bg-blue-500/15 text-blue-300' }
  }[s] || { text: s, color: 'border-slate-700 bg-slate-800 text-slate-300' };

  return (
    <span className={`inline-flex items-center rounded-md border ${labels.color} px-2.5 py-0.5 text-xs font-mono font-medium tracking-wider`}>
      <Activity className="w-3 h-3 mr-1.5 opacity-70" />
      {labels.text}
    </span>
  );
}

export function SimulationBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] font-mono tracking-wider">
      <Radio className="w-3 h-3 animate-ping" />
      SIMULATION MODE (DEMO DATA)
    </span>
  );
}
