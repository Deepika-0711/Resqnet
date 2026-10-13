import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, Clock, Activity, Radio } from 'lucide-react';

export function PriorityBadge({ priority = 'HIGH', size = 'md' }) {
  const p = (priority || 'HIGH').toUpperCase();
  
  const config = {
    CRITICAL: {
      bg: 'bg-[#FCECE9] border-[#F5C2BA] text-[#B94430]',
      dot: 'bg-[#E66B55]',
      icon: ShieldAlert,
      label: 'Critical Priority'
    },
    HIGH: {
      bg: 'bg-[#FCF7ED] border-[#F4DCAD] text-[#9E6F18]',
      dot: 'bg-[#E7B65C]',
      icon: AlertTriangle,
      label: 'High Priority'
    },
    MODERATE: {
      bg: 'bg-[#EEF4EF] border-[#CBDACD] text-[#245C4A]',
      dot: 'bg-[#6E9C91]',
      icon: AlertCircle,
      label: 'Moderate Priority'
    },
    LOW: {
      bg: 'bg-[#F4F7F4] border-[#E8E8E1] text-[#203B32]',
      dot: 'bg-[#245C4A]',
      icon: CheckCircle2,
      label: 'Standard Priority'
    }
  }[p] || {
    bg: 'bg-[#F2F2ED] border-[#E8E8E1] text-[#707970]',
    dot: 'bg-[#707970]',
    icon: AlertCircle,
    label: p
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1.5' 
    : size === 'lg'
    ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} font-sans`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-medium tracking-tight">{config.label}</span>
    </span>
  );
}

export function StatusBadge({ status = 'REPORTED', size = 'md' }) {
  const s = (status || 'REPORTED').toUpperCase();

  const labels = {
    REPORTED: { text: 'Reported', color: 'border-[#E8E8E1] bg-[#F8F7F2] text-[#203B32]' },
    ANALYZING: { text: 'Analyzing', color: 'border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A]' },
    ASSESSED: { text: 'Assessed', color: 'border-[#F4DCAD] bg-[#FCF7ED] text-[#9E6F18]' },
    AMBULANCE_SEARCH: { text: 'Fleet Matching', color: 'border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A]' },
    AMBULANCE_ASSIGNED: { text: 'Ambulance Assigned', color: 'border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A]' },
    HOSPITAL_SEARCH: { text: 'Trauma Evaluation', color: 'border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A]' },
    HOSPITAL_SELECTED: { text: 'Hospital Selected', color: 'border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A]' },
    ROUTE_SELECTED: { text: 'Route Confirmed', color: 'border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A]' },
    HOSPITAL_ALERTED: { text: 'Pre-Alert Broadcast', color: 'border-[#CBDACD] bg-[#EEF4EF] text-[#245C4A]' },
    AMBULANCE_EN_ROUTE: { text: 'En Route to Scene', color: 'border-[#F4DCAD] bg-[#FCF7ED] text-[#9E6F18]' },
    ON_SCENE: { text: 'On Scene', color: 'border-[#F5C2BA] bg-[#FCECE9] text-[#B94430]' }
  }[s] || { text: s, color: 'border-[#E8E8E1] bg-[#F8F7F2] text-[#707970]' };

  return (
    <span className={`inline-flex items-center rounded-full border ${labels.color} px-2.5 py-0.5 text-xs font-sans font-medium`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" />
      {labels.text}
    </span>
  );
}

export function SimulationBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#E8E8E1] bg-[#FFFFFF] text-[#707970] text-[11px] font-sans font-medium shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-[#245C4A]" />
      Corridor Simulation Active
    </span>
  );
}
